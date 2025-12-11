/**
 * Combination Definitions and Algorithms
 * 
 * This file defines all scoring combinations, their point calculation algorithms,
 * and categorization for difficulty levels.
 * 
 * Upgrade System:
 * Each combination type has its own upgrade algorithm with different:
 * - Base points
 * - Base multiplier
 * - Base exponent
 * - Base points added per combination level
 * - Level threshold for when multiplier additions start
 * - Base multiplier added per combination level
 * - Level threshold for when exponent additions start
 * - Base exponent added per combination level
 */

/**
 * Upgrade modifiers for a combination at a given level
 */
export interface CombinationUpgrade {
  pointsAdd: number;      // Additional base points added to base point total from each combo upgrade
  multiplierAdd: number;  // Additional base multiplier added to base multiplier total from each combo upgrade
  exponentAdd: number;    // Additional base exponent added to base exponent total from each combo upgrade
}

/**
 * Combination upgrade algorithm configuration
 */
interface UpgradeConfig {
  pointsPerLevel: (params: any) => number;        // Points added per level (function of n, faceValue, etc.)
  multiplierStartLevel: (params: any) => number;  // Level when multipliers start (at this level, first multiplier is added)
  multiplierPerLevel: (params: any) => number;    // Multiplier added per level
  exponentStartLevel: (params: any) => number;    // Level when exponents start (at this level, first exponent is added)
  exponentPerLevel: (params: any) => number;      // Exponent added per level
}

/**
 * Get combination upgrade algorithm for each combination type
*/
function getUpgradeConfig(type: ScoringCombinationType): UpgradeConfig {
  switch (type) {
    // Beginner combinations - simple, common
    case 'singleN':
      return {
        pointsPerLevel: () => 25,
        multiplierStartLevel: () => 5,
        multiplierPerLevel: () => 0.1,
        exponentStartLevel: () => 15,    
        exponentPerLevel: () => 0.05,
      };
    
    case 'nPairs':
      // For nPairs, upgrade values scale with number of pairs
      return {
        pointsPerLevel: (params: { n: number }) => 30 * params.n,  
        multiplierStartLevel: (params: { n: number }) => Math.max(5 - (params.n - 3) * 5, 2),  
        multiplierPerLevel: (params: { n: number }) => 0.1 * params.n,
        exponentStartLevel: (params: { n: number }) => Math.max(20 - (params.n - 1) * 5, 2),  
        exponentPerLevel: (params: { n: number }) => 0.05 * params.n,
      };
    
    // Intermediate combinations
    case 'nOfAKind':
      // Scale with count (n) and face value
      return {
        pointsPerLevel: (params: { count: number; faceValue: number }) => 40 + (params.count - 3) * 10,
        multiplierStartLevel: (params: { count: number }) => Math.max(5 - (params.count - 4) * 5, 2), 
        multiplierPerLevel: (params: { count: number }) => 0.15 + (params.count - 3) * 0.05,
        exponentStartLevel: (params: { count: number }) => Math.max(20 - (params.count - 3) * 5, 2), 
        exponentPerLevel: (params: { count: number }) => 0.05 + (params.count - 3) * 0.02,
      };
    
    case 'straightOfN':
      // Scale with straight length
      return {
        pointsPerLevel: (params: { length: number }) => 50 + (params.length - 4) * 10,
        multiplierStartLevel: (params: { length: number }) => Math.max(5 - (params.length - 5) * 5, 2), 
        multiplierPerLevel: (params: { length: number }) => 0.15 + (params.length - 4) * 0.05,
        exponentStartLevel: (params: { length: number }) => Math.max(20 - (params.length - 5) * 5, 2),
        exponentPerLevel: (params: { length: number }) => 0.05 + (params.length - 4) * 0.02,
      };
    
    // Advanced combinations - rare, powerful
    case 'nTriplets':
      return {
        pointsPerLevel: (params: { n: number }) => 100 * params.n,
        multiplierStartLevel: (params: { n: number }) => Math.max(5 - (params.n - 2) * 5, 2),  
        multiplierPerLevel: (params: { n: number }) => 0.2 * params.n,
        exponentStartLevel: (params: { n: number }) => Math.max(15 - (params.n - 2) * 5, 2),  
        exponentPerLevel: (params: { n: number }) => 0.1 * params.n,
      };
    case 'nQuadruplets':
      return {
        pointsPerLevel: (params: { n: number }) => 100 * params.n,
        multiplierStartLevel: (params: { n: number }) => 2 ,
        multiplierPerLevel: (params: { n: number }) => 0.2 * params.n,
        exponentStartLevel: (params: { n: number }) => Math.max(10 - (params.n - 2) * 5, 2),  
        exponentPerLevel: (params: { n: number }) => 0.1 * params.n,
      };
    case 'nQuintuplets':
      return {
        pointsPerLevel: (params: { n: number }) => 100 * params.n,
        multiplierStartLevel: (params: { n: number }) => 2,
        multiplierPerLevel: (params: { n: number }) => 0.2 * params.n,
        exponentStartLevel: (params: { n: number }) => Math.max(5 - (params.n - 2) * 5, 2),  
        exponentPerLevel: (params: { n: number }) => 0.1 * params.n,
      };
    case 'nSextuplets':
      return {
        pointsPerLevel: (params: { n: number }) => 100 * params.n,
        multiplierStartLevel: (params: { n: number }) => 2,
        multiplierPerLevel: (params: { n: number }) => 0.2 * params.n,
        exponentStartLevel: (params: { n: number }) => 2,
        exponentPerLevel: (params: { n: number }) => 0.1 * params.n,
      };
    case 'nSeptuplets':
      return {
        pointsPerLevel: (params: { n: number }) => 100 * params.n,
        multiplierStartLevel: (params: { n: number }) => 2,
        multiplierPerLevel: (params: { n: number }) => 0.2 * params.n,
        exponentStartLevel: (params: { n: number }) => 2,
        exponentPerLevel: (params: { n: number }) => 0.1 * params.n,
      };
    case 'nOctuplets':
      return {
        pointsPerLevel: (params: { n: number }) => 150 * params.n,
        multiplierStartLevel: (params: { n: number }) => 2,
        multiplierPerLevel: (params: { n: number }) => 0.25 * params.n,
        exponentStartLevel: (params: { n: number }) => 2,
        exponentPerLevel: (params: { n: number }) => 0.1 * params.n,
      };
    case 'nNonuplets':
      return {
        pointsPerLevel: (params: { n: number }) => 100 * params.n,
        multiplierStartLevel: (params: { n: number }) => 2,
        multiplierPerLevel: (params: { n: number }) => 0.2 * params.n,
        exponentStartLevel: (params: { n: number }) => 2,
        exponentPerLevel: (params: { n: number }) => 0.1 * params.n,
      };
    case 'nDecuplets':
      return {
        pointsPerLevel: (params: { n: number }) => 200 * params.n,
        multiplierStartLevel: (params: { n: number }) => 2,
        multiplierPerLevel: (params: { n: number }) => 0.3 * params.n,
        exponentStartLevel: (params: { n: number }) => 2,
        exponentPerLevel: (params: { n: number }) => 0.15 * params.n,
      };
    
    case 'pyramidOfN':
      return {
        pointsPerLevel: (params: { n: number }) => {
          const layers = getPyramidLayers(params.n);
          return 250 * layers;
        },
        multiplierStartLevel: (params: { n: number }) => {
          const layers = getPyramidLayers(params.n);
          return Math.max((4 - layers) * 5, 2);
        },
        multiplierPerLevel: (params: { n: number }) => {
          const layers = getPyramidLayers(params.n);
          return 0.3 * layers;
        },
        exponentStartLevel: (params: { n: number }) => {
          const layers = getPyramidLayers(params.n);
          return Math.max((20 - (layers - 3) * 10), 2);
        },
        exponentPerLevel: (params: { n: number }) => {
          const layers = getPyramidLayers(params.n);
          return 0.15 * layers;
        },
      };
    
    default:
      // Default fallback
      return {
        pointsPerLevel: () => 25,
        multiplierStartLevel: () => 6,
        multiplierPerLevel: () => 0.1,
        exponentStartLevel: () => 20,
        exponentPerLevel: () => 0.05,
      };
  }
}

/**
 * Calculate upgrade modifiers for a specific combination type at a given level
 * 
 * @param type - The combination type
 * @param level - The upgrade level (1 = base, no upgrades)
 * @param params - Combination parameters (n, count, length, faceValue, etc.)
 * @returns Upgrade modifiers to apply
 */
export function calculateUpgradeModifiers(
  type: ScoringCombinationType,
  level: number,
  params: { n?: number; count?: number; length?: number; faceValue?: number } = {}
): CombinationUpgrade {
  if (level <= 1) {
    return { pointsAdd: 0, multiplierAdd: 0, exponentAdd: 0 };
  }

  const config = getUpgradeConfig(type);
  const pointsPerLevel = config.pointsPerLevel(params);
  const pointsAdd = (level - 1) * pointsPerLevel;
  
  let multiplierAdd = 0;
  let exponentAdd = 0;

  const multiplierStartLevel = config.multiplierStartLevel(params);
  if (level >= multiplierStartLevel) {
    // At multiplierStartLevel, we get the first multiplier increment
    // So if startLevel is 10, level 10 gets 1 increment, level 11 gets 2, etc.
    const multiplierLevels = level - multiplierStartLevel + 1;
    const multiplierPerLevel = config.multiplierPerLevel(params);
    multiplierAdd = multiplierLevels * multiplierPerLevel;
  }

  const exponentStartLevel = config.exponentStartLevel(params);
  if (level >= exponentStartLevel) {
    // At exponentStartLevel, we get the first exponent increment
    // So if startLevel is 25, level 25 gets 1 increment, level 26 gets 2, etc.
    const exponentLevels = level - exponentStartLevel + 1;
    const exponentPerLevel = config.exponentPerLevel(params);
    exponentAdd = exponentLevels * exponentPerLevel;
  }

  return { pointsAdd, multiplierAdd, exponentAdd };
}

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
 * Calculate points for singleN combination
 * 
 * @param faceValue - The face value of the die (1, 3, or 5)
 * @param level - The upgrade level (default: 1)
 * @returns The base points for this combination at the given level
 */
export function calculateSingleNPoints(faceValue: number, level: number = 1): number {
  let basePoints = 0;
  if (faceValue === 1) basePoints = 100;
  else if (faceValue === 5) basePoints = 50;
  else if (faceValue === 3) basePoints = 25; // Low hanging fruit charm
  else return 0;

  const upgrade = calculateUpgradeModifiers('singleN', level);
  return basePoints + upgrade.pointsAdd;
}

/**
 * Calculate points for nPairs combination
 * 
 * @param n - Number of pairs
 * @param faceValue - Highest face value in the pairs
 * @param level - The upgrade level (default: 1)
 * @returns The base points for this combination at the given level
 */
export function calculateNPairsPoints(n: number, faceValue: number, level: number = 1): number {
  // Algorithm: 3^(n-1) * n(f + 14)
  // n = numberOfPairs, f = highestFaceValue
  const basePoints = Math.pow(3, n - 1) * n * (faceValue + 14);
  const upgrade = calculateUpgradeModifiers('nPairs', level, { n });
  return basePoints + upgrade.pointsAdd;
}

/**
 * Calculate points for nOfAKind combination
 * 
 * @param faceValue - The face value
 * @param n - Number of dice of the same value
 * @param level - The upgrade level (default: 1)
 * @returns The base points for this combination at the given level
 */
export function calculateNOfAKindPoints(faceValue: number, n: number, level: number = 1): number {
  // Algorithm: 20 * (f + 14) * (n - 2)^2
  const basePoints = 20 * (faceValue + 14) * Math.pow(n - 2, 2);
  const upgrade = calculateUpgradeModifiers('nOfAKind', level, { count: n, faceValue });
  return basePoints + upgrade.pointsAdd;
}

/**
 * Calculate points for nTuplets combinations
 * 
 * @param n - Number of tuplets
 * @param level - The upgrade level (default: 1)
 * @returns The base points for this combination at the given level
 */
export function calculateNTripletsPoints(n: number, level: number = 1): number {
  const basePoints = 250 * Math.pow(n, 3);
  const upgrade = calculateUpgradeModifiers('nTriplets', level, { n });
  return basePoints + upgrade.pointsAdd;
}
export function calculateNQuadrupletsPoints(n: number, level: number = 1): number {
  const basePoints = 250 * Math.pow(n, 4);
  const upgrade = calculateUpgradeModifiers('nQuadruplets', level, { n });
  return basePoints + upgrade.pointsAdd;
}
export function calculateNQuintupletsPoints(n: number, level: number = 1): number {
  const basePoints = 250 * Math.pow(n, 5);
  const upgrade = calculateUpgradeModifiers('nQuintuplets', level, { n });
  return basePoints + upgrade.pointsAdd;
}
export function calculateNSextupletsPoints(n: number, level: number = 1): number {
  const basePoints = 250 * Math.pow(n, 6);
  const upgrade = calculateUpgradeModifiers('nSextuplets', level, { n });
  return basePoints + upgrade.pointsAdd;
}
export function calculateNSeptupletsPoints(n: number, level: number = 1): number {
  const basePoints = 250 * Math.pow(n, 7);
  const upgrade = calculateUpgradeModifiers('nSeptuplets', level, { n });
  return basePoints + upgrade.pointsAdd;
}
export function calculateNOctupletsPoints(n: number, level: number = 1): number {
  const basePoints = 250 * Math.pow(n, 8);
  const upgrade = calculateUpgradeModifiers('nOctuplets', level, { n });
  return basePoints + upgrade.pointsAdd;
}
export function calculateNNonupletsPoints(n: number, level: number = 1): number {
  const basePoints = 250 * Math.pow(n, 9);
  const upgrade = calculateUpgradeModifiers('nNonuplets', level, { n });
  return basePoints + upgrade.pointsAdd;
}
export function calculateNDecupletsPoints(n: number, level: number = 1): number {
  const basePoints = 250 * Math.pow(n, 10);
  const upgrade = calculateUpgradeModifiers('nDecuplets', level, { n });
  return basePoints + upgrade.pointsAdd;
}

/**
 * Calculate points for straightOfN combination
 * 
 * @param length - Length of the straight
 * @param level - The upgrade level (default: 1)
 * @returns The base points for this combination at the given level
 */
export function calculateStraightOfNPoints(length: number, level: number = 1): number {
  // Algorithm: length ^ 2.5 * 10 * length
  const basePoints = Math.pow(length, 2.5) * 10 * length;
  const upgrade = calculateUpgradeModifiers('straightOfN', level, { length });
  return basePoints + upgrade.pointsAdd;
}

/*
 * Calculate the points for pyramidOfN combination
 */
function getPyramidLayers(pyramidSize: number): number {
  // Pyramid of size n has m layers where n = m*(m+1)/2
  // Solving for m:m = (-1 + sqrt(1 + 8*n)) / 2
  return Math.floor((-1 + Math.sqrt(1 + 8 * pyramidSize)) / 2);
}
/**
 * Calculate points for pyramidOfN combination
 * 
 * @param n - Total dice in pyramid (e.g., 6, 10, 15, 21)
 * @param level - The upgrade level (default: 1)
 * @returns The base points for this combination at the given level
 */
export function calculatePyramidOfNPoints(n: number, level: number = 1): number {
  const layers = getPyramidLayers(n);
  // Algorithm: (2^layers)^layers = 2^(layers^2)
  const basePoints = Math.pow(2, layers * layers);
  const upgrade = calculateUpgradeModifiers('pyramidOfN', level, { n });
  return basePoints + upgrade.pointsAdd;
}

/**
 * Base scoring element values for a combination at a given level
 * This includes base points, multiplier, and exponent all together
 * These are the BASE values from the combination itself (before other modifiers)
 */
export interface BaseScoringElementValues {
  basePoints: number;      // Base points (algorithm result + upgrade points)
  baseMultiplier: number;  // Base multiplier (1.0 + upgrade multiplier)
  baseExponent: number;    // Base exponent (1.0 + upgrade exponent)
}

/**
 * Get base scoring element values (points, multiplier, exponent) for a combination
 */
export function getBaseScoringElementValues(
  type: ScoringCombinationType,
  level: number = 1,
  params: { n?: number; count?: number; length?: number; faceValue?: number } = {}
): BaseScoringElementValues {
  const upgrade = calculateUpgradeModifiers(type, level, params);
  
  // Calculate base points using the appropriate function
  let basePoints = 0;
  switch (type) {
    case 'singleN':
      if (params.faceValue !== undefined) {
        basePoints = calculateSingleNPoints(params.faceValue, level);
      }
      break;
    case 'nPairs':
      if (params.n !== undefined && params.faceValue !== undefined) {
        basePoints = calculateNPairsPoints(params.n, params.faceValue, level);
      }
      break;
    case 'nOfAKind':
      if (params.faceValue !== undefined && params.count !== undefined) {
        basePoints = calculateNOfAKindPoints(params.faceValue, params.count, level);
      }
      break;
    case 'nTriplets':
      if (params.n !== undefined) basePoints = calculateNTripletsPoints(params.n, level);
      break;
    case 'nQuadruplets':
      if (params.n !== undefined) basePoints = calculateNQuadrupletsPoints(params.n, level);
      break;
    case 'nQuintuplets':
      if (params.n !== undefined) basePoints = calculateNQuintupletsPoints(params.n, level);
      break;
    case 'nSextuplets':
      if (params.n !== undefined) basePoints = calculateNSextupletsPoints(params.n, level);
      break;
    case 'nSeptuplets':
      if (params.n !== undefined) basePoints = calculateNSeptupletsPoints(params.n, level);
      break;
    case 'nOctuplets':
      if (params.n !== undefined) basePoints = calculateNOctupletsPoints(params.n, level);
      break;
    case 'nNonuplets':
      if (params.n !== undefined) basePoints = calculateNNonupletsPoints(params.n, level);
      break;
    case 'nDecuplets':
      if (params.n !== undefined) basePoints = calculateNDecupletsPoints(params.n, level);
      break;
    case 'straightOfN':
      if (params.length !== undefined) basePoints = calculateStraightOfNPoints(params.length, level);
      break;
    case 'pyramidOfN':
      if (params.n !== undefined) basePoints = calculatePyramidOfNPoints(params.n, level);
      break;
  }
  
  return {
    basePoints,
    baseMultiplier: 1.0 + upgrade.multiplierAdd,
    baseExponent: 1.0 + upgrade.exponentAdd,
  };
}

/**
 * Main function to calculate points for any combination type
 * 
 * @param type - The combination type
 * @param params - Parameters for the combination
 * @param level - The upgrade level (default: 1)
 * @returns The base points for this combination at the given level
 */
export function calculateCombinationPoints(
  type: ScoringCombinationType,
  params: {
    faceValue?: number;
    count?: number;
    length?: number;
    n?: number;
  },
  level: number = 1
): number {
  switch (type) {
    case 'singleN':
      if (params.faceValue === undefined) return 0;
      return calculateSingleNPoints(params.faceValue, level);
    
    case 'nPairs':
      if (params.n === undefined || params.faceValue === undefined) return 0;
      return calculateNPairsPoints(params.n, params.faceValue, level);
    
    case 'nOfAKind':
      if (params.faceValue === undefined || params.count === undefined) return 0;
      return calculateNOfAKindPoints(params.faceValue, params.count, level);
    
    case 'nTriplets':
      if (params.n === undefined) return 0;
      return calculateNTripletsPoints(params.n, level);
    
    case 'nQuadruplets':
      if (params.n === undefined) return 0;
      return calculateNQuadrupletsPoints(params.n, level);
    
    case 'nQuintuplets':
      if (params.n === undefined) return 0;
      return calculateNQuintupletsPoints(params.n, level);
    
    case 'nSextuplets':
      if (params.n === undefined) return 0;
      return calculateNSextupletsPoints(params.n, level);
    
    case 'nSeptuplets':
      if (params.n === undefined) return 0;
      return calculateNSeptupletsPoints(params.n, level);
    
    case 'nOctuplets':
      if (params.n === undefined) return 0;
      return calculateNOctupletsPoints(params.n, level);
    
    case 'nNonuplets':
      if (params.n === undefined) return 0;
      return calculateNNonupletsPoints(params.n, level);
    
    case 'nDecuplets':
      if (params.n === undefined) return 0;
      return calculateNDecupletsPoints(params.n, level);
    
    case 'straightOfN':
      if (params.length === undefined) return 0;
      return calculateStraightOfNPoints(params.length, level);
    
    case 'pyramidOfN':
      if (params.n === undefined) return 0;
      return calculatePyramidOfNPoints(params.n, level);
    
    default:
      return 0;
  }
}

