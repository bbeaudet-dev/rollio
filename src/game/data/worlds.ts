/**
 * World configurations and definitions
 * Every 5 levels is a World
 * Levels 1-5 is always the same "Base" world
 * The 3rd level of each world is a miniboss (levels 3, 8, 13, 18, 23)
 * The final level of each world is the main boss (levels 5, 10, 15, 20, 25)
 */

export interface WorldEffect {
  id: string;
  name: string;
  description: string;
  type: 'modifier' | 'multiplier' | 'restriction' | 'bonus';
  // Rerolls/banks modifiers
  rerollsModifier?: number; // e.g., +1, -1
  banksModifier?: number; // e.g., +1, -1
  rerollsMultiplier?: number; // e.g., 2 for x2, 0.5 for /2
  banksMultiplier?: number; // e.g., 2 for x2, 0.5 for /2
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
  // Money bonuses
  endOfLevelBonusMultiplier?: number; // e.g., 2 for 2x end of level bonus
  banksRemainingBonusMultiplier?: number; // e.g., 2 for 2x banks remaining bonus
}

export interface World {
  id: string;
  name: string;
  description: string;
  worldNumber: number;
  startLevel: number; // First level of this world (1-based)
  endLevel: number; // Last level of this world (1-based)
  theme?: string; // Visual/audio theme
  unlockCondition?: string; // How to unlock this world
  effects: WorldEffect[]; // World effects that apply to all levels in this world
}

/**
 * World configurations
 * Each world contains 5 levels
 * Worlds are selected from a pool during map generation
 */
export const WORLD_POOL: Omit<World, 'worldNumber' | 'startLevel' | 'endLevel'>[] = [
  {
    id: 'base',
    name: 'Base World',
    description: 'Standard gameplay',
    theme: 'default',
    effects: [
      {
        id: 'baseStandard',
        name: 'Standard',
        description: 'No special effects',
        type: 'modifier',
      },
    ],
  },
  {
    id: 'mountainous',
    name: 'Mountainous',
    description: '2x Straights',
    theme: 'mountain',
    effects: [
      {
        id: 'mountainousStraights',
        name: 'Mountainous Straights',
        description: 'Straights are worth 2x points',
        type: 'multiplier',
        straightsMultiplier: 2,
      },
    ],
  },
  {
    id: 'plains',
    name: 'Plains',
    description: '2x N-of-a-kind',
    theme: 'plains',
    effects: [
      {
        id: 'plainsNOfAKind',
        name: 'Plains N-of-a-kind',
        description: 'N-of-a-kind combinations are worth 2x points',
        type: 'multiplier',
        nOfAKindMultiplier: 2,
      },
    ],
  },
  {
    id: 'city',
    name: 'City',
    description: '2x Singles and Pairs',
    theme: 'city',
    effects: [
      {
        id: 'citySinglesPairs',
        name: 'City Singles and Pairs',
        description: 'Singles and pairs are worth 2x points',
        type: 'multiplier',
        singlesMultiplier: 2,
        pairsMultiplier: 2,
      },
    ],
  },
  {
    id: 'desert',
    name: 'Desert',
    description: '2x Pyramids',
    theme: 'desert',
    effects: [
      {
        id: 'desertPyramids',
        name: 'Desert Pyramids',
        description: 'Pyramids are worth 2x points',
        type: 'multiplier',
        pyramidsMultiplier: 2,
      },
    ],
  },
  {
    id: 'windy',
    name: 'Windy',
    description: '+1 Reroll per level',
    theme: 'wind',
    effects: [
      {
        id: 'windyRerolls',
        name: 'Windy Rerolls',
        description: '+1 reroll per level',
        type: 'modifier',
        rerollsModifier: 1,
      },
    ],
  },
  {
    id: 'barren',
    name: 'Barren',
    description: '-1 Bank per level',
    theme: 'barren',
    effects: [
      {
        id: 'barrenBanks',
        name: 'Barren Banks',
        description: '-1 bank per level',
        type: 'modifier',
        banksModifier: -1,
      },
    ],
  },
  {
    id: 'bountiful',
    name: 'Bountiful',
    description: '2x End of level bonus',
    theme: 'bountiful',
    effects: [
      {
        id: 'bountifulBonus',
        name: 'Bountiful Bonus',
        description: '2x end of level money bonus',
        type: 'bonus',
        endOfLevelBonusMultiplier: 2,
      },
    ],
  },
];

/**
 * Active worlds in the current game (populated during map generation)
 * This is a runtime array that gets populated when the map is generated
 */
export let ACTIVE_WORLDS: World[] = [];

/**
 * Set active worlds (called during map generation)
 */
export function setActiveWorlds(worlds: World[]): void {
  ACTIVE_WORLDS = worlds;
}

/**
 * Get the world for a given level number
 */
export function getWorldForLevel(levelNumber: number): World | null {
  return ACTIVE_WORLDS.find(world => 
    levelNumber >= world.startLevel && levelNumber <= world.endLevel
  ) || null;
}

/**
 * Get world number for a given level
 */
export function getWorldNumber(levelNumber: number): number {
  return Math.ceil(levelNumber / 5);
}

/**
 * Check if a level is a miniboss level (3rd level of each world)
 */
export function isMinibossLevel(levelNumber: number): boolean {
  const levelInWorld = ((levelNumber - 1) % 5) + 1;
  return levelInWorld === 3;
}

/**
 * Check if a level is a main boss level (5th level of each world)
 */
export function isMainBossLevel(levelNumber: number): boolean {
  const worldNumber = getWorldNumber(levelNumber);
  const levelInWorld = ((levelNumber - 1) % 5) + 1;
  return levelInWorld === 5;
}

