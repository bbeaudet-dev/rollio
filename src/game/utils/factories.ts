import { GameState, RoundState, LevelState, DiceSetConfig, Die, CombinationCounters, ShopState, Charm, Consumable, Blessing } from '../types';
import { ALL_SCORING_TYPES } from '../data/combinations';
import { getRandomInt } from './effectUtils';
import { validateDiceSetConfig } from '../validation/diceSetValidation';
import { getLevelConfig } from '../data/levels';
import { calculateRerollsForLevel, calculateBanksForLevel } from '../logic/rerollLogic';
import { applyLevelEffects } from '../logic/gameActions';
import { getWorldForLevel, getWorldNumber, isMinibossLevel, isMainBossLevel } from '../data/worlds';
import { CHARMS } from '../data/charms';
import { CONSUMABLES } from '../data/consumables';
import { ALL_BLESSINGS } from '../data/blessings';
import { DifficultyLevel, getDifficultyConfig, getDifficulty } from '../logic/difficulty';

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
  // Start with empty object - combinations will be added as they're used
  return {};
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
 * Create starting charms from dice set config
 */
export function createStartingCharms(diceSetConfig: DiceSetConfig): (Charm & { active: boolean })[] {
  if (!diceSetConfig.startingCharms || diceSetConfig.startingCharms.length === 0) {
    return [];
  }
  
  return diceSetConfig.startingCharms
    .map(charmId => {
      const charmData = CHARMS.find(c => c.id === charmId);
      if (!charmData) {
        console.warn(`Starting charm not found: ${charmId}`);
        return null;
      }
      return { ...charmData, active: true };
    })
    .filter((charm): charm is Charm & { active: boolean } => charm !== null);
}

/**
 * Create starting consumables from dice set config
 */
export function createStartingConsumables(diceSetConfig: DiceSetConfig): Consumable[] {
  if (!diceSetConfig.startingConsumables || diceSetConfig.startingConsumables.length === 0) {
    return [];
  }
  
  return diceSetConfig.startingConsumables
    .map(consumableId => {
      const consumableData = CONSUMABLES.find(c => c.id === consumableId);
      if (!consumableData) {
        console.warn(`Starting consumable not found: ${consumableId}`);
        return null;
      }
      return { 
        ...consumableData, 
        uses: consumableData.uses || 1
      };
    })
    .filter((consumable): consumable is Consumable => consumable !== null);
}

/**
 * Create starting blessings from dice set config
 */
export function createStartingBlessings(diceSetConfig: DiceSetConfig): Blessing[] {
  if (!diceSetConfig.startingBlessings || diceSetConfig.startingBlessings.length === 0) {
    return [];
  }
  
  return diceSetConfig.startingBlessings
    .map(blessingId => {
      const blessingData = ALL_BLESSINGS.find(b => b.id === blessingId);
      if (!blessingData) {
        console.warn(`Starting blessing not found: ${blessingId}`);
        return null;
      }
      return blessingData;
    })
    .filter((blessing): blessing is Blessing => blessing !== null);
}

/**
 * Creates an initial level state
 * Handles level configuration, rerolls/lives calculation, and level effects
 */
export function createInitialLevelState(levelNumber: number, gameState: GameState, charmManager?: any): LevelState {
  const levelConfig = getLevelConfig(levelNumber, getDifficulty(gameState));
  
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

export function createInitialGameState(diceSetConfig: DiceSetConfig, difficulty: DifficultyLevel): GameState {
  validateDiceSetConfig(diceSetConfig);
  
  // Apply difficulty modifiers (each config explicitly includes all cumulative modifiers)
  const config = getDifficultyConfig(difficulty);
  let finalBanks = diceSetConfig.baseLevelBanks;
  let finalRerolls = diceSetConfig.baseLevelRerolls;
  let finalCharmSlots = diceSetConfig.charmSlots;
  let finalConsumableSlots = diceSetConfig.consumableSlots;
  
  // Apply modifiers if they exist
  if (config.banksModifier !== undefined) {
    finalBanks = Math.max(1, finalBanks + config.banksModifier);
  }
  if (config.rerollsModifier !== undefined) {
    finalRerolls = Math.max(0, finalRerolls + config.rerollsModifier);
  }
  if (config.charmSlotsModifier !== undefined) {
    finalCharmSlots = Math.max(1, finalCharmSlots + config.charmSlotsModifier);
  }
  if (config.consumableSlotsModifier !== undefined) {
    finalConsumableSlots = Math.max(1, finalConsumableSlots + config.consumableSlotsModifier);
  }
  
  const initialGameState: GameState = {
    isActive: true,
    money: diceSetConfig.startingMoney,
    diceSet: createDiceFromConfig(diceSetConfig.dice),
    charms: createStartingCharms(diceSetConfig),
    consumables: createStartingConsumables(diceSetConfig),
    blessings: createStartingBlessings(diceSetConfig),
    baseLevelRerolls: finalRerolls,
    baseLevelBanks: finalBanks,
    charmSlots: finalCharmSlots,
    consumableSlots: finalConsumableSlots,
    settings: DEFAULT_GAME_SETTINGS,
    config: {
      diceSetConfig,
      difficulty,
      penalties: DEFAULT_GAME_CONFIG.penalties,
    },
    
    // Current level state (nested for hierarchy) - will be initialized by initializeLevel
    currentLevel: {} as LevelState,
    
    // History (consolidated here - all history in one place)
    history: {
      combinationCounters: createInitialCombinationCounters(),
      levelHistory: [],
      highScoreSingleRoll: 0,  // Track highest single roll score
      highScoreBank: 0,  // Track highest bank score
    },
    consecutiveBanks: 0,  // Initialize consecutive banks counter
  };
  
  return initialGameState;
}

/**
 * Initialize a new game
 * This is the main entry point for game initialization - handles all setup logic
 */
export function initializeNewGame(
  diceSetConfig: DiceSetConfig,
  difficulty: DifficultyLevel,
  charmManager: any
): GameState {
  // Create initial game state
  const gameState = createInitialGameState(diceSetConfig, difficulty);
  
  // Register starting charms with the charm manager
  registerStartingCharms(gameState, charmManager);
  
  return gameState;
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

/**
 * Register starting charms with the charm manager
 * This should be called after createInitialGameState to register charms with the charm manager
 */
export function registerStartingCharms(
  gameState: GameState,
  charmManager: any
): void {
  // Register all charms from game state with the charm manager
  gameState.charms.forEach(charm => {
    charmManager.addCharm(charm);
  });
}

