import { GameState, RoundState } from '../../game/types';
import { createInitialGameState, createInitialRoundState, DEFAULT_GAME_CONFIG } from '../../game/utils/factories';
import { CharmManager } from '../../game/logic/charmSystem';
import { registerCharms } from '../../game/logic/charms/index';
import { RollManager } from '../../game/engine/RollManager';
import { processReroll } from '../../game/logic/gameActions';
import { processCompleteScoring, calculatePreviewScoring } from '../../game/logic/gameActions';
import { getScoringCombinations } from '../../game/logic/scoring';
import { isFlop } from '../../game/logic/gameLogic';
import { formatDiceAsPips } from '../utils/diceUtils';

export interface WebGameState {
  gameState: GameState | null;
  roundState: RoundState | null;
  selectedDice: number[];
  messages: string[];
  canRoll: boolean;
  canBank: boolean;
  canReroll: boolean;
  canSelectDice: boolean;
  previewScoring: {
    isValid: boolean;
    points: number;
    combinations: string[];
  } | null;
  materialLogs: string[];
  charmLogs: string[];
  justBanked: boolean;
  justFlopped: boolean;
}

export class WebGameManager {
  private charmManager: CharmManager;
  private rollManager: RollManager;
  private messageCallback: (message: string) => void;

  constructor(onMessage: (message: string) => void) {
    this.charmManager = new CharmManager();
    registerCharms();
    this.rollManager = new RollManager();
    this.messageCallback = onMessage;
  }

  private createWebGameState(
    gameState: GameState,
    roundState: RoundState | null,
    selectedDice: number[],
    previewScoring: { isValid: boolean; points: number; combinations: string[] } | null,
    canRoll: boolean,
    canBank: boolean,
    canReroll: boolean,
    canSelectDice: boolean,
    materialLogs: string[],
    charmLogs: string[],
    justBanked: boolean,
    justFlopped: boolean
  ): WebGameState {
    return {
      gameState,
      roundState,
      selectedDice,
      messages: [],
      previewScoring,
      canRoll,
      canBank,
      canReroll,
      canSelectDice,
      materialLogs,
      charmLogs,
      justBanked,
      justFlopped,
    };
  }

  async initializeGame(diceSetIndex?: number, selectedCharms?: number[], selectedConsumables?: number[]): Promise<WebGameState> {
    // Load dice sets and select the specified one
      const { ALL_DICE_SETS } = await import('../../game/data/diceSets');
    const selectedSet = ALL_DICE_SETS[diceSetIndex || 0];
    const diceSetConfig = typeof selectedSet === 'function' ? selectedSet() : selectedSet;
    
    const gameState = createInitialGameState(diceSetConfig);
    gameState.config.penalties.consecutiveFlopLimit = DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit;
    gameState.config.penalties.consecutiveFlopPenalty = DEFAULT_GAME_CONFIG.penalties.consecutiveFlopPenalty;
    gameState.config.penalties.flopPenaltyEnabled = true;

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

    this.addMessage(`Game started with ${diceSetConfig.name}! Click "Start Round" to begin.`);

    // Create initial round state
    const initialRoundState = createInitialRoundState(1);
    
    return this.createWebGameState(gameState, initialRoundState, [], null, true, false, false, false, [], [], false, false);
  }

  startRound(state: WebGameState): WebGameState {
    if (!state.gameState) return state;

    const newGameState = { ...state.gameState };
    const currentRoundNumber = newGameState.currentLevel.currentRound?.roundNumber || 0;
    const nextRoundNumber = currentRoundNumber + 1;
    
    const newRoundState = createInitialRoundState(nextRoundNumber);
    newRoundState.diceHand = newGameState.diceSet.map((die: any) => ({ ...die, scored: false }));
    
    // Roll the initial dice
    this.rollManager.rollDice(newRoundState.diceHand);
    
    this.addMessage(`=== ROUND ${nextRoundNumber} ===`);
    this.addMessage(`Roll 1: ${formatDiceAsPips(newRoundState.diceHand.map((d: any) => d.rolledValue || 0))}`);

    // Check for immediate flop
    if (isFlop(newRoundState.diceHand)) {
      // Try to prevent flop with charms
      const flopResult = this.charmManager.tryPreventFlop({ gameState: newGameState, roundState: newRoundState });
      if (flopResult.prevented) {
        this.addMessage(flopResult.log || '🛡️ Flop Shield activated! Flop prevented');
        this.addMessage('Select dice to score:');
        return this.createWebGameState(newGameState, newRoundState, [], null, false, false, false, false, [], [], false, false);
      }
      
      this.addMessage('No valid scoring combinations found, you flopped!');
      
      newGameState.currentLevel.consecutiveFlops++;
      
      if (newGameState.currentLevel.consecutiveFlops >= (newGameState.config.penalties.consecutiveFlopLimit || 3)) {
        const penalty = newGameState.config.penalties.consecutiveFlopPenalty || 1000;
        newGameState.currentLevel.pointsBanked = Math.max(0, newGameState.currentLevel.pointsBanked - penalty);
        this.addMessage(`Flop penalty: -${penalty} points`);
      }
      
      this.addMessage('Round ended. Click "Start Round" for next round.');
      
      return this.createWebGameState(newGameState, newRoundState, [], null, false, false, false, false, [], [], false, true);
    } else {
      this.addMessage('Select dice to score:');
      
      return this.createWebGameState(newGameState, newRoundState, [], null, false, false, false, false, [], [], false, false);
    }
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

    return this.createWebGameState(state.gameState, state.roundState, selectedIndices, previewScoring, state.canRoll, state.canBank, state.canReroll, false, state.materialLogs, state.charmLogs, state.justBanked, state.justFlopped);
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

    return this.createWebGameState(result.newGameState, result.newRoundState, [], null, false, true, true, false, result.materialEffectData?.materialLogs || [], result.charmEffectData ? [`Charm effects: +${result.charmEffectData.modifiedPoints - result.charmEffectData.basePoints} points`] : [], false, false);
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

    this.addMessage(`Banked ${bankedPoints} points!`);
    this.addMessage(`Total score: ${newGameState.history.totalScore}`);


    this.addMessage('Round completed! Click "Start New Round" for next round.');
    
    // Keep the round state but mark it as complete
    const completedRoundState = { ...state.roundState };
    completedRoundState.isActive = false;
    
    return this.createWebGameState(newGameState, completedRoundState, [], null, true, false, false, false, [], [], true, false);
  }

  rerollDice(state: WebGameState): WebGameState {
    if (!state.gameState || !state.roundState) return state;

    // Use game layer for reroll logic
    const result = processReroll(
      state.gameState,
      state.roundState,
      this.rollManager
    );

    if (result.isHotDice) {
      this.addMessage('Hot dice reroll - all dice restored!');
    }
    
    this.addMessage(`Roll ${result.newRoundState.roundNumber}: ${formatDiceAsPips(result.newRoundState.diceHand.map((d: any) => d.rolledValue || 0))}`);

    // Check for flop
    if (result.isFlop) {
      // Try to prevent flop with charms
      const flopResult = this.charmManager.tryPreventFlop({ gameState: state.gameState, roundState: result.newRoundState });
      if (flopResult.prevented) {
        this.addMessage(flopResult.log || '🛡️ Flop Shield activated! Flop prevented');
        this.addMessage('Select dice to score:');
        return this.createWebGameState(state.gameState, result.newRoundState, [], null, false, false, false, false, [], [], false, false);
      }
      
      this.addMessage('No valid scoring combinations found, you flopped!');
      this.addMessage('Round ended. Click "Start New Round" for next round.');
      
      // Increment consecutive flops when actually flopping
      const newGameState = { ...state.gameState };
      newGameState.currentLevel.consecutiveFlops++;
      
      if (newGameState.currentLevel.consecutiveFlops >= (newGameState.config.penalties.consecutiveFlopLimit || 3)) {
        const penalty = newGameState.config.penalties.consecutiveFlopPenalty || 1000;
        newGameState.currentLevel.pointsBanked = Math.max(0, newGameState.currentLevel.pointsBanked - penalty);
        this.addMessage(`Flop penalty: -${penalty} points`);
      }
      
      this.addMessage(`Consecutive flops: ${newGameState.currentLevel.consecutiveFlops}`);
      
      return this.createWebGameState(newGameState, result.newRoundState, [], null, true, false, false, false, [], [], false, true);
    } else {
      this.addMessage('Select dice to score:');
      
      return this.createWebGameState(state.gameState, result.newRoundState, [], null, false, false, false, false, [], [], false, false);
    }
  }

  private addMessage(message: string): void {
    this.messageCallback(message);
  }
}