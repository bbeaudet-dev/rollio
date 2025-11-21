/**
 * Combination Definitions and Algorithms
 * 
 * This file defines all scoring combinations, their point calculation algorithms,
 * and categorization for difficulty levels.
 */

/**
 * Algorithm-based scoring combination types
 * All specific types (threeOfAKind, fourOfAKind, etc.) have been removed
 * in favor of algorithm-based types that scale with parameters.
 */
export type ScoringCombinationType =
  | 'singleN'           // Single die scoring (normally 1 or 5, can be extended)
  | 'nPairs'            // N pairs (n >= 1)
  | 'nOfAKind'          // N of a kind (n >= 3)
  | 'nTriplets'         // N triplets (n >= 2)
  | 'nQuadruplets'      // N quadruplets (n >= 2)
  | 'nQuintuplets'      // N quintuplets (n >= 2)
  | 'nSextuplets'       // N sextuplets (n >= 2)
  | 'nSeptuplets'       // N septuplets (n >= 2)
  | 'nOctuplets'        // N octuplets (n >= 2)
  | 'nNonuplets'        // N nonuplets (n >= 2)
  | 'nDecuplets'        // N decuplets (n >= 2)
  | 'straightOfN'       // Straight of N consecutive numbers (n >= 4)
  | 'pyramidOfN';       // Pyramid pattern (n = m!, m >= 3)

/**
 * All scoring combination types for iteration
 */
export const ALL_SCORING_TYPES: ScoringCombinationType[] = [
  'singleN',
  'nPairs',
  'nOfAKind',
  'nTriplets',
  'nQuadruplets',
  'nQuintuplets',
  'nSextuplets',
  'nSeptuplets',
  'nOctuplets',
  'nNonuplets',
  'nDecuplets',
  'straightOfN',
  'pyramidOfN',
];

/**
 * Point calculation algorithms for each combination type
 */

/**
 * Calculate points for singleN combination
 * Algorithm: (faceValue * x) where:
 * - if faceValue = 1, then x = 100
 * - if faceValue = 5, then x = 50
 * - if faceValue = 3 (via charm), then x = 25 (or custom)
 */
export function calculateSingleNPoints(faceValue: number): number {
  if (faceValue === 1) return 100;
  if (faceValue === 5) return 50;
  if (faceValue === 3) return 25; // Low hanging fruit charm
  // Default: 50 * faceValue for other values (if enabled by charms)
  return 50 * faceValue;
}

/**
 * Calculate points for nPairs combination
 * Algorithm:
 * - 1 pair: faceValue * 10
 * - 2 pairs: 5 * (faceValue + 9)
 * - 3 pairs: 30 * (faceValue + 9)
 * faceValue is the highest face value among all pairs
 */
export function calculateNPairsPoints(n: number, faceValue: number): number {
  if (n === 1) return faceValue * 10;
  if (n === 2) return 5 * (faceValue + 9);
  if (n === 3) return 30 * (faceValue + 9);
  // For n >= 4, use the 3 pairs formula as base and scale
  return 30 * (faceValue + 9) * (n / 3);
}

/**
 * Calculate points for nOfAKind combination
 * Algorithm: 20 * (faceValue + 9) * (n - 2)^2
 */
export function calculateNOfAKindPoints(faceValue: number, n: number): number {
  // Special case: 1s are worth more
  if (faceValue === 1 && n === 3) return 1000;
  // Algorithm: 10 * (faceValue + 9) * (n - 2)^2
  return 20 * (faceValue + 9) * Math.pow(n - 2, 2);
}

/**
 * Calculate points for nTriplets combination
 * Algorithm: Base value scales with number of triplets
 * Base: 2500 for 2 triplets
 */
export function calculateNTripletsPoints(n: number): number {
  // Base: 2500 for 2 triplets, scales with N
  return 2500 * (n / 2);
}

/**
 * Calculate points for nQuadruplets combination
 * Algorithm: Base value scales with number of quadruplets
 * Base: 1000 for 2 quadruplets
 */
export function calculateNQuadrupletsPoints(n: number): number {
  return 1000 * n;
}

/**
 * Calculate points for nQuintuplets combination
 */
export function calculateNQuintupletsPoints(n: number): number {
  return 2500 * n;
}

/**
 * Calculate points for nSextuplets combination
 */
export function calculateNSextupletsPoints(n: number): number {
  return 4000 * n;
}

/**
 * Calculate points for nSeptuplets combination
 */
export function calculateNSeptupletsPoints(n: number): number {
  return 5000 * n;
}

/**
 * Calculate points for nOctuplets combination
 */
export function calculateNOctupletsPoints(n: number): number {
  return 6000 * n;
}

/**
 * Calculate points for nNonuplets combination
 */
export function calculateNNonupletsPoints(n: number): number {
  return 7000 * n;
}

/**
 * Calculate points for nDecuplets combination
 */
export function calculateNDecupletsPoints(n: number): number {
  return 8000 * n;
}

/**
 * Calculate points for straightOfN combination
 * Algorithm: Base value scales with straight length
 * Base: 300 for length 4, 500 for length 5, 2000 for length 6
 */
export function calculateStraightOfNPoints(length: number): number {
  if (length === 4) return 300;
  if (length === 5) return 500;
  if (length === 6) return 2000;
  // For longer straights, scale from base: 2000 * (length / 6)
  return 2000 * (length / 6);
}

/**
 * Calculate points for pyramidOfN combination
 * Algorithm: Base value scales with pyramid size
 * Base: 3000 for 6-dice pyramid
 */
export function calculatePyramidOfNPoints(n: number): number {
  // Base: 3000 for 6-dice pyramid, scales with N
  return 500 * (n / 6);
}

/**
 * Main function to calculate points for any combination type
 */
export function calculateCombinationPoints(
  type: ScoringCombinationType,
  params: {
    faceValue?: number;
    count?: number;
    length?: number;
    n?: number;
  }
): number {
  switch (type) {
    case 'singleN':
      if (params.faceValue === undefined) return 0;
      return calculateSingleNPoints(params.faceValue);
    
    case 'nPairs':
      if (params.n === undefined || params.faceValue === undefined) return 0;
      return calculateNPairsPoints(params.n, params.faceValue);
    
    case 'nOfAKind':
      if (params.faceValue === undefined || params.count === undefined) return 0;
      return calculateNOfAKindPoints(params.faceValue, params.count);
    
    case 'nTriplets':
      if (params.n === undefined) return 0;
      return calculateNTripletsPoints(params.n);
    
    case 'nQuadruplets':
      if (params.n === undefined) return 0;
      return calculateNQuadrupletsPoints(params.n);
    
    case 'nQuintuplets':
      if (params.n === undefined) return 0;
      return calculateNQuintupletsPoints(params.n);
    
    case 'nSextuplets':
      if (params.n === undefined) return 0;
      return calculateNSextupletsPoints(params.n);
    
    case 'nSeptuplets':
      if (params.n === undefined) return 0;
      return calculateNSeptupletsPoints(params.n);
    
    case 'nOctuplets':
      if (params.n === undefined) return 0;
      return calculateNOctupletsPoints(params.n);
    
    case 'nNonuplets':
      if (params.n === undefined) return 0;
      return calculateNNonupletsPoints(params.n);
    
    case 'nDecuplets':
      if (params.n === undefined) return 0;
      return calculateNDecupletsPoints(params.n);
    
    case 'straightOfN':
      if (params.length === undefined) return 0;
      return calculateStraightOfNPoints(params.length);
    
    case 'pyramidOfN':
      if (params.n === undefined) return 0;
      return calculatePyramidOfNPoints(params.n);
    
    default:
      return 0;
  }
}

