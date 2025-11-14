import { GameState, RoundState, DieValue, LevelState, RollState } from '../types';
import { isFlop, canBankPoints, isLevelCompleted } from './gameLogic';
import { getHighestPointsPartitioning, getAllPartitionings } from './scoring';
import { applyMaterialEffects, getDiceIndicesToRemove } from './materialSystem';
import { createInitialRoundState, createInitialLevelState, DEFAULT_GAME_CONFIG } from '../utils/factories';
import { validateDiceSelection } from '../utils/effectUtils';
import { getLevelConfig, MAX_LEVEL } from '../data/levels';

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
 */
export function randomizeSelectedDice(gameState: GameState, indices: number[]): GameState {
  const roundState = gameState.currentLevel.currentRound!;
  const newGameState = { ...gameState };
  newGameState.currentLevel = { ...gameState.currentLevel };
  newGameState.currentLevel.currentRound = { 
    ...roundState,
    diceHand: roundState.diceHand.map((die, i) => {
      if (indices.includes(i)) {
    return {
          ...die,
          rolledValue: die.allowedValues[Math.floor(Math.random() * die.allowedValues.length)]
        };
      }
      return die;
    })
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
  newGameState.history = { ...gameState.history };
  newGameState.history.totalScore += points;
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
 * End the game with a specific reason
 */
export function endGame(gameState: GameState, reason: 'lost' | 'win'): GameState {
  const newGameState = { ...gameState };
  newGameState.isActive = false;
  newGameState.endReason = reason;
  return newGameState;
}

/**
 * Advance to the next level
 * Resets level-specific state, applies level effects, moves completed level to history
 */
export function advanceToNextLevel(gameState: GameState): GameState {
  const oldLevelNumber = gameState.currentLevel.levelNumber;
  const newLevelNumber = oldLevelNumber + 1;
  const levelConfig = getLevelConfig(newLevelNumber);
  
  const newGameState = { ...gameState };
  newGameState.history = { ...gameState.history };
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
  
  // Create new level state (includes first round)
  newGameState.currentLevel = createInitialLevelState(newLevelNumber, newGameState);
  
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
 * ============================================================================
 * HIGHER-LEVEL ACTIONS
 * ============================================================================
 * Actions that coordinate multiple game systems
 */

/**
 * Process rolling dice
 * Pure function that rolls the dice in the current diceHand
 * Note: For hot dice scenarios, call processHotDice first to reset the dice hand
 */
export function processRoll(
  roundState: RoundState,
  diceSet: any[]
): {
  newRoundState: RoundState;
  isFlop: boolean;
} {
  const newRoundState = { ...roundState };
  
  // If diceHand is empty, populate it from diceSet (first roll of round)
  // Otherwise, use existing diceHand (subsequent rolls after hot dice)
  const diceToRoll = roundState.diceHand.length === 0 
    ? diceSet.map((die: any) => ({ ...die, scored: false, rolledValue: undefined }))
    : roundState.diceHand.map(d => ({ ...d }));
  
  // Create a new diceHand array with new object references for immutability
  const diceHand = diceToRoll.map(d => ({ ...d }));
  
  // Simple roll number: just count entries in history + 1
  const currentRollNumber = (newRoundState.rollHistory?.length || 0) + 1;
  
  // Roll the dice
  for (const die of diceHand) {
    die.rolledValue = die.allowedValues[Math.floor(Math.random() * die.allowedValues.length)];
  }
  
  // Update round state with new diceHand
  newRoundState.diceHand = diceHand;
  
  // Check for flop
  const flopResult = isFlop(diceHand);
  
  // Add roll to history
  newRoundState.rollHistory = newRoundState.rollHistory || [];
  newRoundState.rollHistory.push({
    rollNumber: currentRollNumber, 
    isReroll: false,
    diceHand: diceHand.map(d => ({ ...d })),
    selectedDice: [],
    rollPoints: 0, // Will be calculated when scored
    maxRollPoints: 0,
    scoringSelection: [],
    combinations: [],
    isHotDice: false, // Hot dice is detected during scoring, not rolling
    isFlop: flopResult,
  });
  
  return {
    newRoundState,
    isFlop: flopResult
  };
}

/**
 * Process banking points from current round
 * Pure function that handles all banking logic:
 * 1. Validates banks remaining
 * 2. Banks points (adds to level and total score)
 * 3. Decrements banks
 * 4. Ends the round
 * 5. Checks for level completion
 */
export function processBankPoints(
  gameState: GameState,
  roundState: RoundState
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

  // Use atomic actions
  let newGameState = addPointsToLevel(gameState, roundState.roundPoints);
  newGameState = decrementBanks(newGameState);
  newGameState = endRound(newGameState, 'banked');
  
  const bankedPoints = roundState.roundPoints;
  
  // Check if level is completed
  const levelCompleted = isLevelCompleted(newGameState);

  return {
    success: true,
    newGameState,
    newRoundState: newGameState.currentLevel.currentRound!,
    bankedPoints,
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

  const selectedValues = selectedIndices.map(i => roundState.diceHand[i].rolledValue);
  const input = selectedValues.join('');
  
  // Validate selection and get scoring result
  const context: ScoringContext = { charms: gameState.charms || [] };
  const selectedIndicesFromInput = validateDiceSelection(input, roundState.diceHand.map(die => die.rolledValue) as DieValue[]);
  const allPartitionings = getAllPartitionings(roundState.diceHand, selectedIndicesFromInput, context);
  const combos = allPartitionings.length > 0 ? allPartitionings[0] : [];
  const totalComboDice = combos.reduce((sum, c) => sum + c.dice.length, 0);
  const valid = combos.length > 0 && totalComboDice === selectedIndicesFromInput.length;
  const points = combos.reduce((sum, c) => sum + c.points, 0);
  
  const scoringResult = { valid, points, combinations: combos, allPartitionings };
  
  try {
    if (scoringResult.valid && scoringResult.allPartitionings.length > 0) {
      const bestPartitioningIndex = getHighestPointsPartitioning(scoringResult.allPartitionings);
      const bestPartitioning = scoringResult.allPartitionings[bestPartitioningIndex];
      
      let previewPoints = scoringResult.points;
      const modifiedPoints = charmManager.applyCharmEffects({
        gameState,
        roundState,
        basePoints: previewPoints,
        combinations: bestPartitioning,
        selectedIndices: selectedIndices
      });
      
      const { score: finalPreviewPoints } = applyMaterialEffects(
        roundState.diceHand,
        selectedIndices,
        modifiedPoints,
        gameState,
        roundState,
        charmManager
      );
      
      return {
        isValid: true,
        points: Math.ceil(finalPreviewPoints),
        combinations: bestPartitioning.map((c: any) => c.type)
      };
    } else {
      return { isValid: false, points: 0, combinations: [] };
    }
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

