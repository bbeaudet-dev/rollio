import { GameState, RoundState, LevelState, DiceSetConfig, Die, CombinationCounters, ShopState } from '../types';
import { ALL_SCORING_TYPES } from '../data/combinations';
import { getRandomInt } from './effectUtils';
import { validateDiceSetConfig } from '../validation/diceSetValidation';
import { getLevelConfig } from '../data/levels';
import { calculateRerollsForLevel, calculateBanksForLevel } from '../logic/rerollLogic';
import { applyLevelEffects } from '../logic/gameActions';
import { getWorldForLevel, getWorldNumber, isMinibossLevel, isMainBossLevel } from '../data/worlds';

// Default game configuration
export const DEFAULT_GAME_CONFIG = {
  penalties: {
    consecutiveFlopLimit: 3,
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
export function createInitialLevelState(levelNumber: number, gameState: GameState, charmManager?: any): LevelState {
  const levelConfig = getLevelConfig(levelNumber);
  
  // Get world information
  const world = getWorldForLevel(levelNumber);
  const worldNumber = getWorldNumber(levelNumber);
  const isMiniboss = isMinibossLevel(levelNumber);
  const isMainBoss = isMainBossLevel(levelNumber);
  
  // Calculate base rerolls and banks (from game state + charms/blessings)
  const baseRerolls = calculateRerollsForLevel(gameState, charmManager);
  const baseBanks = calculateBanksForLevel(gameState, charmManager);
  
  // Apply level effects (boss effects, modifiers)
  const { rerolls, banks } = applyLevelEffects(baseRerolls, baseBanks, levelConfig);
  
  // Create first round of the level (diceHand will be empty until first roll)
  const firstRound = createInitialRoundState(1);
  
  return {
    levelNumber,
    levelThreshold: levelConfig.pointThreshold,
    worldId: world?.id,
    worldNumber,
    isMiniboss,
    isMainBoss,
    rerollsRemaining: rerolls,
    banksRemaining: banks,
    consecutiveFlops: 0,  // Reset at start of each level
    pointsBanked: 0,  // Initialize to 0 at level start
    shop: DEFAULT_SHOP_STATE,
    currentRound: firstRound,
    banksUsed: 0,  // Initialize for OneSongGlory charm
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
    baseLevelRerolls: diceSetConfig.baseLevelRerolls,
    baseLevelBanks: diceSetConfig.baseLevelBanks,
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
    consecutiveBanks: 0,  // Initialize consecutive banks counter
  };
  
  return initialGameState;
}

export function createInitialRoundState(roundNumber: number = 1, diceSet?: any[]): RoundState {
  // Start with empty diceHand - dice will be added when rolling
  // If diceSet is provided, we'll use it when rolling, but don't populate diceHand yet
  const diceHand: any[] = [];
  
  return {
    roundNumber: roundNumber,
    roundPoints: 0,
    diceHand,
    hotDiceCounter: 0,
    forfeitedPoints: 0,
    crystalsScoredThisRound: 0,
    isActive: true,
    rollHistory: [],
    flowerCounter: 0,  // Initialize flower counter for Bloom charm
  };
}

// Utility function to reset dice scored state (for hot dice)
export function resetDiceScoredState(diceSet: Die[]): void {
  diceSet.forEach(die => {
    die.scored = false;
  });
}

