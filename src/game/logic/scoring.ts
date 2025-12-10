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

import { Die, DieValue, ScoringCombination, Charm, GameState, RoundState } from '../types';
import type { ScoringBreakdown } from './scoringBreakdown';
import { ScoringCombinationType, ALL_SCORING_TYPES } from '../data/combinations';
import { findAllPossibleCombinations, hasAnyScoringCombination, countDice, ScoringContext } from './findCombinations';
import { findAllValidPartitionings, getHighestPointsPartitioning } from './partitioning';
import { applyMaterialEffects } from './materialSystem';
import { applyAllPipEffects } from './pipEffectSystem';
import { ScoringElements, createScoringElementsFromPoints, calculateFinalScore, multiplyMultiplier, addBasePoints } from './scoringElements';
import { createBreakdownBuilder } from './scoringBreakdown';
import { CharmManager } from './charmSystem';
import { getDifficulty } from './difficulty';
import { createCombinationKey } from '../utils/combinationTracking';

// Re-export types and constants for convenience (allows importing from scoring.ts)
export type { ScoringCombinationType } from '../data/combinations';
export { ALL_SCORING_TYPES } from '../data/combinations';

// Re-export combination and partitioning functions
export { findAllPossibleCombinations, hasAnyScoringCombination, countDice } from './findCombinations';
export { findAllValidPartitionings, getHighestPointsPartitioning } from './partitioning';

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
  context: ScoringContext,
  gameState: GameState
): ScoringCombination[][] {
  const values = selectedIndices.map(i => diceHand[i].rolledValue!);
  // Always require difficulty from gameState
  if (!context.difficulty) {
    context = { ...context, difficulty: getDifficulty(gameState) };
  }
  return findAllValidPartitionings(values, selectedIndices, diceHand, context);
}

/**
 * Roll dice (utility function)
 */
export function rollDice(numDice: number, sides: number = 6): DieValue[] {
  return Array.from({ length: numDice }, () => (Math.floor(Math.random() * sides) + 1) as DieValue);
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
    difficulty: getDifficulty(gameState),
    effectContext: gameState.currentWorld?.currentLevel.effectContext, // Include world and level effect context
  };
  
  const allPartitionings = getAllPartitionings(diceHand, selectedIndices, context, gameState);
  
  if (allPartitionings.length === 0) {
    return null;
  }

  // Get the best partitioning (highest points)
  const bestPartitioningIndex = getHighestPointsPartitioning(allPartitionings);
  const selectedPartitioning = allPartitionings[bestPartitioningIndex] || [];

  // Step 2: Create initial ScoringElements from combinations
  // Check for debuffed combinations and set their points to 0
  const debuffedCombinations: string[] = [];
  let basePoints = 0;
  
  for (const combo of selectedPartitioning) {
    if ((combo as any).isDebuffed) {
      // Debuffed combination scores 0 points
      debuffedCombinations.push(createCombinationKey(combo, diceHand));
    } else {
      basePoints += combo.points;
    }
  }
  
  let scoringElements = createScoringElementsFromPoints(basePoints);

  // Store combination keys (composite keys like "single1", "nPairs:2") for display
  const combinationKeys = selectedPartitioning.map((c: any) => 
    createCombinationKey(c, diceHand)
  );

  // Create breakdown builder
  const breakdown = createBreakdownBuilder(scoringElements);
  
  // Show base combinations
  let baseDescription = `Combinations: ${combinationKeys.join(', ')} = ${basePoints} points`;
  if (debuffedCombinations.length > 0) {
    baseDescription += ` (${debuffedCombinations.join(', ')} debuffed: 0 points)`;
  }
  breakdown.addStep(
    'baseCombinations',
    scoringElements,
    baseDescription
  );
  
  // Show debuff steps if any (group by reason to avoid duplicates)
  if (debuffedCombinations.length > 0) {
    const debuffReasons = new Map<string, string[]>(); // reason -> combination keys
    for (const combo of selectedPartitioning) {
      if ((combo as any).isDebuffed) {
        const debuffReason = (combo as any).debuffReason || 'Debuffed';
        const comboKey = createCombinationKey(combo, diceHand);
        if (!debuffReasons.has(debuffReason)) {
          debuffReasons.set(debuffReason, []);
        }
        debuffReasons.get(debuffReason)!.push(comboKey);
      }
    }
    
    // Add one step per unique debuff reason
    for (const [reason, comboKeys] of debuffReasons.entries()) {
      breakdown.addStep(
        'debuff',
        scoringElements, // Points stay the same (already 0)
        `${comboKeys.join(', ')}: ${reason} → 0 points`
      );
    }
  }

    // Step 2.5: Apply world and level effect multipliers
    // Apply multipliers per-combination and track them for breakdown display
    const effectContext = gameState.currentWorld?.currentLevel.effectContext;
  if (effectContext) {
    const { world, level } = effectContext;
    
    // Group combinations by type and calculate multipliers
    const comboGroups = new Map<string, Array<{ combo: any; key: string; points: number }>>();
    
    for (const combo of selectedPartitioning) {
      if ((combo as any).isDebuffed) continue; // Skip debuffed combinations
      
      const comboType = combo.type;
      const comboKey = createCombinationKey(combo, diceHand);
      
      if (!comboGroups.has(comboType)) {
        comboGroups.set(comboType, []);
      }
      comboGroups.get(comboType)!.push({ combo, key: comboKey, points: combo.points });
    }
    
    // Apply multipliers per combination type
    for (const [comboType, combos] of comboGroups.entries()) {
      let multiplier = 1;
      let comboName = '';

      if (comboType === 'straightOfN') {
        multiplier = (world.straightsMultiplier || 1) * (level.straightsMultiplier || 1);
        comboName = 'Straights';
      } else if (comboType === 'nPairs') {
        multiplier = (world.pairsMultiplier || 1) * (level.pairsMultiplier || 1);
        comboName = 'Pairs';
      } else if (comboType === 'singleN') {
        multiplier = (world.singlesMultiplier || 1) * (level.singlesMultiplier || 1);
        comboName = 'Singles';
      } else if (comboType === 'nOfAKind') {
        multiplier = (world.nOfAKindMultiplier || 1) * (level.nOfAKindMultiplier || 1);
        comboName = 'N-of-a-kind';
      } else if (comboType === 'pyramidOfN') {
        multiplier = (world.pyramidsMultiplier || 1) * (level.pyramidsMultiplier || 1);
        comboName = 'Pyramids';
      }

      if (multiplier !== 1) {
        // Calculate points for this combination type
        const typePoints = combos.reduce((sum, c) => sum + c.points, 0);
        const beforePoints = calculateFinalScore(scoringElements);
        
        // Apply multiplier to base points (add the multiplied difference)
        const multiplierBonus = typePoints * (multiplier - 1);
        scoringElements = addBasePoints(scoringElements, multiplierBonus);
        
        const afterPoints = calculateFinalScore(scoringElements);
        
        // Show multiplier step
        const comboKeys = combos.map(c => c.key).join(', ');
        breakdown.addStep(
          'worldLevelMultiplier',
          scoringElements,
          `${comboKeys} (${comboName}): ×${multiplier} → +${multiplierBonus} points (${afterPoints} total)`
        );
      }
    }
  }

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

  // Step 6: Apply hot dice base multiplier (1.15^x cumulative)
  const hotDiceCounter = roundState.hotDiceCounter || 0;
  if (hotDiceCounter > 0) {
    const hotDiceMultiplier = Math.pow(1.15, hotDiceCounter);
    scoringElements = multiplyMultiplier(scoringElements, hotDiceMultiplier);
    breakdown.addStep(
      'hotDiceMultiplier',
      scoringElements,
      `Hot Dice (${hotDiceCounter}): ×${hotDiceMultiplier.toFixed(3)} multiplier`
    );
  }

  // Build and return final breakdown
  const finalBreakdown = breakdown.build();
  
  // Add selectedPartitioning and combinationKeys to the final breakdown for tracking
  (finalBreakdown as any).selectedPartitioning = selectedPartitioning;
  (finalBreakdown as any).combinationKeys = combinationKeys;
  
  return finalBreakdown;
}
