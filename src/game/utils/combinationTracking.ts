/**
 * Combination Tracking Utilities
 * 
 * Functions for tracking combination usage with composite keys
 * (e.g., "nPairs:2", "nOfAKind:4", "straightOfN:5")
 */

import { ScoringCombination, GameState } from '../types';
import { ScoringCombinationType } from '../data/combinations';

/**
 * Extract parameters from a ScoringCombination to create a composite key
 * Composite keys format: "type:param" (e.g., "nPairs:2", "nOfAKind:4")
 */
export function createCombinationKey(
  combination: ScoringCombination,
  diceHand: { rolledValue?: number }[]
): string {
  const { type, dice } = combination;
  
  // Get dice values for this combination
  const diceValues = dice.map(idx => diceHand[idx]?.rolledValue).filter(v => v !== undefined) as number[];
  
  switch (type as ScoringCombinationType) {
    case 'nPairs':
      // Number of pairs = dice.length / 2
      const pairCount = dice.length / 2;
      return `nPairs:${pairCount}`;
    
    case 'nOfAKind':
      // Count = dice.length, faceValue = the value (all dice should have same value)
      const count = dice.length;
      const faceValue = diceValues[0]; // All dice have same value
      return `nOfAKind:${count}`;
    
    case 'straightOfN':
      // Length = dice.length
      const length = dice.length;
      return `straightOfN:${length}`;
    
    case 'nTriplets':
      // n = dice.length / 3
      const tripletCount = dice.length / 3;
      return `nTriplets:${tripletCount}`;
    
    case 'nQuadruplets':
      const quadrupletCount = dice.length / 4;
      return `nQuadruplets:${quadrupletCount}`;
    
    case 'nQuintuplets':
      const quintupletCount = dice.length / 5;
      return `nQuintuplets:${quintupletCount}`;
    
    case 'nSextuplets':
      const sextupletCount = dice.length / 6;
      return `nSextuplets:${sextupletCount}`;
    
    case 'nSeptuplets':
      const septupletCount = dice.length / 7;
      return `nSeptuplets:${septupletCount}`;
    
    case 'nOctuplets':
      const octupletCount = dice.length / 8;
      return `nOctuplets:${octupletCount}`;
    
    case 'nNonuplets':
      const nonupletCount = dice.length / 9;
      return `nNonuplets:${nonupletCount}`;
    
    case 'nDecuplets':
      const decupletCount = dice.length / 10;
      return `nDecuplets:${decupletCount}`;
    
    case 'pyramidOfN':
      // For pyramid, we need to calculate n from the pattern
      // This is complex, but for now we can use dice.length as a proxy
      // TODO: Calculate actual pyramid n value if needed
      return `pyramidOfN:${dice.length}`;
    
    case 'singleN':
      // For singleN, we track the face value
      const faceValueForSingle = diceValues[0];
      return `singleN:${faceValueForSingle}`;
    
    default:
      // Fallback: just use the type
      return type;
  }
}

/**
 * Get the category from a combination key
 * Extracts the category part (before the colon) from keys like "nPairs:2" -> "nPairs"
 */
export function getCategoryFromKey(key: string): string {
  const [category] = key.split(':');
  return category || key;
}

/**
 * Format a combination category name for display (plural form)
 * Converts "singleN" to "Singles", "nPairs" to "Pairs", etc.
 */
export function formatCategoryName(category: string): string {
  switch (category) {
    case 'singleN':
      return 'Singles';
    case 'nPairs':
      return 'Pairs';
    case 'nOfAKind':
      return 'N of a Kind';
    case 'nTriplets':
      return 'Triplets';
    case 'nQuadruplets':
      return 'Quadruplets';
    case 'nQuintuplets':
      return 'Quintuplets';
    case 'nSextuplets':
      return 'Sextuplets';
    case 'nSeptuplets':
      return 'Septuplets';
    case 'nOctuplets':
      return 'Octuplets';
    case 'nNonuplets':
      return 'Nonuplets';
    case 'nDecuplets':
      return 'Decuplets';
    case 'straightOfN':
      return 'Straights';
    case 'pyramidOfN':
      return 'Pyramids';
    default:
      return category;
  }
}

/**
 * Format a combination key for display
 * Converts "nPairs:2" to "2 Pairs", "nOfAKind:4" to "4 of a Kind", etc.
 */
export function formatCombinationKey(key: string): string {
  // Handle special cases: "flop" (no combinations) and "hotDice" (uses all dice)
  if (key === 'flop') {
    return 'Flop';
  }
  if (key === 'hotDice') {
    return 'Hot Dice';
  }
  
  const [type, param] = key.split(':');
  const paramNum = parseInt(param, 10);
  
  switch (type) {
    case 'singleN':
      return `Single ${paramNum}`;
    
    case 'nPairs':
      return paramNum === 1 ? '1 Pair' : `${paramNum} Pairs`;
    
    case 'nOfAKind':
      return `${paramNum} of a Kind`;
    
    case 'straightOfN':
      return `${paramNum}-Length Straight`;
    
      case 'pyramidOfN':
        return `Pyramid (${paramNum})`;
    
    case 'nTriplets':
      return `${paramNum} Triplets`;
    
    case 'nQuadruplets':
      return `${paramNum} Quadruplets`;
    
    case 'nQuintuplets':
      return `${paramNum} Quintuplets`;
    
    case 'nSextuplets':
      return `${paramNum} Sextuplets`;
    
    case 'nSeptuplets':
      return `${paramNum} Septuplets`;
    
    case 'nOctuplets':
      return `${paramNum} Octuplets`;
    
    case 'nNonuplets':
      return `${paramNum} Nonuplets`;
    
    case 'nDecuplets':
      return `${paramNum} Decuplets`;
    
    default:
      return key;
  }
}

/**
 * Extract combination types from a scoring breakdown
 * Tries to get them from breakdown.combinationTypes first, then falls back to parsing description
 */
export function extractCombinationTypesFromBreakdown(breakdown: any): string[] {
  // Check if combinationTypes were stored in breakdown
  if (breakdown.combinationTypes && Array.isArray(breakdown.combinationTypes)) {
    return breakdown.combinationTypes;
  }
  
  // Fallback: extract from description
  const baseStep = breakdown.steps?.find((s: any) => s.step === 'baseCombinations');
  if (baseStep) {
    const match = baseStep.description.match(/Combinations: (.+) =/);
    if (match && match[1]) {
      return match[1].split(', ').map((c: string) => c.trim());
    }
  }
  
  return [];
}

/**
 * Get the upgrade level for a combination key
 * Returns 1 if the combination hasn't been upgraded yet
 */
export function getCombinationLevel(gameState: GameState, combinationKey: string): number {
  return gameState.history.combinationLevels[combinationKey] || 1;
}

/**
 * Upgrade a combination by one level
 * Returns updated gameState with the combination level incremented
 */
export function upgradeCombination(gameState: GameState, combinationKey: string): GameState {
  const currentLevel = getCombinationLevel(gameState, combinationKey);
  const combinationLevels = { ...gameState.history.combinationLevels };
  combinationLevels[combinationKey] = currentLevel + 1;
  
  return {
    ...gameState,
    history: {
      ...gameState.history,
      combinationLevels
    }
  };
}

/**
 * Upgrade multiple combinations (for consumables that upgrade groups)
 * Returns updated gameState with all specified combinations upgraded
 */
export function upgradeCombinations(gameState: GameState, combinationKeys: string[]): GameState {
  const combinationLevels = { ...gameState.history.combinationLevels };
  
  for (const key of combinationKeys) {
    const currentLevel = combinationLevels[key] || 1;
    combinationLevels[key] = currentLevel + 1;
  }
  
  return {
    ...gameState,
    history: {
      ...gameState.history,
      combinationLevels
    }
  };
}

/**
 * Track combination usage from a scoring breakdown
 * Updates the gameState's combinationCounters with composite keys
 */
export function trackCombinationUsage(
  gameState: GameState,
  breakdown: any,
  diceHand: { rolledValue?: number }[]
): GameState {
  const selectedPartitioning = breakdown?.selectedPartitioning;
  if (!selectedPartitioning || !Array.isArray(selectedPartitioning)) {
    return gameState;
  }
  
  const combinationCounters = { ...gameState.history.combinationCounters };
  
  for (const combination of selectedPartitioning) {
    const key = createCombinationKey(combination, diceHand);
    combinationCounters[key] = (combinationCounters[key] || 0) + 1;
  }
  
  return {
    ...gameState,
    history: {
      ...gameState.history,
      combinationCounters
    }
  };
}

