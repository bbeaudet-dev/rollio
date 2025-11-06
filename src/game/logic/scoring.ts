import { Die, DieValue, ScoringCombination, Charm } from '../types';
import { debugLog, getDebugMode, debugAction, debugVerbose } from '../utils/debug';
import { applyMaterialEffects } from './materialSystem';

/*
  Ideas for balancing:
  
  Odds of each combination (default dice set):
  - God's Straight: impossible
  - Straight: 
  - Four Pairs: impossible
  - Three Pairs: 
  - Triple Triplets: impossible
  - Two Triplets: 
  - Seven of a Kind: impossible
  - Six of a Kind: 
  - Five of a Kind: 
  - Four of a Kind: 
  - Three of a Kind: 
  - Single One: 1 in 6
  - Single Five: 1 in 6

  How each odds change based on factors:
  - More dice
  - More faces
  - Manipulated faces
  - Materials
  - Charms
  - Consumables
  - Blessings
  - Rolls / rerolls

  Odds of flopping based on number of dice:
  - 1 die: 2 in 3 = 66.67%
  - 2 dice: 4 in 9 = 44.44%
  - 3 dice: 
  - 4 dice: 
  - 5 dice: 
  - 6 dice: 
*/

// Define scoring combination types for type safety
export type ScoringCombinationType = 
  | 'godStraight' | 'straight' | 'fourPairs' | 'threePairs' | 'tripleTriplets' | 'twoTriplets'
  | 'sevenOfAKind' | 'sixOfAKind' | 'fiveOfAKind' | 'fourOfAKind' | 'threeOfAKind'
  | 'singleOne' | 'singleFive';

// Export array of all scoring types for iteration (e.g., creating counters)
export const ALL_SCORING_TYPES: ScoringCombinationType[] = [
  'godStraight', 'straight', 'fourPairs', 'threePairs', 'tripleTriplets', 'twoTriplets',
  'sevenOfAKind', 'sixOfAKind', 'fiveOfAKind', 'fourOfAKind', 'threeOfAKind',
  'singleOne', 'singleFive'
];

interface ScoringContext {
  charms: Charm[];
  materials?: any[];
  charmManager?: any;
}

// Base points for combinations that don't depend on face values
const BASE_POINTS = {
  godStraight: 10000,
  straight: 2000,
  fourPairs: 3500,
  threePairs: 2250,
  tripleTriplets: 5000,
  twoTriplets: 2500,
  singleOne: 100,
  singleFive: 50,
} as const;

// Generalized function to get points for any combination
function getCombinationPoints(type: ScoringCombinationType, faceValue?: number, count?: number): number {
  
  // Handle N-of-a-kind combinations (3, 4, 5, 6, 7)
  if (type.includes('OfAKind') && faceValue !== undefined && count !== undefined) {
    if (count === 3) {
      // Three-of-a-kind: 100 × face value (1s = 1000)
      return faceValue === 1 ? 1000 : faceValue * 100;
    } else if (count === 4) {
      // Four-of-a-kind: 250 × face value
      return faceValue * 250;
    } else if (count === 5) {
      // Five-of-a-kind: 500 × face value
      return faceValue * 500;
    } else if (count === 6) {
      // Six-of-a-kind: 1000 × face value
      return faceValue * 1000;
    } else if (count === 7) {
      // Seven-of-a-kind: 2000 × face value
      return faceValue * 2000;
    }
  }
  
  // Handle base combinations
  return BASE_POINTS[type as keyof typeof BASE_POINTS] || 0;
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
 * Get all valid partitionings
 */
export function getAllPartitionings(
  diceHand: Die[],
  selectedIndices: number[],
  context: ScoringContext
): ScoringCombination[][] {
  
  const values = selectedIndices.map(i => diceHand[i].rolledValue!);
  
  return findAllValidPartitionings(values, selectedIndices, diceHand, context);
}

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

// Helper function to find all valid partitionings
function findAllValidPartitionings(
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

// Helper function to find all possible individual combinations from subsets of the dice
function findAllPossibleCombinations(
  values: number[], 
  selectedIndices: number[], 
  diceHand: Die[],
  context?: ScoringContext
): ScoringCombination[] {
  const combinations: ScoringCombination[] = [];
  
  // Generate combinations for all possible subsets of the dice
  const allSubsets = generateAllSubsets(selectedIndices);
  
  for (const subsetIndices of allSubsets) {
    if (subsetIndices.length === 0) continue;
    
    const subsetValues = subsetIndices.map(idx => diceHand[idx].rolledValue!);
    const counts = countDice(subsetValues);
    const subsetSize = subsetValues.length;
    
    // Generate N-of-a-kind combinations for each face value
    for (let i = 0; i < counts.length; i++) {
      for (let n = 3; n <= Math.min(counts[i], 7); n++) {
        const value = i + 1;
        let type: ScoringCombinationType;
        switch (n) {
          case 3: type = 'threeOfAKind'; break;
          case 4: type = 'fourOfAKind'; break;
          case 5: type = 'fiveOfAKind'; break;
          case 6: type = 'sixOfAKind'; break;
          case 7: type = 'sevenOfAKind'; break;
          default: continue;
        }
        const valueIndices = subsetIndices.filter(idx => diceHand[idx].rolledValue! === value);
        const diceIndices = valueIndices.slice(0, n);
        
        combinations.push({
          type,
          dice: diceIndices,
          points: getCombinationPoints(type, value, n),
        });
      }
    }
    
    // Generate single combinations (only 1s and 5s) for individual dice
    if (subsetSize === 1) {
      const value = subsetValues[0];
      const dieIndex = subsetIndices[0];
      
      // Check if this die was already used in a larger combination
      const usedInLargerCombo = combinations.some(combo => 
        combo.dice.includes(dieIndex) && combo.type !== 'singleOne' && combo.type !== 'singleFive'
      );
      
        if (!usedInLargerCombo) {
          if (value === 1) {
                    combinations.push({
            type: 'singleOne',
            dice: subsetIndices,
            points: getCombinationPoints('singleOne'),
          });
        } else if (value === 5) {
          combinations.push({
            type: 'singleFive',
            dice: subsetIndices,
            points: getCombinationPoints('singleFive'),
          });
        }
      }
    }
    
    // Generate special combinations for specific subset sizes
    // God's Straight (1-10, requires 10 dice)
    if (subsetSize === 10 && counts.length >= 10 && counts.slice(0, 10).every((c) => c === 1)) {
      combinations.push({
        type: 'godStraight',
        dice: subsetIndices,
        points: getCombinationPoints('godStraight'),
      });
    }
    
    // Triple triplets (requires 9 dice)
    if (subsetSize === 9 && counts.filter((c) => c === 3).length === 3) {
      combinations.push({
        type: 'tripleTriplets',
        dice: subsetIndices,
        points: getCombinationPoints('tripleTriplets'),
      });
    }
    
    // Four pairs (requires 8 dice)
    if (subsetSize === 8) {
      // Count how many pairs can be formed (allowing multiple pairs from same value)
      let pairCount = 0;
      for (let i = 0; i < counts.length; i++) {
        pairCount += Math.floor(counts[i] / 2);
      }
      if (pairCount === 4) {
        combinations.push({
          type: 'fourPairs',
          dice: subsetIndices,
          points: getCombinationPoints('fourPairs'),
        });
      }
    }
    // Three pairs (requires 6 dice)
    if (subsetSize === 6) {
      let pairCount = 0;
      for (let i = 0; i < counts.length; i++) {
        pairCount += Math.floor(counts[i] / 2);
      }
      if (pairCount === 3) {
        combinations.push({
          type: 'threePairs',
          dice: subsetIndices,
          points: getCombinationPoints('threePairs'),
        });
      }
    }
    
    // Straight (any 6 consecutive numbers)
    if (subsetSize === 6) {
      const sorted = [...subsetValues].sort((a, b) => a - b);
      const unique = [...new Set(sorted)];
      if (unique.length === 6 && unique[unique.length - 1] - unique[0] === 5) {
        combinations.push({
          type: 'straight',
          dice: subsetIndices,
          points: getCombinationPoints('straight'),
        });
      }
    }
    
    // Two triplets (requires 6 dice)
    if (subsetSize === 6 && counts.filter((c) => c === 3).length === 2) {
      combinations.push({
        type: 'twoTriplets',
        dice: subsetIndices,
        points: getCombinationPoints('twoTriplets'),
      });
    }
  }
  
  // Deduplicate combinations (same type and dice indices)
  const uniqueCombinations: ScoringCombination[] = [];
  const seenCombinations = new Set<string>();
  
  const beforeCombinationCount = combinations.length;
  
  for (const combo of combinations) {
    const canonical = `${combo.type}:${combo.dice.sort((a, b) => a - b).join(',')}`;
    if (!seenCombinations.has(canonical)) {
      seenCombinations.add(canonical);
      uniqueCombinations.push(combo);
    }
  }
  
  if (getDebugMode()) {
    debugLog(`Combination deduplication: ${beforeCombinationCount} → ${uniqueCombinations.length} unique combinations`);
  }
  
  return uniqueCombinations;
}

// Helper function to generate all possible subsets of indices
function generateAllSubsets(indices: number[]): number[][] {
  const subsets: number[][] = [];
  const n = indices.length;
  
  // Generate all possible subsets using bit manipulation
  for (let i = 1; i < (1 << n); i++) {
    const subset: number[] = [];
    for (let j = 0; j < n; j++) {
      if (i & (1 << j)) {
        subset.push(indices[j]);
      }
    }
    subsets.push(subset);
  }
  
  return subsets;
}


export function rollDice(numDice: number, sides: number = 6): DieValue[] {
  return Array.from({ length: numDice }, () => (Math.floor(Math.random() * sides) + 1) as DieValue);
}

export function countDice(dice: number[]): number[] {
  const maxFace = Math.max(...dice, 6); // Default to 6 if dice is empty
  const counts = Array(maxFace).fill(0);
  for (const die of dice) {
    counts[die - 1]++;
  }
  return counts;
}

export function hasAnyScoringCombination(diceHand: Die[]): boolean {
  const values = diceHand.map(die => die.rolledValue!);
  const counts = countDice(values);
  // Singles
  if (counts[0] > 0 || counts[4] > 0) return true; // 1s or 5s
  // Three/four/five/six/seven of a kind
  for (let n = 3; n <= 7; n++) {
    if (counts.some(c => c >= n)) return true;
  }
  // God's Straight (1-10, requires 10 dice)
  if (values.length === 10) {
    const sorted = [...values].sort((a, b) => a - b);
    if (sorted.join(',') === '1,2,3,4,5,6,7,8,9,10') return true;
  }
  // Straight (any 6 consecutive numbers)
  if (values.length === 6) {
    const sorted = [...values].sort((a, b) => a - b);
    const unique = [...new Set(sorted)];
    if (unique.length === 6 && unique[unique.length - 1] - unique[0] === 5) return true;
  }
  // Four pairs (requires 8 dice)
  if (values.length === 8 && counts.filter(c => c === 2).length === 4) return true;
  // Three pairs
  if (values.length === 6 && counts.filter(c => c === 2).length === 3) return true;
  // Triple triplets (three triplets)
  if (values.length === 9 && counts.filter(c => c === 3).length === 3) return true;
  // Two triplets
  if (values.length === 6 && counts.filter(c => c === 3).length === 2) return true;
  return false;
}

export function isFlop(diceHand: Die[]): boolean {
  return !hasAnyScoringCombination(diceHand);
} 