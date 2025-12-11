import { GameState, RoundState, LevelState, DiceSetConfig, Die, CombinationCounters, ShopState, Charm, Consumable, Blessing, GamePhase, WorldState, ConsumableCounters, CharmCounters, BlessingCounters, DiceMaterialType, CombinationLevels, CombinationCategory } from '../types';
import { getRandomInt } from './effectUtils';
import { validateDiceSetConfig } from '../validation/diceSetValidation';
import { getLevelConfig, generateWorldLevelConfigs, LevelConfig } from '../data/levels';
import { calculateRerollsForLevel, calculateBanksForLevel } from '../logic/rerollLogic';
import { applyLevelEffects } from '../logic/gameActions';
import { isMinibossLevel, isMainBossLevel, setActiveWorlds, WORLD_POOL, World } from '../data/worlds';
import { generateGameMap, getWorldIdForNode } from '../logic/mapGeneration';
import { getLevelEffectContext } from '../logic/worldEffects';
import { CHARMS } from '../data/charms';
import { CONSUMABLES } from '../data/consumables';
import { ALL_BLESSINGS } from '../data/blessings';
import { DifficultyLevel, getDifficultyConfig, getDifficulty, getStartingCredits } from '../logic/difficulty';
import { MATERIALS } from '../data/materials';
import { PIP_EFFECTS, PipEffectType } from '../data/pipEffects';
import { updateEchoDescription } from '../logic/consumableEffects';

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
  availableCharms: [],
  availableConsumables: [],
  availableBlessings: [],
};

function createInitialCombinationCounters(): CombinationCounters {
  // Start with empty object - combinations will be added as they're used
  return {};
}

function createInitialCombinationLevels(): CombinationLevels {
  // Start with empty object - all combinations default to level 1
  // Levels will be added as combinations are upgraded
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
export function createInitialLevelState(
  levelNumber: number, 
  gameState: GameState, 
  charmManager?: any,
  preGeneratedConfig?: LevelConfig
): LevelState {
  if (!gameState.currentWorld) {
    throw new Error('Cannot create level state without currentWorld');
  }
  
  // Use pre-generated config if available and level number matches, otherwise generate on the fly
  const levelConfig = (preGeneratedConfig && preGeneratedConfig.levelNumber === levelNumber) 
    ? preGeneratedConfig 
    : getLevelConfig(levelNumber, getDifficulty(gameState));
  
  const isMiniboss = isMinibossLevel(levelNumber);
  const isMainBoss = isMainBossLevel(levelNumber);
  
  // Get world from pool by ID to get full world definition
  const worldFromPool = WORLD_POOL.find(w => w.id === gameState.currentWorld!.worldId);
  if (!worldFromPool) {
    throw new Error(`World ${gameState.currentWorld.worldId} not found in WORLD_POOL`);
  }
  
  const world: World = {
    ...worldFromPool,
    worldNumber: gameState.currentWorld.worldNumber,
    startLevel: ((gameState.currentWorld.worldNumber - 1) * 5) + 1,
    endLevel: gameState.currentWorld.worldNumber * 5,
  };
  
  // Calculate base rerolls and banks (from game state + charms/blessings)
  const baseRerolls = calculateRerollsForLevel(gameState, charmManager);
  const baseBanks = calculateBanksForLevel(gameState, charmManager);
  
  // Collect all level effects (from level config and boss/miniboss)
  const levelEffects = levelConfig.effects || [];
  if (levelConfig.boss?.effects) {
    levelEffects.push(...levelConfig.boss.effects);
  }
  
  // Apply level effects (world effects + boss/miniboss effects, modifiers)
  const { rerolls, banks } = applyLevelEffects(baseRerolls, baseBanks, levelConfig);
  
  // CRITICAL: Ensure banksRemaining is at least 1 - player must be able to play
  // If level effects reduce banks to 0, this would prevent rolling
  const finalBanks = Math.max(1, banks);
  const finalRerolls = Math.max(0, rerolls);
  
  if (banks <= 0) {
    console.warn(`[createInitialLevelState] Warning: Level ${levelNumber} would have ${banks} banks. Setting to minimum of 1.`);
  }
  
  // Get effect context for filtering and scoring (world effects come from gameState.currentWorld)
  const worldEffects = gameState.currentWorld.worldEffects;
  const effectContext = getLevelEffectContext(world, levelEffects);
  
  // Create first round of the level (diceHand will be empty until first roll)
  const firstRound = createInitialRoundState(1);
  
  return {
    levelNumber,
    levelThreshold: levelConfig.pointThreshold,
    isMiniboss,
    isMainBoss,
    rerollsRemaining: finalRerolls,
    banksRemaining: finalBanks,
    flopsThisLevel: 0, 
    pointsBanked: 0, 
    currentRound: firstRound,
    banksThisLevel: 0,
    isFirstScoring: false,  // Track first scoring of level
    isFirstFlop: false,  // Track first flop of level
    isFirstRoll: false,  // Track first roll of level
    isFirstBank: false,  // Track first bank of level 
    levelEffects,
    effectContext,
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
  
  // Generate game map at start
  const gameMap = generateGameMap();
  
  // Set active worlds based on map nodes
  const activeWorlds = gameMap.nodes
    .filter(node => node.worldNumber > 0)
    .map(node => {
      const worldTemplate = WORLD_POOL.find(w => w.id === node.worldId);
      if (!worldTemplate) {
        throw new Error(`World ${node.worldId} not found in WORLD_POOL`);
      }
      return {
        ...worldTemplate,
        worldNumber: node.worldNumber,
        startLevel: ((node.worldNumber - 1) * 5) + 1,
        endLevel: node.worldNumber * 5,
      };
    });
  setActiveWorlds(activeWorlds);
  
  // Don't auto-select world 1 - player will select it from map at game start
  // selectedWorldId will be set when player selects a world

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
    
    // Map and world selection (no initial selection - player chooses at start)
    gameMap,
    currentWorld: undefined, // Will be set when world is selected
    
    // Game phase - start in world selection
    gamePhase: 'worldSelection' as GamePhase,
    
    // History (consolidated here - all history in one place)
    history: {
      combinationCounters: createInitialCombinationCounters(),
      combinationLevels: createInitialCombinationLevels(),
      consumableCounters: {},
      charmCounters: {},
      blessingCounters: {},
      highScoreSingleRoll: 0, 
      highScoreBank: 0,
      charmState: {}, // Track cumulative charm state (e.g., rabbitsFoot.rainbowTriggers, assassin.destroyedDice)
    },
    consecutiveBanks: 0,  
    consecutiveFlops: 0,  
  };
  
  return initialGameState;
}

/**
 * Credit transaction interface for dice customization
 */
export interface CreditTransaction {
  type: 'addDie' | 'removeDie' | 'changeMaterial' | 'addPipEffect' | 'removePipEffect' | 'changeSideValue' | 'addBaseReroll' | 'addBaseBank' | 'addCharmSlot' | 'addConsumableSlot';
  dieIndex?: number;
  sideIndex?: number;
  cost: number; // negative for refunds
  timestamp: number;
  metadata?: {
    material?: DiceMaterialType;
    pipEffect?: PipEffectType;
    oldValue?: number;
    newValue?: number;
  };
}

/**
 * Result of randomizing a dice set configuration
 */
export interface RandomizedDiceSetResult {
  diceSet: Die[];
  creditTransactions: CreditTransaction[];
  originalSideValues: Record<string, number[]>;
  creditsUsed: number;
}

/**
 * Randomize a dice set configuration within credit budget
 * Targets using 60-90% of starting credits (errs on the side of using more)
 */
export function randomizeDiceSetConfig(difficulty: DifficultyLevel): RandomizedDiceSetResult {
  const startingCredits = getStartingCredits(difficulty);
  
  // Credit costs - base costs
  const COST_CHANGE_MATERIAL = 3;
  const COST_CHANGE_SIDE_VALUE = 2;
  const COST_ADD_PIP_EFFECT = 2;

  // Helper to get cost of adding a die
  const getAddDieCost = (currentDiceCount: number): number => {
    const addedDiceCount = Math.max(0, currentDiceCount - 5);
    if (addedDiceCount === 0) return 5; // First extra die: 5 credits
    if (addedDiceCount === 1) return 10; // Second extra die: 10 credits
    return 15; // Third and beyond: 15 credits each
  };

  // Create default 5 dice
  const createDefaultDice = (): Die[] => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `d${i + 1}`,
      sides: 6,
      allowedValues: [1, 2, 3, 4, 5, 6],
      material: 'plastic' as DiceMaterialType,
      pipEffects: undefined
    }));
  };
  
  // Start fresh with default dice
  const defaultDice = createDefaultDice();
  const newDiceSet: Die[] = defaultDice.map(die => ({ ...die }));
  const newTransactions: CreditTransaction[] = [];
  const newOriginalSideValues: Record<string, number[]> = {};
  let creditsUsed = 0;
  let timestamp = Date.now();

  // Initialize original side values
  defaultDice.forEach(die => {
    newOriginalSideValues[die.id] = [...die.allowedValues];
  });

  // Target using 75-100% of starting credits (err on the side of using more)
  // But ensure remaining credits is less than 10
  const minCreditsToUse = Math.max(
    Math.floor(startingCredits * 0.75), // At least 75% of credits
    Math.max(0, startingCredits - 9)    // Or enough to leave < 10 remaining, whichever is higher
  );
  const maxCreditsToUse = startingCredits;
  // Randomly choose between minCreditsToUse and maxCreditsToUse
  const targetCreditsToUse = Math.floor(
    minCreditsToUse + (maxCreditsToUse - minCreditsToUse) * Math.random()
  );
  // Ensure we don't exceed starting credits
  const actualMaxCreditsToUse = Math.min(targetCreditsToUse, startingCredits);

  // Available materials (excluding plastic for randomization, but we'll add it back with probability)
  const availableMaterials: DiceMaterialType[] = MATERIALS.map(m => m.id as DiceMaterialType);
  const nonPlasticMaterials = availableMaterials.filter(m => m !== 'plastic');
  
  // Available pip effects
  const availablePipEffects: PipEffectType[] = PIP_EFFECTS.map(e => e.type);

  // Randomly decide how many dice to add (0-3, but constrained by credits)
  // Add dice one at a time, checking costs as we go
  for (let i = 0; i < 3; i++) {
    const cost = getAddDieCost(newDiceSet.length);
    if (creditsUsed + cost <= actualMaxCreditsToUse) {
      // 45% chance to add another die if we can afford it 
      if (Math.random() < 0.45) {
        const newDieIndex = newDiceSet.length;
        const newDie: Die = {
          id: `d${newDieIndex + 1}`,
          sides: 6,
          allowedValues: [1, 2, 3, 4, 5, 6],
          material: 'plastic',
          pipEffects: undefined
        };
        newDiceSet.push(newDie);
        newOriginalSideValues[newDie.id] = [...newDie.allowedValues];
        creditsUsed += cost;
        newTransactions.push({
          type: 'addDie',
          dieIndex: newDieIndex,
          cost: cost,
          timestamp: timestamp++
        });
      } else {
        break;
      }
    } else {
      break;
    }
  }

  // Track counts for probability adjustments
  let totalSideValueChanges = 0;
  let totalPipEffects = 0;

  // Track current side values for each die (starts as original values)
  // This ensures we make incremental changes like the UI does
  const currentSideValues: Record<number, number[]> = {};
  newDiceSet.forEach((die, index) => {
    currentSideValues[index] = [...die.allowedValues];
  });

  // For each die, randomly customize it
  for (let dieIndex = 0; dieIndex < newDiceSet.length; dieIndex++) {
    const die = newDiceSet[dieIndex];
    const remainingCredits = actualMaxCreditsToUse - creditsUsed;
    
    // 85% chance to change material (increased from 70% - materials should show up more often)
    if (remainingCredits >= COST_CHANGE_MATERIAL && Math.random() < 0.85) {
      const randomMaterial = nonPlasticMaterials[Math.floor(Math.random() * nonPlasticMaterials.length)];
      die.material = randomMaterial;
      creditsUsed += COST_CHANGE_MATERIAL;
      newTransactions.push({
        type: 'changeMaterial',
        dieIndex,
        cost: COST_CHANGE_MATERIAL,
        metadata: { material: randomMaterial },
        timestamp: timestamp++
      });
    }

    // Calculate probability for side value changes based on how many have been done
    // Base probability decreases as more changes are made
    // 0 changes: 40% chance per die, 1 change: 30%, 2 changes: 20%, 3+: 10%
    const sideValueChangeBaseProb = Math.max(0.1, 0.4 - (totalSideValueChanges * 0.1));
    const maxSideValueChanges = Math.min(
      3, // Max 3 changes per die
      Math.floor((actualMaxCreditsToUse - creditsUsed) / COST_CHANGE_SIDE_VALUE)
    );

    // Decide how many side value changes to make for this die
    let numSideValueChanges = 0;
    for (let attempt = 0; attempt < maxSideValueChanges; attempt++) {
      // Probability decreases with each attempt on this die
      const currentProb = sideValueChangeBaseProb * (1 - attempt * 0.3);
      if (Math.random() < currentProb && creditsUsed + COST_CHANGE_SIDE_VALUE <= actualMaxCreditsToUse) {
        numSideValueChanges++;
      } else {
        break;
      }
    }

    // Make incremental side value changes (like the UI does with increment/decrement)
    for (let i = 0; i < numSideValueChanges; i++) {
      if (creditsUsed + COST_CHANGE_SIDE_VALUE > actualMaxCreditsToUse) break;
      
      // Pick a random side that can still be changed (not at min/max)
      const availableSides = currentSideValues[dieIndex]
        .map((val, idx) => ({ value: val, index: idx }))
        .filter(({ value }) => value > 1 && value < 20); // Can still be incremented or decremented
      
      if (availableSides.length === 0) break; // No more sides can be changed
      
      const sideToChange = availableSides[Math.floor(Math.random() * availableSides.length)];
      const sideIndex = sideToChange.index;
      const oldValue = currentSideValues[dieIndex][sideIndex];
      
      // Randomly decide to increment or decrement (with bias towards staying in reasonable range)
      let delta: number;
      if (oldValue <= 3) {
        // Low values: prefer incrementing (70% chance)
        delta = Math.random() < 0.7 ? 1 : -1;
      } else if (oldValue >= 18) {
        // High values: prefer decrementing (70% chance)
        delta = Math.random() < 0.7 ? -1 : 1;
      } else {
        // Middle values: random increment/decrement
        delta = Math.random() < 0.5 ? 1 : -1;
      }
      
      const newValue = Math.max(1, Math.min(20, oldValue + delta));
      
      // Only proceed if the value actually changes
      if (newValue === oldValue) continue;
      
      // Update the current value tracking
      currentSideValues[dieIndex][sideIndex] = newValue;
      die.allowedValues[sideIndex] = newValue;
      
      creditsUsed += COST_CHANGE_SIDE_VALUE;
      totalSideValueChanges++;
      newTransactions.push({
        type: 'changeSideValue',
        dieIndex,
        sideIndex,
        cost: COST_CHANGE_SIDE_VALUE,
        metadata: { oldValue, newValue },
        timestamp: timestamp++
      });
    }

    // Calculate probability for pip effects based on how many have been done
    // Base probability decreases as more effects are added
    // 0 effects: 45% chance per die, 1 effect: 40%, 2 effects: 35%
    const pipEffectBaseProb = Math.max(0.20, 0.45 - (totalPipEffects * 0.05));
    const maxPipEffects = Math.min(
      3, // Max 3 effects per die
      Math.floor((actualMaxCreditsToUse - creditsUsed) / COST_ADD_PIP_EFFECT)
    );

    // Decide how many pip effects to add for this die
    let numPipEffects = 0;
    for (let attempt = 0; attempt < maxPipEffects; attempt++) {
      // Probability decreases with each attempt on this die
      const currentProb = pipEffectBaseProb * (1 - attempt * 0.4);
      if (Math.random() < currentProb && creditsUsed + COST_ADD_PIP_EFFECT <= actualMaxCreditsToUse) {
        numPipEffects++;
      } else {
        break;
      }
    }

    if (numPipEffects > 0) {
      die.pipEffects = {};
      // Get unique side values (in case side values were changed and there are duplicates)
      const availableSideValues = [...new Set(die.allowedValues)];
      
      for (let i = 0; i < numPipEffects; i++) {
        if (creditsUsed + COST_ADD_PIP_EFFECT > actualMaxCreditsToUse) break;
        if (availableSideValues.length === 0) break;
        
        const sideValueIndex = Math.floor(Math.random() * availableSideValues.length);
        const sideValue = availableSideValues[sideValueIndex];
        availableSideValues.splice(sideValueIndex, 1); // Remove to avoid duplicates
        
        const randomEffect = availablePipEffects[Math.floor(Math.random() * availablePipEffects.length)];
        die.pipEffects[sideValue] = randomEffect;
        
        creditsUsed += COST_ADD_PIP_EFFECT;
        totalPipEffects++;
        newTransactions.push({
          type: 'addPipEffect',
          dieIndex,
          sideIndex: sideValue, // Note: sideIndex in transaction stores the sideValue, not the array index
          cost: COST_ADD_PIP_EFFECT,
          metadata: { pipEffect: randomEffect },
          timestamp: timestamp++
        });
      }
    }
  }

  return {
    diceSet: newDiceSet,
    creditTransactions: newTransactions,
    originalSideValues: newOriginalSideValues,
    creditsUsed
  };
}

/**
 * Initialize a new game
 * This is the main entry point for game initialization - handles all setup logic
 */
export function initializeNewGame(
  diceSetConfig: DiceSetConfig,
  difficulty: DifficultyLevel,
  charmManager: any,
  selectedCharms?: number[],
  selectedConsumables?: number[],
  selectedBlessings?: number[]
): GameState {
  // Create initial game state (without level state - player selects world first)
  const gameState = createInitialGameState(diceSetConfig, difficulty);
  
  // Add selected charms, consumables, and blessings 
  if (selectedCharms && selectedCharms.length > 0) {
    const charmsToAdd = selectedCharms
      .filter(index => index < CHARMS.length)
      .map(index => {
        const charm = CHARMS[index];
        const runtimeCharm = { ...charm, active: true };
        charmManager.addCharm(runtimeCharm);
        return runtimeCharm;
      });
    gameState.charms = [...gameState.charms, ...charmsToAdd];
  }
  
  if (selectedConsumables && selectedConsumables.length > 0) {
    const consumablesToAdd = selectedConsumables
      .filter(index => index < CONSUMABLES.length)
      .map(index => ({ ...CONSUMABLES[index], uses: CONSUMABLES[index].uses || 1 }));
    gameState.consumables = [...gameState.consumables, ...consumablesToAdd];
  }
  
  if (selectedBlessings && selectedBlessings.length > 0) {
    const blessingsToAdd = selectedBlessings
      .filter(index => index < ALL_BLESSINGS.length)
      .map(index => ALL_BLESSINGS[index]);
    gameState.blessings = [...gameState.blessings, ...blessingsToAdd];
  }
  
  // Register starting charms with the charm manager
  registerStartingCharms(gameState, charmManager);
  
  // Update echo consumable description if last consumable was used
  updateEchoDescription(gameState);
  
  // Don't create level state yet - player needs to select a world first
  // Level state will be created when world is selected
  
  return gameState;
}

export function createInitialRoundState(roundNumber: number = 1, diceSet?: any[]): RoundState {
  // Start with empty diceHand - dice will be added when rolling
  // If diceSet is provided, we'll use it when rolling, but don't populate diceHand yet
  const diceHand: any[] = [];
  
  // Initialize Generator charm category (cycles through: singleN, nPairs, nTuplets, straightOfN, pyramidOfN, nOfAKind)
  const generatorCategories: CombinationCategory[] = [
    'singleN', 'nPairs', 'nTuplets', 'straightOfN', 'pyramidOfN', 'nOfAKind'
  ];
  const generatorCurrentCategory = generatorCategories[Math.floor(Math.random() * generatorCategories.length)];
  
  return {
    roundNumber: roundNumber,
    roundPoints: 0,
    diceHand,
    hotDiceCounter: 0,
    forfeitedPoints: 0,
    isActive: true,
    rollHistory: [],
    flowerCounter: 0,  // Initialize flower counter for Bloom charm
    generatorCurrentCategory,  // Initialize Generator charm category
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

