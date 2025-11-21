import { GameState, RoundState, DieValue, LevelState, RollState, Die } from '../types';
import { isFlop, canBankPoints, isLevelCompleted } from './gameLogic';
import { getHighestPointsPartitioning, getAllPartitionings } from './scoring';
import { getDiceIndicesToRemove, handleMirrorDiceRolling, shouldTriggerHotDice } from './materialSystem';
import { createInitialRoundState, createInitialLevelState } from '../utils/factories';
import { validateDiceSelection } from '../utils/effectUtils';
import { getLevelConfig } from '../data/levels';
import { createCombinationKey } from '../utils/combinationTracking';

interface ScoringContext {
  charms: any[];
}

/**
 * ============================================================================
 * ATOMIC ACTIONS - DICE & ROLLING
 * ============================================================================
 * One function = one state change. All functions take GameState and return GameState.
 */

/**
 * Remove dice from hand by indices
 * Note: Uses material system to check for special removal rules (e.g., lead dice stay in hand)
 */
export function removeDiceFromHand(gameState: GameState, indices: number[]): GameState {
  const roundState = gameState.currentLevel.currentRound!;
  
  // Get actual indices to remove (accounting for lead dice, etc.)
  const indicesToRemove = getDiceIndicesToRemove(roundState.diceHand, indices);
  
  const newGameState = { ...gameState };
  newGameState.currentLevel = { ...gameState.currentLevel };
  newGameState.currentLevel.currentRound = { 
    ...roundState,
    diceHand: roundState.diceHand.filter((_, i) => !indicesToRemove.includes(i))
  };
  return newGameState;
}

/**
 * Randomize selected dice values (for rerolling)
 * Handles mirror dice: they copy a non-mirror die's value, or random if all are mirror
 */
export function randomizeSelectedDice(gameState: GameState, indices: number[]): GameState {
  const roundState = gameState.currentLevel.currentRound!;
  const newGameState = { ...gameState };
  newGameState.currentLevel = { ...gameState.currentLevel };
  
  const diceHand = roundState.diceHand.map(d => ({ ...d }));
  
  // First, reroll all selected non-mirror dice
  for (const i of indices) {
    if (diceHand[i].material !== 'mirror') {
      diceHand[i].rolledValue = diceHand[i].allowedValues[Math.floor(Math.random() * diceHand[i].allowedValues.length)];
    }
  }
  
  // Then, handle mirror dice (they copy non-mirror dice or all get same value if all are mirror)
  handleMirrorDiceRolling(diceHand);
  
  newGameState.currentLevel.currentRound = { 
    ...roundState,
    diceHand
  };
  return newGameState;
}

/**
 * Reset dice hand to full set (for hot dice)
 */
export function resetDiceHandToFullSet(gameState: GameState): GameState {
  const roundState = gameState.currentLevel.currentRound!;
  const newGameState = { ...gameState };
  newGameState.currentLevel = { ...gameState.currentLevel };
  newGameState.currentLevel.currentRound = { 
    ...roundState,
    diceHand: gameState.diceSet.map((die: any) => ({ 
      ...die, 
      scored: false,
      rolledValue: undefined
    }))
  };
  return newGameState;
}

/**
 * Increment hot dice counter
 */
export function incrementHotDiceCounter(gameState: GameState): GameState {
  const roundState = gameState.currentLevel.currentRound!;
  const newGameState = { ...gameState };
  newGameState.currentLevel = { ...gameState.currentLevel };
  newGameState.currentLevel.currentRound = { 
    ...roundState,
    hotDiceCounter: (roundState.hotDiceCounter || 0) + 1
  };
  return newGameState;
}

/**
 * ============================================================================
 * ATOMIC ACTIONS - SCORING & POINTS
 * ============================================================================
 */

/**
 * Add points to current round
 */
export function addPointsToRound(gameState: GameState, points: number): GameState {
  const roundState = gameState.currentLevel.currentRound!;
  const newGameState = { ...gameState };
  newGameState.currentLevel = { ...gameState.currentLevel };
  newGameState.currentLevel.currentRound = { 
    ...roundState,
    roundPoints: roundState.roundPoints + points
  };
  return newGameState;
}

/**
 * Add points to level (banked points)
 */
export function addPointsToLevel(gameState: GameState, points: number): GameState {
  const newGameState = { ...gameState };
  newGameState.currentLevel = { ...gameState.currentLevel };
  newGameState.currentLevel.pointsBanked += points;
  return newGameState;
}

/**
 * Increment crystals scored counter
 */
export function incrementCrystalsScored(gameState: GameState, count: number): GameState {
  const roundState = gameState.currentLevel.currentRound!;
  const newGameState = { ...gameState };
  newGameState.currentLevel = { ...gameState.currentLevel };
  newGameState.currentLevel.currentRound = { 
    ...roundState,
    crystalsScoredThisRound: roundState.crystalsScoredThisRound + count
  };
  return newGameState;
}

/**
 * Add entry to roll history
 */
export function updateRollHistory(gameState: GameState, entry: RollState): GameState {
  const roundState = gameState.currentLevel.currentRound!;
  const newGameState = { ...gameState };
  newGameState.currentLevel = { ...gameState.currentLevel };
  newGameState.currentLevel.currentRound = { 
    ...roundState,
    rollHistory: [...roundState.rollHistory, entry]
  };
  return newGameState;
}

/**
 * Add a roll to history
 * Creates a roll entry and adds it to the roll history
 */
export function addRollToHistory(
  gameState: GameState,
  diceHand: Die[],
  isFlop: boolean,
  isReroll: boolean = false
): GameState {
  const roundState = gameState.currentLevel.currentRound!;
  const currentRollNumber = (roundState.rollHistory?.length || 0) + 1;
  
  const rollEntry: RollState = {
    rollNumber: currentRollNumber,
    isReroll,
    diceHand: diceHand.map(d => ({ ...d })),
    selectedDice: [],
    rollPoints: 0,
    maxRollPoints: 0,
    scoringSelection: [],
    combinations: [],
    isHotDice: false,
    isFlop,
  };
  
  return updateRollHistory(gameState, rollEntry);
}

/**
 * ============================================================================
 * ATOMIC ACTIONS - ROUND & LEVEL STATE
 * ============================================================================
 */

/**
 * End round (set isActive to false, set endReason)
 */
export function endRound(gameState: GameState, reason: 'banked' | 'flopped'): GameState {
  const roundState = gameState.currentLevel.currentRound!;
  const newGameState = { ...gameState };
  newGameState.currentLevel = { ...gameState.currentLevel };
  newGameState.currentLevel.currentRound = { 
    ...roundState,
    isActive: false,
    endReason: reason,
    ...(reason === 'banked' ? { banked: true } : { flopped: true })
  };
  
  return newGameState;
}

/**
 * Decrement rerolls remaining
 */
export function decrementRerolls(gameState: GameState): GameState {
  const newGameState = { ...gameState };
  newGameState.currentLevel = { ...gameState.currentLevel };
  if (newGameState.currentLevel.rerollsRemaining !== undefined) {
    newGameState.currentLevel.rerollsRemaining--;
  }
  return newGameState;
}

/**
 * Decrement banks remaining
 */
export function decrementBanks(gameState: GameState): GameState {
  const newGameState = { ...gameState };
  newGameState.currentLevel = { ...gameState.currentLevel };
  newGameState.currentLevel.banksRemaining = 
    (gameState.currentLevel.banksRemaining || 0) - 1;
  return newGameState;
}

/**
 * Increment consecutive flops
 */
export function incrementConsecutiveFlops(gameState: GameState): GameState {
  const newGameState = { ...gameState };
  newGameState.currentLevel = { ...gameState.currentLevel };
  newGameState.currentLevel.consecutiveFlops = 
    (gameState.currentLevel.consecutiveFlops || 0) + 1;
  return newGameState;
}

/**
 * Reset consecutive flop counter to 0
 */
export function resetConsecutiveFlops(gameState: GameState): GameState {
  const newGameState = { ...gameState };
  newGameState.currentLevel = { ...gameState.currentLevel };
  newGameState.currentLevel.consecutiveFlops = 0;
  return newGameState;
}

/**
 * Apply flop penalty: subtract 10% of level threshold from banked points (can go negative)
 * This penalty is applied on every flop, regardless of consecutive flop count
 */
export function applyFlopPenalty(gameState: GameState): GameState {
  const newGameState = { ...gameState };
  newGameState.currentLevel = { ...gameState.currentLevel };
  const levelThreshold = newGameState.currentLevel.levelThreshold;
  const penaltyAmount = levelThreshold * 0.1;
  const currentBanked = newGameState.currentLevel.pointsBanked;
  const newBanked = currentBanked - penaltyAmount;
  newGameState.currentLevel.pointsBanked = newBanked;
  
  // Debug log to verify penalty is applied
  console.log(`[FLOP PENALTY] Banked points reduced from ${currentBanked} to ${newBanked} (penalty: -${penaltyAmount.toFixed(1)}, 10% of threshold ${levelThreshold})`);
  
  return newGameState;
}

/**
 * Increment consecutive banks counter
 */
export function incrementConsecutiveBanks(gameState: GameState): GameState {
  const newGameState = { ...gameState };
  newGameState.consecutiveBanks = (newGameState.consecutiveBanks || 0) + 1;
  return newGameState;
}

/**
 * Reset consecutive banks counter to 0
 */
export function resetConsecutiveBanks(gameState: GameState): GameState {
  const newGameState = { ...gameState };
  newGameState.consecutiveBanks = 0;
  return newGameState;
}

/**
 * Set forfeited points on round
 */
export function setForfeitedPoints(gameState: GameState, points: number): GameState {
  const roundState = gameState.currentLevel.currentRound!;
  const newGameState = { ...gameState };
  newGameState.currentLevel = { ...gameState.currentLevel };
  newGameState.currentLevel.currentRound = { 
    ...roundState,
    forfeitedPoints: points
  };
  return newGameState;
}

/**
 * Get the round points that were just banked
 * Returns the roundPoints from the most recently banked round
 */
export function getBankedRoundPoints(gameState: GameState): number {
  const currentRound = gameState.currentLevel.currentRound;
  if (currentRound && !currentRound.isActive && currentRound.banked) {
    return currentRound.roundPoints || 0;
  }
  return 0;
}

/**
 * Get the level points before the most recent banking
 * Calculates by subtracting the banked round points from current level points
 */
export function getLevelPointsBeforeBanking(gameState: GameState): number {
  const currentPointsBanked = gameState.currentLevel.pointsBanked || 0;
  const bankedRoundPoints = getBankedRoundPoints(gameState);
  return currentPointsBanked - bankedRoundPoints;
}

/**
 * End the game with a specific reason
 */
export function endGame(gameState: GameState, reason: 'lost' | 'win'): GameState {
  const newGameState = { ...gameState };
  newGameState.isActive = false;
  newGameState.endReason = reason;
  return newGameState;
}

/**
 * Handle world completion (every 5 levels: 5, 10, 15, etc.)
 * Called when completing a level that ends a world
 */
export function advanceToNextWorld(
  gameState: GameState,
  completedLevelNumber: number,
  charmManager?: any
): GameState {
  const newGameState = { ...gameState };
  
  // Apply world completion bonuses from charms
  if (charmManager) {
    const activeCharms = charmManager.getActiveCharms?.() || [];
    for (const charm of activeCharms) {
      if (charm.calculateWorldCompletionBonus) {
        const bonus = charm.calculateWorldCompletionBonus(completedLevelNumber, gameState.currentLevel, gameState);
        if (bonus > 0) {
          newGameState.money = (newGameState.money || 0) + bonus;
        }
      }
    }
  }
  
  // TODO: Add more world-specific logic here as needed
  // - World completion rewards
  // - World-specific state updates
  // - World transition effects
  
  return newGameState;
}

/**
 * Advance to the next level
 * Resets level-specific state, applies level effects, moves completed level to history
 */
export function advanceToNextLevel(gameState: GameState, charmManager?: any): GameState {
  const oldLevelNumber = gameState.currentLevel.levelNumber;
  const newLevelNumber = oldLevelNumber + 1;
  
  const newGameState = { ...gameState };
  newGameState.history = { ...newGameState.history };
  newGameState.history.levelHistory = [...gameState.history.levelHistory];
  
  // Move completed level to history 
  const completedLevel: LevelState = {
    ...gameState.currentLevel,
    completed: true,
    roundHistory: gameState.currentLevel.currentRound 
      ? [gameState.currentLevel.currentRound] 
      : [],
  };
  newGameState.history.levelHistory.push(completedLevel);
  
  // Check if we completed a world (every 5 levels: 5, 10, 15, etc.)
  if (oldLevelNumber % 5 === 0) {
    const worldCompletedState = advanceToNextWorld(newGameState, oldLevelNumber, charmManager);
    // Merge world completion changes back into newGameState
    newGameState.money = worldCompletedState.money;
    // Add any other world completion state updates here as needed
  }
  
  // Create new level state (includes first round)
  newGameState.currentLevel = createInitialLevelState(newLevelNumber, newGameState, charmManager);
  
  return newGameState;
}

/**
 * ============================================================================
 * COMPOSITE ACTIONS
 * ============================================================================
 * Actions that combine multiple atomic actions
 */

/**
 * Process hot dice - resets dice hand to full set and increments hot dice counter
 * Should be called when hot dice occurs (diceHand is empty)
 */
export function processHotDice(gameState: GameState): GameState {
  let newGameState = incrementHotDiceCounter(gameState);
  newGameState = resetDiceHandToFullSet(newGameState);
  return newGameState;
}

/**
 * Remove dice from hand and check for hot dice
 * This handles the complete flow of removing dice and determining if hot dice should trigger,
 * including special cases like SwordInTheStone charm.
 * 
 * @param gameState - Current game state
 * @param selectedIndices - Indices of dice to remove (score)
 * @param charmManager - Charm manager to check for special charms
 * @returns Object with updated gameState and whether hot dice occurred
 */
export function removeDiceAndCheckHotDice(
  gameState: GameState,
  selectedIndices: number[],
  charmManager?: any
): { gameState: GameState; wasHotDice: boolean } {
  const roundState = gameState.currentLevel.currentRound!;
  
  // Check if all dice were scored (before removal) - needed for SwordInTheStone charm
  const allDiceWereScored = selectedIndices.length === roundState.diceHand.length;
  
  // Remove dice from hand (Lead dice stay in hand normally)
  let newGameState = removeDiceFromHand(gameState, selectedIndices);
  
  // Check for hot dice (includes SwordInTheStone special case)
  const remainingDice = newGameState.currentLevel.currentRound!.diceHand;
  const wasHotDice = shouldTriggerHotDice(remainingDice, charmManager, allDiceWereScored);
  
  return {
    gameState: newGameState,
    wasHotDice
  };
}

/**
 * ============================================================================
 * HIGHER-LEVEL ACTIONS
 * ============================================================================
 * Actions that coordinate multiple game systems
 */

/**
 * Process rolling dice
 * Pure function that rolls the dice in the current diceHand
 * Note: For hot dice scenarios, call processHotDice first to reset the dice hand
 * Returns the new round state with rolled dice. Does NOT add to history.
 * The caller should use addRollToHistory() after checking for flop.
 */
export function processRoll(
  roundState: RoundState,
  diceSet: any[]
): RoundState {
  const newRoundState = { ...roundState };
  
  // If diceHand is empty, populate it from diceSet (first roll of round)
  // Otherwise, use existing diceHand (subsequent rolls after hot dice)
  const diceToRoll = roundState.diceHand.length === 0 
    ? diceSet.map((die: any) => ({ ...die, scored: false, rolledValue: undefined }))
    : roundState.diceHand.map(d => ({ ...d }));
  
  // Create a new diceHand array with new object references for immutability
  const diceHand = diceToRoll.map(d => ({ ...d }));
  
  // First, roll all dice (non-mirror dice get random values)
  for (const die of diceHand) {
    if (die.material !== 'mirror') {
      die.rolledValue = die.allowedValues[Math.floor(Math.random() * die.allowedValues.length)];
    }
  }
  
  // Then, handle mirror dice (they copy non-mirror dice or all get same value if all are mirror)
  handleMirrorDiceRolling(diceHand);
  
  // Update round state with new diceHand
  newRoundState.diceHand = diceHand;
  
  return newRoundState;
}

/**
 * Process banking points from current round
 * Pure function that handles all banking logic:
 * 1. Validates banks remaining
 * 2. Applies charm effects to banked points
 * 3. Banks points (adds to level and total score)
 * 4. Decrements banks
 * 5. Ends the round
 * 6. Checks for level completion
 */
export function processBankPoints(
  gameState: GameState,
  roundState: RoundState,
  charmManager?: any
): {
  success: boolean;
  newGameState: GameState;
  newRoundState: RoundState;
  bankedPoints: number;
  levelCompleted: boolean;
} {
  // Check if player can bank
  if (!canBankPoints(gameState)) {
    throw new Error('Cannot bank points - check banks remaining, round points, and round state');
  }

  // Bank the base round points first
  const baseBankedPoints = roundState.roundPoints;
  let newGameState = addPointsToLevel(gameState, baseBankedPoints);
  newGameState = decrementBanks(newGameState);
  
  // Track banks used for OneSongGlory charm (increment before ending round)
  newGameState.currentLevel = { ...newGameState.currentLevel };
  newGameState.currentLevel.banksUsed = (newGameState.currentLevel.banksUsed || 0) + 1;
  
  // Track consecutive banks
  newGameState = incrementConsecutiveBanks(newGameState);
  
  newGameState = endRound(newGameState, 'banked');
  
  // Apply charm effects AFTER banking (as bonuses)
  let finalBankedPoints = baseBankedPoints;
  if (charmManager) {
    finalBankedPoints = charmManager.applyBankEffects({
      gameState: newGameState,
      roundState: newGameState.currentLevel.currentRound!,
      bankedPoints: baseBankedPoints
    });
    
    // Add bonus points if any
    const charmBonus = finalBankedPoints - baseBankedPoints;
    if (charmBonus > 0) {
      newGameState = addPointsToLevel(newGameState, charmBonus);
    }
  }
  
  // Check if level is completed
  const levelCompleted = isLevelCompleted(newGameState);

  return {
    success: true,
    newGameState,
    newRoundState: newGameState.currentLevel.currentRound!,
    bankedPoints: finalBankedPoints,
    levelCompleted
  };
}

/**
 * Start a new round
 * Pure function that creates a new round state
 */
export function startNewRound(
  gameState: GameState,
  charmManager: any
): {
  newGameState: GameState;
} {
  // Check if player can start a new round (has banks remaining and game is active)
  if ((gameState.currentLevel.banksRemaining || 0) <= 0) {
    throw new Error('No banks remaining - cannot start new round');
  }
  if (!gameState.isActive) {
    throw new Error('Game is not active - cannot start new round');
  }
  
  const newGameState = { ...gameState };
  
  // Determine next round number
  const existingRound = newGameState.currentLevel.currentRound;
  const nextRoundNumber = existingRound && existingRound.isActive === true
    ? existingRound.roundNumber
    : existingRound === undefined
    ? 1
    : existingRound.roundNumber + 1;
  
  // Create new round state (diceHand will be empty until first roll)
  const roundState = createInitialRoundState(nextRoundNumber);
  
  // Call charm onRoundStart hooks
  charmManager.callAllOnRoundStart({ gameState: newGameState, roundState });
  
  // Update game state
  newGameState.currentLevel.currentRound = roundState;
  
  return { newGameState };
}

/**
 * Calculate preview scoring for selected dice (for UI display)
 * Only returns combinations and validity - no score calculation
 */
export function calculatePreviewScoring(
  gameState: GameState,
  roundState: RoundState,
  selectedIndices: number[],
  charmManager: any
): {
  isValid: boolean;
  points: number;
  combinations: string[];
} {
  if (selectedIndices.length === 0) {
    return { isValid: false, points: 0, combinations: [] };
  }

  try {
    // Just find combinations - no scoring calculation
    const selectedValues = selectedIndices.map(i => roundState.diceHand[i].rolledValue);
    const input = selectedValues.join('');
    
    const context: ScoringContext = { charms: gameState.charms || [] };
    const selectedIndicesFromInput = validateDiceSelection(input, roundState.diceHand.map(die => die.rolledValue) as DieValue[]);
    const allPartitionings = getAllPartitionings(roundState.diceHand, selectedIndicesFromInput, context, gameState);
    
    if (allPartitionings.length === 0) {
      return { isValid: false, points: 0, combinations: [] };
    }
    
    // Get the best partitioning
    const bestPartitioningIndex = getHighestPointsPartitioning(allPartitionings);
    const bestPartitioning = allPartitionings[bestPartitioningIndex] || [];
    const totalComboDice = bestPartitioning.reduce((sum, c) => sum + c.dice.length, 0);
    const valid = bestPartitioning.length > 0 && totalComboDice === selectedIndicesFromInput.length;
    
    // Calculate base points only (for display purposes)
    const basePoints = bestPartitioning.reduce((sum, c) => sum + c.points, 0);
    
    // Convert combinations to composite keys (e.g., "single1", "nPairs:2")
    const combinationKeys = bestPartitioning.map((c: any) => 
      createCombinationKey(c, roundState.diceHand)
    );
    
    return {
      isValid: valid,
      points: basePoints, // Just base combination points, not final score
      combinations: combinationKeys
    };
  } catch (error) {
    return { isValid: false, points: 0, combinations: [] };
  }
}

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 */

/**
 * Applies level effects (boss effects, modifiers) to rerolls and banks
 * Returns modified values after applying all effects
 */
export function applyLevelEffects(
  baseRerolls: number,
  baseBanks: number,
  levelConfig: ReturnType<typeof getLevelConfig>
): { rerolls: number; banks: number } {
  let rerolls = baseRerolls;
  let banks = baseBanks;

  // Apply effects from boss and level modifiers
  const effects = levelConfig.effects || [];
  if (levelConfig.boss?.effects) {
    effects.push(...levelConfig.boss.effects);
  }

  for (const effect of effects) {
    if (effect.banksModifier !== undefined) {
      banks += effect.banksModifier;
    }
    if (effect.rerollsModifier !== undefined) {
      rerolls += effect.rerollsModifier;
    }
  }

  // Ensure values don't go below 0
  rerolls = Math.max(0, rerolls);
  banks = Math.max(0, banks);

  return { rerolls, banks };
}

