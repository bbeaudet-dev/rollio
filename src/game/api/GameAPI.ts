import { GameInterface } from '../../cli/interfaces';
import { GameState, GameConfig, RoundState, DiceSetConfig, Consumable } from '../types';
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
  updateRollHistory,
  addRollToHistory,
  processHotDice,
  randomizeSelectedDice,
  decrementRerolls,
  resetConsecutiveBanks,
  setForfeitedPoints,
} from '../logic/gameActions';
import {
  incrementConsecutiveFlops,
  applyFlopPenalty,
  checkMaxFlopsPerLevel,
} from '../logic/flops';
import { isGameOver, isFlop, isHotDice, isLevelCompleted, canBankPoints as canBankPointsLogic, canRoll as canRollLogic, canSelectDice as canSelectDiceLogic } from '../logic/gameLogic';
import { endGame, advanceToNextLevel, selectNextWorld } from '../logic/gameActions';
import { getAvailableWorldChoices, getWorldIdForNode } from '../logic/mapGeneration';
import { tallyLevel as tallyLevelFunction, calculateLevelRewards, LevelRewards } from '../logic/tallying';
import { generateShopInventory, purchaseCharm, purchaseConsumable, purchaseBlessing, sellCharm as sellCharmLogic, sellConsumable as sellConsumableLogic, reorderCharm as reorderCharmLogic } from '../logic/shop';
import { validateRerollSelection } from '../logic/rerollLogic';
import { applyConsumableEffect, updateLastConsumableUsed, determineConsumableInputs } from '../logic/consumableEffects';
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
import { resetFlowerCounter } from '../logic/gameActions';


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
   * Accepts either a dice set index (legacy) or a custom DiceSetConfig
   * Optionally accepts selectedCharms, selectedConsumables, and selectedBlessings
   */
  async initializeGame(
    diceSetIndexOrConfig: number | DiceSetConfig,
    difficulty: string,
    selectedCharms?: number[],
    selectedConsumables?: number[],
    selectedBlessings?: number[]
  ): Promise<InitializeGameResult> {
    let diceSetConfig: DiceSetConfig;
    
    if (typeof diceSetIndexOrConfig === 'number') {
      // Legacy: dice set index
    const { ALL_DICE_SETS } = await import('../data/diceSets');
      const selectedSet = ALL_DICE_SETS[diceSetIndexOrConfig];
      diceSetConfig = typeof selectedSet === 'function' ? selectedSet() : selectedSet;
    } else {
      // New: custom dice set config
      diceSetConfig = diceSetIndexOrConfig;
    }
    
    // Initialize game
    const { initializeNewGame } = await import('../utils/factories');
    const gameState = initializeNewGame(
      diceSetConfig, 
      difficulty as any, 
      this.charmManager,
      selectedCharms,
      selectedConsumables,
      selectedBlessings
    );
    
    this.emit('stateChanged', { gameState });
    
    return { gameState };
  }

  /**
   * Initialize a level (creates level state and first round)
   */
  async initializeLevel(gameState: GameState, levelNumber: number): Promise<{ gameState: GameState }> {
    if (!gameState.currentWorld) {
      throw new Error('Cannot initialize level without currentWorld');
    }
    
    const newGameState = { ...gameState };
    newGameState.currentWorld = { ...gameState.currentWorld };
    
    // Use pre-generated config if available (for current world)
    const currentWorld = newGameState.currentWorld;
    const worldLevelIndex = (levelNumber - 1) % 5; // 0-4 index within world
    const preGeneratedConfig = currentWorld.levelConfigs?.[worldLevelIndex];
    
    // Use pure function to create level state (includes first round)
    // Pass pre-generated config to ensure level effects are applied correctly
    const levelState = createInitialLevelState(levelNumber, newGameState, this.charmManager, preGeneratedConfig);
    newGameState.currentWorld.currentLevel = levelState;
    const roundState = levelState.currentRound;
    
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
    const roundState = gameState.currentWorld!.currentLevel.currentRound;
    if (!roundState) {
      return { isValid: false, points: 0, combinations: [] };
    }
    return calculatePreviewScoring(gameState, roundState, selectedIndices, this.charmManager);
  }

  /**
   * Calculate scoring breakdown for selected dice (does not remove dice or modify state)
   * Dice remain in hand until the scoring breakdown is completed
   */
  calculateScoringBreakdownOnly(
    gameState: GameState,
    selectedIndices: number[]
  ): { success: boolean; breakdown?: any; points: number; combinations: string[]; gameState: GameState } {
    const roundState = gameState.currentWorld!.currentLevel.currentRound;
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
        combinations: []
      };
    }
    
    // Extract final score from breakdown
    const finalPoints = calculateFinalScore(breakdown.final);
    
    // Extract combination types from breakdown
    const combinationTypes = extractCombinationTypesFromBreakdown(breakdown);
    
    // Track combination usage with composite keys (this modifies state but doesn't remove dice)
    const updatedGameState = trackCombinationUsage(gameState, breakdown, roundState.diceHand);
    
    // Update high score for single roll if this is higher
    if (finalPoints > (updatedGameState.history.highScoreSingleRoll || 0)) {
      updatedGameState.history.highScoreSingleRoll = finalPoints;
    }
    
    return {
      success: true,
      breakdown,
      points: finalPoints,
      combinations: combinationTypes,
      gameState: updatedGameState
    };
  }

  /**
   * Complete scoring by removing dice and updating state
   * Should be called after breakdown animation completes
   */
  async completeScoring(
    gameState: GameState,
    selectedIndices: number[],
    finalPoints: number,
    combinations: string[],
    breakdown: any
  ): Promise<ScoreDiceResult> {
    // Remove dice from hand and check for hot dice (includes SwordInTheStone special case)
    const { gameState: stateAfterRemoval, wasHotDice } = removeDiceAndCheckHotDice(
      gameState,
      selectedIndices,
      this.charmManager
    );
    let currentGameState = stateAfterRemoval;
    
    // Get current round state after dice removal
    let currentRoundState = currentGameState.currentWorld!.currentLevel.currentRound!;
    
    // Check for Russian Roulette auto-flop (set during scoring by charm)
    const russianRouletteFlop = (currentRoundState as any).russianRouletteFlop;
    if (russianRouletteFlop) {
      // Clear the flag
      delete (currentRoundState as any).russianRouletteFlop;
      // Clear all dice from hand to trigger flop on next check
      currentRoundState.diceHand = [];
      // The flop will be detected on the next action (bank/roll)
    }
    
    // Add points to round
    currentGameState = addPointsToRound(currentGameState, finalPoints);
    
    if (wasHotDice) {
      // Get remaining dice before hot dice reset for Body Double check
      const remainingDiceBeforeReset = currentGameState.currentWorld!.currentLevel.currentRound!.diceHand;
      currentGameState = processHotDice(currentGameState, remainingDiceBeforeReset, this.charmManager);
    }
    
    // Update roll history 
    currentRoundState = currentGameState.currentWorld!.currentLevel.currentRound!;
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
      combinations: combinations as any, // combinations is string[], but RollState expects ScoringCombination[]
      isHotDice: wasHotDice,
      isFlop: false,
      scoringBreakdown: breakdown, // Store breakdown in history
    };
    
    currentGameState = updateRollHistory(currentGameState, historyEntry);
    
    // Track dice scored for Sleeper Agent charm
    const { trackDiceScoredForSleeperAgent } = await import('../logic/charms/RareCharms');
    currentGameState = trackDiceScoredForSleeperAgent(currentGameState, selectedIndices.length);
    
    // Update Generator charm category after scoring breakdown completes
    const { updateGeneratorCategory } = await import('../logic/charms/charmUtils');
    currentGameState = updateGeneratorCategory(currentGameState);
    
    this.emit('diceScored', {
      selectedIndices,
      points: finalPoints,
      combinations: combinations,
      gameState: currentGameState
    });
    this.emit('stateChanged', { gameState: currentGameState });
    
    return {
      success: true,
      gameState: currentGameState,
      points: finalPoints,
      combinations: combinations,
      hotDice: wasHotDice,
      breakdown
    };
  }


  /**
   * Score selected dice (complete flow - for CLI/backward compatibility)
   */
  async scoreDice(
    gameState: GameState,
    selectedIndices: number[]
  ): Promise<ScoreDiceResult> {
    const calculation = this.calculateScoringBreakdownOnly(gameState, selectedIndices);
    if (!calculation.success || !calculation.breakdown) {
      return {
        success: false,
        gameState,
        points: 0,
        combinations: [],
        hotDice: false,
        breakdown: undefined
      };
    }
    
    return this.completeScoring(
      calculation.gameState,
      selectedIndices,
      calculation.points,
      calculation.combinations,
      calculation.breakdown
    );
  }

  /**
   * Bank points from current round
   */
  async bankPoints(gameState: GameState): Promise<BankPointsResult> {
    const roundState = gameState.currentWorld!.currentLevel.currentRound;
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
      const finalGameState = endGame(result.newGameState, false);
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
      reason: 'bank',
      gameState: result.newGameState
    });
    
    if (result.levelCompleted) {
      // Level is complete 
      // Don't advance level yet - happens after shop
      this.emit('levelCompleted', {
        levelNumber: result.newGameState.currentWorld!.currentLevel.levelNumber,
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
    const completedLevelNumber = gameState.currentWorld!.currentLevel.levelNumber;
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
    const roundState = gameState.currentWorld!.currentLevel.currentRound;
    if (!roundState) {
      throw new Error('No active round to handle flop');
    }
    
    const forfeitedPoints = roundState.roundPoints;
    
    // Call onFlop for all charms to allow tracking (e.g., Sandbagger)
    // This happens before state updates so charms can see the current state
    this.charmManager.callAllOnFlop({
      gameState,
      roundState
    });
    
    let newGameState = incrementConsecutiveFlops(gameState);
    newGameState = resetConsecutiveBanks(newGameState);
    newGameState = setForfeitedPoints(newGameState, forfeitedPoints);
    newGameState = resetFlowerCounter(newGameState);
    newGameState = endRound(newGameState, 'flop');
    newGameState = applyFlopPenalty(newGameState);
    newGameState = checkMaxFlopsPerLevel(newGameState);
    
    const consecutiveFlops = newGameState.consecutiveFlops;
    
    this.emit('flopOccurred', {
      forfeitedPoints,
      consecutiveFlops,
      gameState: newGameState
    });
    this.emit('roundEnded', {
      roundNumber: newGameState.currentWorld!.currentLevel.currentRound?.roundNumber || 0,
      reason: 'flop',
      gameState: newGameState
    });
    
    // Game over check for consecutive flops is handled in updateGameStateAfterRound
    if (!newGameState.isActive && newGameState.won === false) {
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
      roundNumber: result.newGameState.currentWorld!.currentLevel.currentRound?.roundNumber || 1,
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
    const roundState = gameState.currentWorld!.currentLevel.currentRound;
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
    const newRoundState = newGameState.currentWorld!.currentLevel.currentRound;
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
    const roundState = gameState.currentWorld!.currentLevel.currentRound;
    if (!roundState) {
      throw new Error('No active round to roll dice');
    }
    
    const newRoundState = processRoll(roundState, gameState.diceSet);
    
    // Update game state with new round state
    let newGameState = { ...gameState };
    if (!newGameState.currentWorld) {
      throw new Error('Cannot roll dice without currentWorld');
    }
    if (!gameState.currentWorld) {
      throw new Error('Cannot roll dice without currentWorld');
    }
    newGameState.currentWorld = {
      ...gameState.currentWorld,
      currentLevel: {
        ...gameState.currentWorld.currentLevel,
        currentRound: newRoundState
      }
    };
    
    // Check for flop (this already checks for flop shield availability)
    const isFlopResult = isFlop(newRoundState.diceHand, newGameState);
    
    // Add roll to history
    newGameState = addRollToHistory(newGameState, newRoundState.diceHand, isFlopResult, false);
    
    const roundStateAfterRoll = newGameState.currentWorld!.currentLevel.currentRound!;
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
   * Refresh shop - handles voucher logic
   */
  async refreshShop(gameState: GameState, shopState: ShopState): Promise<{ success: boolean; message: string; gameState?: GameState }> {
    const { refreshShop: refreshShopFn } = await import('../logic/shop');
    return refreshShopFn(gameState, shopState);
  }

  /**
   * Purchase charm from shop
   */
  async purchaseCharm(gameState: GameState, shopState: ShopState, charmIndex: number): Promise<{ success: boolean; message: string; gameState: GameState }> {
    const result = purchaseCharm(gameState, shopState, charmIndex);
    
    if (result.success && result.gameState) {
      // Sync charm manager with updated gameState to include newly purchased charm
      this.charmManager.syncFromGameState(result.gameState);
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
    const roundState = gameState.currentWorld!.currentLevel.currentRound;
    if (!roundState) return false;
    return isFlop(roundState.diceHand, gameState);
  }

  /**
   * Get the number of dice that will be rolled on the next roll
   * Handles hot dice, empty dice hand, and ended round cases
   */
  getDiceToRollCount(gameState: GameState): number {
    const roundState = gameState.currentWorld!.currentLevel.currentRound;
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
    if (!justBanked || !gameState.currentWorld) {
      return null;
    }
    
    const currentPointsBanked = gameState.currentWorld.currentLevel.pointsBanked || 0;
    
    // When we bank, the previous round is stored in currentLevel.currentRound with isActive=false
    // The roundPoints from that round is what was just banked
    const currentRound = gameState.currentWorld.currentLevel.currentRound;
    if (currentRound && !currentRound.isActive && currentRound.endReason === 'bank') {
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
    return canRollLogic(gameState);
  }

  /**
   * Check if player can select dice
   */
  canSelectDice(gameState: GameState): boolean {
    return canSelectDiceLogic(gameState);
  }

  /**
   * Check if player can reroll (before scoring - after rolling dice)
   */
  canReroll(gameState: GameState): boolean {
    if (!gameState.currentWorld) return false;
    const roundState = gameState.currentWorld.currentLevel.currentRound;
    if (!roundState) return false;
    return roundState.isActive
      && roundState.diceHand.length > 0
      && (gameState.currentWorld.currentLevel.rerollsRemaining || 0) > 0;
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
    const roundState = gameState.currentWorld!.currentLevel.currentRound;
    if (!roundState) {
      return { valid: false, error: 'No active round' };
    }
    return validateRerollSelection(selectedIndices, roundState.diceHand);
  }

  /**
   * Calculate level rewards (without applying them)
   */
  calculateLevelRewards(levelNumber: number, gameState: GameState): LevelRewards {
    if (!gameState.currentWorld) {
      throw new Error('Cannot calculate level rewards without currentWorld');
    }
    return calculateLevelRewards(levelNumber, gameState.currentWorld.currentLevel, gameState, this.charmManager);
  }

  /**
   * Use a consumable
   */
  async useConsumable(
    gameState: GameState, 
    index: number, 
    selectedDiceIndices?: number[]
  ): Promise<{ success: boolean; gameState: GameState; roundState?: RoundState; requiresInput?: any; shouldRemove: boolean; unlockInfo?: { type: 'pip_effect' | 'material'; id: string } }> {
    const roundState = gameState.currentWorld!.currentLevel.currentRound || null;
    const consumable = gameState.consumables[index];
    
    if (!consumable) {
      return {
        success: false,
        gameState,
        roundState: roundState || undefined,
        shouldRemove: false
      };
    }

    // Determine inputs from selected dice indices
    const { dieSelectionInput, dieSideSelectionInput } = determineConsumableInputs(
      consumable,
      selectedDiceIndices,
      roundState
    );

    const result = await applyConsumableEffect(
      index,
      gameState,
      roundState,
      this.charmManager,
      dieSelectionInput,
      dieSideSelectionInput
    );
    
    const finalGameState = result.gameState;
    
    // Remove consumable if needed
    if (result.shouldRemove) {
      finalGameState.consumables.splice(index, 1);
    }
    
    // Update round state if it exists
    if (roundState && result.roundState && finalGameState.currentWorld) {
      finalGameState.currentWorld = {
        ...finalGameState.currentWorld,
        currentLevel: {
          ...finalGameState.currentWorld.currentLevel,
          currentRound: result.roundState
        }
      };
    }
    
    this.emit('stateChanged', { gameState: finalGameState });
    
    return {
      success: result.success,
      gameState: finalGameState,
      roundState: result.roundState || roundState || undefined,
      requiresInput: result.requiresInput,
      shouldRemove: result.shouldRemove,
      unlockInfo: result.unlockInfo
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
   * Get available world choices from current map position
   */
  getAvailableWorlds(gameState: GameState): { nodeId: number; worldId: string; worldNumber: number }[] {
    if (!gameState.gameMap) {
      return [];
    }

    // If no world selected yet (game start), show world 1 options (column 1)
    // Otherwise, show choices from current position
    let availableNodeIds: number[];
    if (!gameState.currentWorld) {
      // Game start - show world 1 options
      const world1Nodes = gameState.gameMap.nodes.filter(n => n.column === 1 && n.worldNumber === 1);
      availableNodeIds = world1Nodes.map(n => n.nodeId);
    } else {
      availableNodeIds = getAvailableWorldChoices(gameState.gameMap);
    }
    
    return availableNodeIds.map(nodeId => {
      const worldId = getWorldIdForNode(gameState.gameMap!, nodeId);
      const node = gameState.gameMap!.nodes.find(n => n.nodeId === nodeId);
      return {
        nodeId,
        worldId: worldId || '',
        worldNumber: node?.worldNumber || 0,
      };
    });
  }

  /**
   * Select a world and advance to first level of that world
   */
  async selectWorld(gameState: GameState, selectedNodeId: number): Promise<{ gameState: GameState }> {
    if (!gameState.gameMap) {
      throw new Error('Game map not found - cannot select world');
    }

    // Validate that the node is available
    const availableNodeIds = getAvailableWorldChoices(gameState.gameMap);
    if (!availableNodeIds.includes(selectedNodeId)) {
      // Also check if this is game start (no currentWorld)
      if (!gameState.currentWorld) {
        const world1Nodes = gameState.gameMap.nodes.filter(n => n.column === 1 && n.worldNumber === 1);
        const world1NodeIds = world1Nodes.map(n => n.nodeId);
        if (!world1NodeIds.includes(selectedNodeId)) {
          throw new Error(`Node ${selectedNodeId} is not available from current position`);
        }
      } else {
        throw new Error(`Node ${selectedNodeId} is not available from current position`);
      }
    }

    const newGameState = selectNextWorld(gameState, selectedNodeId, this.charmManager);
    
    const selectedNode = gameState.gameMap.nodes.find(n => n.nodeId === selectedNodeId);
    const worldId = selectedNode?.worldId || '';
    
    this.emit('worldSelected', {
      worldId: worldId,
      gameState: newGameState
    });
    this.emit('stateChanged', { gameState: newGameState });
    this.emit('levelStarted', {
      levelNumber: newGameState.currentWorld!.currentLevel.levelNumber,
      gameState: newGameState,
    });
    
    return { gameState: newGameState };
  }

  /**
   * Get charm manager (for charm-specific operations)
   */
  getCharmManager(): CharmManager {
    return this.charmManager;
  }

  /**
   * Sell a charm
   */
  async sellCharm(gameState: GameState, charmIndex: number): Promise<{ success: boolean; message: string; gameState: GameState }> {
    const result = sellCharmLogic(gameState, charmIndex);
    if (result.success && result.gameState) {
      this.emit('stateChanged', { gameState: result.gameState });
    }
    return {
      success: result.success,
      message: result.message,
      gameState: result.gameState || gameState
    };
  }

  /**
   * Sell a consumable
   */
  async sellConsumable(gameState: GameState, consumableIndex: number): Promise<{ success: boolean; message: string; gameState: GameState }> {
    const result = sellConsumableLogic(gameState, consumableIndex);
    if (result.success && result.gameState) {
      this.emit('stateChanged', { gameState: result.gameState });
    }
    return {
      success: result.success,
      message: result.message,
      gameState: result.gameState || gameState
    };
  }

  /**
   * Reorder a charm (move left or right in the charms array)
   */
  async reorderCharm(gameState: GameState, charmIndex: number, direction: 'left' | 'right'): Promise<{ success: boolean; message: string; gameState: GameState }> {
    const result = reorderCharmLogic(gameState, charmIndex, direction);
    if (result.success && result.gameState) {
      this.emit('stateChanged', { gameState: result.gameState });
    }
    return {
      success: result.success,
      message: result.message,
      gameState: result.gameState || gameState
    };
  }
}

