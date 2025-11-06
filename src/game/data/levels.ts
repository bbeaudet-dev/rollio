/**
 * Level configurations and definitions
 * Defines point thresholds, base money rewards, and special effects/boss mechanics for each level
 */

export interface LevelEffect {
  id: string;
  name: string;
  description: string;
  type: 'boss' | 'modifier';
  // Effect properties (will be applied at level start)
  livesModifier?: number;  // e.g., -2 lives
  rerollsModifier?: number;  // e.g., -1 rerolls
  noLivesBonuses?: boolean;  // Disable unused lives money bonus
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
 * Boss pool - bosses that can randomly appear on certain levels
 * Similar to Balatro's boss system
 */
export const BOSS_POOL: Boss[] = [
  // Example bosses (to be expanded later)
  // {
  //   id: 'greedyBoss',
  //   name: 'Greedy Boss',
  //   description: '-2 Lives',
  //   effects: [{ id: 'livesModifier', type: 'modifier', livesModifier: -2 }],
  //   minLevel: 3,
  //   weight: 1,
  // },
  // {
  //   id: 'noBonusesBoss',
  //   name: 'Stingy Boss',
  //   description: 'No Lives Bonuses',
  //   effects: [{ id: 'noLivesBonuses', type: 'modifier', noLivesBonuses: true }],
  //   minLevel: 5,
  //   weight: 1,
  // },
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
export const MAX_LEVEL = 5;

/**
 * Calculate level threshold using a formula
 * Formula: 500 + (level - 1) * 250 * level
 * This creates a progressive scaling: 500, 750, 1000, 1500, 2000 for levels 1-5
 */
export function calculateLevelThreshold(levelNumber: number): number {
  if (levelNumber <= 5) {
    const config = LEVEL_CONFIGS.find(c => c.levelNumber === levelNumber);
    if (config) return config.pointThreshold;
  }
  // For levels beyond 5, use formula: 500 + (level - 1) * 250 * level
  return 500 + (levelNumber - 1) * 250 * levelNumber;
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
 * Select a random boss from the boss pool for a given level
 * Returns null if no boss should appear (regular level)
 */
export function selectBossForLevel(levelNumber: number): Boss | null {
  // Filter bosses that can appear on this level
  const availableBosses = BOSS_POOL.filter(boss => {
    if (boss.minLevel && levelNumber < boss.minLevel) return false;
    if (boss.maxLevel && levelNumber > boss.maxLevel) return false;
    return true;
  });

  if (availableBosses.length === 0) {
    return null;
  }

  // Calculate total weight
  const totalWeight = availableBosses.reduce((sum, boss) => sum + (boss.weight || 1), 0);
  
  // Random selection weighted by boss weight
  let random = Math.random() * totalWeight;
  for (const boss of availableBosses) {
    random -= (boss.weight || 1);
    if (random <= 0) {
      return boss;
    }
  }

  // Fallback (shouldn't happen)
  return availableBosses[0];
}

/**
 * Determine if a level should have a boss
 * Bosses can appear on certain levels (e.g., every 3 levels, or specific levels)
 */
export function shouldHaveBoss(levelNumber: number): boolean {
  // For now: no bosses (will be implemented later)
  // Examples:
  // - Bosses every 3 levels (3, 6, 9, 12, ...)
  // - Bosses on specific levels (5, 10, 15, ...)
  // - Random chance based on level number
  return false;
}

/**
 * Get level configuration for any level number
 * Handles boss selection and effect application
 * Uses formula-based approach for all levels
 */
export function getLevelConfig(levelNumber: number): LevelConfig {
  // Use formula for all levels
  const baseConfig: Omit<LevelConfig, 'boss' | 'effects'> = {
    levelNumber,
    pointThreshold: calculateLevelThreshold(levelNumber),
    baseMoney: getLevelBaseMoney(levelNumber),
  };

  // Determine if this level should have a boss
  const boss = shouldHaveBoss(levelNumber) ? selectBossForLevel(levelNumber) : null;

  return {
    ...baseConfig,
    boss: boss || undefined,
    effects: boss?.effects || [],
  };
}

