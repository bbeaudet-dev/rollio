/**
 * Scoring Orchestration
 * 
 * This module orchestrates the complete scoring flow:
 * 1. Find all possible combinations
 * 2. Find all valid partitionings
 * 3. Apply material effects
 * 4. Apply charm effects
 * 5. Apply pip effects
 * 6. Return final score
 * 
 * This is the high-level API for scoring dice selections.
 */

import { Die, DieValue, ScoringCombination, Charm } from '../types';
import { ScoringCombinationType, ALL_SCORING_TYPES } from '../data/combinations';
import { findAllPossibleCombinations, hasAnyScoringCombination, countDice } from './findCombinations';
import { findAllValidPartitionings, getHighestPointsPartitioning } from './partitioning';
import { applyMaterialEffects } from './materialSystem';

// Re-export types and constants for convenience (allows importing from scoring.ts)
export type { ScoringCombinationType } from '../data/combinations';
export { ALL_SCORING_TYPES } from '../data/combinations';

// Re-export combination and partitioning functions
export { findAllPossibleCombinations, hasAnyScoringCombination, countDice } from './findCombinations';
export { findAllValidPartitionings, getHighestPointsPartitioning } from './partitioning';

interface ScoringContext {
  charms: Charm[];
  materials?: any[];
  charmManager?: any;
}

/**
 * Get scoring combinations for validation purposes.
 * The actual scoring uses the user-selected partitioning from getAllPartitionings().
 */
export function getScoringCombinations(
  diceHand: Die[],
  selectedIndices: number[],
  context: ScoringContext
): ScoringCombination[] {
  const values = selectedIndices.map(i => diceHand[i].rolledValue!);
  
  // Find all valid partitionings of the dice into valid combinations
  const allPartitionings = findAllValidPartitionings(values, selectedIndices, diceHand, context);
  
  if (allPartitionings.length === 0) {
    return [];
  }
  
  // Return the first valid partitioning for validation
  const firstPartitioning = allPartitionings[0];
  return firstPartitioning;
}

/**
 * Get all valid partitionings for a set of selected dice
 */
export function getAllPartitionings(
  diceHand: Die[],
  selectedIndices: number[],
  context: ScoringContext
): ScoringCombination[][] {
  const values = selectedIndices.map(i => diceHand[i].rolledValue!);
  return findAllValidPartitionings(values, selectedIndices, diceHand, context);
}

/**
 * Roll dice (utility function)
 */
export function rollDice(numDice: number, sides: number = 6): DieValue[] {
  return Array.from({ length: numDice }, () => (Math.floor(Math.random() * sides) + 1) as DieValue);
}

/**
 * Check if a dice hand is a flop (no scoring combinations)
 */
export function isFlop(diceHand: Die[]): boolean {
  return !hasAnyScoringCombination(diceHand);
}
