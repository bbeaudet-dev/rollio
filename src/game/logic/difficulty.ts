/**
 * Game Difficulty configurations
 * Defines which scoring combinations are available at each difficulty level
 * and other difficulty-related game rules
 */

import { ScoringCombinationType, DIFFICULTY_MIN_VALUES } from '../data/combinations';

export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'extreme';

export interface DifficultyConfig {
  id: DifficultyLevel;
  name: string;
  description: string;
  minValues: typeof DIFFICULTY_MIN_VALUES.easy; // Minimum N values for each combination type
  // Other difficulty modifiers (for future use)
  banksModifier?: number; // Modifier for banks per level
  rerollsModifier?: number; // Modifier for rerolls per level
  moneyModifier?: number; // Multiplier for money rewards
  pointThresholdModifier?: number; // Multiplier for level thresholds
}

/**
 * Difficulty configurations
 */
export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    id: 'easy',
    name: 'Easy',
    description: 'Beginner-friendly with basic combinations available',
    minValues: DIFFICULTY_MIN_VALUES.easy,
  },
  normal: {
    id: 'normal',
    name: 'Normal',
    description: 'Standard difficulty with all standard combinations',
    minValues: DIFFICULTY_MIN_VALUES.normal,
  },
  hard: {
    id: 'hard',
    name: 'Hard',
    description: 'No beginner combinations - only intermediate and advanced',
    minValues: DIFFICULTY_MIN_VALUES.hard,
  },
  extreme: {
    id: 'extreme',
    name: 'Extreme',
    description: 'Only advanced combinations available',
    minValues: DIFFICULTY_MIN_VALUES.extreme,
  },
};

/**
 * Get difficulty configuration
 */
export function getDifficultyConfig(difficulty: DifficultyLevel): DifficultyConfig {
  return DIFFICULTY_CONFIGS[difficulty];
}

/**
 * Check if a combination is available at a given difficulty
 * This checks if the combination meets the minimum N requirements for the difficulty
 */
export function isCombinationAvailable(
  combination: ScoringCombinationType,
  difficulty: DifficultyLevel,
  params?: { n?: number; count?: number; length?: number }
): boolean {
  const config = getDifficultyConfig(difficulty);
  const minValues = config.minValues;
  
  // Check minimum requirements based on combination type
  switch (combination) {
    case 'nPairs':
      if (params?.n === undefined) return false;
      return params.n >= minValues.nPairs;
    
    case 'nOfAKind':
      if (params?.count === undefined) return false;
      return params.count >= minValues.nOfAKind;
    
    case 'nTriplets':
      if (params?.n === undefined) return false;
      return params.n >= minValues.nTriplets;
    
    case 'nQuadruplets':
      if (params?.n === undefined) return false;
      return params.n >= minValues.nQuadruplets;
    
    case 'straightOfN':
      if (params?.length === undefined) return false;
      return params.length >= minValues.straightOfN;
    
    case 'pyramidOfN':
      if (params?.n === undefined) return false;
      return params.n >= minValues.pyramidOfN;
    
    case 'singleN':
      // SingleN is always available (1s and 5s)
      return true;
    
    // Other types (nQuintuplets, etc.) are always available if they can be formed
    default:
      return true;
  }
}

/**
 * Get all available combinations for a difficulty
 * Returns all combination types (filtering happens at runtime based on min values)
 */
export function getAvailableCombinations(difficulty: DifficultyLevel): ScoringCombinationType[] {
  // All algorithm-based types are potentially available
  // Filtering happens in isCombinationAvailable based on min values
  return [
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
}
