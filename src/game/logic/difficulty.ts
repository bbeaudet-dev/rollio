/**
 * Game Difficulty configurations
 * Defines which scoring combinations are available at each difficulty level
 * and other difficulty-related game rules
 */

import { ScoringCombinationType, DIFFICULTY_MIN_VALUES } from '../data/combinations';
import { GameState } from '../types';

export type DifficultyLevel = 'plastic' | 'copper' | 'silver' | 'gold' | 'platinum' | 'sapphire' | 'emerald' | 'ruby' | 'diamond';

/**
 * Get difficulty from game state
 */
export function getDifficulty(gameState: GameState): DifficultyLevel {
  return gameState.config.difficulty;
}

export interface DifficultyConfig {
  id: DifficultyLevel;
  name: string;
  description: string;
  minValues: typeof DIFFICULTY_MIN_VALUES.plastic; // Minimum N values for each combination type
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
    description: 'All scoring combinations available. Standard level progression.',
    minValues: DIFFICULTY_MIN_VALUES.plastic,
    pointThresholdModifier: 1.0,
  },
  copper: {
    id: 'copper',
    name: 'Copper',
    description: '-1 reroll per level.',
    minValues: DIFFICULTY_MIN_VALUES.copper,
    pointThresholdModifier: 1.0,
    rerollsModifier: -1,
  },
  silver: {
    id: 'silver',
    name: 'Silver',
    description: 'Beginner scoring combinations not available.',
    minValues: DIFFICULTY_MIN_VALUES.silver,
    pointThresholdModifier: 1.0,
  },
  gold: {
    id: 'gold',
    name: 'Gold',
    description: '-1 bank per level.',
    minValues: DIFFICULTY_MIN_VALUES.gold,
    pointThresholdModifier: 1.0,
    banksModifier: -1,
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum',
    description: 'Faster level threshold scaling (1.5x).',
    minValues: DIFFICULTY_MIN_VALUES.platinum,
    pointThresholdModifier: 1.5, // 1.5x level thresholds
  },
  sapphire: {
    id: 'sapphire',
    name: 'Sapphire',
    description: 'Level completion bonus only for miniboss and boss levels.',
    minValues: DIFFICULTY_MIN_VALUES.sapphire,
    pointThresholdModifier: 1.5,
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    description: '-1 consumable slot.',
    minValues: DIFFICULTY_MIN_VALUES.emerald,
    pointThresholdModifier: 1.5,
    consumableSlotsModifier: -1,
  },
  ruby: {
    id: 'ruby',
    name: 'Ruby',
    description: '-1 charm slot.',
    minValues: DIFFICULTY_MIN_VALUES.ruby,
    pointThresholdModifier: 1.5,
    charmSlotsModifier: -1,
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond',
    description: 'Stricter combination requirements (4-of-a-kind, 6 straight, 10 pyramid).',
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
      // Check if singleN is enabled and if the face value meets the minimum
      // singleN: 0 = disabled, 1 = allows 1s and 5s (both >= 1), 5 = only 5s, etc.
      // faceValue can be passed as 'count' or 'faceValue' parameter
      if (minValues.singleN === 0) return false;
      const faceValue = params?.count ?? params?.faceValue;
      if (faceValue === undefined) return false;
      
      // Advanced difficulties (diamond): no singleN combinations
      if (difficulty === 'diamond') return false;
      
      // Intermediate difficulties (silver, gold, platinum, sapphire, emerald, ruby): only single1, no single5
      if (difficulty === 'silver' || difficulty === 'gold' || difficulty === 'platinum' || 
          difficulty === 'sapphire' || difficulty === 'emerald' || difficulty === 'ruby') {
        return faceValue === 1;
      }
      
      // Beginner difficulties (plastic, copper): both single1 and single5
      return faceValue >= minValues.singleN && (faceValue === 1 || faceValue === 5);
    
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
