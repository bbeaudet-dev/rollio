/**
 * Scoring Orchestration
 * 
 * This module orchestrates the complete scoring flow:
 * 1. Find all possible combinations (handling two-faced/wild pip effects)
 * 2. Create initial ScoringElements from combinations
 * 3. Apply pip effects (in order of selected dice)
 * 4. Apply material effects
 * 5. Apply charm effects
 * 6. Return detailed breakdown with final score
 * 
 * This is the high-level API for scoring dice selections.
 */

import { Die, DieValue, ScoringCombination, Charm, GameState, RoundState, ScoringBreakdown } from '../types';
import { ScoringCombinationType, ALL_SCORING_TYPES } from '../data/combinations';
import { findAllPossibleCombinations, hasAnyScoringCombination, countDice } from './findCombinations';
import { findAllValidPartitionings, getHighestPointsPartitioning } from './partitioning';
import { applyMaterialEffects } from './materialSystem';
import { applyAllPipEffects } from './pipEffectSystem';
import { ScoringElements, createScoringElementsFromPoints, calculateFinalScore } from './scoringElements';
import { createBreakdownBuilder } from './scoringBreakdown';
import { CharmManager } from './charmSystem';

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

/**
 * Calculate complete scoring breakdown for selected dice
 * 
 * Order of operations:
 * 1. Find valid combinations (handling two-faced/wild pip effects)
 * 2. Create initial ScoringElements from combinations
 * 3. Apply pip effects (in order of selected dice, left to right)
 * 4. Apply material effects
 * 5. Apply charm effects
 * 
 * Returns detailed breakdown showing each step of the transformation.
 */
export function calculateScoringBreakdown(
  diceHand: Die[],
  selectedIndices: number[],
  gameState: GameState,
  roundState: RoundState,
  charmManager: CharmManager
): ScoringBreakdown | null {
  if (selectedIndices.length === 0) {
    return null;
  }

  // Step 1: Find valid combinations
  // Two-faced and wild pip effects are handled in findAllPossibleCombinations via expandDiceValuesForCombinations
  const context: ScoringContext = {
    charms: gameState.charms || [],
    charmManager,
  };
  
  const allPartitionings = getAllPartitionings(diceHand, selectedIndices, context);
  
  if (allPartitionings.length === 0) {
    return null;
  }

  // Get the best partitioning (highest points)
  const bestPartitioningIndex = getHighestPointsPartitioning(allPartitionings);
  const selectedPartitioning = allPartitionings[bestPartitioningIndex] || [];

  // Step 2: Create initial ScoringElements from combinations
  const basePoints = selectedPartitioning.reduce((sum: number, c: any) => sum + c.points, 0);
  let scoringElements = createScoringElementsFromPoints(basePoints);

  // Store combination types for later extraction
  const combinationTypes = selectedPartitioning.map((c: any) => c.type);

  // Create breakdown builder
  const breakdown = createBreakdownBuilder(scoringElements);
  breakdown.addStep(
    'baseCombinations',
    scoringElements,
    `Combinations: ${combinationTypes.join(', ')} = ${basePoints} points`
  );
  
  // Store combination types in breakdown for easy access
  (breakdown as any).combinationTypes = combinationTypes;

  // Step 3: Apply pip effects (in order of selected dice)
  // This also checks for per-die charm triggers before each pip effect
  const pipResult = applyAllPipEffects(
    diceHand,
    selectedIndices,
    scoringElements,
    gameState,
    roundState,
    charmManager,
    breakdown // Pass breakdown builder to track per-die charm triggers
  );
  
  // Pip effects are now tracked individually in applyAllPipEffects
  scoringElements = pipResult.scoringElements;

  // Step 4: Apply material effects (each material tracked individually)
  const materialValues = applyMaterialEffects(
    diceHand,
    selectedIndices,
    scoringElements,
    gameState,
    roundState,
    charmManager,
    breakdown // Pass breakdown builder to track each material
  );
  
  scoringElements = materialValues;

  // Step 5: Apply charm effects (each charm tracked individually)
  const charmContext = {
    gameState,
    roundState,
    scoringElements,
    combinations: selectedPartitioning,
    selectedIndices,
  };
  
  const charmValues = charmManager.applyCharmEffects(charmContext, breakdown); // Pass breakdown builder
  
  scoringElements = charmValues;

  // Build and return final breakdown
  const finalBreakdown = breakdown.build();
  
  // Log breakdown for debugging (always log for now to see what's happening)
  console.log('=== Scoring Breakdown ===');
  console.log(`Selected dice indices: [${selectedIndices.join(', ')}]`);
  finalBreakdown.steps.forEach((step, index) => {
    const inputScore = calculateFinalScore(step.input);
    const outputScore = calculateFinalScore(step.output);
    console.log(`${index + 1}. ${step.step}:`);
    console.log(`   Input:  ${step.input.basePoints} pts × ${step.input.multiplier}x ^ ${step.input.exponent} = ${inputScore}`);
    console.log(`   Output: ${step.output.basePoints} pts × ${step.output.multiplier}x ^ ${step.output.exponent} = ${outputScore}`);
    console.log(`   ${step.description}`);
  });
  const finalScore = calculateFinalScore(finalBreakdown.final);
  console.log(`Final Score: ${finalScore} (${finalBreakdown.final.basePoints} × ${finalBreakdown.final.multiplier} ^ ${finalBreakdown.final.exponent})`);
  console.log('========================');
  
  return finalBreakdown;
}
