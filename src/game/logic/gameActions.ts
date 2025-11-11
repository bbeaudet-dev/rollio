import { GameState, RoundState } from '../types';
import { validateDiceSelectionAndScore, processDiceScoring, isFlop } from './gameLogic';
import { getHighestPointsPartitioning } from './scoring';
import { applyMaterialEffects } from './materialSystem';
import { debugActionWithContext } from '../utils/debug';

/**
 * Higher-level game actions that coordinate multiple game systems
 */

export function processCompleteScoring(
  gameState: GameState,
  roundState: RoundState,
  selectedIndices: number[],
  charmManager: any
): {
  success: boolean;
  finalPoints: number;
  newRoundState: RoundState;
  newGameState: GameState;
  hotDice: boolean;
  materialEffectData: any;
  charmEffectData: { basePoints: number; modifiedPoints: number };
  scoringResult: any;
} {
  debugActionWithContext('scoring', 'Starting scoring process', 'Validating selection', {
    selectedIndices,
    diceValues: selectedIndices.map(i => roundState.diceHand[i]?.rolledValue)
  });
  
  const selectedValues = selectedIndices.map(i => roundState.diceHand[i].rolledValue);
  const input = selectedValues.join('');
  
  debugActionWithContext('scoring', 'Validating dice selection', 'Finding partitionings', { input });
  
  const { scoringResult } = validateDiceSelectionAndScore(
    input, 
    roundState.diceHand, 
    { charms: gameState.charms || [] }
  );

  if (!scoringResult.valid) {
    debugActionWithContext('scoring', 'Validation failed', 'Returning error');
    return {
      success: false,
      finalPoints: 0,
      newRoundState: roundState,
      newGameState: gameState,
      hotDice: false,
      materialEffectData: null,
      charmEffectData: { basePoints: 0, modifiedPoints: 0 },
      scoringResult
    };
  }

  const bestPartitioningIndex = getHighestPointsPartitioning(scoringResult.allPartitionings);
  const selectedPartitioning = scoringResult.allPartitionings[bestPartitioningIndex];
  
  debugActionWithContext('scoring', 'Selected best partitioning', 'Applying charm effects', {
    partitioning: selectedPartitioning.map(c => c.type),
    totalPartitionings: scoringResult.allPartitionings.length
  });
  
  let basePoints = selectedPartitioning.reduce((sum: number, c: any) => sum + c.points, 0);
  
  debugActionWithContext('scoring', 'Applying charm effects', 'Applying material effects', { basePoints });
  
  const modifiedPoints = charmManager.applyCharmEffects({
    gameState,
    roundState,
    basePoints,
    combinations: selectedPartitioning,
    selectedIndices
  });
  
  debugActionWithContext('scoring', 'Charm effects applied', 'Applying material effects', {
    basePoints,
    modifiedPoints
  });
  
  const materialResult = applyMaterialEffects(
    roundState.diceHand,
    selectedIndices,
    modifiedPoints,
    gameState,
    roundState,
    charmManager
  );
  
  debugActionWithContext('scoring', 'Material effects applied', 'Updating round state', {
    finalPoints: materialResult.score,
    materialLogs: materialResult.materialLogs
  });

  const newRoundState = { ...roundState };
  newRoundState.roundPoints += Math.ceil(materialResult.score);
  
  const scoredCrystals = selectedIndices.filter((idx: number) => {
    const die = newRoundState.diceHand[idx];
    return die && die.material === 'crystal';
  }).length;
  newRoundState.crystalsScoredThisRound += scoredCrystals;
  
  const scoringActionResult = processDiceScoring(
    newRoundState.diceHand, 
    selectedIndices, 
    { valid: true, points: materialResult.score, combinations: selectedPartitioning }
  );
  
  newRoundState.diceHand = scoringActionResult.newHand;
  
  // Check for hot dice (all dice scored)
  const hotDice = scoringActionResult.hotDice;
  if (hotDice) {
    newRoundState.hotDiceCounter++;
    // Note: diceHand is empty at this point - it will be reset when player chooses to roll
  }
  
  // Add entry to roll history
  // Find the last roll entry to get the current roll number
  const lastRollEntry = newRoundState.rollHistory.length > 0 
    ? newRoundState.rollHistory[newRoundState.rollHistory.length - 1]
    : null;
  const currentRollNumber = lastRollEntry?.rollNumber || 1;
  
  newRoundState.rollHistory.push({
    rollNumber: currentRollNumber, 
    isReroll: false,
    diceHand: [...newRoundState.diceHand], // Store remaining dice after scoring (empty if hot dice)
    selectedDice: [],
    rollPoints: materialResult.score,
    maxRollPoints: materialResult.score, // TODO: calculate actual max possible
    scoringSelection: selectedIndices,
    combinations: selectedPartitioning.map((c: any) => c.type),
    isHotDice: hotDice,
    isFlop: false,
  });
  
  let newGameState = { ...gameState };

  return {
    success: true,
    finalPoints: Math.ceil(materialResult.score),
    newRoundState,
    newGameState,
    hotDice,
    materialEffectData: materialResult,
    charmEffectData: { basePoints, modifiedPoints },
    scoringResult: selectedPartitioning
  };
}

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
  
  try {
    const { scoringResult } = validateDiceSelectionAndScore(
      input, 
      roundState.diceHand, 
      { charms: gameState.charms || [] }
    );
    
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
        combinations: bestPartitioning.map(c => c.type)
      };
    } else {
      return { isValid: false, points: 0, combinations: [] };
    }
  } catch (error) {
    console.error('Preview scoring error:', error);
    return { isValid: false, points: 0, combinations: [] };
  }
}

/**
 * Roll all dice in a hand
 * Pure function - just rolls the dice, nothing else
 */
export function rollDice(diceHand: any[]): void {
  for (const die of diceHand) {
    die.rolledValue = die.allowedValues[Math.floor(Math.random() * die.allowedValues.length)];
  }
}

/**
 * Reroll specific dice 
 * Pure function - just rerolls the specified dice
 */
export function rerollDice(diceHand: any[], diceIndices: number[]): void {
  diceIndices.forEach(idx => {
    if (diceHand[idx]) {
      const die = diceHand[idx];
      die.rolledValue = die.allowedValues[Math.floor(Math.random() * die.allowedValues.length)];
    }
  });
}

/**
 * Reset dice hand to full dice set (for hot dice)
 * Pure function - repopulates diceHand from diceSet
 */
export function resetDiceHandToFullSet(diceHand: any[], diceSet: any[]): void {
  diceHand.length = 0;
  diceHand.push(...diceSet.map((die: any) => ({ ...die, scored: false })));
}

/**
 * Process rolling dice
 * Handles all rolls - whether it's the first roll, remaining dice, or full set (hot dice)
 */
export function processRoll(
  roundState: RoundState,
  diceSet?: any[] // Optional: if diceHand is empty, populate from diceSet
): {
  newRoundState: RoundState;
  isFlop: boolean;
} {
  const newRoundState = { ...roundState };
  
  // If diceHand is empty, populate it
  if (newRoundState.diceHand.length === 0 && diceSet) {
    resetDiceHandToFullSet(newRoundState.diceHand, diceSet);
  }
  
  // Simple roll number: just count entries in history + 1
  const currentRollNumber = (newRoundState.rollHistory?.length || 0) + 1;
  
  // Roll the dice
  rollDice(newRoundState.diceHand);
  
  // Check for flop
  const flopResult = isFlop(newRoundState.diceHand);
  
  // Add roll to history
  newRoundState.rollHistory = newRoundState.rollHistory || [];
  newRoundState.rollHistory.push({
    rollNumber: currentRollNumber,
    isReroll: false,
    diceHand: newRoundState.diceHand.map(d => ({ ...d })),
    selectedDice: [],
    rollPoints: 0, // Will be calculated when scored
    maxRollPoints: 0,
    scoringSelection: [],
    combinations: [],
    isHotDice: false,
    isFlop: flopResult,
  });
  
  return {
    newRoundState,
    isFlop: flopResult
  };
}