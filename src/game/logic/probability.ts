import { ScoringCombinationType } from '../data/combinations';
import { countDice } from './findCombinations';

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

  // Pyramid of N: 6 to numDice (if applicable)
  if (numDice >= 6) {
    combinations.push({ type: 'pyramidOfN', param: numDice });
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
  const maxFace = Math.max(...roll, 0);
  
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
      // Check if roll has counts that form a descending sequence starting from some N down to 1
      if (roll.length !== param) return false;
      const pyramidCounts = counts.filter(c => c > 0).sort((a, b) => b - a);
      
      // Check if counts form a descending sequence: N, N-1, N-2, ..., 1
      if (pyramidCounts.length === 0) return false;
      
      // The first count should be the largest, and they should decrease by 1 each time
      const firstCount = pyramidCounts[0];
      if (pyramidCounts.length !== firstCount) return false; // Must have exactly firstCount different values
      
      // Check if counts are consecutive descending: firstCount, firstCount-1, ..., 1
      // Also verify the sum equals param (total dice)
      let sum = 0;
      for (let i = 0; i < pyramidCounts.length; i++) {
        if (pyramidCounts[i] !== firstCount - i) {
          return false;
        }
        sum += pyramidCounts[i];
      }
      
      // Sum should equal param (e.g., 3+2+1=6, 4+3+2+1=10)
      return sum === param;
    
    default:
      return false;
  }
}


/**
 * Process computation in chunks to avoid blocking the UI
 * Uses adaptive chunk sizes - larger chunks for better performance, only yields when needed
 */
function processChunk<T>(
  items: T[],
  processor: (item: T, index: number) => void,
  chunkSize: number = 500000, // Process 500k items at a time (much larger)
  onProgress?: (current: number, total: number) => void,
  shouldCancel?: () => boolean
): Promise<void> {
  return new Promise((resolve, reject) => {
    // For small computations, process everything at once
    if (items.length < 1000000) {
      for (let i = 0; i < items.length; i++) {
        if (shouldCancel && shouldCancel()) {
          reject(new Error('Calculation cancelled'));
          return;
        }
        processor(items[i], i);
      }
      if (onProgress) {
        onProgress(items.length, items.length);
      }
      resolve();
      return;
    }
    
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
        // Yield control back to browser, then continue
        // Use requestAnimationFrame for smoother updates, fallback to setTimeout
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(processNextChunk);
        } else {
          setTimeout(processNextChunk, 0);
        }
      } else {
        resolve();
      }
    };
    
    processNextChunk();
  });
}

/**
 * Calculate favorable outcomes for a specific combination with parameter
 * Uses inclusive counting - counts all rolls that contain the combination
 */
async function calculateFavorableOutcomesForSpecificCombination(
  type: ScoringCombinationType,
  param: number,
  diceFaces: number[][],
  onProgress?: (current: number, total: number) => void,
  shouldCancel?: () => boolean
): Promise<number> {
  // Generate all possible rolls
  const allRolls = generateAllPossibleRolls(diceFaces);
  
  // Count how many rolls contain this combination
  let count = 0;
  
  await processChunk(
    allRolls,
    (roll) => {
      if (rollContainsCombination(roll, type, param)) {
        count++;
      }
    },
    500000, // Process 500k rolls at a time for better performance
    onProgress,
    shouldCancel
  );
  
  return count;
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
      // For pyramid of N, we need N dice total
      return numDice === param;
    
    default:
      return false;
  }
}

/**
 * Calculate probabilities for all specific combinations
 */
export async function calculateAllSpecificProbabilities(
  diceFaces: number[][],
  onProgress?: (combinationIndex: number, totalCombinations: number, currentRoll: number, totalRolls: number) => void,
  shouldCancel?: () => boolean
): Promise<SpecificCombinationProbability[]> {
  const numDice = diceFaces.length;
  const specificCombinations = generateAllSpecificCombinations(numDice);
  const totalOutcomes = calculateTotalOutcomes(diceFaces);
  const results: SpecificCombinationProbability[] = [];
  
  // Filter out impossible combinations first
  const possibleCombinations = specificCombinations.filter(({ type, param }) => 
    isCombinationPossible(type, param, numDice)
  );
  
  for (let index = 0; index < possibleCombinations.length; index++) {
    // Check for cancellation before each combination
    if (shouldCancel && shouldCancel()) {
      throw new Error('Calculation cancelled');
    }
    
    const { type, param } = possibleCombinations[index];
    
    // Create progress callback for this combination
    const combinationProgress = onProgress 
      ? (current: number, total: number) => {
          onProgress(index, possibleCombinations.length, current, total);
        }
      : undefined;
    
    const result = await calculateProbabilityForSpecificCombination(
      type, 
      param, 
      diceFaces,
      combinationProgress,
      shouldCancel
    );
    
    results.push(result);
  }
  
  // Add impossible combinations with 0 favorable outcomes
  const impossibleCombinations = specificCombinations.filter(({ type, param }) => 
    !isCombinationPossible(type, param, numDice)
  );
  
  for (const { type, param } of impossibleCombinations) {
    results.push({
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
  
  return results;
}


/**
 * Calculate probability for a specific combination with parameter
 */
async function calculateProbabilityForSpecificCombination(
  type: ScoringCombinationType,
  param: number,
  diceFaces: number[][],
  onProgress?: (current: number, total: number) => void,
  shouldCancel?: () => boolean
): Promise<SpecificCombinationProbability> {
  const totalOutcomes = calculateTotalOutcomes(diceFaces);
  const favorableOutcomes = await calculateFavorableOutcomesForSpecificCombination(
    type, 
    param, 
    diceFaces,
    onProgress,
    shouldCancel
  );
  const probability = favorableOutcomes / totalOutcomes;
  const percentage = probability * 100;
  
  return {
    key: `${type}:${param}`,
    type,
    param,
    favorableOutcomes,
    totalOutcomes,
    probability,
    percentage,
    isPossible: favorableOutcomes > 0,
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
