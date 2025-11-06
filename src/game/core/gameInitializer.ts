import { GameState, RoundState, LevelState, DiceSetConfig, Die, CombinationCounters, ShopState } from './types';
import { ScoringCombinationType } from '../logic/scoring';

// Define all possible scoring combination types (for use in other modules)
const ALL_SCORING_TYPES: ScoringCombinationType[] = [
  'godStraight', 'straight', 'fourPairs', 'threePairs', 'tripleTriplets', 'twoTriplets',
  'sevenOfAKind', 'sixOfAKind', 'fiveOfAKind', 'fourOfAKind', 'threeOfAKind',
  'singleOne', 'singleFive'
];
import { getRandomInt } from '../utils/effectUtils';
import { validateDiceSetConfig } from '../validation/diceSetValidation';
import { getLevelConfig } from '../data/levels';

// Default game configuration
export const DEFAULT_GAME_CONFIG = {
  penalties: {
    consecutiveFlopPenalty: 1000,
    consecutiveFlopLimit: 3,
    flopPenaltyEnabled: true,
  },
};

// Default game settings
export const DEFAULT_GAME_SETTINGS = {
  sortDice: 'unsorted' as const,
  gameSpeed: 'default' as const,
  optimizeRollScore: false,
};

// Default shop state
export const DEFAULT_SHOP_STATE: ShopState = {
  isOpen: false,
  availableCharms: [],
  availableConsumables: [],
  availableBlessings: [],
};

function createInitialCombinationCounters(): CombinationCounters {
  return Object.fromEntries(ALL_SCORING_TYPES.map(c => [c, 0])) as CombinationCounters;
}

// Convert die config to runtime die state
function createDiceFromConfig(diceConfig: Omit<Die, 'scored' | 'rolledValue'>[]): Die[] {
  return diceConfig.map(die => ({
    ...die,
    scored: false, // Initialize as not scored
    rolledValue: die.allowedValues[getRandomInt(0, die.allowedValues.length - 1)],
  }));
}

export function createInitialGameState(diceSetConfig: DiceSetConfig): GameState {
  validateDiceSetConfig(diceSetConfig);
  
  // Get level configuration (Level 1)
  const levelConfig = getLevelConfig(1);
  
  // Create initial level state (Level 1)
  // Lives and rerolls are calculated from base values + modifiers at level start
  // For initial state, we'll set them to base values (proper calculation will be implemented later)
  const initialLevel: LevelState = {
    levelNumber: 1,
    levelThreshold: levelConfig.pointThreshold,
    rerollsRemaining: diceSetConfig.rerollValue,
    livesRemaining: diceSetConfig.livesValue,
    consecutiveFlops: 0,  // Reset at start of each level
    pointsBanked: 0,  // Initialize to 0 at level start
    shop: DEFAULT_SHOP_STATE,
    currentRound: undefined, // Will be created when first round starts
  };
  
  return {
    // Game-wide state (flattened - no meta/core split)
    isActive: true,
    money: diceSetConfig.startingMoney,
    diceSet: createDiceFromConfig(diceSetConfig.dice),
    charms: [],
    consumables: [],
    blessings: [],
    rerollValue: diceSetConfig.rerollValue,
    livesValue: diceSetConfig.livesValue,
    charmSlots: diceSetConfig.charmSlots,
    consumableSlots: diceSetConfig.consumableSlots,
    settings: DEFAULT_GAME_SETTINGS,
    config: {
      diceSetConfig,
      penalties: DEFAULT_GAME_CONFIG.penalties,
    },
    
    // Current level state (nested for hierarchy)
    currentLevel: initialLevel,
    
    // History (consolidated here - all history in one place)
            history: {
              totalScore: 0, // Renamed from gameScore - cumulative banked points
              combinationCounters: createInitialCombinationCounters(),
              levelHistory: [],
            },
  };
}

export function createInitialRoundState(roundNumber: number = 1): RoundState {
  return {
    roundNumber: roundNumber,
    roundPoints: 0,
    diceHand: [],
    hotDiceCounter: 0,
    forfeitedPoints: 0,
    crystalsScoredThisRound: 0,
    isActive: true,
    rollHistory: [],
  };
}

// Utility function to reset dice scored state (for hot dice)
export function resetDiceScoredState(diceSet: Die[]): void {
  diceSet.forEach(die => {
    die.scored = false;
  });
} 