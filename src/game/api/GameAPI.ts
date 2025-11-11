import { GameInterface } from '../interfaces';
import { GameState, GameConfig } from '../types';
import { CharmManager } from '../logic/charmSystem';
import { 
  processCompleteScoring, 
  calculatePreviewScoring, 
  processRoll,
  resetDiceHandToFullSet,
  rollDice,
  rerollDice as rerollDiceFunction
} from '../logic/gameActions';
import { isFlop, isLevelCompleted, advanceToNextLevel } from '../logic/gameLogic';
import { calculateLevelRewards, applyLevelRewards } from '../logic/tallying';
import { generateShopInventory, purchaseCharm, purchaseConsumable, purchaseBlessing } from '../logic/shop';
import { ShopState } from '../types';
import { GameAPIEvent, GameAPIEventData } from './GameAPIEvents';
import {
  InitializeGameResult,
  RollDiceResult,
  ScoreDiceResult,
  BankPointsResult,
  FlopResult
} from './types';
import { createInitialGameState, createInitialRoundState } from '../utils/factories';
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
    
    // Create initial round state
    const roundState = createInitialRoundState(1);
    // Reset dice hand to full set (same function used for hot dice)
    resetDiceHandToFullSet(roundState.diceHand, gameState.diceSet);
    
    gameState.currentLevel.currentRound = roundState;
    
    // Call charm onRoundStart hooks
    this.charmManager.callAllOnRoundStart({ gameState, roundState });
    
    this.emit('stateChanged', { gameState });
    this.emit('roundStarted', { roundNumber: 1, gameState });
    
    return { gameState };
  }

  /**
   * Calculate preview scoring for selected dice
   */
  calculatePreviewScoring(
    gameState: GameState,
    selectedIndices: number[]
  ): { isValid: boolean; points: number; combinations: string[] } {
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
      return {
        success: false,
        gameState,
        points: 0,
        combinations: [],
        hotDice: false
      };
    }
    
    const result = processCompleteScoring(
      gameState,
      roundState,
      selectedIndices,
      this.charmManager
    );
    
    if (!result.success) {
      return {
        success: false,
        gameState,
        points: 0,
        combinations: [],
        hotDice: false
      };
    }
    
    // Update game state
    const newGameState = { ...result.newGameState };
    newGameState.currentLevel.currentRound = result.newRoundState;
    
    this.emit('diceScored', {
      selectedIndices,
      points: result.finalPoints,
      combinations: result.scoringResult.map((c: any) => c.type),
      gameState: newGameState
    });
    this.emit('stateChanged', { gameState: newGameState });
    
    return {
      success: true,
      gameState: newGameState,
      points: result.finalPoints,
      combinations: result.scoringResult.map((c: any) => c.type),
      hotDice: result.hotDice
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
    
    const newGameState = { ...gameState };
    const newRoundState = { ...roundState };
    
    // Bank the points
    newGameState.currentLevel.pointsBanked += newRoundState.roundPoints;
    newGameState.history.totalScore += newRoundState.roundPoints;
    
    // End the round
    newRoundState.isActive = false;
    newRoundState.banked = true;
    newRoundState.endReason = 'banked';
    
    // Update game state
    newGameState.currentLevel.currentRound = newRoundState;
    
    this.emit('pointsBanked', {
      points: newRoundState.roundPoints,
      gameState: newGameState
    });
    this.emit('roundEnded', {
      roundNumber: newRoundState.roundNumber,
      reason: 'banked',
      gameState: newGameState
    });
    
    // Check if level is completed
    const levelCompleted = isLevelCompleted(newGameState);
    
    if (levelCompleted) {
      // Calculate and apply level rewards
      const completedLevelNumber = newGameState.currentLevel.levelNumber;
      const levelHistory = newGameState.history.levelHistory;
      const completedLevelState = levelHistory[levelHistory.length - 1];
      const rewards = calculateLevelRewards(completedLevelNumber, completedLevelState, newGameState);
      applyLevelRewards(newGameState, rewards);
      
      // Advance to next level
      advanceToNextLevel(newGameState);
      
      // Create new round state for next level
      const newRoundState = createInitialRoundState(1);
      // Reset dice hand to full set (same function used for hot dice)
      resetDiceHandToFullSet(newRoundState.diceHand, newGameState.diceSet);
      newGameState.currentLevel.currentRound = newRoundState;
      
      this.emit('levelCompleted', {
        levelNumber: completedLevelNumber,
        rewards,
        gameState: newGameState
      });
    }
    
    this.emit('stateChanged', { gameState: newGameState });
    
    return {
      gameState: newGameState,
      bankedPoints: newRoundState.roundPoints,
      levelCompleted
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
    
    const newGameState = { ...gameState };
    const newRoundState = { ...roundState };
    
    const forfeitedPoints = newRoundState.roundPoints;
    const consecutiveFlops = newGameState.currentLevel.consecutiveFlops + 1;
    
    // Apply flop penalty
    newGameState.currentLevel.consecutiveFlops = consecutiveFlops;
    newGameState.currentLevel.livesRemaining = (newGameState.currentLevel.livesRemaining || 0) - 1;
    
    // End the round
    newRoundState.isActive = false;
    newRoundState.flopped = true;
    newRoundState.endReason = 'flopped';
    newRoundState.forfeitedPoints = forfeitedPoints;
    
    // Update game state
    newGameState.currentLevel.currentRound = newRoundState;
    
    this.emit('flopOccurred', {
      forfeitedPoints,
      consecutiveFlops,
      gameState: newGameState
    });
    this.emit('roundEnded', {
      roundNumber: newRoundState.roundNumber,
      reason: 'flopped',
      gameState: newGameState
    });
    
    // Check if game is over (lives reached zero)
    if (newGameState.currentLevel.livesRemaining === 0) {
      newGameState.isActive = false;
      newGameState.endReason = 'lost';
      
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
    const newGameState = { ...gameState };
    
    // Determine next round number
    const existingRound = newGameState.currentLevel.currentRound;
    let nextRoundNumber: number;
    
    if (existingRound && existingRound.isActive === true) {
      nextRoundNumber = existingRound.roundNumber;
    } else if (existingRound === undefined) {
      nextRoundNumber = 1;
    } else {
      nextRoundNumber = existingRound.roundNumber + 1;
    }
    
    // Create new round state
    const roundState = createInitialRoundState(nextRoundNumber);
    // Reset dice hand to full set (same function used for hot dice)
    resetDiceHandToFullSet(roundState.diceHand, newGameState.diceSet);
    
    // Call charm onRoundStart hooks
    this.charmManager.callAllOnRoundStart({ gameState: newGameState, roundState });
    
    // Update game state
    newGameState.currentLevel.currentRound = roundState;
    
    this.emit('roundStarted', {
      roundNumber: nextRoundNumber,
      gameState: newGameState
    });
    this.emit('stateChanged', { gameState: newGameState });
    
    return { gameState: newGameState };
  }

  /**
   * Reroll specific dice (before scoring - keep some dice, reroll others)
   */
  async rerollDice(
    gameState: GameState,
    diceToReroll: number[]
  ): Promise<{ gameState: GameState }> {
    const roundState = gameState.currentLevel.currentRound;
    if (!roundState) {
      throw new Error('No active round to reroll dice');
    }
    
    const newGameState = { ...gameState };
    const newRoundState = { ...roundState };
    
    // Reroll the specified dice
    rerollDiceFunction(newRoundState.diceHand, diceToReroll);
    
    // Decrement rerolls remaining
    if (newGameState.currentLevel.rerollsRemaining !== undefined) {
      newGameState.currentLevel.rerollsRemaining--;
    }
    
    // Update game state
    newGameState.currentLevel.currentRound = newRoundState;
    
    this.emit('diceRolled', {
      rollNumber: newRoundState.rollHistory.length + 1,
      gameState: newGameState
    });
    this.emit('stateChanged', { gameState: newGameState });
    
    return { gameState: newGameState };
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
    
    const newGameState = { ...gameState };
    const newRoundState = { ...roundState };
    
    // Check for hot dice (empty diceHand) - processRoll will handle populating if needed
    const isHotDice = newRoundState.diceHand.length === 0;
    
    const result = processRoll(newRoundState, isHotDice ? newGameState.diceSet : undefined);
    
    // Update game state
    newGameState.currentLevel.currentRound = result.newRoundState;
    
    // Get roll number from history
    const lastRollEntry = result.newRoundState.rollHistory[result.newRoundState.rollHistory.length - 1];
    const rollNumber = lastRollEntry?.rollNumber || 1;
    
    this.emit('diceRolled', {
      rollNumber,
      gameState: newGameState
    });
    this.emit('stateChanged', { gameState: newGameState });
    
    return {
      gameState: newGameState,
      rollNumber
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
    const newGameState = { ...gameState };
    const result = purchaseCharm(newGameState, shopState, charmIndex);
    
    this.emit('stateChanged', { gameState: newGameState });
    
    return { ...result, gameState: newGameState };
  }

  /**
   * Purchase consumable from shop
   */
  async purchaseConsumable(gameState: GameState, shopState: ShopState, consumableIndex: number): Promise<{ success: boolean; message: string; gameState: GameState }> {
    const newGameState = { ...gameState };
    const result = purchaseConsumable(newGameState, shopState, consumableIndex);
    
    this.emit('stateChanged', { gameState: newGameState });
    
    return { ...result, gameState: newGameState };
  }

  /**
   * Purchase blessing from shop
   */
  async purchaseBlessing(gameState: GameState, shopState: ShopState, blessingIndex: number): Promise<{ success: boolean; message: string; gameState: GameState }> {
    const newGameState = { ...gameState };
    const result = purchaseBlessing(newGameState, shopState, blessingIndex);
    
    this.emit('stateChanged', { gameState: newGameState });
    
    return { ...result, gameState: newGameState };
  }

  /**
   * Get charm manager (for charm-specific operations)
   */
  getCharmManager(): CharmManager {
    return this.charmManager;
  }
}

