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
 * Creates an initial level state
 * Handles level configuration, rerolls/lives calculation, and level effects
 */
export function createInitialLevelState(levelNumber: number, gameState: GameState): LevelState {
  const levelConfig = getLevelConfig(levelNumber);
  
  // Calculate base rerolls and lives (from game state + charms/blessings)
  const baseRerolls = calculateRerollsForLevel(gameState);
  const baseLives = calculateLivesForLevel(gameState);
  
  // Apply level effects (boss effects, modifiers)
  const { rerolls, lives } = applyLevelEffects(baseRerolls, baseLives, levelConfig);
  
  // Create first round of the level
  const firstRound = createInitialRoundState(1);
  
  return {
    levelNumber,
    levelThreshold: levelConfig.pointThreshold,
    rerollsRemaining: rerolls,
    livesRemaining: lives,
    consecutiveFlops: 0,  // Reset at start of each level
    pointsBanked: 0,  // Initialize to 0 at level start
    shop: DEFAULT_SHOP_STATE,
    currentRound: firstRound,
  };
}

export function createInitialGameState(diceSetConfig: DiceSetConfig): GameState {
  validateDiceSetConfig(diceSetConfig);
  
  // Create game state - level will be initialized separately
  const initialGameState: GameState = {
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
    
    // Current level state (nested for hierarchy) - will be initialized by initializeLevel
    currentLevel: {} as LevelState,
    
    // History (consolidated here - all history in one place)
    history: {
      totalScore: 0, // Renamed from gameScore - cumulative banked points
      combinationCounters: createInitialCombinationCounters(),
      levelHistory: [],
    },
  };
  
  return initialGameState;
}

export function createInitialRoundState(roundNumber: number = 1, diceSet?: any[]): RoundState {
  const diceHand: any[] = [];
  
  // If diceSet is provided, populate dice hand with full set
  if (diceSet) {
    diceHand.length = 0;
    diceHand.push(...diceSet.map((die: any) => ({ ...die, scored: false })));
  }
  
  return {
    roundNumber: roundNumber,
    roundPoints: 0,
    diceHand,
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

