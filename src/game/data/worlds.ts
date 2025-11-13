/**
 * World configurations and definitions
 * Every 5 levels is a World
 * Levels 1-5 is always the same "Base" world
 * The third level of each world is a miniboss (levels 3, 8, 13, 18, ...)
 * The final level of each world is the main boss (levels 5, 10, 15, 20, ...)
 */

export interface World {
  id: string;
  name: string;
  description: string;
  worldNumber: number;
  startLevel: number; // First level of this world (1-based)
  endLevel: number; // Last level of this world (1-based)
  theme?: string; // Visual/audio theme
  unlockCondition?: string; // How to unlock this world
}

/**
 * World configurations
 * Each world contains 5 levels
 */
export const WORLDS: World[] = [
  {
    id: 'base',
    name: 'Base World',
    description: 'The starting world for all players',
    worldNumber: 1,
    startLevel: 1,
    endLevel: 5,
    theme: 'default',
  },
  // Additional worlds will be added here
  // World 2: levels 6-10
  // World 3: levels 11-15
  // etc.
];

/**
 * Get the world for a given level number
 */
export function getWorldForLevel(levelNumber: number): World | null {
  return WORLDS.find(world => 
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
  const worldNumber = getWorldNumber(levelNumber);
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

