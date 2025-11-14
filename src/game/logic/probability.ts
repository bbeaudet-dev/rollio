import { ScoringCombinationType, ALL_SCORING_TYPES } from '../data/combinations';

/**
 * Probability Calculation Engine
 * 
 * This module calculates probabilities for scoring combinations in Rollio.
 * Uses inclusive (non-exclusive) counting - a roll can count for multiple combinations.
 * 
 * Phases:
 * - Phase 1: Static 6 dice calculations (current)
 * - Phase 2: Parametrize number of dice
 * - Phase 3: Dynamic combination detection based on dice count
 * - Phase 4: UI calculator tool
 * - Phase 5: Custom dice sides/values
 * - Phase 6: Full scoring breakdown with charms, materials, etc.
 */

export interface ProbabilityConfig {
  numDice: number;
  numSides: number; // Usually 6
  allowedValues?: number[]; // For custom dice faces (e.g., Low Baller: [1,2,3])
}

export interface CombinationProbability {
  type: ScoringCombinationType;
  ways: number;
  totalOutcomes: number;
  probability: number;
  percentage: number;
  isPossible: boolean; // Whether this combination is possible with current dice count
}

/**
 * Calculate total number of possible outcomes for given configuration
 */
function calculateTotalOutcomes(config: ProbabilityConfig): number {
  if (config.allowedValues) {
    // Custom dice faces: (number of allowed values) ^ numDice
    return Math.pow(config.allowedValues.length, config.numDice);
  }
  // Standard dice: numSides ^ numDice
  return Math.pow(config.numSides, config.numDice);
}

/**
 * Calculate probability for a specific combination
 * Phase 1: Static 6 dice implementation
 */
function calculateCombinationProbability(
  type: ScoringCombinationType,
  config: ProbabilityConfig
): CombinationProbability {
  const totalOutcomes = calculateTotalOutcomes(config);
  
  // Phase 1: Only handle 6 dice for now
  if (config.numDice !== 6) {
    return {
      type,
      ways: 0,
      totalOutcomes,
      probability: 0,
      percentage: 0,
      isPossible: false,
    };
  }
  
  // Check if combination is possible with 6 dice
  const isPossible = isCombinationPossible(type, config.numDice);
  
  if (!isPossible) {
    return {
      type,
      ways: 0,
      totalOutcomes,
      probability: 0,
      percentage: 0,
      isPossible: false,
    };
  }
  
  // Calculate ways this combination can occur (inclusive counting)
  const ways = calculateWaysForCombination(type, config);
  
  const probability = ways / totalOutcomes;
  const percentage = probability * 100;
  
  return {
    type,
    ways,
    totalOutcomes,
    probability,
    percentage,
    isPossible: true,
  };
}

/**
 * Check if a combination is possible with given number of dice
 */
function isCombinationPossible(type: ScoringCombinationType, numDice: number): boolean {
  // Minimum dice requirements for each combination type
  const requirements: Record<ScoringCombinationType, number> = {
    singleN: 1,
    nPairs: 2, // Algorithm-based, minimum 2 dice (1 pair)
    nOfAKind: 3, // Algorithm-based, minimum 3 dice
    nTriplets: 6, // Algorithm-based, minimum 6 dice (2 triplets)
    nQuadruplets: 8, // Algorithm-based, minimum 8 dice (2 quadruplets)
    nQuintuplets: 10,
    nSextuplets: 12,
    nSeptuplets: 14,
    nOctuplets: 16,
    nNonuplets: 18,
    nDecuplets: 20,
    straightOfN: 4, // Algorithm-based, minimum 4 dice
    pyramidOfN: 6, // Algorithm-based, minimum 6 dice
  };
  
  const minDice = requirements[type] || Infinity;
  return numDice >= minDice;
}

/**
 * Calculate number of ways a combination can occur
 * Phase 1: Static 6 dice, standard 6-sided dice
 * Uses inclusion-exclusion principle for inclusive counting
 */
function calculateWaysForCombination(
  type: ScoringCombinationType,
  config: ProbabilityConfig
): number {
  // Phase 1: Only handle 6 dice, 6 sides
  if (config.numDice !== 6 || config.numSides !== 6) {
    return 0;
  }
  
  const total = Math.pow(6, 6); // 46,656
  
  switch (type) {
    case 'singleN':
      // At least one 1 or 5: Total - ways with no 1s and no 5s
      // No 1s and no 5s: 4^6 = 4,096
      // But we want at least one 1 OR at least one 5
      // Using inclusion-exclusion: ways with 1s + ways with 5s - ways with both
      // Ways with 1s: total - ways with no 1s = 46,656 - 15,625 = 31,031
      // Ways with 5s: total - ways with no 5s = 46,656 - 15,625 = 31,031
      // Ways with both: total - ways with no 1s and no 5s = 46,656 - 4,096 = 42,560
      // But this counts rolls with both 1s and 5s twice, so:
      // singleN = ways with 1s + ways with 5s - ways with both = 31,031 + 31,031 - 42,560 = 19,502
      // Actually simpler: total - ways with neither = 46,656 - 4,096 = 42,560
      return total - 4096;
    
    case 'nPairs':
      // At least one pair: Total - ways with no pairs
      // Ways with no pairs: All dice different = 6! = 720
      return total - 720;
    
    case 'nOfAKind':
      // At least three of a kind: Use inclusion-exclusion
      // Known value from calculations: 17,136
      return 17136;
    
    case 'straightOfN':
      // For Phase 1, we'll use known values for specific lengths
      // This will be made dynamic in Phase 2/3
      // For now, return 0 - will be calculated based on length parameter in Phase 2
      return 0;
    
    case 'nTriplets':
      // Two triplets: Known value
      return 300;
    
    case 'nQuadruplets':
      // Will be calculated in Phase 2/3
      return 0;
    
    case 'nQuintuplets':
    case 'nSextuplets':
    case 'nSeptuplets':
    case 'nOctuplets':
    case 'nNonuplets':
    case 'nDecuplets':
      // Will be calculated in Phase 2/3
      return 0;
    
    case 'pyramidOfN':
      // Pyramid pattern (e.g., 3-2-1): Known value for 6-dice pyramid
      // Will be made dynamic in Phase 2/3
      return 60;
    
    default:
      return 0;
  }
}

/**
 * Calculate probabilities for all combinations given dice configuration
 * Phase 1: Static 6 dice implementation
 */
export function calculateAllProbabilities(config: ProbabilityConfig): CombinationProbability[] {
  return ALL_SCORING_TYPES.map(type => calculateCombinationProbability(type, config));
}

/**
 * Get probability for a specific combination
 */
export function getCombinationProbability(
  type: ScoringCombinationType,
  config: ProbabilityConfig
): CombinationProbability {
  return calculateCombinationProbability(type, config);
}

