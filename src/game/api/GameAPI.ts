import { GameInterface } from '../../cli/interfaces';
import { GameState, GameConfig, RoundState } from '../types';
import { CharmManager } from '../logic/charmSystem';
import { extractCombinationTypesFromBreakdown, trackCombinationUsage } from '../utils/combinationTracking';
import { 
  calculatePreviewScoring, 
  processRoll,
  processBankPoints,
  startNewRound,
  endRound,
  removeDiceAndCheckHotDice,
  addPointsToRound,
  incrementCrystalsScored,
  updateRollHistory,
  addRollToHistory,
  processHotDice,
  randomizeSelectedDice,
  decrementRerolls,
  incrementConsecutiveFlops,
  resetConsecutiveBanks,
  setForfeitedPoints,
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
import { createInitialGameState, createInitialLevelState, registerStartingCharms } from '../utils/factories';
import { registerCharms } from '../logic/charms/index';
import { checkFlopShieldAvailable } from '../logic/charms/CommonCharms';

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
  async initializeGame(
    diceSetIndex: number,
    difficulty: string
  ): Promise<InitializeGameResult> {
    const { ALL_DICE_SETS } = await import('../data/diceSets');
    const selectedSet = ALL_DICE_SETS[diceSetIndex];
    const diceSetConfig = typeof selectedSet === 'function' ? selectedSet() : selectedSet;
    
    // Initialize game - all logic is in factories
    const { initializeNewGame } = await import('../utils/factories');
    const gameState = initializeNewGame(diceSetConfig, difficulty as any, this.charmManager);
    
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
        hotDice: false,
        breakdown: undefined
      };
    }
    
    // Extract final score from breakdown
    const finalPoints = calculateFinalScore(breakdown.final);
    
    // Update high score for single roll if this is higher
    if (finalPoints > (gameState.history.highScoreSingleRoll || 0)) {
      gameState.history.highScoreSingleRoll = finalPoints;
    }
    
    // Extract combination types from breakdown
    const combinationTypes = extractCombinationTypesFromBreakdown(breakdown);
    
    // Track combination usage with composite keys
    let currentGameState = trackCombinationUsage(gameState, breakdown, roundState.diceHand);
    
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
      hotDice: wasHotDice,
      breakdown
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
    
    // Update high score for bank if this is higher
    if (result.bankedPoints > (result.newGameState.history.highScoreBank || 0)) {
      result.newGameState.history.highScoreBank = result.bankedPoints;
    }
    
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
    const result = tallyLevelFunction(gameState, completedLevelNumber, this.charmManager);
    
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
    newGameState = resetConsecutiveBanks(newGameState);
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
    
    // Special case: skip reroll
    // Player intentionally chose to skip reroll - if it's a flop, handle it immediately
    if (diceToReroll.length === 0) {
      const isFlopResult = isFlop(roundState.diceHand, gameState);
      const shieldCheck = checkFlopShieldAvailable(gameState);
      
      // If it's a flop, handle it (player chose to skip reroll)
      if (isFlopResult) {
        // If shield is available, return that info so UI can prompt
        if (shieldCheck.available) {
          return {
            gameState,
            isFlop: true,
            flopShieldAvailable: true
          };
        }
        
        // No shield available - handle the flop immediately
        const flopResult = await this.handleFlop(gameState);
        return {
          gameState: flopResult.gameState,
          isFlop: true,
          flopShieldAvailable: false
        };
      }
      
      // Not a flop - return result
      return { 
        gameState, 
        isFlop: false,
        flopShieldAvailable: false
      };
    }
    
    let newGameState = randomizeSelectedDice(gameState, diceToReroll);
    newGameState = decrementRerolls(newGameState);
    
    // Check for flop
    const newRoundState = newGameState.currentLevel.currentRound;
    if (!newRoundState) {
      throw new Error('Round state lost after reroll');
    }
    const flopResult = isFlop(newRoundState.diceHand, newGameState);
    const shieldCheck = checkFlopShieldAvailable(newGameState);
    
    this.emit('diceRolled', {
      rollNumber: newRoundState.rollHistory.length + 1,
      gameState: newGameState
    });
    this.emit('stateChanged', { gameState: newGameState });
    
    return { 
      gameState: newGameState, 
      isFlop: flopResult,
      flopShieldAvailable: shieldCheck.available
    };
  }

  /**
   * Roll dice 
   * NOTE: This is a ROLL, not a reroll. Reroll only happens before scoring.
   * processRoll already handles empty diceHand (populates from diceSet)
   */
  async rollDice(gameState: GameState): Promise<RollDiceResult> {
    const roundState = gameState.currentLevel.currentRound;
    if (!roundState) {
      throw new Error('No active round to roll dice');
    }
    
    const newRoundState = processRoll(roundState, gameState.diceSet);
    
    // Update game state with new round state
    let newGameState = { ...gameState };
    newGameState.currentLevel = { ...gameState.currentLevel };
    newGameState.currentLevel.currentRound = newRoundState;
    
    // Check for flop (this already checks for flop shield availability)
    const isFlopResult = isFlop(newRoundState.diceHand, newGameState);
    
    // Add roll to history
    newGameState = addRollToHistory(newGameState, newRoundState.diceHand, isFlopResult, false);
    
    const roundStateAfterRoll = newGameState.currentLevel.currentRound!;
    const rollNumber = roundStateAfterRoll.rollHistory[roundStateAfterRoll.rollHistory.length - 1]?.rollNumber || 1;
    
    // Check if flop shield is available (for UI purposes)
    const shieldCheck = checkFlopShieldAvailable(newGameState);
    
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
    return isFlop(roundState.diceHand, gameState);
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
   * Get the number of dice that will be rolled on the next roll
   * Handles hot dice, empty dice hand, and ended round cases
   */
  getDiceToRollCount(gameState: GameState): number {
    const roundState = gameState.currentLevel.currentRound;
    if (!roundState) {
      // No round state - use full dice set
      return gameState.diceSet.length;
    }

    // If round is ended (e.g., after flop or banking), next roll will start a new round with full dice set
    if (!roundState.isActive) {
      return gameState.diceSet.length;
    }

    // If dice hand is empty, roll full set (for both hot dice and new round/level cases)
    if (roundState.diceHand.length === 0) {
      return gameState.diceSet.length;
    }
    
    // Otherwise, use remaining dice count
    return roundState.diceHand.length;
  }

  /**
   * Get banking display information for UI
   * Returns the points that were just banked and totals for display
   */
  getBankingDisplayInfo(gameState: GameState, justBanked: boolean): {
    pointsJustBanked: number;
    previousTotal: number;
    newTotal: number;
  } | null {
    if (!justBanked || !gameState?.currentLevel) {
      return null;
    }
    
    const currentPointsBanked = gameState.currentLevel.pointsBanked || 0;
    
    // When we bank, the previous round is stored in currentLevel.currentRound with isActive=false
    // The roundPoints from that round is what was just banked
    const currentRound = gameState.currentLevel.currentRound;
    if (currentRound && !currentRound.isActive && currentRound.banked) {
      // This is the round that was just banked
      const pointsJustBanked = currentRound.roundPoints || 0;
      const previousTotal = currentPointsBanked - pointsJustBanked;
      
      return {
        pointsJustBanked,
        previousTotal,
        newTotal: currentPointsBanked
      };
    }
    
    // Fallback: if we can't find it, return null (don't show wrong data)
    return null;
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
    return calculateLevelRewards(levelNumber, gameState.currentLevel, gameState, this.charmManager);
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

