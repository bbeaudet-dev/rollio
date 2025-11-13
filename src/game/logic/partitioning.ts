/**
 * Partitioning Logic
 * 
 * This module handles finding all valid partitionings of dice into scoring combinations.
 * A partitioning is a set of one or more combinations such that every die is used exactly once.
 */

import { Die, ScoringCombination } from '../types';
import { findAllPossibleCombinations } from './findCombinations';
import { debugLog, getDebugMode } from '../utils/debug';

interface ScoringContext {
  charms?: any[];
  materials?: any[];
  charmManager?: any;
}

/**
 * Find all valid partitionings of dice into scoring combinations
 * A partitioning uses all dice exactly once with no overlaps
 */
export function findAllValidPartitionings(
  values: number[],
  selectedIndices: number[],
  diceHand: Die[],
  context?: ScoringContext
): ScoringCombination[][] {
  // Step 1: Generate all possible individual combinations that can be made from these dice
  const allPossibleCombos = findAllPossibleCombinations(values, selectedIndices, diceHand, context);
  
  // Step 2: Find all possible ways to combine these combinations to use all dice exactly once
  const allPartitionings: ScoringCombination[][] = [];
  
  // Use a recursive function to build all possible combinations of combinations
  function buildPartitionings(
    remainingIndices: Set<number>,
    currentPartitioning: ScoringCombination[]
  ) {
    // If no dice left, we have a complete partitioning
    if (remainingIndices.size === 0) {
      allPartitionings.push([...currentPartitioning]);
      return;
    }
    
    // Try each possible combination that uses some of the remaining dice
    for (const combo of allPossibleCombos) {
      // Check if this combination only uses remaining dice
      const canUseCombo = combo.dice.every(dieIndex => remainingIndices.has(dieIndex));
      
      if (canUseCombo) {
        // Create new remaining indices without the dice used by this combination
        const newRemainingIndices = new Set(remainingIndices);
        for (const dieIndex of combo.dice) {
          newRemainingIndices.delete(dieIndex);
        }
        
        // Recursively build partitionings with the remaining dice
        buildPartitionings(newRemainingIndices, [...currentPartitioning, combo]);
      }
    }
  }
  
  // Start building partitionings with all dice available
  buildPartitionings(new Set(selectedIndices), []);
  
  // Step 3: Filter out invalid partitionings (double counting or leftovers)
  const validPartitionings = allPartitionings.filter(partitioning => {
    // Count how many of each digit we're using across all combinations
    const digitCounts = new Map<number, number>();
    
    for (const combo of partitioning) {
      for (const dieIndex of combo.dice) {
        const value = diceHand[dieIndex].rolledValue!;
        digitCounts.set(value, (digitCounts.get(value) || 0) + 1);
      }
    }
    
    // Count how many of each digit were actually submitted
    const submittedCounts = new Map<number, number>();
    for (const value of values) {
      submittedCounts.set(value, (submittedCounts.get(value) || 0) + 1);
    }
    
    // Check for double counting
    for (const [digit, usedCount] of digitCounts) {
      const submittedCount = submittedCounts.get(digit) || 0;
      if (usedCount > submittedCount) {
        return false; // Double counting detected
      }
    }
    
    // Check for leftovers (all submitted dice must be used)
    const totalUsedDice = Array.from(digitCounts.values()).reduce((sum, count) => sum + count, 0);
    if (totalUsedDice !== values.length) {
      return false; // Leftover dice detected
    }
    
    return true;
  });
  
  // Step 4: Remove duplicate partitionings (same combinations in different orders)
  const uniquePartitionings: ScoringCombination[][] = [];
  const seenPartitionings = new Set<string>();
  
  const beforeCount = validPartitionings.length;
  
  for (const partitioning of validPartitionings) {
    // Create a canonical representation for comparison
    // Sort each combination's dice indices and sort combinations by type and dice values
    const canonical = partitioning
      .map(combo => ({
        type: combo.type,
        dice: combo.dice.sort((a, b) => a - b),
        diceValues: combo.dice.map(idx => diceHand[idx].rolledValue!).sort((a, b) => a - b)
      }))
      .sort((a, b) => {
        // First sort by type
        const typeComparison = a.type.localeCompare(b.type);
        if (typeComparison !== 0) return typeComparison;
        // Then sort by dice values (not positions)
        const aValues = a.diceValues.join(',');
        const bValues = b.diceValues.join(',');
        return aValues.localeCompare(bValues);
      })
      .map(combo => `${combo.type}:${combo.diceValues.join(',')}`)
      .join('|');
    
    if (!seenPartitionings.has(canonical)) {
      seenPartitionings.add(canonical);
      uniquePartitionings.push(partitioning);
    }
  }
  
  if (getDebugMode()) {
    debugLog(`Partitioning deduplication: ${beforeCount} → ${uniquePartitionings.length} unique partitionings`);
  }
  
  return uniquePartitionings;
}

/**
 * Get the highest-scoring partitioning from a list of partitionings
 */
export function getHighestPointsPartitioning(partitionings: ScoringCombination[][]): number {
  let maxPoints = -Infinity;
  let maxIndex = 0;
  for (let i = 0; i < partitionings.length; i++) {
    const points = partitionings[i].reduce((sum, c) => sum + c.points, 0);
    if (points > maxPoints) {
      maxPoints = points;
      maxIndex = i;
    }
  }
  return maxIndex;
}

