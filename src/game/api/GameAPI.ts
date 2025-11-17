import { GameInterface } from '../../cli/interfaces';
import { GameState, GameConfig, RoundState } from '../types';
import { CharmManager } from '../logic/charmSystem';
import { 
  calculatePreviewScoring, 
  processRoll,
  processBankPoints,
  startNewRound,
  endRound,
  removeDiceFromHand,
  removeDiceAndCheckHotDice,
  addPointsToRound,
  incrementCrystalsScored,
  updateRollHistory,
  processHotDice,
  randomizeSelectedDice,
  decrementRerolls,
  incrementConsecutiveFlops,
  setForfeitedPoints
} from '../logic/gameActions';
import { isGameOver, isFlop, isHotDice, isLevelCompleted, canBankPoints as canBankPointsLogic } from '../logic/gameLogic';
import { endGame, advanceToNextLevel } from '../logic/gameActions';
import { tallyLevel as tallyLevelFunction, calculateLevelRewards, LevelRewards } from '../logic/tallying';
import { generateShopInventory, purchaseCharm, purchaseConsumable, purchaseBlessing } from '../logic/shop';
import { validateRerollSelection } from '../logic/rerollLogic';
import { applyConsumableEffect } from '../logic/consumableEffects';
import { calculateScoringBreakdown } from '../logic/scoring';
import { calculateFinalScore } from '../logic/scoringElements';
import { RollState } from '../types';
import { ShopState } from '../types';
import { GameAPIEvent, GameAPIEventData } from './GameAPIEvents';
import {
  InitializeGameResult,
  RollDiceResult,
  RerollDiceResult,
  ScoreDiceResult,
  BankPointsResult,
  FlopResult
} from './types';
import { createInitialGameState, createInitialLevelState } from '../utils/factories';
import { registerCharms } from '../logic/charms/index';

/**
 * GameAPI
 * 
 * Event-driven API layer that wraps GameEngine functionality.
 * Provides a clean interface for both CLI and Web applications.
 * 
 * Key Features:
 * - Event-driven interface (better for React)
 * - Wraps GameEngine functionality
 * - Can be used by both CLI and Web
 * - No duplication of game logic
 */
export class GameAPI {
  private gameInterface: GameInterface;
  private charmManager: CharmManager;
  private eventListeners: Map<GameAPIEvent, Set<(data: any) => void>> = new Map();

  constructor(gameInterface: GameInterface) {
    this.gameInterface = gameInterface;
    this.charmManager = new CharmManager();
    registerCharms();
  }

  /**
   * Event subscription system
   */
  on<T extends GameAPIEvent>(event: T, callback: (data: GameAPIEventData[T]) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off<T extends GameAPIEvent>(event: T, callback: (data: GameAPIEventData[T]) => void): void {
    this.eventListeners.get(event)?.delete(callback);
  }

  private emit<T extends GameAPIEvent>(event: T, data: GameAPIEventData[T]): void {
    this.eventListeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
        this.emit('error', { error: error as Error, context: { event, data } });
      }
    });
  }

  /**
   * Initialize a new game
   */
  async initializeGame(config: GameConfig): Promise<InitializeGameResult> {
    const gameState = createInitialGameState(config.diceSetConfig);
    
    // Don't create level/round here - that's done by initializeLevel
    // The game state will have an empty level state that needs to be initialized
    
    this.emit('stateChanged', { gameState });
    
    return { gameState };
  }

  /**
   * Initialize a level (creates level state and first round)
   */
  async initializeLevel(gameState: GameState, levelNumber: number): Promise<{ gameState: GameState }> {
    const newGameState = { ...gameState };
    
    // Use pure function to create level state (includes first round)
    newGameState.currentLevel = createInitialLevelState(levelNumber, newGameState, this.charmManager);
    const roundState = newGameState.currentLevel.currentRound;
    
    if (!roundState) {
      throw new Error('Failed to create round state for level');
    }
    
    // Call charm onRoundStart hooks
    this.charmManager.callAllOnRoundStart({ gameState: newGameState, roundState });
    
    this.emit('levelStarted', {
      levelNumber,
      gameState: newGameState
    });
    this.emit('roundStarted', {
      roundNumber: 1,
      gameState: newGameState
    });
    this.emit('stateChanged', { gameState: newGameState });
    
    return { gameState: newGameState };
  }

  /**
   * Calculate preview scoring for selected dice
   */
  calculatePreviewScoring(
    gameState: GameState,
    selectedIndices: number[]
  ): { isValid: boolean; points: number; combinations: string[]; breakdown?: any } {
    const roundState = gameState.currentLevel.currentRound;
    if (!roundState) {
      return { isValid: false, points: 0, combinations: [] };
    }
    return calculatePreviewScoring(gameState, roundState, selectedIndices, this.charmManager);
  }

  /**
   * Score selected dice
   */
  async scoreDice(
    gameState: GameState,
    selectedIndices: number[]

  ): Promise<ScoreDiceResult> {
    const roundState = gameState.currentLevel.currentRound;
    if (!roundState) {
      throw new Error('No active round to score dice');
    }
    
    // Calculate scoring breakdown using new system
    const breakdown = calculateScoringBreakdown(
      roundState.diceHand,
      selectedIndices,
      gameState,
      roundState,
      this.charmManager
    );
    
    if (!breakdown) {
      return {
        success: false,
        gameState,
        points: 0,
        combinations: [],
        hotDice: false
      };
    }
    
    // Extract final score from breakdown
    const finalPoints = calculateFinalScore(breakdown.final);
    
    // Extract combinations from breakdown
    // Check if combinationTypes were stored in breakdown
    let combinationTypes: string[] = [];
    if ((breakdown as any).combinationTypes) {
      combinationTypes = (breakdown as any).combinationTypes;
    } else {
      // Fallback: extract from description
      const baseStep = breakdown.steps.find(s => s.step === 'baseCombinations');
      if (baseStep) {
        const match = baseStep.description.match(/Base combinations: (.+) =/);
        if (match && match[1]) {
          combinationTypes = match[1].split(', ').map(c => c.trim());
        }
      }
    }
    
    let currentGameState = gameState;
    
    // Remove dice from hand and check for hot dice (includes SwordInTheStone special case)
    const { gameState: stateAfterRemoval, wasHotDice } = removeDiceAndCheckHotDice(
      currentGameState,
      selectedIndices,
      this.charmManager
    );
    currentGameState = stateAfterRemoval;
    
    // Add points to round
    currentGameState = addPointsToRound(currentGameState, finalPoints);
    
    // Increment crystals scored
    const scoredCrystals = selectedIndices.filter((idx: number) => {
      const die = roundState.diceHand[idx];
      return die && die.material === 'crystal';
    }).length;
    
    if (scoredCrystals > 0) {
      currentGameState = incrementCrystalsScored(currentGameState, scoredCrystals);
    }
    
    if (wasHotDice) {
      currentGameState = processHotDice(currentGameState);
    }
    
    // Update roll history
    const currentRoundState = currentGameState.currentLevel.currentRound!;
    const lastRollEntry = currentRoundState.rollHistory.length > 0 
      ? currentRoundState.rollHistory[currentRoundState.rollHistory.length - 1]
      : null;
    const currentRollNumber = lastRollEntry?.rollNumber || 1;
    
    const historyEntry: RollState = {
      rollNumber: currentRollNumber,
      isReroll: false,
      diceHand: wasHotDice ? [] : [...currentRoundState.diceHand],
      selectedDice: [],
      rollPoints: finalPoints,
      maxRollPoints: finalPoints,
      scoringSelection: selectedIndices,
      combinations: combinationTypes as any, // combinationTypes is string[], but RollState expects ScoringCombination[]
      isHotDice: wasHotDice,
      isFlop: false,
      scoringBreakdown: breakdown, // Store breakdown in history
    };
    
    currentGameState = updateRollHistory(currentGameState, historyEntry);
    
    this.emit('diceScored', {
      selectedIndices,
      points: finalPoints,
      combinations: combinationTypes,
      gameState: currentGameState
    });
    this.emit('stateChanged', { gameState: currentGameState });
    
    return {
      success: true,
      gameState: currentGameState,
      points: finalPoints,
      combinations: combinationTypes,
      hotDice: wasHotDice
    };
  }

  /**
   * Bank points from current round
   */
  async bankPoints(gameState: GameState): Promise<BankPointsResult> {
    const roundState = gameState.currentLevel.currentRound;
    if (!roundState) {
      throw new Error('No active round to bank points');
    }
    
    // Use pure function to process banking (charm effects applied after banking)
    const result = processBankPoints(gameState, roundState, this.charmManager);
    
    // Check if game should end (no banks remaining) - only if level not completed
    // If level is completed, player proceeds to tally/shop, not game over
    if (!result.levelCompleted && isGameOver(result.newGameState)) {
      const finalGameState = endGame(result.newGameState, 'lost');
      this.emit('gameEnded', {
        reason: 'lost',
        gameState: finalGameState
      });
      return {
        gameState: finalGameState,
        bankedPoints: result.bankedPoints,
        levelCompleted: result.levelCompleted
      };
    }
    
    // Emit events
    this.emit('pointsBanked', {
      points: result.bankedPoints,
      gameState: result.newGameState
    });
    this.emit('roundEnded', {
      roundNumber: result.newRoundState.roundNumber,
      reason: 'banked',
      gameState: result.newGameState
    });
    
    if (result.levelCompleted) {
      // Level is complete 
      // Don't advance level yet - happens after shop
      this.emit('levelCompleted', {
        levelNumber: result.newGameState.currentLevel.levelNumber,
        gameState: result.newGameState
      });
    }
    
    if (result.newGameState.isActive && !result.levelCompleted) {
      this.emit('stateChanged', { gameState: result.newGameState });
    }
    
    return {
      gameState: result.newGameState,
      bankedPoints: result.bankedPoints,
      levelCompleted: result.levelCompleted
    };
  }

  /**
   * Tally level completion (calculate and apply rewards)
   * This is the "cashing out" phase - applies rewards and prepares for shop
   */
  async tallyLevel(gameState: GameState): Promise<{ gameState: GameState; rewards: LevelRewards }> {
    const completedLevelNumber = gameState.currentLevel.levelNumber;
    const result = tallyLevelFunction(gameState, completedLevelNumber);
    
    this.emit('levelTallied', {
      levelNumber: completedLevelNumber,
      rewards: result.rewards,
      gameState: result.gameState
    });
    this.emit('stateChanged', { gameState: result.gameState });
    
    return {
      gameState: result.gameState,
      rewards: result.rewards
    };
  }

  /**
   * Handle flop (no valid scoring combinations)
   */
  async handleFlop(gameState: GameState): Promise<FlopResult> {
    const roundState = gameState.currentLevel.currentRound;
    if (!roundState) {
      throw new Error('No active round to handle flop');
    }
    
    const forfeitedPoints = roundState.roundPoints;
    
    let newGameState = incrementConsecutiveFlops(gameState);
    newGameState = setForfeitedPoints(newGameState, forfeitedPoints);
    newGameState = endRound(newGameState, 'flopped');
    
    const consecutiveFlops = newGameState.currentLevel.consecutiveFlops;
    
    this.emit('flopOccurred', {
      forfeitedPoints,
      consecutiveFlops,
      gameState: newGameState
    });
    this.emit('roundEnded', {
      roundNumber: newGameState.currentLevel.currentRound?.roundNumber || 0,
      reason: 'flopped',
      gameState: newGameState
    });
    
    // Game over check for consecutive flops is handled in updateGameStateAfterRound
    if (!newGameState.isActive && newGameState.endReason === 'lost') {
      this.emit('gameEnded', {
        reason: 'lost',
        gameState: newGameState
      });
    }
    
    this.emit('stateChanged', { gameState: newGameState });
    
    return {
      gameState: newGameState,
      forfeitedPoints,
      consecutiveFlops
    };
  }

  /**
   * Start a new round
   */
  async startNewRound(gameState: GameState): Promise<{ gameState: GameState }> {
    const result = startNewRound(gameState, this.charmManager);
    
    this.emit('roundStarted', {
      roundNumber: result.newGameState.currentLevel.currentRound?.roundNumber || 1,
      gameState: result.newGameState
    });
    this.emit('stateChanged', { gameState: result.newGameState });
    
    return { gameState: result.newGameState };
  }

  /**
   * Reroll specific dice (before scoring - keep some dice, reroll others)
   */
  async rerollDice(
    gameState: GameState,
    diceToReroll: number[]
  ): Promise<RerollDiceResult> {
    const roundState = gameState.currentLevel.currentRound;
    if (!roundState) {
      throw new Error('No active round to reroll dice');
    }
    
    // Use atomic actions
    let newGameState = randomizeSelectedDice(gameState, diceToReroll);
    newGameState = decrementRerolls(newGameState);
    
    // Check for flop
    const newRoundState = newGameState.currentLevel.currentRound;
    if (!newRoundState) {
      throw new Error('Round state lost after reroll');
    }
    const flopResult = isFlop(newRoundState.diceHand);
    
    this.emit('diceRolled', {
      rollNumber: newRoundState.rollHistory.length + 1,
      gameState: newGameState
    });
    this.emit('stateChanged', { gameState: newGameState });
    
    return { gameState: newGameState, isFlop: flopResult };
  }

  /**
   * Roll dice 
   * NOTE: This is a ROLL, not a reroll. Reroll only happens before scoring.
   * If diceHand is empty (hot dice), resets it to full set before rolling.
   */
  async rollDice(gameState: GameState): Promise<RollDiceResult> {
    const roundState = gameState.currentLevel.currentRound;
    if (!roundState) {
      throw new Error('No active round to roll dice');
    }
    
    // Hot dice should have been processed during scoring, so diceHand should already be reset
    // If diceHand is empty and we have history, hot dice occurred but wasn't reset - fix it
    let newGameState = { ...gameState };
    if (roundState.diceHand.length === 0 && roundState.rollHistory.length > 0) {
      newGameState = processHotDice(newGameState);
    }
    const currentRoundState = newGameState.currentLevel.currentRound;
    if (!currentRoundState) {
      throw new Error('No active round to roll dice');
    }
    const result = processRoll(currentRoundState, newGameState.diceSet);
    
    // Update game state
    newGameState.currentLevel = { ...newGameState.currentLevel };
    newGameState.currentLevel.currentRound = result.newRoundState;
    
    // Get roll number from history
    const rollNumber = result.newRoundState.rollHistory[result.newRoundState.rollHistory.length - 1]?.rollNumber || 1;
    
    const isFlopResult = isFlop(result.newRoundState.diceHand);
    const shieldCheck = this.charmManager.checkFlopShieldAvailable({ gameState: newGameState, roundState: result.newRoundState });
    
    this.emit('diceRolled', {
      rollNumber,
      gameState: newGameState
    });
    this.emit('stateChanged', { gameState: newGameState });
    
    return {
      gameState: newGameState,
      rollNumber,
      isFlop: isFlopResult,
      flopShieldAvailable: shieldCheck.available
    };
  }

  /**
   * Generate shop inventory
   */
  generateShop(gameState: GameState): ShopState {
    return generateShopInventory(gameState);
  }

  /**
   * Purchase charm from shop
   */
  async purchaseCharm(gameState: GameState, shopState: ShopState, charmIndex: number): Promise<{ success: boolean; message: string; gameState: GameState }> {
    const result = purchaseCharm(gameState, shopState, charmIndex);
    
    if (result.success && result.gameState) {
      this.emit('stateChanged', { gameState: result.gameState });
      return { ...result, gameState: result.gameState };
    }
    
    return { ...result, gameState };
  }

  /**
   * Purchase consumable from shop
   */
  async purchaseConsumable(gameState: GameState, shopState: ShopState, consumableIndex: number): Promise<{ success: boolean; message: string; gameState: GameState }> {
    const result = purchaseConsumable(gameState, shopState, consumableIndex);
    
    if (result.success && result.gameState) {
      this.emit('stateChanged', { gameState: result.gameState });
      return { ...result, gameState: result.gameState };
    }
    
    return { ...result, gameState };
  }

  /**
   * Purchase blessing from shop
   */
  async purchaseBlessing(gameState: GameState, shopState: ShopState, blessingIndex: number): Promise<{ success: boolean; message: string; gameState: GameState }> {
    const result = purchaseBlessing(gameState, shopState, blessingIndex);
    
    if (result.success && result.gameState) {
      this.emit('stateChanged', { gameState: result.gameState });
      return { ...result, gameState: result.gameState };
    }
    
    return { ...result, gameState };
  }

  /**
   * Check if a roll is a flop (no valid scoring combinations)
   */
  checkFlop(gameState: GameState): boolean {
    const roundState = gameState.currentLevel.currentRound;
    if (!roundState) return false;
    return isFlop(roundState.diceHand);
  }

  /**
   * Check if player can reroll
   */
  canReroll(gameState: GameState): boolean {
    const roundState = gameState.currentLevel.currentRound;
    if (!roundState) return false;
    return roundState.isActive 
      && roundState.diceHand.length > 0
      && (gameState.currentLevel.rerollsRemaining || 0) > 0;
  }

  /**
   * Check if player can roll
   */
  canRoll(gameState: GameState): boolean {
    if (!gameState.isActive) return false;
    if ((gameState.currentLevel.banksRemaining || 0) <= 0) return false;
    const roundState = gameState.currentLevel.currentRound;
    if (!roundState) return true; // Can start new round
    if (!roundState.isActive) return true; // Can start new round
    // Can roll if no dice rolled yet in this round
    return roundState.rollHistory.length === 0;
  }

  /**
   * Check if player can bank points
   */
  canBankPoints(gameState: GameState): boolean {
    return canBankPointsLogic(gameState);
  }

  /**
   * Check if hot dice occurred
   */
  isHotDice(gameState: GameState): boolean {
    return isHotDice(gameState, this.charmManager);
  }

  /**
   * Check if game is over
   */
  isGameOver(gameState: GameState): boolean {
    return isGameOver(gameState);
  }

  /**
   * Check if level is completed
   */
  isLevelCompleted(gameState: GameState): boolean {
    return isLevelCompleted(gameState);
  }

  /**
   * Validate reroll selection
   */
  validateReroll(gameState: GameState, selectedIndices: number[]): { valid: boolean; error?: string } {
    const roundState = gameState.currentLevel.currentRound;
    if (!roundState) {
      return { valid: false, error: 'No active round' };
    }
    return validateRerollSelection(selectedIndices, roundState.diceHand);
  }

  /**
   * Calculate level rewards (without applying them)
   */
  calculateLevelRewards(levelNumber: number, gameState: GameState): LevelRewards {
    return calculateLevelRewards(levelNumber, gameState.currentLevel, gameState);
  }

  /**
   * Use a consumable
   */
  async useConsumable(gameState: GameState, index: number): Promise<{ success: boolean; gameState: GameState; roundState?: RoundState; requiresInput?: any; shouldRemove: boolean }> {
    const roundState = gameState.currentLevel.currentRound || null;
    const newGameState = { ...gameState };
    const newRoundState = roundState ? { ...roundState } : undefined;
    
    const result = applyConsumableEffect(index, newGameState, newRoundState || null, this.charmManager);
    
    // Update game state
    Object.assign(newGameState, result.gameState);
    if (result.roundState && newRoundState) {
      Object.assign(newRoundState, result.roundState);
    }
    
    // Remove consumable if needed
    if (result.shouldRemove) {
      newGameState.consumables.splice(index, 1);
    }
    
    // Check if consumable has 0 uses
    const consumable = newGameState.consumables[index];
    if (consumable && consumable.uses !== undefined && consumable.uses <= 0) {
      newGameState.consumables.splice(index, 1);
    }
    
    // Update round state if it exists
    if (newRoundState && result.roundState) {
      newGameState.currentLevel.currentRound = newRoundState;
    }
    
    this.emit('stateChanged', { gameState: newGameState });
    
    return {
      success: result.success,
      gameState: newGameState,
      roundState: newRoundState,
      requiresInput: result.requiresInput,
      shouldRemove: result.shouldRemove
    };
  }

  /**
   * Advance to next level
   */
  async advanceToNextLevel(gameState: GameState): Promise<{ gameState: GameState }> {
    const newGameState = advanceToNextLevel(gameState, this.charmManager);
    
    this.emit('stateChanged', { gameState: newGameState });
    
    return { gameState: newGameState };
  }

  /**
   * Get charm manager (for charm-specific operations)
   */
  getCharmManager(): CharmManager {
    return this.charmManager;
  }
}

