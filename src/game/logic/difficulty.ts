/**
 * Game Difficulty configurations
 * Defines which scoring combinations are available at each difficulty level
 * and other difficulty-related game rules
 */

import { ScoringCombinationType } from '../data/combinations';
import { GameState } from '../types';

export type DifficultyLevel = 'plastic' | 'copper' | 'silver' | 'gold' | 'platinum' | 'sapphire' | 'emerald' | 'ruby' | 'diamond';

/**
 * Minimum N values for each combination type at each difficulty level
 */
export interface CombinationMinValues {
  singleN: number[] | false;  // Array of allowed face values (e.g., [1, 5] for beginner, [1] for intermediate, false for disabled)
  nPairs: number;             // Minimum number of pairs required
  nOfAKind: number;           // Minimum count for N-of-a-kind
  nTriplets: number;          // Minimum number of triplets required
  nQuadruplets: number;       // Minimum number of quadruplets required
  straightOfN: number;        // Minimum straight length
  pyramidOfN: number;         // Minimum pyramid size
}

/**
 * Minimum N values for each combination type at each difficulty level
 */
export const DIFFICULTY_MIN_VALUES: Record<DifficultyLevel, CombinationMinValues> = {
  plastic: {
    singleN: [1, 5],    // Both 1s and 5s allowed
    nPairs: 1,          // One pair or more
    nOfAKind: 3,        // Three of a kind or more
    nTriplets: 2,       // Two triplets or more
    nQuadruplets: 2,    // Two quadruplets or more
    straightOfN: 4,     // Straight of (4) or more
    pyramidOfN: 6,      // Pyramid of 6 or more
  },
  copper: {
    singleN: [1, 5],
    nPairs: 1,       
    nOfAKind: 3,
    nTriplets: 2,
    nQuadruplets: 2,
    straightOfN: 4, 
    pyramidOfN: 6,  
  },
  silver: {
    singleN: [1],       // Only 1s allowed, 5s disabled
    nPairs: 3,          // Three pairs or more 
    nOfAKind: 3,
    nTriplets: 2,
    nQuadruplets: 2,
    straightOfN: 5,     // Straight of (5) or more
    pyramidOfN: 6,
  },
  gold: {
    singleN: [1], 
    nPairs: 3,
    nOfAKind: 3,
    nTriplets: 2,
    nQuadruplets: 2,
    straightOfN: 5,
    pyramidOfN: 6,
  },
  platinum: {
    singleN: [1], 
    nPairs: 3,
    nOfAKind: 3,
    nTriplets: 2,
    nQuadruplets: 2,
    straightOfN: 5,
    pyramidOfN: 6,
  },
  sapphire: {
    singleN: [1], 
    nPairs: 3,
    nOfAKind: 3,
    nTriplets: 2,
    nQuadruplets: 2,
    straightOfN: 5,
    pyramidOfN: 6,
  },
  emerald: {
    singleN: [1], 
    nPairs: 3,
    nOfAKind: 3,
    nTriplets: 2,
    nQuadruplets: 2,
    straightOfN: 5,
    pyramidOfN: 6,
  },
  ruby: {
    singleN: [1], 
    nPairs: 3,
    nOfAKind: 3,
    nTriplets: 2,
    nQuadruplets: 2,
    straightOfN: 5,
    pyramidOfN: 6,
  },
  diamond: {
    singleN: false,     // Singles disabled
    nPairs: 3,
    nOfAKind: 4,        // Four of a kind or more
    nTriplets: 2,
    nQuadruplets: 2, 
    straightOfN: 6,     // Large straight (6) or more
    pyramidOfN: 10,     // Pyramid of 10 or more
  },
};

/**
 * Get difficulty from game state
 */
export function getDifficulty(gameState: GameState): DifficultyLevel {
  return gameState.config.difficulty;
}

/**
 * Get difficulty minimum values for a given difficulty level
 */
export function getDifficultyMinValues(difficulty: DifficultyLevel): CombinationMinValues {
  return DIFFICULTY_MIN_VALUES[difficulty];
}

export interface DifficultyConfig {
  id: DifficultyLevel;
  name: string;
  description: string;
  minValues: CombinationMinValues;
  // Other difficulty modifiers
  banksModifier?: number; // Modifier for banks per level
  rerollsModifier?: number; // Modifier for rerolls per level
  charmSlotsModifier?: number; // Modifier for charm slots
  consumableSlotsModifier?: number; // Modifier for consumable slots
  moneyModifier?: number; // Multiplier for money rewards
  pointThresholdModifier?: number; // Multiplier for level thresholds
}

/**
 * Difficulty configurations
 */
export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  plastic: {
    id: 'plastic',
    name: 'Plastic',
    description: 'All scoring combinations available',
    minValues: DIFFICULTY_MIN_VALUES.plastic,
    pointThresholdModifier: 1.0,
  },
  copper: {
    id: 'copper',
    name: 'Copper',
    description: '-1 reroll per level',
    minValues: DIFFICULTY_MIN_VALUES.copper,
    pointThresholdModifier: 1.0,
    rerollsModifier: -1,
  },
  silver: {
    id: 'silver',
    name: 'Silver',
    description: 'No beginner scoring combinations',
    minValues: DIFFICULTY_MIN_VALUES.silver,
    pointThresholdModifier: 1.0,
  },
  gold: {
    id: 'gold',
    name: 'Gold',
    description: '-1 bank per level',
    minValues: DIFFICULTY_MIN_VALUES.gold,
    pointThresholdModifier: 1.0,
    banksModifier: -1,
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum',
    description: 'Faster level threshold scaling (1.5x)',
    minValues: DIFFICULTY_MIN_VALUES.platinum,
    pointThresholdModifier: 1.5, // 1.5x level thresholds
  },
  sapphire: {
    id: 'sapphire',
    name: 'Sapphire',
    description: 'Level completion bonus only for miniboss and boss levels',
    minValues: DIFFICULTY_MIN_VALUES.sapphire,
    pointThresholdModifier: 1.5,
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    description: '-1 consumable slot',
    minValues: DIFFICULTY_MIN_VALUES.emerald,
    pointThresholdModifier: 1.5,
    consumableSlotsModifier: -1,
  },
  ruby: {
    id: 'ruby',
    name: 'Ruby',
    description: '-1 charm slot',
    minValues: DIFFICULTY_MIN_VALUES.ruby,
    pointThresholdModifier: 1.5,
    charmSlotsModifier: -1,
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond',
    description: 'No intermediate scoring combinations',
    minValues: DIFFICULTY_MIN_VALUES.diamond,
    pointThresholdModifier: 1.5,
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
  params?: { n?: number; count?: number; length?: number; faceValue?: number }
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
      // Check which values are allowed for singleN
      if (minValues.singleN === false) return false;
      const faceValue = params?.count ?? params?.faceValue;
      if (faceValue === undefined) return false;
      
      // Check if the face value is in the allowed array
      return Array.isArray(minValues.singleN) && minValues.singleN.includes(faceValue);
    
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
