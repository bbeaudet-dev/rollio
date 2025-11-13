/**
 * Game Difficulty configurations
 * Defines which scoring combinations are available at each difficulty level
 * and other difficulty-related game rules
 */

import { ScoringCombinationType } from './scoring';

export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'extreme';

export interface DifficultyConfig {
  id: DifficultyLevel;
  name: string;
  description: string;
  availableCombinations: ScoringCombinationType[]; // Which combinations can be scored
  unavailableCombinations?: ScoringCombinationType[]; // Explicitly disabled combinations
  // Other difficulty modifiers
  livesModifier?: number;
  rerollsModifier?: number;
  moneyModifier?: number; // Multiplier for money rewards
  pointThresholdModifier?: number; // Multiplier for level thresholds
}

/**
 * Combination categories for difficulty settings
 */
export const BEGINNER_COMBINATIONS: ScoringCombinationType[] = [
  'singleOne',
  'singleFive',
  'threeOfAKind',
];

export const INTERMEDIATE_COMBINATIONS: ScoringCombinationType[] = [
  'fourOfAKind',
  'fiveOfAKind',
  'straight',
  'threePairs',
  'twoTriplets',
];

export const ADVANCED_COMBINATIONS: ScoringCombinationType[] = [
  'sixOfAKind',
  'sevenOfAKind',
  'godStraight',
  'fourPairs',
  'tripleTriplets',
];

/**
 * Difficulty configurations
 */
export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    id: 'easy',
    name: 'Easy',
    description: 'Beginner-friendly with basic combinations available',
    availableCombinations: [
      ...BEGINNER_COMBINATIONS,
      ...INTERMEDIATE_COMBINATIONS,
    ],
  },
  normal: {
    id: 'normal',
    name: 'Normal',
    description: 'Standard difficulty with all standard combinations',
    availableCombinations: [
      ...BEGINNER_COMBINATIONS,
      ...INTERMEDIATE_COMBINATIONS,
      ...ADVANCED_COMBINATIONS,
    ],
  },
  hard: {
    id: 'hard',
    name: 'Hard',
    description: 'No beginner combinations - only intermediate and advanced',
    availableCombinations: [
      ...INTERMEDIATE_COMBINATIONS,
      ...ADVANCED_COMBINATIONS,
    ],
    unavailableCombinations: BEGINNER_COMBINATIONS,
  },
  extreme: {
    id: 'extreme',
    name: 'Extreme',
    description: 'Only advanced combinations available',
    availableCombinations: ADVANCED_COMBINATIONS,
    unavailableCombinations: [
      ...BEGINNER_COMBINATIONS,
      ...INTERMEDIATE_COMBINATIONS,
    ],
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
 */
export function isCombinationAvailable(
  combination: ScoringCombinationType,
  difficulty: DifficultyLevel
): boolean {
  const config = getDifficultyConfig(difficulty);
  
  // Check if explicitly unavailable
  if (config.unavailableCombinations?.includes(combination)) {
    return false;
  }
  
  // Check if in available list
  return config.availableCombinations.includes(combination);
}

/**
 * Get all available combinations for a difficulty
 */
export function getAvailableCombinations(difficulty: DifficultyLevel): ScoringCombinationType[] {
  return getDifficultyConfig(difficulty).availableCombinations;
}

