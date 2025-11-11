import { GameState, RoundState } from '../../game/types';
import { createInitialGameState, createInitialRoundState, DEFAULT_GAME_CONFIG } from '../../game/utils/factories';
import { CharmManager } from '../../game/logic/charmSystem';
import { registerCharms } from '../../game/logic/charms/index';
import { calculatePreviewScoring, processCompleteScoring, processRoll, resetDiceHandToFullSet } from '../../game/logic/gameActions';
import { getScoringCombinations } from '../../game/logic/scoring';
import { isFlop, isLevelCompleted, advanceToNextLevel } from '../../game/logic/gameLogic';
import { formatDiceAsPips } from '../utils/diceUtils';
import { ReactGameInterface, PendingAction } from './ReactGameInterface';
import { calculateRerollsForLevel, calculateLivesForLevel, validateRerollSelection } from '../../game/logic/rerollLogic';
import { resetLevelColors } from '../utils/levelColors';
import { calculateLevelRewards, applyLevelRewards, LevelRewards } from '../../game/logic/tallying';
import { generateShopInventory, purchaseCharm, purchaseConsumable, purchaseBlessing } from '../../game/logic/shop';
import { ShopState } from '../../game/types';

export interface WebGameState {
  gameState: GameState | null;
  roundState: RoundState | null;
  selectedDice: number[];
  messages: string[];
  pendingAction: PendingAction;
  previewScoring: {
    isValid: boolean;
    points: number;
    combinations: string[];
  } | null;
  materialLogs: string[];
  charmLogs: string[];
  justBanked: boolean;
  justFlopped: boolean;
  isProcessing: boolean; // Whether RoundManager is currently processing
  // Derived flags for compatibility
  canRoll: boolean;
  canBank: boolean;
  canReroll: boolean; // After scoring - can roll remaining dice
  canSelectDice: boolean;
  isWaitingForReroll: boolean; // Before scoring - can reroll any dice
  canRerollSelected: boolean; // Before scoring - can reroll selected dice
  canContinueFlop: boolean; // After flop - can continue to next round
  canChooseFlopShield: boolean; // Can choose whether to use flop shield
  // Shop state
  isInShop: boolean;
  shopState: ShopState | null;
  levelRewards: LevelRewards | null; // Rewards from completed level
}

export class WebGameManager {
  private charmManager: CharmManager;
  private gameInterface: ReactGameInterface;
  private messageCallback: (message: string) => void;

  constructor(onMessage: (message: string) => void) {
    this.charmManager = new CharmManager();
    registerCharms();
    this.gameInterface = new ReactGameInterface();
    this.messageCallback = onMessage;
  }

  private createWebGameState(
    gameState: GameState,
    roundState: RoundState | null,
    selectedDice: number[],
    previewScoring: { isValid: boolean; points: number; combinations: string[] } | null,
    materialLogs: string[],
    charmLogs: string[],
    justBanked: boolean,
    justFlopped: boolean,
    isProcessing: boolean = false
  ): WebGameState {
    const messages = this.gameInterface.getMessages();
    const pendingAction = this.gameInterface.getPendingAction();
    
    // Update message callback with new messages
    messages.forEach(msg => this.messageCallback(msg));
    
    // Derive flags from pendingAction and game state
    // canRoll is true if: no round state (game ready), OR round state exists but no dice rolled yet (first roll)
    const hasRolledDice = !!(roundState?.rollHistory && roundState.rollHistory.length > 0);
    const canRoll: boolean = (!roundState && !isProcessing && gameState.isActive) || 
                    !!(roundState?.isActive && !hasRolledDice && pendingAction.type === 'none');
    const canBank = !!(roundState?.isActive && roundState.roundPoints > 0 && pendingAction.type === 'bankOrReroll');
    // canReroll is for AFTER scoring - when you can roll remaining dice
    // Also allow reroll if hot dice occurred (diceHand is empty but we can roll full set)
    const hasHotDice = !!(roundState?.rollHistory && roundState.rollHistory.length > 0 && 
      roundState.rollHistory[roundState.rollHistory.length - 1]?.isHotDice);
    const canReroll = !!(roundState?.isActive && pendingAction.type === 'bankOrReroll' && 
      (roundState.diceHand.length > 0 || hasHotDice));
    // canSelectDice is for selecting dice to score
    const canSelectDice = !!(roundState?.isActive && (pendingAction.type === 'diceSelection' || pendingAction.type === 'reroll') && !justBanked && !justFlopped);
    // isWaitingForReroll is for BEFORE scoring - when you can reroll any dice
    const isWaitingForReroll = !!(roundState?.isActive && pendingAction.type === 'reroll' && gameState.currentLevel.rerollsRemaining && gameState.currentLevel.rerollsRemaining > 0);
    // canRerollSelected is for when waiting for reroll AND rerolls remaining (dice selection is optional - can reroll 0 dice)
    const canRerollSelected = !!(isWaitingForReroll && gameState.currentLevel.rerollsRemaining && gameState.currentLevel.rerollsRemaining > 0);
    // canContinueFlop is for when user needs to continue after seeing flop message
    const canContinueFlop = !!(roundState?.isActive && pendingAction.type === 'flopContinue');
    // canChooseFlopShield is for when user needs to choose whether to use flop shield
    const canChooseFlopShield: boolean = !!(roundState?.isActive && pendingAction.type === 'flopShieldChoice');
    
    return {
      gameState,
      roundState,
      selectedDice,
      messages,
      pendingAction,
      previewScoring,
      materialLogs,
      charmLogs,
      justBanked,
      justFlopped,
      isProcessing,
      canRoll,
      canBank,
      canReroll,
      canSelectDice,
      isWaitingForReroll,
      canRerollSelected,
      canContinueFlop,
      canChooseFlopShield: canChooseFlopShield || false,
      isInShop: false,
      shopState: null,
      levelRewards: null,
    };
  }

  async initializeGame(diceSetIndex?: number, selectedCharms?: number[], selectedConsumables?: number[]): Promise<WebGameState> {
    // Reset level colors for new game
    resetLevelColors();
    
    // Load dice sets and select the specified one
      const { ALL_DICE_SETS } = await import('../../game/data/diceSets');
    const selectedSet = ALL_DICE_SETS[diceSetIndex || 0];
    const diceSetConfig = typeof selectedSet === 'function' ? selectedSet() : selectedSet;
    
    const gameState = createInitialGameState(diceSetConfig);
    gameState.config.penalties.consecutiveFlopLimit = DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit;
    gameState.config.penalties.consecutiveFlopPenalty = DEFAULT_GAME_CONFIG.penalties.consecutiveFlopPenalty;
    gameState.config.penalties.flopPenaltyEnabled = true;

    // Initialize level state with rerolls and lives
    gameState.currentLevel.rerollsRemaining = calculateRerollsForLevel(gameState);
    gameState.currentLevel.livesRemaining = calculateLivesForLevel(gameState);

    // Add selected charms
    if (selectedCharms && selectedCharms.length > 0) {
      const { CHARMS } = await import('../../game/data/charms');
      selectedCharms.forEach(charmIndex => {
        if (charmIndex >= 0 && charmIndex < CHARMS.length) {
          const charmData = CHARMS[charmIndex];
          this.charmManager.addCharm({ ...charmData, active: true });
          gameState.charms.push({ ...charmData, active: true });
        }
      });
    }

    // Add selected consumables
    if (selectedConsumables && selectedConsumables.length > 0) {
      const { CONSUMABLES } = await import('../../game/data/consumables');
      selectedConsumables.forEach(consumableIndex => {
        if (consumableIndex >= 0 && consumableIndex < CONSUMABLES.length) {
          const consumableData = CONSUMABLES[consumableIndex];
          gameState.consumables.push({ ...consumableData, uses: consumableData.uses || 1 });
        }
      });
    }

    this.addMessage(`Game started with ${diceSetConfig.name}!`);

    // Create initial round state immediately (skip "Start New Round" screen)
    const initialRoundState = createInitialRoundState(1);
    initialRoundState.diceHand = []; // Don't populate diceHand yet - wait for first roll
    gameState.currentLevel.currentRound = initialRoundState;
    
    this.addMessage('=== ROUND 1 ===');
    this.addMessage('Click "Roll" to start the round.');

    return this.createWebGameState(gameState, initialRoundState, [], null, [], [], false, false, false);
  }

  // Start a new round - simplified for now, will integrate RoundManager later
  startRound(state: WebGameState): WebGameState {
    if (!state.gameState) return state;
    if (state.isProcessing) return state; // Don't start if already processing

    const newGameState = { ...state.gameState };
    const currentRoundNumber = newGameState.currentLevel.currentRound?.roundNumber || 0;
    const nextRoundNumber = currentRoundNumber + 1;
    
    // Create initial round state (but don't roll dice yet)
    const newRoundState = createInitialRoundState(nextRoundNumber);
    // Don't populate diceHand yet - wait for first roll
    newRoundState.diceHand = [];
    
    // Update game state
    newGameState.currentLevel.currentRound = newRoundState;
    
    this.addMessage(`=== ROUND ${nextRoundNumber} ===`);
    this.addMessage('Click "Roll" to start the round.');
    
    // Don't roll dice yet - wait for user to click Roll button
    // Set pending action to indicate we're ready to roll
    (this.gameInterface as any).pendingAction = { type: 'none' };
    
    return this.createWebGameState(newGameState, newRoundState, [], null, [], [], false, false, false);
  }

  // Handle flop shield choice
  handleFlopShieldChoice(state: WebGameState, useShield: boolean): WebGameState {
    if (!state.gameState || !state.roundState) return state;
    if (state.pendingAction.type !== 'flopShieldChoice') return state;

    const gameState = { ...state.gameState };
    const roundState = { ...state.roundState };

    if (useShield) {
      // Use the flop shield
      const flopResult = this.charmManager.tryPreventFlop({ gameState, roundState });
      if (flopResult.prevented) {
        this.addMessage(flopResult.log || '🛡️ Flop Shield activated! Flop prevented');
        
        // When flop shield is activated, restore player to bank or roll state
        // This breaks out of flop handling and returns control to the caller
        const diceToRoll = roundState.diceHand.length;
        this.gameInterface.askForBankOrReroll(diceToRoll);
        this.addMessage('Bank points or roll remaining dice.');
        
        return this.createWebGameState(gameState, roundState, [], null, [], [], false, false, false);
      }
    }
    
    // User chose not to use shield, or shield failed - proceed with flop
    return this.handleFlop(gameState, roundState);
  }

  // Handle flop (common logic for when flop occurs)
  private handleFlop(gameState: GameState, roundState: RoundState): WebGameState {
    // Show flop message but don't end round yet - wait for user to click continue
    const forfeitedPoints = roundState.roundPoints;
    const consecutiveFlops = gameState.currentLevel.consecutiveFlops + 1;
    
    // Set pending action for flop continue
    (this.gameInterface as any).pendingAction = { 
      type: 'flopContinue', 
      forfeitedPoints, 
      consecutiveFlops 
    };
    
    this.addMessage('No valid scoring combinations found, you flopped!');
    
    // Don't increment consecutiveFlops or apply penalty yet - wait for continue
    return this.createWebGameState(gameState, roundState, [], null, [], [], false, false, false);
  }

  updateDiceSelection(state: WebGameState, selectedIndices: number[]): WebGameState {
    if (!state.roundState || !state.gameState) return state;

    // Use game layer for preview calculation
    const previewScoring = calculatePreviewScoring(
      state.gameState,
      state.roundState,
      selectedIndices,
      this.charmManager
    );

    return this.createWebGameState(state.gameState, state.roundState, selectedIndices, previewScoring, state.materialLogs, state.charmLogs, state.justBanked, state.justFlopped, state.isProcessing);
  }

  scoreSelectedDice(state: WebGameState): WebGameState {
    if (!state.gameState || !state.roundState || state.selectedDice.length === 0) {
      return state;
    }

    console.log('Debug - Before scoring, roundState:', state.roundState);
    console.log('Debug - Before scoring, rollHistory length:', state.roundState.rollHistory?.length);

    // Check charm restrictions before scoring
    const combos = getScoringCombinations(state.roundState.diceHand, state.selectedDice, { charms: state.gameState.charms });
    
    // Apply charm filtering to check for restrictions
    let filteredCombos = combos;
    for (const charm of this.charmManager.getActiveCharms()) {
      if (charm.filterScoringCombinations) {
        filteredCombos = charm.filterScoringCombinations(filteredCombos, {
          basePoints: 0,
          combinations: filteredCombos,
          selectedIndices: state.selectedDice,
          roundState: state.roundState,
          gameState: state.gameState
        });
      }
    }
    
    // Check if any combination has points > 0 after filtering
    const hasValidPoints = filteredCombos.some(combo => combo.points > 0);
    if (!hasValidPoints && combos.length > 0) {
      this.addMessage('Invalid selection - restricted by active charms');
      return state;
    }

    // Use game layer for all scoring logic
    const result = processCompleteScoring(
      state.gameState,
      state.roundState,
      state.selectedDice,
      this.charmManager
    );

    console.log('Debug - After scoring, newRoundState:', result.newRoundState);
    console.log('Debug - After scoring, rollHistory length:', result.newRoundState.rollHistory?.length);

    if (!result.success) {
      this.addMessage('Invalid dice selection. Please select valid scoring combinations.');
      return state;
    }

    // Display scoring result
    this.addMessage(`Scored ${result.finalPoints} points from: ${result.scoringResult.map((c: any) => c.type).join(', ')}`);
    if (result.charmEffectData) {
      this.addMessage(`Charm effects: +${result.charmEffectData.modifiedPoints - result.charmEffectData.basePoints} points`);
    }
    if (result.materialEffectData) {
      result.materialEffectData.materialLogs.forEach((log: string) => this.addMessage(log));
    }

    // Handle hot dice
    if (result.hotDice) {
      this.addMessage('🔥 Hot dice! All dice are available for reroll!');
    }

    this.addMessage(`Roll points: +${result.finalPoints}`);
    this.addMessage(`Round points: ${result.newRoundState.roundPoints}`);

    // Update game state with new round state
    result.newGameState.currentLevel.currentRound = result.newRoundState;

    // Set pending action for bank or reroll
    const diceToReroll = result.newRoundState.diceHand.length;
    this.gameInterface.askForBankOrReroll(diceToReroll);

    return this.createWebGameState(result.newGameState, result.newRoundState, [], null, result.materialEffectData?.materialLogs || [], result.charmEffectData ? [`Charm effects: +${result.charmEffectData.modifiedPoints - result.charmEffectData.basePoints} points`] : [], false, false, false);
  }

  bankPoints(state: WebGameState): WebGameState {
    if (!state.gameState || !state.roundState) return state;

    const bankedPoints = this.charmManager.applyBankEffects({ 
      gameState: state.gameState, 
      roundState: state.roundState, 
      bankedPoints: state.roundState.roundPoints 
    });
    
    const newGameState = { ...state.gameState };
    newGameState.currentLevel.pointsBanked += bankedPoints;
    newGameState.history.totalScore += bankedPoints;
    newGameState.currentLevel.consecutiveFlops = 0; // Reset consecutive flops on successful bank

    // Mark round as banked
    const completedRoundState = { ...state.roundState };
    completedRoundState.isActive = false;
    completedRoundState.banked = true;
    newGameState.currentLevel.currentRound = completedRoundState;

    this.addMessage(`Banked ${bankedPoints} points!`);
    this.addMessage(`Total score: ${newGameState.history.totalScore}`);
    this.addMessage(`Points banked: ${newGameState.currentLevel.pointsBanked} / ${newGameState.currentLevel.levelThreshold}`);

    // Check if level is complete
    if (isLevelCompleted(newGameState)) {
      const completedLevelNumber = newGameState.currentLevel.levelNumber;
      this.addMessage(`Level ${completedLevelNumber} complete!`);
      
      // Advance to next level first (moves completed level to history)
      advanceToNextLevel(newGameState);
      
      // Calculate rewards from completed level
      const levelHistory = newGameState.history.levelHistory;
      if (levelHistory.length > 0) {
        const completedLevelState = levelHistory[levelHistory.length - 1];
        const rewards = calculateLevelRewards(completedLevelNumber, completedLevelState, newGameState);
        
        // Apply rewards (add money)
        applyLevelRewards(newGameState, rewards);
        
        // Generate shop inventory
        const shopState = generateShopInventory(newGameState);
        
        // Return state with shop open
        const webState = this.createWebGameState(newGameState, null, [], null, [], [], false, false, false);
        return {
          ...webState,
          isInShop: true,
          shopState,
          levelRewards: rewards,
        };
      }
    }

    // Create new round state immediately (skip "Start New Round" screen)
    const currentRoundNumber = newGameState.currentLevel.currentRound?.roundNumber || 0;
    const nextRoundNumber = currentRoundNumber + 1;
    const newRoundState = createInitialRoundState(nextRoundNumber);
    newRoundState.diceHand = []; // Don't populate dice yet - wait for first roll
    newGameState.currentLevel.currentRound = newRoundState;
    
    this.addMessage(`=== ROUND ${nextRoundNumber} ===`);
    this.addMessage('Click "Roll" to start the round.');
    
    return this.createWebGameState(newGameState, newRoundState, [], null, [], [], false, false, false);
  }

  rollDice(state: WebGameState): WebGameState {
    if (!state.gameState || !state.roundState) return state;

    const newGameState = { ...state.gameState };
    const newRoundState = { ...state.roundState };
    
    // Check for hot dice (empty diceHand) - processRoll will handle populating if needed
    const isHotDice = newRoundState.diceHand.length === 0;
    if (isHotDice) {
      this.addMessage('🔥 Hot dice! All dice restored!');
    }

    // Use game layer for roll logic (pass diceSet if diceHand is empty)
    const result = processRoll(newRoundState, isHotDice ? newGameState.diceSet : undefined);

    // Update game state with new round state
    newGameState.currentLevel.currentRound = result.newRoundState;
    
    // Get roll number from the last entry in roll history (just added by processRoll)
    const lastRollEntry = result.newRoundState.rollHistory[result.newRoundState.rollHistory.length - 1];
    const rollNumber = lastRollEntry?.rollNumber || 1;
    
    this.addMessage(`Roll ${rollNumber}: ${formatDiceAsPips(result.newRoundState.diceHand.map((d: any) => d.rolledValue || 0))}`);

    // After rolling remaining dice, check for reroll prompt (BEFORE flop check)
    // This is where player can reroll any dice before scoring
    if (newGameState.currentLevel.rerollsRemaining && newGameState.currentLevel.rerollsRemaining > 0) {
      // Set pending action for reroll
      this.gameInterface.askForReroll(result.newRoundState.diceHand, newGameState.currentLevel.rerollsRemaining);
      return this.createWebGameState(newGameState, result.newRoundState, [], null, [], [], false, false, false);
    }

    // Check for flop (only after reroll prompt is handled)
    if (result.isFlop) {
      // Check if flop shield is available (but don't use it yet)
      const shieldCheck = this.charmManager.checkFlopShieldAvailable({ gameState: newGameState, roundState: result.newRoundState });
      
      if (shieldCheck.available) {
        // Prompt user to choose whether to use flop shield
        (this.gameInterface as any).pendingAction = {
          type: 'flopShieldChoice',
          canPrevent: true,
          log: shieldCheck.log
        };
        this.addMessage(shieldCheck.log || '🛡️ Flop Shield available! Would you like to use it?');
        this.addMessage('(Click "Use Shield" to prevent flop, or "Skip" to proceed with flop)');
        return this.createWebGameState(newGameState, result.newRoundState, [], null, [], [], false, false, false);
      }
      
      // No flop shield available - proceed with flop
      return this.handleFlop(newGameState, result.newRoundState);
    } else {
      this.addMessage('Select dice to score:');
      this.gameInterface.askForDiceSelection(result.newRoundState.diceHand, newGameState.consumables);
      
      return this.createWebGameState(newGameState, result.newRoundState, [], null, [], [], false, false, false);
    }
  }

  // Handle resolving pending actions (called from React when user interacts)
  resolvePendingAction(state: WebGameState, value: string): WebGameState {
    this.gameInterface.resolvePendingAction(value);
    
    // Get updated state after resolving
    const messages = this.gameInterface.getMessages();
    messages.forEach(msg => this.messageCallback(msg));
    
    // Return updated state
    return {
      ...state,
      messages: [...state.messages, ...messages],
      pendingAction: this.gameInterface.getPendingAction(),
    };
  }

  // Handle reroll selection (when user selects dice to reroll BEFORE scoring)
  handleRerollSelection(state: WebGameState, selectedIndices: number[]): WebGameState {
    if (!state.gameState || !state.roundState) return state;
    if (state.pendingAction.type !== 'reroll') return state;

    const gameState = { ...state.gameState };
    const roundState = { ...state.roundState };

    // Validate selection
    const validation = validateRerollSelection(selectedIndices, roundState.diceHand);
    if (!validation.valid) {
      this.addMessage(validation.error || 'Invalid reroll selection. Please try again.');
      return state;
    }

    // If no dice selected, skip reroll
    if (selectedIndices.length === 0) {
      this.addMessage('Skipping reroll.');
      // Resolve the pending action and continue to flop check
      this.gameInterface.resolvePendingAction('');
      // Now check for flop
      return this.checkForFlopAfterReroll(gameState, roundState);
    }

    // Reroll selected dice
    // Create a copy of the dice to reroll
    const diceToReroll = selectedIndices.map((idx: number) => ({ ...roundState.diceHand[idx] }));
    for (const die of diceToReroll) {
      die.rolledValue = die.allowedValues[Math.floor(Math.random() * die.allowedValues.length)];
    }

    // Update diceHand with rerolled values (create new array to trigger React update)
    const newDiceHand = roundState.diceHand.map((die, idx) => {
      const rerollIndex = selectedIndices.indexOf(idx);
      if (rerollIndex >= 0) {
        // This die was rerolled - use the new value
        return { ...diceToReroll[rerollIndex] };
      }
      // This die was not rerolled - keep the same value
      return { ...die };
    });
    roundState.diceHand = newDiceHand;

    // Decrement rerolls remaining
    gameState.currentLevel.rerollsRemaining = (gameState.currentLevel.rerollsRemaining || 0) - 1;

    // Add to roll history
    const rollNumber = roundState.rollHistory.length + 1;
    roundState.rollHistory.push({
      rollNumber,
      isReroll: true,
      diceHand: roundState.diceHand.map(d => ({ ...d })),
      selectedDice: [],
    });

    this.addMessage(`Rerolled ${selectedIndices.length} dice. Rerolls remaining: ${gameState.currentLevel.rerollsRemaining}`);
    this.addMessage(`Roll: ${formatDiceAsPips(roundState.diceHand.map((d: any) => d.rolledValue || 0))}`);

    // Update game state
    gameState.currentLevel.currentRound = roundState;

    // Resolve the pending action
    this.gameInterface.resolvePendingAction(selectedIndices.map(i => i + 1).join(' '));

    // Clear selected dice after reroll
    const newSelectedDice: number[] = [];

    // Check if more rerolls available - if so, prompt again
    if (gameState.currentLevel.rerollsRemaining && gameState.currentLevel.rerollsRemaining > 0) {
      this.gameInterface.askForReroll(roundState.diceHand, gameState.currentLevel.rerollsRemaining);
      return this.createWebGameState(gameState, roundState, newSelectedDice, null, [], [], false, false, false);
    }

    // No more rerolls - check for flop
    return this.checkForFlopAfterReroll(gameState, roundState);
  }

  // Check for flop after reroll is complete
  private checkForFlopAfterReroll(gameState: GameState, roundState: RoundState): WebGameState {
    // Check for flop
    if (isFlop(roundState.diceHand)) {
      // Check if flop shield is available (but don't use it yet)
      const shieldCheck = this.charmManager.checkFlopShieldAvailable({ gameState, roundState });
      
      if (shieldCheck.available) {
        // Prompt user to choose whether to use flop shield
        (this.gameInterface as any).pendingAction = {
          type: 'flopShieldChoice',
          canPrevent: true,
          log: shieldCheck.log
        };
        this.addMessage(shieldCheck.log || '🛡️ Flop Shield available! Would you like to use it?');
        this.addMessage('(Click "Use Shield" to prevent flop, or "Skip" to proceed with flop)');
        return this.createWebGameState(gameState, roundState, [], null, [], [], false, false, false);
      }
      
      // No flop shield available - proceed with flop
      return this.handleFlop(gameState, roundState);
    } else {
      this.addMessage('Select dice to score:');
      this.gameInterface.askForDiceSelection(roundState.diceHand, gameState.consumables);
      
      return this.createWebGameState(gameState, roundState, [], null, [], [], false, false, false);
    }
  }

  // Use consumable
  async useConsumable(state: WebGameState, index: number): Promise<WebGameState> {
    if (!state.gameState || !state.roundState) return state;
    
    const { applyConsumableEffect, applyDieSelectionConsumable } = await import('../../game/logic/consumableEffects');
    const gameState = { ...state.gameState };
    const roundState = { ...state.roundState };
    
    const result = applyConsumableEffect(index, gameState, roundState, this.charmManager);
    
    // Track state changes for message generation
    const oldMoney = gameState.money;
    const oldDiceSetLength = gameState.diceSet.length;
    const oldCharmSlots = gameState.charmSlots;
    const oldCharmsLength = gameState.charms.length;
    
    // Update gameState and roundState from result
    Object.assign(gameState, result.gameState);
    if (result.roundState) {
      Object.assign(roundState, result.roundState);
    }
    
    // Handle input requests (chisel, potteryWheel) - for web, we'll need to handle this in UI
    if (result.requiresInput && result.requiresInput.type === 'dieSelection') {
      // TODO: Handle die selection in UI - for now, just add a message
      this.addMessage(`Please select a die to ${result.requiresInput.consumableId === 'chisel' ? 'reduce' : 'enlarge'}`);
      // Don't remove consumable yet - wait for die selection
    } else {
      // Generate messages based on state changes (Web-specific)
      if (gameState.money !== oldMoney) {
        this.addMessage(`💰 Money Doubler used! You now have $${gameState.money}.`);
      }
      if (gameState.diceSet.length > oldDiceSetLength) {
        this.addMessage('🎲 Extra Die added! You will have an extra die next round.');
      }
      if (gameState.charmSlots > oldCharmSlots) {
        this.addMessage('🧳 Slot Expander used! You now have an extra charm slot.');
      }
      if (gameState.charms.length > oldCharmsLength) {
        const newCharm = gameState.charms[gameState.charms.length - 1];
        this.addMessage(`🎁 Charm Giver: You gained a new charm: ${newCharm.name}!`);
      }
      if (result.shouldRemove) {
        // Remove consumable if it was used successfully
        gameState.consumables.splice(index, 1);
      }
    }
    
    // Check if consumable was consumed (uses decreased or removed)
    const consumable = gameState.consumables[index];
    if (consumable && consumable.uses !== undefined) {
      if (consumable.uses <= 0) {
        gameState.consumables.splice(index, 1);
      }
    }
    
    // Check for lose condition after consumable use
    if (gameState.currentLevel.livesRemaining !== undefined && gameState.currentLevel.livesRemaining <= 0) {
      gameState.isActive = false;
      gameState.endReason = 'lost';
      this.addMessage('=== GAME OVER ===');
      this.addMessage('You ran out of lives!');
    }
    
    return this.createWebGameState(gameState, roundState, state.selectedDice, state.previewScoring, state.materialLogs, state.charmLogs, state.justBanked, state.justFlopped, state.isProcessing);
  }

  // Handle flop continue (when user clicks continue after seeing flop)
  handleFlopContinue(state: WebGameState): WebGameState {
    if (!state.gameState || !state.roundState) return state;
    if (state.pendingAction.type !== 'flopContinue') return state;

    const gameState = { ...state.gameState };
    const roundState = { ...state.roundState };

    // Now apply flop penalties
    gameState.currentLevel.consecutiveFlops++;
    
    if (gameState.currentLevel.consecutiveFlops >= (gameState.config.penalties.consecutiveFlopLimit || 3)) {
      const penalty = gameState.config.penalties.consecutiveFlopPenalty || 1000;
      gameState.currentLevel.pointsBanked = Math.max(0, gameState.currentLevel.pointsBanked - penalty);
      this.addMessage(`Flop penalty: -${penalty} points`);
    }
    
    // Mark round as flopped and inactive
    roundState.isActive = false;
    roundState.flopped = true;
    roundState.forfeitedPoints = roundState.roundPoints;
    gameState.currentLevel.currentRound = roundState;
    
    // Apply flop life loss
    if (gameState.currentLevel.livesRemaining && gameState.currentLevel.livesRemaining > 0) {
      gameState.currentLevel.livesRemaining--;
      this.addMessage(`-1 Life (${gameState.currentLevel.livesRemaining} lives remaining)`);
    }
    
    // Check for lose condition
    if (gameState.currentLevel.livesRemaining !== undefined && gameState.currentLevel.livesRemaining <= 0) {
      gameState.isActive = false;
      gameState.endReason = 'lost';
      this.addMessage('=== GAME OVER ===');
      this.addMessage('You ran out of lives!');
      return this.createWebGameState(gameState, roundState, [], null, [], [], false, false, false);
    }
    
    // Clear pending action
    (this.gameInterface as any).pendingAction = { type: 'none' };
    
    // Create new round state immediately (skip "Start New Round" screen)
    const currentRoundNumber = gameState.currentLevel.currentRound?.roundNumber || 0;
    const nextRoundNumber = currentRoundNumber + 1;
    const newRoundState = createInitialRoundState(nextRoundNumber);
    newRoundState.diceHand = []; // Don't populate dice yet - wait for first roll
    gameState.currentLevel.currentRound = newRoundState;
    
    this.addMessage(`=== ROUND ${nextRoundNumber} ===`);
    this.addMessage('Click "Roll" to start the round.');
    
    return this.createWebGameState(gameState, newRoundState, [], null, [], [], false, false, false);
  }

  // Shop methods
  purchaseCharm(state: WebGameState, charmIndex: number): WebGameState {
    if (!state.gameState || !state.shopState || !state.isInShop) return state;
    
    const result = purchaseCharm(state.gameState, state.shopState, charmIndex);
    this.addMessage(result.message);
    
    if (result.success) {
      // Regenerate shop inventory (remove purchased charm)
      const newShopState = generateShopInventory(state.gameState);
      const webState = this.createWebGameState(state.gameState, null, [], null, [], [], false, false, false);
      return {
        ...webState,
        isInShop: true,
        shopState: newShopState,
        levelRewards: state.levelRewards,
      };
    }
    
    return state;
  }

  purchaseConsumable(state: WebGameState, consumableIndex: number): WebGameState {
    if (!state.gameState || !state.shopState || !state.isInShop) return state;
    
    const result = purchaseConsumable(state.gameState, state.shopState, consumableIndex);
    this.addMessage(result.message);
    
    if (result.success) {
      // Regenerate shop inventory (remove purchased consumable)
      const newShopState = generateShopInventory(state.gameState);
      const webState = this.createWebGameState(state.gameState, null, [], null, [], [], false, false, false);
      return {
        ...webState,
        isInShop: true,
        shopState: newShopState,
        levelRewards: state.levelRewards,
      };
    }
    
    return state;
  }

  purchaseBlessing(state: WebGameState, blessingIndex: number): WebGameState {
    if (!state.gameState || !state.shopState || !state.isInShop) return state;
    
    const result = purchaseBlessing(state.gameState, state.shopState, blessingIndex);
    this.addMessage(result.message);
    
    if (result.success) {
      // Regenerate shop inventory (remove purchased blessing)
      const newShopState = generateShopInventory(state.gameState);
      const webState = this.createWebGameState(state.gameState, null, [], null, [], [], false, false, false);
      return {
        ...webState,
        isInShop: true,
        shopState: newShopState,
        levelRewards: state.levelRewards,
      };
    }
    
    return state;
  }

  exitShop(state: WebGameState): WebGameState {
    if (!state.gameState || !state.isInShop) return state;
    
    // Create new round state for the next level
    const nextRoundNumber = 1;
    const newRoundState = createInitialRoundState(nextRoundNumber);
    newRoundState.diceHand = []; // Don't populate dice yet - wait for first roll
    state.gameState.currentLevel.currentRound = newRoundState;
    
    this.addMessage(`=== LEVEL ${state.gameState.currentLevel.levelNumber} ===`);
    this.addMessage(`Threshold: ${state.gameState.currentLevel.levelThreshold} points`);
    this.addMessage(`Rerolls: ${state.gameState.currentLevel.rerollsRemaining}, Lives: ${state.gameState.currentLevel.livesRemaining}`);
    this.addMessage('Click "Roll" to start the round.');
    
    return this.createWebGameState(state.gameState, newRoundState, [], null, [], [], false, false, false);
  }

  private addMessage(message: string): void {
    this.messageCallback(message);
  }
}