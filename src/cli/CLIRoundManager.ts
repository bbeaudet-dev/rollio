import { GameInterface } from './interfaces';
import { CharmManager } from '../game/logic/charmSystem';
import { createInitialRoundState, DEFAULT_GAME_CONFIG } from '../game/utils/factories';
import { checkFlopShieldAvailable } from '../game/logic/charms/CommonCharms';
import { isFlop } from '../game/logic/gameLogic';
import { processBankAction, processFlop, updateGameStateAfterRound } from './CLIGameActions';
import { getAllPartitionings } from '../game/logic/scoring';
import { validateDiceSelection } from '../game/utils/effectUtils';
import { DieValue } from '../game/types';
import { applyMaterialEffects } from '../game/logic/materialSystem';
import { getHighestPointsPartitioning } from '../game/logic/scoring';
import { calculateRerollsForLevel, calculateBanksForLevel, validateRerollSelection } from '../game/logic/rerollLogic';
import { Die } from '../game/types';
import { debugLog, debugAction, debugActionWithContext, debugStateChangeWithContext } from '../game/utils/debug';
import { DisplayFormatter } from '../web/utils/display';
import { CLIDisplayFormatter } from './display/cliDisplay';
import { SimpleDiceAnimation } from './display/simpleDiceAnimation';

/*
 * =============================
 * CLIRoundManager
 * =============================
 * CLI-specific round orchestration with I/O.
 * Handles the flow of a single round: rolling, scoring, banking, flops, etc.
 * Used by GameEngine (CLI) to play each round.
 * 
 * NOTE: This is CLI-specific. For pure game logic, see gameActions.ts.
 * For web/API usage, use GameAPI which uses pure functions.
 */
export class CLIRoundManager {
  private diceAnimation: SimpleDiceAnimation;

  /*
   * Constructor
   * (No special setup required)
   */
  constructor() {
    this.diceAnimation = new SimpleDiceAnimation();
  }

  /*
   * playRound
   * ---------
   * Orchestrates a single round of play, including rolling, scoring,
   * banking, flops, and user interaction. Uses RollManager for dice rolls.
   */
  async playRound(
    gameState: any,
    diceSetName: string,
    charmManager: CharmManager,
    gameInterface: GameInterface,
    useConsumable: (idx: number, gameState: any, roundState: any) => Promise<void>
  ): Promise<void> {
    /* === Round Setup === */
    const existingRound = gameState.currentLevel.currentRound;
    let nextRoundNumber: number;
    
    if (existingRound && existingRound.isActive === true) {
      nextRoundNumber = existingRound.roundNumber;
      debugLog(`[ROUND SETUP] Using existing active round: ${nextRoundNumber}`);
    } else if (existingRound === undefined) {
      // New level - start at round 1
      nextRoundNumber = 1;
      debugLog(`[ROUND SETUP] New level detected - starting at round 1`);
    } else {
      const lastRoundNumber = existingRound.roundNumber;
      nextRoundNumber = lastRoundNumber + 1;
      debugLog(`[ROUND SETUP] Starting new round. Last round: ${lastRoundNumber}, Next: ${nextRoundNumber}`);
    }
    
    debugActionWithContext('roundTransitions', `Starting round ${nextRoundNumber}`, 'Waiting for initial roll', {
      nextRoundNumber,
      existingRound: existingRound ? { roundNumber: existingRound.roundNumber, isActive: existingRound.isActive } : null
    });
    
    let roundState = createInitialRoundState(nextRoundNumber);
    roundState.diceHand = gameState.diceSet.map((die: Die) => ({ ...die, scored: false }));
    charmManager.callAllOnRoundStart({ gameState, roundState });
    await gameInterface.displayRoundStart(nextRoundNumber);
    let roundActive = true;
    let levelCompleted = false; // Track if level was completed during this round

    /* === Initial Roll and Flop Check === */
    let currentRollNumber = 1;
    for (const die of roundState.diceHand) {
      die.rolledValue = die.allowedValues[Math.floor(Math.random() * die.allowedValues.length)];
    }
    
    debugActionWithContext('diceRolls', `Initial roll #${currentRollNumber} for round ${nextRoundNumber}`, 'Prompting for reroll', {
      rollNumber: currentRollNumber,
      roundNumber: nextRoundNumber,
      diceValues: roundState.diceHand.map(d => d.rolledValue)
    });
    
      roundState.rollHistory.push({
        rollNumber: currentRollNumber,
        isReroll: false,
        diceHand: [...roundState.diceHand], // Snapshot of initial roll
        selectedDice: [],
        rollPoints: 0, 
        isFlop: isFlop(roundState.diceHand, gameState),
      });
    
    await this.displayRollNumber(currentRollNumber, gameInterface);
    await this.diceAnimation.animateDiceRoll(roundState.diceHand, currentRollNumber);
    
    await this.handleRerollPrompt(gameInterface, gameState, roundState, currentRollNumber);
    
    const flopResult = await this.checkAndHandleFlop(roundState, gameState, gameInterface, charmManager);
    if (flopResult === true) {
      roundActive = false;
      return;
    }

    while (roundActive) {
      /* === Scoring Selection === */
      debugActionWithContext('scoring', 'Waiting for user dice selection', 'Validating selection');
      const { selectedIndices, scoringResult } = await this.promptAndValidateScoringSelection(gameInterface, roundState, gameState, useConsumable);
      if (!scoringResult.valid) {
        debugActionWithContext('scoring', 'Invalid dice selection', 'Waiting for new selection');
        await gameInterface.log('Invalid selection. Please select a valid scoring combination.');
        continue;
      }
      
      debugActionWithContext('scoring', 'Valid selection received', 'Processing scoring', {
        selectedIndices,
        diceValues: selectedIndices.map(i => roundState.diceHand[i]?.rolledValue)
      });

      /* === Partitioning Selection === */
      const partitioningResult = await this.choosePartitioning(gameInterface, scoringResult);
      if (!partitioningResult) continue;
      const { partitioning: selectedPartitioning, partitioningInfo } = partitioningResult;

      /* === Charm and Material Effects === */
      const { finalPoints, scoredCrystals, charmLogs, materialLogs, baseMaterialPoints, finalMaterialPoints } = await this.applyCharmAndMaterialEffects(
        charmManager, gameInterface, selectedPartitioning, roundState, gameState, selectedIndices
      );
      
      // Display partitioning info if available
      if (partitioningInfo && partitioningInfo.length > 0) {
        for (const line of partitioningInfo) {
          await gameInterface.log(line);
        }
      }
      
      // Display material effects first, then charm effects
      if (materialLogs && materialLogs.length > 0) {
        const materialEffectLines = CLIDisplayFormatter.formatMaterialEffectLogs(
          baseMaterialPoints, 
          finalMaterialPoints, 
          materialLogs
        );
        for (const line of materialEffectLines) {
          await gameInterface.log(line);
        }
      }
      
      // Only show charm logs if there are active charms with effects
      const activeCharms = charmManager.getAllCharms().filter(charm => charm.canUse());
      if (charmLogs && charmLogs.length > 0 && activeCharms.length > 0) {
        for (const log of charmLogs) {
          await gameInterface.log(log);
        }
      }
      
      // Update round points
      roundState.roundPoints += finalPoints;
      roundState.roundPoints = Math.ceil(roundState.roundPoints);

      /* === Display Combination Summary (before removing dice) === */
      // Store dice hand before scoring removes dice, so we can show which dice were scored
      const diceHandBeforeScoring = [...roundState.diceHand];
      const combinationSummary = CLIDisplayFormatter.formatCombinationSummary(
        selectedIndices,
        diceHandBeforeScoring,
        selectedPartitioning,
        undefined,
        partitioningInfo
      );
      await gameInterface.log(combinationSummary);
      await gameInterface.log('');

      /* === Remove Scored Dice and Update History === */
      // Remove scored dice from diceHand
      const newHand = roundState.diceHand.filter((_, i) => !selectedIndices.includes(i));
      const hotDice = newHand.length === 0;
      const scoringActionResult = { newHand, hotDice };
      roundState.diceHand = scoringActionResult.newHand;
      
      // Get the roll number from the last roll entry
      // Look for the last entry that has a roll but no scoring
      let rollNumberForScoring = currentRollNumber;
      for (let i = roundState.rollHistory.length - 1; i >= 0; i--) {
        const entry = roundState.rollHistory[i];
        if (!entry.scoringSelection) {
          // This is a roll entry, use its roll number
          rollNumberForScoring = entry.rollNumber;
          break;
        }
      }
      
      roundState.rollHistory.push({
        rollNumber: rollNumberForScoring,
        isReroll: false,
        diceHand: [...roundState.diceHand], // Snapshot of dice after scoring
        selectedDice: [],
        rollPoints: finalPoints,
        maxRollPoints: 0, // TODO: calculate this
        scoringSelection: selectedIndices,
        combinations: selectedPartitioning,
        isHotDice: scoringActionResult.hotDice,
        isFlop: false,
      });

      /* === Display Roll Summary === */
      const rollSummaryLine = CLIDisplayFormatter.formatRollSummary(
        rollNumberForScoring,
        Math.ceil(finalPoints),
        roundState.roundPoints,
        roundState.hotDiceCounter
      );
      const rollSummaryLines = [rollSummaryLine];
      for (const line of rollSummaryLines) {
        await gameInterface.log(line);
      }

      /* === Hot Dice Handling === */
      if (scoringActionResult.hotDice) {
        // Increment hot dice counter when hot dice occurs
        roundState.hotDiceCounter++;
        await gameInterface.displayHotDice(roundState.hotDiceCounter);
        roundState.diceHand = gameState.diceSet.map((die: Die) => ({ ...die, scored: false }));
      }

      /* === Bank or Reroll Prompt === */
      const roundResult = await this.promptBankOrReroll(gameInterface, gameState, roundState, charmManager, useConsumable);
      if (roundResult.levelCompleted) {
        levelCompleted = true;
      }
      if (roundResult.result === 'banked' || roundResult.result === 'end') {
        roundActive = false;
      }
    }

    /* === End of Round Bookkeeping === */
    const oldIsActive = roundState.isActive;
    roundState.isActive = false;
    gameState.currentLevel.currentRound = roundState;
    
    debugStateChangeWithContext(
      'playRound',
      `Round ${roundState.roundNumber} completed`,
      gameState,
      {
        'currentLevel.currentRound.isActive': { old: oldIsActive, new: false }
      }
    );
    
    /* === Display Round Summary === */
    if (!levelCompleted) {
      await gameInterface.displayBetweenRounds(gameState);
      
      // Check if game should end (lives exhausted) after showing round summary
      if (gameState.currentLevel.banksRemaining !== undefined && gameState.currentLevel.banksRemaining <= 0) {
        gameState.isActive = false;
        gameState.endReason = 'lost';
        await gameInterface.log('\n=== GAME OVER ===');
        await gameInterface.log('You ran out of lives!');
        await gameInterface.displayGameEnd(gameState);
      }
    }
  }

  /*
   * promptAndValidateScoringSelection
   * ---------------------------------
   * Prompts the player for a scoring selection and validates it.
   */
  private async promptAndValidateScoringSelection(
    gameInterface: GameInterface,
    roundState: any,
    gameState: any,
    useConsumable: (idx: number, gameState: any, roundState: any) => Promise<void>
  ) {

    
    const input = await (gameInterface as any).askForDiceSelection(
      roundState.diceHand,
      gameState.consumables,
      async (idx: number) => await useConsumable(idx, gameState, roundState),
      gameState
    );
    
    // Validate selection and get scoring result
    const selectedIndices = validateDiceSelection(input, roundState.diceHand.map((die: Die) => die.rolledValue) as DieValue[]);
    const context = { charms: gameState.charms || [] };
    const allPartitionings = getAllPartitionings(roundState.diceHand, selectedIndices, context, gameState);
    const combos = allPartitionings.length > 0 ? allPartitionings[0] : [];
    const totalComboDice = combos.reduce((sum, c) => sum + c.dice.length, 0);
    const valid = combos.length > 0 && totalComboDice === selectedIndices.length;
    const points = combos.reduce((sum, c) => sum + c.points, 0);
    
    return {
      selectedIndices,
      scoringResult: { valid, points, combinations: combos, allPartitionings }
    };
  }



  /*
   * choosePartitioning
   * ------------------
   * Handles multiple valid scoring partitionings and prompts the user to choose.
   */
  private async choosePartitioning(gameInterface: GameInterface, scoringResult: any): Promise<{ partitioning: any, partitioningInfo: string[] } | null> {
    if (scoringResult.allPartitionings.length === 0) return null;
    if (scoringResult.allPartitionings.length === 1) {
      return { 
        partitioning: scoringResult.allPartitionings[0], 
        partitioningInfo: [] 
      };
    }
    
    // Build partitioning info lines
    const partitioningInfo: string[] = [];
    partitioningInfo.push(`Found ${scoringResult.allPartitionings.length} valid partitionings:`);
    for (let i = 0; i < scoringResult.allPartitionings.length; i++) {
      const partitioning = scoringResult.allPartitionings[i];
      const points = partitioning.reduce((sum: number, c: any) => sum + c.points, 0);
      partitioningInfo.push(`  ${i + 1}. ${partitioning.map((c: any) => c.type).join(', ')} (${points} points)`);
    }
    
    // Display the partitioning options
    for (const line of partitioningInfo) {
      await gameInterface.log(line);
    }
    
    const bestPartitioningIndex = getHighestPointsPartitioning(scoringResult.allPartitionings);
    const choice = await gameInterface.askForPartitioningChoice(scoringResult.allPartitionings.length);
    let choiceIndex: number;
    let resultInfo: string[] = [];
    if (choice.trim() === '' || choice.trim() === '1') {
      choiceIndex = bestPartitioningIndex;
      resultInfo.push(`Auto-selected highest points partitioning: Option ${choiceIndex + 1}`);
    } else {
      choiceIndex = parseInt(choice.trim(), 10) - 1;
    }
    if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= scoringResult.allPartitionings.length) {
      await gameInterface.log('Invalid choice. Please try again.');
      return null;
    }
    return { 
      partitioning: scoringResult.allPartitionings[choiceIndex], 
      partitioningInfo: resultInfo 
    };
  }

  /*
   * applyCharmAndMaterialEffects
   * ----------------------------
   * Applies all charm and material effects to scoring and logs results.
   */
  private async applyCharmAndMaterialEffects(
    charmManager: CharmManager,
    gameInterface: GameInterface,
    selectedPartitioning: any[],
    roundState: any,
    gameState: any,
    selectedIndices: number[]
  ) {
    const charmResults: Array<{ name: string, effect: number, uses: number | undefined, logs?: string[] }> = [];
    let modifiedPoints = selectedPartitioning.reduce((sum: number, c: any) => sum + c.points, 0);
    const charms = charmManager.getAllCharms();
    for (const charm of charms) {
      if (charm.canUse()) {
        const effect = charm.onScoring({
          gameState,
          roundState,
          basePoints: modifiedPoints,
          combinations: selectedPartitioning,
          selectedIndices
        });
        let logs: string[] | undefined = undefined;
        if (typeof (charm as any).getLogs === 'function') {
          logs = (charm as any).getLogs();
        }
        charmResults.push({ name: charm.name, effect, uses: charm.uses, logs });
        modifiedPoints += effect;
      } else {
        charmResults.push({ name: charm.name, effect: 0, uses: charm.uses });
      }
    }
    const baseCharmPoints = selectedPartitioning.reduce((sum: number, c: any) => sum + c.points, 0);
    const charmLogs = CLIDisplayFormatter.formatCharmEffectLogsFromResults(baseCharmPoints, charmResults, modifiedPoints);
    // Instead of logging here, return the logs and base/final points for the interface to format
    // Calculate number of crystal dice scored in this action
    const scoredCrystals = selectedIndices.filter((idx: number) => {
      const die = roundState.diceHand[idx];
      return die && die.material === 'crystal';
    }).length;
    // Log material effects (crystal effect will use the PREVIOUS value)
    const materialResult = applyMaterialEffects(roundState.diceHand, selectedIndices, modifiedPoints, gameState, roundState, charmManager);
    let finalPoints = materialResult.score;
    // Return all relevant logs and points for display
    return {
      finalPoints,
      scoredCrystals,
      charmLogs,
      baseCharmPoints,
      modifiedPoints,
      materialLogs: materialResult.materialLogs,
      baseMaterialPoints: modifiedPoints,
      finalMaterialPoints: finalPoints
    };
  }

  /*
   * promptBankOrReroll
   * ------------------
   * Prompts the user to bank or reroll, and handles the response.
   * Returns 'banked', 'reroll', or 'end', and whether a level was completed.
   */
  private async promptBankOrReroll(
    gameInterface: GameInterface,
    gameState: any,
    roundState: any,
    charmManager: CharmManager,
    useConsumable: (idx: number, gameState: any, roundState: any) => Promise<void>
  ): Promise<{ result: 'banked' | 'reroll' | 'end'; levelCompleted: boolean }> {
      const action = await (gameInterface as any).askForBankOrRoll(
      roundState.diceHand.length,
      gameState.consumables,
      async (idx: number) => await useConsumable(idx, gameState, roundState)
    );
    if (action.trim().toLowerCase() === 'b') {
      const bankedPoints = charmManager.applyBankEffects({ gameState, roundState, bankedPoints: roundState.roundPoints });
      const bankResult = processBankAction(bankedPoints);
      
      const updateResult = updateGameStateAfterRound(gameState, roundState, bankResult, charmManager);
      
      // Handle level completion: tallying and shop
      if (updateResult.levelCompleted) {
        if (updateResult.levelAdvanced) {
          const completedLevelNumber = gameState.currentLevel.levelNumber - 1;
          // Import and call handleBetweenLevels
          const { handleBetweenLevels } = await import('./CLILevelManager');
          await handleBetweenLevels(gameState, gameInterface, completedLevelNumber);
          
          await gameInterface.log(`\n=== Level ${gameState.currentLevel.levelNumber} Starting ===`);
          await gameInterface.log(`Threshold: ${gameState.currentLevel.levelThreshold} points`);
          await gameInterface.log(`Rerolls: ${gameState.currentLevel.rerollsRemaining}, Lives: ${gameState.currentLevel.banksRemaining}\n`);
        } else {
          await gameInterface.log(`\n=== LEVEL ${gameState.currentLevel.levelNumber} COMPLETE! ===`);
          await gameInterface.log(`You won the game!\n`);
        }
      }
      
      return { result: 'banked', levelCompleted: updateResult.levelCompleted || false };
    } else {
      for (const die of roundState.diceHand) {
      die.rolledValue = die.allowedValues[Math.floor(Math.random() * die.allowedValues.length)];
    }
      
      let lastScoringEntry = null;
      for (let i = roundState.rollHistory.length - 1; i >= 0; i--) {
        const entry = roundState.rollHistory[i];
        if (entry.scoringSelection) {
          lastScoringEntry = entry;
          break;
        }
      }
      
      let currentRollNumber = 1;
      if (lastScoringEntry) {
        currentRollNumber = lastScoringEntry.rollNumber + 1;
        debugActionWithContext('diceRolls', `Calculating roll number after scoring`, 'Rolling dice', {
          lastEntryRollNumber: lastScoringEntry.rollNumber,
          newRollNumber: currentRollNumber,
          wasScoring: true
        });
      } else if (roundState.rollHistory.length > 0) {
        const lastEntry = roundState.rollHistory[roundState.rollHistory.length - 1];
        currentRollNumber = lastEntry.rollNumber + 1;
        debugActionWithContext('diceRolls', `Calculating roll number (no scoring found)`, 'Rolling dice', {
          lastEntryRollNumber: lastEntry.rollNumber,
          newRollNumber: currentRollNumber
        });
      } else {
        debugActionWithContext('diceRolls', `No previous rolls, starting at roll #1`, 'Rolling dice', {
          firstRoll: true
        });
      }
      
      const isReroll = false;
      roundState.rollHistory.push({
        rollNumber: currentRollNumber,
        isReroll: isReroll,
        diceHand: [...roundState.diceHand], // Snapshot of rolled dice
        selectedDice: [],
        rollPoints: 0, // Will be calculated when scored
        isFlop: isFlop(roundState.diceHand, gameState),
      });
      
      debugActionWithContext('diceRolls', `Roll #${currentRollNumber} completed`, 'Checking for flop', {
        rollNumber: currentRollNumber,
        isReroll: isReroll,
        diceValues: roundState.diceHand.map((d: Die) => d.rolledValue),
        totalHistoryEntries: roundState.rollHistory.length
      });
      
      await this.displayRollNumber(currentRollNumber, gameInterface);
      await this.diceAnimation.animateDiceRoll(roundState.diceHand, currentRollNumber);
      
      await this.handleRerollPrompt(gameInterface, gameState, roundState, currentRollNumber);
      
      const flopResult = await this.checkAndHandleFlop(roundState, gameState, gameInterface, charmManager);
      if (flopResult === true) return { result: 'end', levelCompleted: false };
      if (flopResult === 'flopPrevented') {
        const roundResult = await this.promptBankOrReroll(gameInterface, gameState, roundState, charmManager, useConsumable);
        return roundResult;
      }
      
      return { result: 'reroll', levelCompleted: false };
    }
  }

  /*
   * handleRerollPrompt
   * ------------------
   * Handles reroll prompts after a roll, before flop check or scoring.
   * Prompts for rerolls if available, validates selection, and rerolls selected dice.
   */
  private async handleRerollPrompt(
    gameInterface: GameInterface,
    gameState: any,
    roundState: any,
    currentRollNumber: number
  ): Promise<void> {
    // Keep prompting while rerolls are available
    while (gameState.currentLevel.rerollsRemaining !== undefined && gameState.currentLevel.rerollsRemaining > 0) {
      debugLog(`[REROLL] Prompting for reroll. Rerolls remaining: ${gameState.currentLevel.rerollsRemaining}`);
      // Prompt for reroll selection
      const input = await (gameInterface as any).askForReroll(roundState.diceHand, gameState.currentLevel.rerollsRemaining);
      
      // If empty input, skip reroll
      if (!input || input.trim() === '') {
        debugLog(`[REROLL] User skipped reroll. Exiting reroll loop.`);
        break;
      }
      
      const diceIndices = input.trim().split(/[\s,]+/).map((s: string) => parseInt(s.trim(), 10) - 1).filter((n: number) => !isNaN(n));
      
      // Validate selection 
      const validation = validateRerollSelection(diceIndices, roundState.diceHand);
      if (!validation.valid) {
        await gameInterface.log(validation.error || 'Invalid reroll selection. Please try again.');
        continue;
      }
      
      if (diceIndices.length === 0) {
        debugLog(`[REROLL] User skipped reroll (no dice selected). Exiting reroll loop.`);
        break;
      }
      
      // Reroll selected dice
      const diceToReroll = diceIndices.map((idx: number) => roundState.diceHand[idx]);
      for (const die of diceToReroll) {
        die.rolledValue = die.allowedValues[Math.floor(Math.random() * die.allowedValues.length)];
      }
      
      // Update diceHand with rerolled values (diceToReroll now has new rolledValue)
      for (let i = 0; i < diceIndices.length; i++) {
        const idx = diceIndices[i];
        roundState.diceHand[idx] = diceToReroll[i];
      }
      
      roundState.rollHistory.push({
        rollNumber: currentRollNumber,
        isReroll: true,
        diceHand: [...roundState.diceHand],
        selectedDice: diceIndices,
        rollPoints: 0,
        isFlop: isFlop(roundState.diceHand, gameState),
      });
      
      // Decrement rerolls remaining
      gameState.currentLevel.rerollsRemaining--;
      
      debugLog(`[REROLL] Rerolled ${diceIndices.length} dice (1 reroll used). Rerolls remaining: ${gameState.currentLevel.rerollsRemaining}`);
      
      // Animate reroll: show all dice, but only animate the selected ones
      await this.diceAnimation.animateDiceRoll(roundState.diceHand, currentRollNumber, diceIndices);
      
      // Display updated dice
      await gameInterface.log(`Rerolled ${diceIndices.length} dice: ${diceIndices.map((idx: number) => roundState.diceHand[idx].rolledValue).join(', ')}`);
      
      // Continue the loop to prompt again if rerolls are still available
      // The loop will exit only if:
      // 1. User skips reroll (empty input)
      // 2. User selects 0 dice
      // 3. rerollsRemaining becomes 0
      debugLog(`[REROLL] Loop continuing. Rerolls remaining: ${gameState.currentLevel.rerollsRemaining}`);
    }
    debugLog(`[REROLL] handleRerollPrompt exiting. Final rerolls remaining: ${gameState.currentLevel.rerollsRemaining}`);
  }

  /*
   * displayRollNumber
   * ----------------
   * Helper: Display the roll number when dice are rolled.
   */
  private async displayRollNumber(rollNumber: number, gameInterface: GameInterface): Promise<void> {
    await gameInterface.log(`\nRoll #${rollNumber}:`);
  }

  /*
   * checkAndHandleFlop
   * ------------------
   * Checks for flop and handles it. Returns true if flop occurred (round should end), 'flopPrevented' if prevented, false otherwise.
   */
  private async checkAndHandleFlop(roundState: any, gameState: any, gameInterface: GameInterface, charmManager: CharmManager): Promise<boolean | 'flopPrevented'> {
    const isFlopResult = isFlop(roundState.diceHand, gameState);
    if (isFlopResult) {
      // Check if flop shield is available (without using it)
      const shieldCheck = checkFlopShieldAvailable(gameState);
      
      if (shieldCheck.available) {
        // Prompt user to choose whether to use flop shield
        await gameInterface.log(shieldCheck.log || '🛡️ Flop Shield available!');
        const useShield = await gameInterface.ask('Would you like to use your Flop Shield? (y/n): ');
        
        if (useShield.toLowerCase().trim() === 'y' || useShield.toLowerCase().trim() === 'yes') {
          // User chose to use shield - now actually use it
          const flopPreventionResult = charmManager.tryPreventFlop({ gameState, roundState });
          if (flopPreventionResult.prevented) {
            const usesLeft = gameState.charms?.find((c: any) => c.name === 'Flop Shield')?.uses ?? '∞';
            const shieldMsg = flopPreventionResult.log || `🛡️ Flop Shield activated! Flop prevented (${usesLeft} uses left)`;
            await gameInterface.log(shieldMsg);
            
            // Return 'flopPrevented' to break out of flop handling
            return 'flopPrevented'; 
          }
        }
        // User chose not to use shield, or shield failed - proceed with flop
      }
      
      // Flop was NOT prevented - process the flop
      const levelBankedPoints = gameState.currentLevel.pointsBanked || 0;
      const flopActionResult = processFlop(roundState.roundPoints, levelBankedPoints, gameState);
      
      // Update game state (this sets roundState.flopped = true)
      updateGameStateAfterRound(gameState, roundState, flopActionResult);
      
      // Display flop message 
      const consecutiveFlops = gameState.currentLevel.consecutiveFlops;
      await gameInterface.displayFlopMessage(
        roundState.roundPoints,
        consecutiveFlops,
        levelBankedPoints,
        (gameState.config?.penalties?.consecutiveFlopLimit ?? DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit)
      );
      
      return true; // Return true to indicate flop occurred (round should end)
    }
    return false;
  }
} 