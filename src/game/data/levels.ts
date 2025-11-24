/**
 * Level configurations and definitions
 * Defines point thresholds, base money rewards, and special effects/boss mechanics for each level
 */
import { isMinibossLevel, isMainBossLevel } from './worlds';
import { DifficultyLevel, getDifficultyConfig } from '../logic/difficulty';

export interface LevelEffect {
  id: string;
  name: string;
  description: string;
  type: 'boss' | 'modifier' | 'multiplier' | 'restriction';
  // Rerolls/banks modifiers
  banksModifier?: number;  // e.g., -2 banks
  rerollsModifier?: number;  // e.g., -1 rerolls
  banksMultiplier?: number; // e.g., 2 for x2, 0.5 for /2
  rerollsMultiplier?: number; // e.g., 2 for x2, 0.5 for /2
  // Combination multipliers
  straightsMultiplier?: number; // e.g., 2 for 2x straights
  pairsMultiplier?: number; // e.g., 2 for 2x pairs
  singlesMultiplier?: number; // e.g., 2 for 2x singles
  nOfAKindMultiplier?: number; // e.g., 2 for 2x N-of-a-kind
  pyramidsMultiplier?: number; // e.g., 2 for 2x pyramids
  // Combination restrictions
  noStraights?: boolean;
  noPairs?: boolean;
  noSingles?: boolean;
  noNOfAKind?: boolean;
  noPyramids?: boolean;
  // Dice value restrictions
  noOnes?: boolean;
  noTwos?: boolean;
  noThrees?: boolean;
  noFours?: boolean;
  noFives?: boolean;
  noSixes?: boolean;
  noOddValues?: boolean;
  noEvenValues?: boolean;
  // Charm/consumable restrictions
  noCharms?: boolean; // Disable all charms
  noConsumables?: boolean; // Disable consumable usage
  // Level threshold modifiers
  thresholdModifier?: number; // Multiplier for level threshold
  thresholdIncreasePerFlop?: number; // Increase threshold per flop
  // Time-based effects (placeholder for future)
  timeBased?: boolean;
  [key: string]: any;  // Allow other effect properties
}

export interface Boss {
  id: string;
  name: string;
  description: string;
  effects: LevelEffect[];
  minLevel?: number;  // Minimum level this boss can appear
  maxLevel?: number;  // Maximum level this boss can appear
  weight?: number;  // Probability weight (higher = more likely)
}

export interface LevelConfig {
  levelNumber: number;
  pointThreshold: number;
  baseMoney: number;
  boss?: Boss | null;  // Boss for this level (null = no boss, regular level)
  effects?: LevelEffect[];  // Additional level effects
}

/**
 * Miniboss pool - minibosses that can randomly appear on miniboss levels (2nd and 4th of each world)
 * Medium-difficulty debuffs
 */
export const MINIBOSS_POOL: Boss[] = [
  {
    id: 'noStraightsMiniboss',
    name: 'No Straights',
    description: 'Straights cannot be scored',
    effects: [
      {
        id: 'noStraights',
        name: 'No Straights',
        description: 'Straights cannot be scored',
        type: 'restriction',
        noStraights: true,
      },
    ],
    minLevel: 2,
    weight: 1,
  },
  {
    id: 'noPairsMiniboss',
    name: 'No Pairs',
    description: 'Pairs cannot be scored',
    effects: [
      {
        id: 'noPairs',
        name: 'No Pairs',
        description: 'Pairs cannot be scored',
        type: 'restriction',
        noPairs: true,
      },
    ],
    minLevel: 2,
    weight: 1,
  },
  {
    id: 'minusTwoBanksMiniboss',
    name: 'Bank Drain',
    description: '-2 Banks',
    effects: [
      {
        id: 'minusTwoBanks',
        name: 'Bank Drain',
        description: '-2 banks',
        type: 'modifier',
        banksModifier: -2,
      },
    ],
    minLevel: 2,
    weight: 1,
  },
  {
    id: 'noOnesMiniboss',
    name: 'No Ones',
    description: 'Dice showing 1 cannot be used',
    effects: [
      {
        id: 'noOnes',
        name: 'No Ones',
        description: 'Dice showing 1 cannot be used',
        type: 'restriction',
        noOnes: true,
      },
    ],
    minLevel: 2,
    weight: 1,
  },
  {
    id: 'noSinglesMiniboss',
    name: 'No Singles',
    description: 'Single dice cannot be scored',
    effects: [
      {
        id: 'noSingles',
        name: 'No Singles',
        description: 'Single dice cannot be scored',
        type: 'restriction',
        noSingles: true,
      },
    ],
    minLevel: 4,
    weight: 1,
  },
  {
    id: 'minusOneRerollMiniboss',
    name: 'Reroll Reduction',
    description: '-1 Reroll',
    effects: [
      {
        id: 'minusOneReroll',
        name: 'Reroll Reduction',
        description: '-1 reroll',
        type: 'modifier',
        rerollsModifier: -1,
      },
    ],
    minLevel: 4,
    weight: 1,
  },
];

/**
 * Boss pool - bosses that can randomly appear on boss levels (5th of each world)
 * Harder debuffs that require more strategy
 */
export const BOSS_POOL: Boss[] = [
  {
    id: 'noStraightsOrPairsBoss',
    name: 'Restrictive Boss',
    description: 'No Straights or Pairs',
    effects: [
      {
        id: 'noStraightsOrPairs',
        name: 'No Straights or Pairs',
        description: 'Straights and pairs cannot be scored',
        type: 'restriction',
        noStraights: true,
        noPairs: true,
      },
    ],
    minLevel: 5,
    weight: 1,
  },
  {
    id: 'severePenaltyBoss',
    name: 'Severe Penalty',
    description: '-3 Banks, -2 Rerolls',
    effects: [
      {
        id: 'severePenalty',
        name: 'Severe Penalty',
        description: '-3 banks, -2 rerolls',
        type: 'modifier',
        banksModifier: -3,
        rerollsModifier: -2,
      },
    ],
    minLevel: 5,
    weight: 1,
  },
  {
    id: 'noSinglesOrPairsBoss',
    name: 'Elite Restriction',
    description: 'No Singles or Pairs',
    effects: [
      {
        id: 'noSinglesOrPairs',
        name: 'No Singles or Pairs',
        description: 'Singles and pairs cannot be scored',
        type: 'restriction',
        noSingles: true,
        noPairs: true,
      },
    ],
    minLevel: 10,
    weight: 1,
  },
  {
    id: 'onlyStraightsBoss',
    name: 'Straight Master',
    description: 'Only Straights can be scored',
    effects: [
      {
        id: 'onlyStraights',
        name: 'Only Straights',
        description: 'Only straights can be scored',
        type: 'restriction',
        noPairs: true,
        noSingles: true,
        noNOfAKind: true,
        noPyramids: true,
      },
    ],
    minLevel: 15,
    weight: 1,
  },
];

/**
 * Level configurations - 5 levels total
 * When level 5 is completed, the player wins the game
 */
export const LEVEL_CONFIGS: Omit<LevelConfig, 'boss' | 'effects'>[] = [
  { levelNumber: 1, pointThreshold: 500, baseMoney: 2 },
  { levelNumber: 2, pointThreshold: 750, baseMoney: 2 },
  { levelNumber: 3, pointThreshold: 1000, baseMoney: 2 },
  { levelNumber: 4, pointThreshold: 1500, baseMoney: 2 },
  { levelNumber: 5, pointThreshold: 2000, baseMoney: 2 },
  // { levelNumber: 6, pointThreshold: 2500, baseMoney: 3 },
  // { levelNumber: 7, pointThreshold: 3000, baseMoney: 3 },
  // { levelNumber: 8, pointThreshold: 4000, baseMoney: 3 },
  // { levelNumber: 9, pointThreshold: 5000, baseMoney: 3 },
  // { levelNumber: 10, pointThreshold: 7500, baseMoney: 3 },
  // { levelNumber: 11, pointThreshold: 10000, baseMoney: 3 },
  // { levelNumber: 12, pointThreshold: 15000, baseMoney: 3 },
  // { levelNumber: 13, pointThreshold: 20000, baseMoney: 3 },
  // { levelNumber: 14, pointThreshold: 25000, baseMoney: 3 },
  // { levelNumber: 15, pointThreshold: 30000, baseMoney: 3 },
  // { levelNumber: 16, pointThreshold: 40000, baseMoney: 3 },
  // { levelNumber: 17, pointThreshold: 50000, baseMoney: 3 },
  // { levelNumber: 18, pointThreshold: 60000, baseMoney: 3 },
  // { levelNumber: 19, pointThreshold: 75000, baseMoney: 3 },
  // { levelNumber: 20, pointThreshold: 100000, baseMoney: 3 },
];

/**
 * Maximum level - beating this level wins the game
 */
export const MAX_LEVEL = 25;

/**
 * Calculate level threshold using a formula
 * Formula: 500 + (level - 1) * 250 * level
 * This creates a progressive scaling: 500, 750, 1000, 1500, 2000 for levels 1-5
 * Applies difficulty modifier (e.g., Silver = 1.5x)
 */
export function calculateLevelThreshold(levelNumber: number, difficulty?: DifficultyLevel): number {
  let baseThreshold: number;
  if (levelNumber <= 5) {
    const config = LEVEL_CONFIGS.find(c => c.levelNumber === levelNumber);
    baseThreshold = config ? config.pointThreshold : 500 + (levelNumber - 1) * 250 * levelNumber;
  } else {
    // For levels beyond 5, use formula: 500 + (level - 1) * 250 * level
    baseThreshold = 500 + (levelNumber - 1) * 250 * levelNumber;
  }
  
  // Apply difficulty modifier (each config explicitly includes all cumulative modifiers)
  if (difficulty) {
    const difficultyConfig = getDifficultyConfig(difficulty);
    if (difficultyConfig.pointThresholdModifier) {
      return Math.floor(baseThreshold * difficultyConfig.pointThresholdModifier);
    }
  }
  
  return baseThreshold;
}

/**
 * Get base money reward for a level
 * Formula: $2 for levels 1-5, $3 for levels 6+
 */
export function getLevelBaseMoney(levelNumber: number): number {
  if (levelNumber <= 5) {
    const config = LEVEL_CONFIGS.find(c => c.levelNumber === levelNumber);
    if (config) return config.baseMoney;
  }
  // Level 6+: $3
  return 3;
}

/**
 * Select a random boss or miniboss from the appropriate pool for a given level
 * Returns null if no boss/miniboss should appear (regular level)
 */
export function selectBossOrMinibossForLevel(levelNumber: number): Boss | null {
  const isMiniboss = isMinibossLevel(levelNumber);
  const isBoss = isMainBossLevel(levelNumber);
  
  // Determine which pool to use
  const pool = isMiniboss ? MINIBOSS_POOL : isBoss ? BOSS_POOL : [];
  
  if (pool.length === 0) {
    return null;
  }

  // Filter bosses/minibosses that can appear on this level
  const available = pool.filter(boss => {
    if (boss.minLevel && levelNumber < boss.minLevel) return false;
    if (boss.maxLevel && levelNumber > boss.maxLevel) return false;
    return true;
  });

  if (available.length === 0) {
    return null;
  }

  // Calculate total weight
  const totalWeight = available.reduce((sum, boss) => sum + (boss.weight || 1), 0);
  
  // Random selection weighted by boss weight
  let random = Math.random() * totalWeight;
  for (const boss of available) {
    random -= (boss.weight || 1);
    if (random <= 0) {
      return boss;
    }
  }

  // Fallback (shouldn't happen)
  return available[0];
}

/**
 * Select a random boss from the boss pool for a given level
 * Returns null if no boss should appear (regular level)
 * @deprecated Use selectBossOrMinibossForLevel instead
 */
export function selectBossForLevel(levelNumber: number): Boss | null {
  return selectBossOrMinibossForLevel(levelNumber);
}

/**
 * Determine if a level should have a boss
 * Bosses can appear on certain levels (e.g., every 3 levels, or specific levels)
 */
export function shouldHaveBoss(levelNumber: number): boolean {
  // Bosses appear on miniboss levels (3rd level of each world) and main boss levels (5th level of each world)
  return isMinibossLevel(levelNumber) || isMainBossLevel(levelNumber);
}

/**
 * Select boss/miniboss deterministically for world preview
 * 
 * This ensures the same world/level combination always gets the same boss,
 * so players can see what's coming before they start the world.
 * 
 * Uses a simple hash of the world ID + level offset to create a pseudo-random
 * seed that's consistent for the same inputs.
 */
function selectBossDeterministic(levelNumber: number, worldId: string, levelOffset: number): Boss | null {
  const isMiniboss = isMinibossLevel(levelNumber);
  const isBoss = isMainBossLevel(levelNumber);
  const pool = isMiniboss ? MINIBOSS_POOL : isBoss ? BOSS_POOL : [];
  
  if (pool.length === 0) return null;

  // Filter to bosses that can appear at this level
  const available = pool.filter(boss => {
    if (boss.minLevel && levelNumber < boss.minLevel) return false;
    if (boss.maxLevel && levelNumber > boss.maxLevel) return false;
    return true;
  });

  if (available.length === 0) return null;

  // Create a deterministic number from world ID + level offset
  // This hash function converts a string to a number: multiply by 31 and add each character
  let hash = 0;
  for (let i = 0; i < worldId.length; i++) {
    hash = hash * 31 + worldId.charCodeAt(i);
  }
  // Add level offset to make each level in the world different
  const seed = Math.abs(hash) + levelOffset;
  
  // Use seed to pick from weighted pool (same algorithm as random selection, but deterministic)
  const totalWeight = available.reduce((sum, boss) => sum + (boss.weight || 1), 0);
  const normalizedSeed = (seed % 1000000) / 1000000; // Convert to 0-1 range
  let weightedRandom = normalizedSeed * totalWeight;
  
  // Weighted selection: subtract each boss's weight until we hit 0 or below
  for (const boss of available) {
    weightedRandom -= (boss.weight || 1);
    if (weightedRandom <= 0) return boss;
  }
  
  return available[0]; // Fallback (shouldn't happen)
}

/**
 * Get level configuration for any level number
 * Handles boss selection and effect application
 * Uses formula-based approach for all levels
 * 
 * preGeneratedConfig: Optional pre-generated config to use instead of generating
 */
export function getLevelConfig(
  levelNumber: number, 
  difficulty?: DifficultyLevel,
  preGeneratedConfig?: LevelConfig
): LevelConfig {
  // If we have a pre-generated config for this level, use it
  if (preGeneratedConfig && preGeneratedConfig.levelNumber === levelNumber) {
    return preGeneratedConfig;
  }

  // Use formula for all levels
  const baseConfig: Omit<LevelConfig, 'boss' | 'effects'> = {
    levelNumber,
    pointThreshold: calculateLevelThreshold(levelNumber, difficulty),
    baseMoney: getLevelBaseMoney(levelNumber),
  };

  // Determine if this level should have a boss or miniboss
  const boss = shouldHaveBoss(levelNumber) ? selectBossOrMinibossForLevel(levelNumber) : null;

  return {
    ...baseConfig,
    boss: boss || undefined,
    effects: boss?.effects || [],
  };
}

/**
 * Generate all level configs for a world (like Balatro's blind preview)
 * Pre-generates bosses/minibosses so players can see what's coming
 * Uses deterministic selection based on world ID
 */
export function generateWorldLevelConfigs(
  worldNumber: number,
  worldId: string,
  difficulty: DifficultyLevel
): LevelConfig[] {
  const configs: LevelConfig[] = [];
  const startLevel = ((worldNumber - 1) * 5) + 1;
  
  // Generate configs for all 5 levels in this world
  for (let i = 0; i < 5; i++) {
    const levelNumber = startLevel + i;
    
    // Use formula for base config
    const baseConfig: Omit<LevelConfig, 'boss' | 'effects'> = {
      levelNumber,
      pointThreshold: calculateLevelThreshold(levelNumber, difficulty),
      baseMoney: getLevelBaseMoney(levelNumber),
    };

    // Determine if this level should have a boss or miniboss (deterministic based on world + level)
    const boss = shouldHaveBoss(levelNumber) ? selectBossDeterministic(levelNumber, worldId, i) : null;

    configs.push({
      ...baseConfig,
      boss: boss || undefined,
      effects: boss?.effects || [],
    });
  }
  
  return configs;
}

