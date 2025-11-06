import { GameState, RoundState, LevelState, DiceSetConfig, Die, CombinationCounters, ShopState } from '../types';
import { ALL_SCORING_TYPES } from '../logic/scoring';
import { getRandomInt } from './effectUtils';
import { validateDiceSetConfig } from '../validation/diceSetValidation';
import { getLevelConfig } from '../data/levels';
import { calculateRerollsForLevel, calculateLivesForLevel } from '../logic/rerollLogic';
import { applyLevelEffects } from '../logic/gameLogic';

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
export function createDiceFromConfig(diceConfig: Omit<Die, 'scored' | 'rolledValue'>[]): Die[] {
  return diceConfig.map(die => ({
    ...die,
    scored: false, // Initialize as not scored
    rolledValue: die.allowedValues[getRandomInt(0, die.allowedValues.length - 1)],
  }));
}

/**
 * Creates an initial level state for a given level number
 * Handles level configuration, rerolls/lives calculation, and level effects
 */
export function createInitialLevelState(levelNumber: number, gameState: GameState): LevelState {
  const levelConfig = getLevelConfig(levelNumber);
  
  // Calculate base rerolls and lives (from game state + charms/blessings)
  const baseRerolls = calculateRerollsForLevel(gameState);
  const baseLives = calculateLivesForLevel(gameState);
  
  // Apply level effects (boss effects, modifiers)
  const { rerolls, lives } = applyLevelEffects(baseRerolls, baseLives, levelConfig);
  
  return {
    levelNumber,
    levelThreshold: levelConfig.pointThreshold,
    rerollsRemaining: rerolls,
    livesRemaining: lives,
    consecutiveFlops: 0,  // Reset at start of each level
    pointsBanked: 0,  // Initialize to 0 at level start
    shop: DEFAULT_SHOP_STATE,
    currentRound: undefined, // Will be created when first round starts
  };
}

export function createInitialGameState(diceSetConfig: DiceSetConfig): GameState {
  validateDiceSetConfig(diceSetConfig);
  
  // Create initial level state (Level 1)
  // For initial state, we create a minimal game state first, then use createInitialLevelState
  const initialGameState: GameState = {
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
    
    // Current level state (nested for hierarchy) - will be set below
    currentLevel: {} as LevelState,
    
    // History (consolidated here - all history in one place)
    history: {
      totalScore: 0, // Renamed from gameScore - cumulative banked points
      combinationCounters: createInitialCombinationCounters(),
      levelHistory: [],
    },
  };
  
  // Now create the initial level state using the factory function
  initialGameState.currentLevel = createInitialLevelState(1, initialGameState);
  
  return initialGameState;
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

