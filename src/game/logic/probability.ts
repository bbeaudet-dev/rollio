import { ScoringCombinationType } from '../data/combinations';
import { DIFFICULTY_MIN_VALUES } from '../logic/difficulty';
import { countDice, getSpecificCombinationParams } from './findCombinations';
import { findAllValidPartitionings } from './partitioning';
import { Die } from '../types';
import { isCombinationAvailable } from './difficulty';

/**
 * Probability Calculation Engine
 * 
 * This module calculates probabilities for scoring combinations in Rollio.
 * Uses inclusive (non-exclusive) counting - a roll can count for multiple combinations.
 */

export interface SpecificCombinationProbability {
  key: string; // e.g., "nPairs:2", "nOfAKind:4"
  type: ScoringCombinationType;
  param: number; // The parameter value (e.g., 2 for "2 Pairs", 4 for "4 of a Kind")
  favorableOutcomes: number; // Number of rolls that include this combination (exact count)
  totalOutcomes: number;
  probability: number;
  percentage: number;
  isPossible: boolean;
}

export type CombinationCategory = 'beginner' | 'intermediate' | 'advanced';


/**
 * Calculate total number of possible outcomes for given configuration
 * Total outcomes = product of number of faces on each die
 */
function calculateTotalOutcomes(diceFaces: number[][]): number {
  return diceFaces.reduce((total, dieFaces) => total * dieFaces.length, 1);
}


/**
 * Generate all possible specific combinations for a given dice count
 */
export function generateAllSpecificCombinations(numDice: number): Array<{ type: ScoringCombinationType; param: number }> {
  const combinations: Array<{ type: ScoringCombinationType; param: number }> = [];
  
  // Single N: 1 and 5
  combinations.push({ type: 'singleN', param: 1 });
  combinations.push({ type: 'singleN', param: 5 });
  
  // N Pairs: 1 to floor(numDice/2)
  for (let n = 1; n <= Math.floor(numDice / 2); n++) {
    combinations.push({ type: 'nPairs', param: n });
  }
  
  // N of a Kind: 3 to numDice
  for (let n = 3; n <= numDice; n++) {
    combinations.push({ type: 'nOfAKind', param: n });
  }
  
  // Straight of N: 4 to numDice
  for (let n = 4; n <= numDice; n++) {
    combinations.push({ type: 'straightOfN', param: n });
  }

  // Pyramid of N: Triangular numbers (n*(n+1)/2) starting from 6
  // 6 (3-2-1), 10 (4-3-2-1), 15 (5-4-3-2-1), 21 (6-5-4-3-2-1), etc.
  for (let n = 3; ; n++) {
    const pyramidSize = (n * (n + 1)) / 2;
    if (pyramidSize > numDice) break;
    combinations.push({ type: 'pyramidOfN', param: pyramidSize });
  }
  
  // N Triplets: 2 to floor(numDice/3)
  for (let n = 2; n <= Math.floor(numDice / 3); n++) {
    combinations.push({ type: 'nTriplets', param: n });
  }
  
  // N Quadruplets: 2 to floor(numDice/4)
  for (let n = 2; n <= Math.floor(numDice / 4); n++) {
    combinations.push({ type: 'nQuadruplets', param: n });
  }
  
  // N Quintuplets: 2 to floor(numDice/5)
  for (let n = 2; n <= Math.floor(numDice / 5); n++) {
    combinations.push({ type: 'nQuintuplets', param: n });
  }
  
  // N Sextuplets: 2 to floor(numDice/6)
  for (let n = 2; n <= Math.floor(numDice / 6); n++) {
    combinations.push({ type: 'nSextuplets', param: n });
  }
  
  // N Septuplets: 2 to floor(numDice/7)
  for (let n = 2; n <= Math.floor(numDice / 7); n++) {
    combinations.push({ type: 'nSeptuplets', param: n });
  }
  
  // N Octuplets: 2 to floor(numDice/8)
  for (let n = 2; n <= Math.floor(numDice / 8); n++) {
    combinations.push({ type: 'nOctuplets', param: n });
  }
  
  // N Nonuplets: 2 to floor(numDice/9)
  for (let n = 2; n <= Math.floor(numDice / 9); n++) {
    combinations.push({ type: 'nNonuplets', param: n });
  }
  
  // N Decuplets: 2 to floor(numDice/10)
  for (let n = 2; n <= Math.floor(numDice / 10); n++) {
    combinations.push({ type: 'nDecuplets', param: n });
  }
  
  return combinations;
}


/**
 * Generate all possible rolls from diceFaces configuration
 * Returns an array of arrays, where each inner array is a possible roll
 */
function generateAllPossibleRolls(diceFaces: number[][]): number[][] {
  const rolls: number[][] = [];
  
  function generateRecursive(currentRoll: number[], dieIndex: number) {
    if (dieIndex === diceFaces.length) {
      rolls.push([...currentRoll]);
      return;
    }
    
    for (const faceValue of diceFaces[dieIndex]) {
      currentRoll.push(faceValue);
      generateRecursive(currentRoll, dieIndex + 1);
      currentRoll.pop();
    }
  }
  
  generateRecursive([], 0);
  return rolls;
}


/**
 * Check if a roll contains a specific combination (inclusive counting)
 */
function rollContainsCombination(
  roll: number[],
  type: ScoringCombinationType,
  param: number
): boolean {
  const counts = countDice(roll);
  
  switch (type) {
    case 'singleN':
      // Check if roll contains at least one die with value param
      return roll.includes(param);
    
    case 'nPairs':
      // Check if roll contains at least param pairs
      const pairCount = counts.reduce((sum, c) => sum + Math.floor(c / 2), 0);
      return pairCount >= param;
    
    case 'nOfAKind':
      // Check if roll contains at least param dice of the same value
      return counts.some(c => c >= param);
    
    case 'straightOfN':
      // Check if roll contains a straight of length param
      const uniqueSorted = [...new Set(roll)].sort((a, b) => a - b);
      if (uniqueSorted.length < param) return false;
      
      // Check all possible consecutive sequences of length param
      for (let start = 0; start <= uniqueSorted.length - param; start++) {
        const sequence = uniqueSorted.slice(start, start + param);
        if (sequence[param - 1] - sequence[0] === param - 1) {
          // Check if we have at least one of each value in the sequence
          const hasAll = sequence.every(val => roll.includes(val));
          if (hasAll) return true;
        }
      }
      return false;
    
    case 'nTriplets':
      // Check if roll contains at least param triplets
      const tripletCount = counts.filter(c => c >= 3).length;
      return tripletCount >= param;
    
    case 'nQuadruplets':
      // Check if roll contains at least param quadruplets
      const quadrupletCount = counts.filter(c => c >= 4).length;
      return quadrupletCount >= param;
    
    case 'nQuintuplets':
      // Check if roll contains at least param quintuplets
      const quintupletCount = counts.filter(c => c >= 5).length;
      return quintupletCount >= param;
    
    case 'nSextuplets':
      // Check if roll contains at least param sextuplets
      const sextupletCount = counts.filter(c => c >= 6).length;
      return sextupletCount >= param;
    
    case 'nSeptuplets':
      // Check if roll contains at least param septuplets
      const septupletCount = counts.filter(c => c >= 7).length;
      return septupletCount >= param;
    
    case 'nOctuplets':
      // Check if roll contains at least param octuplets
      const octupletCount = counts.filter(c => c >= 8).length;
      return octupletCount >= param;
    
    case 'nNonuplets':
      // Check if roll contains at least param nonuplets
      const nonupletCount = counts.filter(c => c >= 9).length;
      return nonupletCount >= param;
    
    case 'nDecuplets':
      // Check if roll contains at least param decuplets
      const decupletCount = counts.filter(c => c >= 10).length;
      return decupletCount >= param;
    
    case 'pyramidOfN':
      // Pyramid: descending count pattern (e.g., 3-2-1, 4-3-2-1, 5-4-3-2-1)
      // Check if roll contains a subset that forms a pyramid of size param
      // A pyramid of N requires: N of one value, N-1 of another, ..., 1 of another
      // Total dice needed: N + (N-1) + ... + 1 = N*(N+1)/2 = param
      if (roll.length < param) return false;
      
      // Find N such that N*(N+1)/2 = param
      // N^2 + N - 2*param = 0
      // N = (-1 + sqrt(1 + 8*param)) / 2
      const n = Math.floor((-1 + Math.sqrt(1 + 8 * param)) / 2);
      if (n * (n + 1) / 2 !== param) return false; // param is not a triangular number
      
      // Check if we can form pyramid pattern: n, n-1, ..., 1
      // We need to find n different values where we have at least n, n-1, ..., 1 of each
      const nonZeroCounts = counts.filter(c => c > 0).sort((a, b) => b - a);
      
      // We need at least n different values
      if (nonZeroCounts.length < n) return false;
      
      // Check if we can select n values from the available counts to form the pyramid
      // We need: one value with count >= n, one with count >= n-1, ..., one with count >= 1
      // Try all possible ways to assign the pyramid pattern to the available counts
      function canFormPyramid(availableCounts: number[], pyramidPattern: number[]): boolean {
        if (pyramidPattern.length === 0) return true;
        const needed = pyramidPattern[0];
        for (let i = 0; i < availableCounts.length; i++) {
          if (availableCounts[i] >= needed) {
            const newAvailable = [...availableCounts];
            newAvailable.splice(i, 1);
            if (canFormPyramid(newAvailable, pyramidPattern.slice(1))) {
              return true;
            }
          }
        }
        return false;
      }
      
      const pyramidPattern: number[] = [];
      for (let i = n; i >= 1; i--) {
        pyramidPattern.push(i);
      }
      
      return canFormPyramid(nonZeroCounts, pyramidPattern);
    
    default:
      return false;
  }
}


/**
 * Process computation in chunks to avoid blocking the UI
 * Always yields to the browser to keep the UI responsive
 * In Node.js (non-browser), can process synchronously for better performance
 */
function processChunk<T>(
  items: T[],
  processor: (item: T, index: number) => void,
  chunkSize: number = 10000, // Process 10k items at a time, then yield
  onProgress?: (current: number, total: number) => void,
  shouldCancel?: () => boolean
): Promise<void> {
  return new Promise((resolve, reject) => {
    // In Node.js, process everything synchronously for maximum speed
    // In browser, we need to yield to keep UI responsive
    const isNode = typeof window === 'undefined';
    
    if (isNode && items.length < 10000000) {
      // For Node.js with reasonable sizes, process synchronously
      let lastProgressUpdate = 0;
      const progressUpdateInterval = Math.max(50000, Math.floor(items.length / 200));
      
      for (let i = 0; i < items.length; i++) {
        if (shouldCancel && shouldCancel()) {
          reject(new Error('Calculation cancelled'));
          return;
        }
        
        processor(items[i], i);
        
        // Update progress occasionally
        if (onProgress && (i - lastProgressUpdate >= progressUpdateInterval || i === items.length - 1)) {
          onProgress(i + 1, items.length);
          lastProgressUpdate = i;
        }
      }
      
      if (onProgress) {
        onProgress(items.length, items.length);
      }
      resolve();
      return;
    }
    
    // Browser path: yield to keep UI responsive
    let index = 0;
    let lastProgressUpdate = 0;
    // Update progress every 0.5% or every 10k items, whichever is larger
    const progressUpdateInterval = Math.max(10000, Math.floor(items.length / 200));
    
    const processNextChunk = () => {
      if (shouldCancel && shouldCancel()) {
        reject(new Error('Calculation cancelled'));
        return;
      }
      
      const end = Math.min(index + chunkSize, items.length);
      for (let i = index; i < end; i++) {
        processor(items[i], i);
      }
      
      index = end;
      
      // Only update progress occasionally to avoid overhead
      if (onProgress && (index - lastProgressUpdate >= progressUpdateInterval || index >= items.length)) {
        onProgress(index, items.length);
        lastProgressUpdate = index;
      }
      
      if (index < items.length) {
        // Always yield control back to browser to keep UI responsive
        // Use setTimeout(0) to yield to the event loop
        setTimeout(processNextChunk, 0);
      } else {
        resolve();
      }
    };
    
    processNextChunk();
  });
}

/**
 * Check if a combination is possible with the given number of dice
 */
function isCombinationPossible(type: ScoringCombinationType, param: number, numDice: number): boolean {
  switch (type) {
    case 'singleN':
      return numDice >= 1; // Always possible if we have at least 1 die
    
    case 'nPairs':
      return numDice >= param * 2; // Need at least 2 dice per pair
    
    case 'nOfAKind':
      return numDice >= param; // Need at least param dice
    
    case 'straightOfN':
      return numDice >= param; // Need at least param dice
    
    case 'nTriplets':
      return numDice >= param * 3; // Need at least 3 dice per triplet
    
    case 'nQuadruplets':
      return numDice >= param * 4; // Need at least 4 dice per quadruplet
    
    case 'nQuintuplets':
      return numDice >= param * 5; // Need at least 5 dice per quintuplet
    
    case 'nSextuplets':
      return numDice >= param * 6; // Need at least 6 dice per sextuplet
    
    case 'nSeptuplets':
      return numDice >= param * 7; // Need at least 7 dice per septuplet
    
    case 'nOctuplets':
      return numDice >= param * 8; // Need at least 8 dice per octuplet
    
    case 'nNonuplets':
      return numDice >= param * 9; // Need at least 9 dice per nonuplet
    
    case 'nDecuplets':
      return numDice >= param * 10; // Need param * 10 dice total 
    
    case 'pyramidOfN':
      // Pyramid requires specific count pattern: N, N-1, N-2, ..., 1
      // Sum is N*(N+1)/2, so we need at least that many dice
      // For pyramid of N, we need at least N dice (can use fewer than all dice)
      return numDice >= param;
    
    default:
      return false;
  }
}

/**
 * Filter combinations based on difficulty category
 */
function filterCombinationsByCategory(
  combinations: Array<{ type: ScoringCombinationType; param: number }>,
  category: CombinationCategory
): Array<{ type: ScoringCombinationType; param: number }> {
  const minValues = category === 'beginner' 
    ? DIFFICULTY_MIN_VALUES.plastic
    : category === 'intermediate'
    ? DIFFICULTY_MIN_VALUES.silver
    : DIFFICULTY_MIN_VALUES.diamond;
  
  return combinations.filter(({ type, param }) => {
    switch (type) {
      case 'singleN':
        if (minValues.singleN === false) {
          return false;
        } else if (Array.isArray(minValues.singleN)) {
          return minValues.singleN.includes(param);
        }
        return false;
      case 'nPairs':
        return param >= minValues.nPairs;
      case 'nOfAKind':
        return param >= minValues.nOfAKind;
      case 'straightOfN':
        return param >= minValues.straightOfN;
      case 'nTriplets':
        return param >= minValues.nTriplets;
      case 'nQuadruplets':
        return param >= minValues.nQuadruplets;
      case 'pyramidOfN':
        return param >= minValues.pyramidOfN;
      default:
        return true; // Other types are always included
    }
  });
}

/**
 * Calculate how many dice a combination uses
 */
export function getDiceUsedByCombination(type: ScoringCombinationType, param: number): number {
  switch (type) {
    case 'singleN':
      return 1;
    case 'nPairs':
      return param * 2;
    case 'nOfAKind':
      return param;
    case 'straightOfN':
      return param;
    case 'nTriplets':
      return param * 3;
    case 'nQuadruplets':
      return param * 4;
    case 'nQuintuplets':
      return param * 5;
    case 'nSextuplets':
      return param * 6;
    case 'nSeptuplets':
      return param * 7;
    case 'nOctuplets':
      return param * 8;
    case 'nNonuplets':
      return param * 9;
    case 'nDecuplets':
      return param * 10;
    case 'pyramidOfN':
      return param; // Pyramid of N uses N dice
    default:
      return 0;
  }
}

/**
 * Convert CombinationCategory to DifficultyLevel for partitioning system
 */
function categoryToDifficulty(category: CombinationCategory): 'plastic' | 'silver' | 'diamond' {
  switch (category) {
    case 'beginner':
      return 'plastic';
    case 'intermediate':
      return 'silver';
    case 'advanced':
      return 'diamond';
  }
}

/**
 * Check if a roll can use all dice (hot dice) using the actual partitioning system
 * This uses the same logic as the game to determine if all dice can be used
 * @throws Error if diceFaces configuration is invalid or doesn't match roll length
 */
function rollHasHotDice(
  roll: number[],
  category: CombinationCategory,
  diceFaces: number[][]
): boolean {
  const numDice = roll.length;
  if (numDice === 0) return false;
  
  // Validate that diceFaces matches roll length
  if (diceFaces.length !== numDice) {
    throw new Error(`Dice configuration mismatch: roll has ${numDice} dice but diceFaces has ${diceFaces.length} entries`);
  }
  
  // Validate each die configuration
  for (let i = 0; i < numDice; i++) {
    if (!diceFaces[i] || diceFaces[i].length === 0) {
      throw new Error(`Invalid dice configuration at index ${i}: diceFaces[${i}] is missing or empty`);
    }
    if (!diceFaces[i].includes(roll[i])) {
      throw new Error(`Roll value ${roll[i]} at index ${i} is not in allowedValues [${diceFaces[i].join(', ')}]`);
    }
  }
  
  // Convert category to difficulty level
  const difficulty = categoryToDifficulty(category);
  
  // Create minimal Die objects from the roll values
  // Use the actual diceFaces configuration to get correct allowedValues
  const diceHand: Die[] = roll.map((value, index) => ({
    id: `die-${index}`,
    sides: diceFaces[index].length,
    allowedValues: diceFaces[index],
    material: 'plastic' as const,
    rolledValue: value,
    pipEffects: {}, // No pip effects for calculator
  }));
  
  // Create selected indices (all dice)
  const selectedIndices = roll.map((_, index) => index);
  
  // Create scoring context with difficulty
  // The partitioning system will use findAllPossibleCombinations which filters by difficulty
  const context = {
    charms: [],
    difficulty: difficulty,
  };
  
  // Use the actual partitioning system to find all valid partitionings
  // The partitioning system will automatically filter by difficulty
  const partitionings = findAllValidPartitionings(
    roll,
    selectedIndices,
    diceHand,
    context
  );
  
  // Hot dice if there's at least one valid partitioning that uses all dice
  // (partitionings are already filtered by difficulty in findAllValidPartitionings)
  return partitionings.length > 0;
}


/**
 * Check all combinations for a single roll (single-pass optimization)
 */
function checkRollForAllCombinations(
  roll: number[],
  combinations: Array<{ type: ScoringCombinationType; param: number }>
): { [key: string]: boolean; hasAny: boolean } {
  const results: { [key: string]: boolean; hasAny: boolean } = { hasAny: false };
  
  for (const { type, param } of combinations) {
    const key = `${type}:${param}`;
    const contains = rollContainsCombination(roll, type, param);
    results[key] = contains;
    if (contains) {
      results.hasAny = true;
    }
  }
  
  return results;
}

/**
 * Calculate probabilities for all specific combinations using single-pass optimization
 */
export async function calculateAllSpecificProbabilities(
  diceFaces: number[][],
  category: CombinationCategory = 'beginner',
  onProgress?: (currentRoll: number, totalRolls: number) => void,
  shouldCancel?: () => boolean
): Promise<{ combinations: SpecificCombinationProbability[]; noneProbability: SpecificCombinationProbability }> {
  const numDice = diceFaces.length;
  const allSpecificCombinations = generateAllSpecificCombinations(numDice);
  const totalOutcomes = calculateTotalOutcomes(diceFaces);
  
  // Filter by category and impossible combinations
  const categoryFiltered = filterCombinationsByCategory(allSpecificCombinations, category);
  const possibleCombinations = categoryFiltered.filter(({ type, param }) => 
    isCombinationPossible(type, param, numDice)
  );
  
  // Generate all possible rolls
  const allRolls = generateAllPossibleRolls(diceFaces);
  
  // Initialize counters for each combination
  const combinationCounts: { [key: string]: number } = {};
  for (const { type, param } of possibleCombinations) {
    combinationCounts[`${type}:${param}`] = 0;
  }
  
  let noneCount = 0; // Rolls with zero combinations
  let hotDiceCount = 0; // Rolls that can use all dice (hot dice)
  
  // Process all rolls in a single pass
  await processChunk(
    allRolls,
    (roll) => {
      const results = checkRollForAllCombinations(roll, possibleCombinations);
      
      // Update counts for each combination
      for (const key in results) {
        if (key !== 'hasAny' && key !== 'hasHotDice' && results[key]) {
          combinationCounts[key]++;
        }
      }
      
      // Track "none" (rolls with no combinations)
      if (!results.hasAny) {
        noneCount++;
      }
      
      // Track hot dice using partitioning system
      // If this throws, let it propagate to the catch block
      if (rollHasHotDice(roll, category, diceFaces)) {
        hotDiceCount++;
      }
    },
    10000, // Smaller chunk size to keep UI responsive with expensive hot dice checks
    onProgress,
    shouldCancel
  );
  
  // Build results
  const combinationResults: SpecificCombinationProbability[] = [];
  for (const { type, param } of possibleCombinations) {
    const key = `${type}:${param}`;
    const favorableOutcomes = combinationCounts[key] || 0;
    const probability = favorableOutcomes / totalOutcomes;
    const percentage = probability * 100;
    
    combinationResults.push({
      key,
      type,
      param,
      favorableOutcomes,
      totalOutcomes,
      probability,
      percentage,
      isPossible: favorableOutcomes > 0,
    });
  }
  
  // Add impossible combinations with 0 favorable outcomes
  const impossibleCombinations = allSpecificCombinations.filter(({ type, param }) => 
    !isCombinationPossible(type, param, numDice) || 
    !categoryFiltered.some(c => c.type === type && c.param === param)
  );
  
  for (const { type, param } of impossibleCombinations) {
    combinationResults.push({
      key: `${type}:${param}`,
      type,
      param,
      favorableOutcomes: 0,
      totalOutcomes,
      probability: 0,
      percentage: 0,
      isPossible: false,
    });
  }
  
  // Add "flop" probability (rolls with no combinations)
  const flopProbability: SpecificCombinationProbability = {
    key: 'flop',
    type: 'singleN' as ScoringCombinationType, // Dummy type for "flop"
    param: 0,
    favorableOutcomes: noneCount,
    totalOutcomes,
    probability: noneCount / totalOutcomes,
    percentage: (noneCount / totalOutcomes) * 100,
    isPossible: noneCount > 0,
  };
  
  // Add "hotDice" probability (rolls that can use all dice)
  const hotDiceProbability: SpecificCombinationProbability = {
    key: 'hotDice',
    type: 'singleN' as ScoringCombinationType, // Dummy type for "hotDice"
    param: 0,
    favorableOutcomes: hotDiceCount,
    totalOutcomes,
    probability: hotDiceCount / totalOutcomes,
    percentage: (hotDiceCount / totalOutcomes) * 100,
    isPossible: hotDiceCount > 0,
  };
  
  // Add flop and hotDice to the results so they get sorted with the rest
  combinationResults.push(flopProbability);
  combinationResults.push(hotDiceProbability);
  
  return {
    combinations: combinationResults,
    noneProbability: flopProbability,
  };
}



/**
 * Factorial: n! = n * (n-1) * ... * 1
 */
function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}


/**
 * Combination: C(n, k) = n! / (k! * (n-k)!)
 */
function combination(n: number, k: number): number {
  if (k > n || k < 0) return 0;
  if (k === 0 || k === n) return 1;
  // Use symmetry: C(n, k) = C(n, n-k)
  if (k > n - k) k = n - k;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return Math.round(result);
}
