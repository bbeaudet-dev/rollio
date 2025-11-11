/**
 * Level color utilities
 * Level 1 is always green, subsequent levels rotate randomly through different colors
 * Ensures no two consecutive levels have the same color
 */

export interface LevelColor {
  backgroundColor: string;
  borderColor: string;
}

// Color palette for levels (excluding green for Level 1)
const LEVEL_COLORS: LevelColor[] = [
  // Reds
  { backgroundColor: '#5a2d2d', borderColor: '#3d1a1a' },
  { backgroundColor: '#6b2d2d', borderColor: '#4a1a1a' },
  { backgroundColor: '#7b3d3d', borderColor: '#5a2a2a' },
  // Oranges
  { backgroundColor: '#5a3d2d', borderColor: '#3d2a1a' },
  { backgroundColor: '#6b4d2d', borderColor: '#4a3a1a' },
  { backgroundColor: '#7b5d3d', borderColor: '#5a4a2a' },
  // Purples
  { backgroundColor: '#4d2d5a', borderColor: '#2a1a3d' },
  { backgroundColor: '#5d3d6b', borderColor: '#3a2a4a' },
  { backgroundColor: '#6d4d7b', borderColor: '#4a3a5a' },
  // Blues
  { backgroundColor: '#2d3d5a', borderColor: '#1a2a3d' },
  { backgroundColor: '#3d4d6b', borderColor: '#2a3a4a' },
  { backgroundColor: '#4d5d7b', borderColor: '#3a4a5a' },
  // Turquoise
  { backgroundColor: '#2d5a5a', borderColor: '#1a3d3d' },
  { backgroundColor: '#3d6b6b', borderColor: '#2a4a4a' },
  { backgroundColor: '#4d7b7b', borderColor: '#3a5a5a' },
  // Brown
  { backgroundColor: '#5a4d2d', borderColor: '#3d3a1a' },
  { backgroundColor: '#6b5d3d', borderColor: '#4a4a2a' },
  { backgroundColor: '#7b6d4d', borderColor: '#5a5a3a' },
];

// Level 1 is always green
const LEVEL_1_COLOR: LevelColor = {
  backgroundColor: '#2d5a2d', // Casino green
  borderColor: '#1a3d1a',
};

// Store level colors to ensure consistency and no consecutive repeats
const levelColorCache = new Map<number, LevelColor>();
let shuffledPalette: LevelColor[] | null = null;

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get color for a level
 * Level 1 is always green
 * Subsequent levels randomly rotate through colors,
 * ensuring no two consecutive levels have the same color
 */
export function getLevelColor(levelNumber: number): LevelColor {
  // Check cache first
  if (levelColorCache.has(levelNumber)) {
    return levelColorCache.get(levelNumber)!;
  }

  // Level 1 is always green
  if (levelNumber === 1) {
    levelColorCache.set(1, LEVEL_1_COLOR);
    return LEVEL_1_COLOR;
  }

  // Initialize shuffled palette on first use (for level 2+)
  if (!shuffledPalette) {
    shuffledPalette = shuffleArray(LEVEL_COLORS);
  }

  // Get the previous level's color
  const previousLevelColor = getLevelColor(levelNumber - 1);
  
  // Filter out the previous level's color to avoid consecutive repeats
  let availableColors = shuffledPalette;
  if (previousLevelColor !== LEVEL_1_COLOR) {
    availableColors = shuffledPalette.filter(
      color => color.backgroundColor !== previousLevelColor.backgroundColor
    );
  }
  
  // Use level number to cycle through available colors
  // This ensures the same level always gets the same color within a game
  const colorIndex = (levelNumber - 2) % availableColors.length;
  const selectedColor = availableColors[colorIndex];
  
  // Cache the color for this level
  levelColorCache.set(levelNumber, selectedColor);
  
  return selectedColor;
}

/**
 * Reset the color tracking (useful for new games)
 */
export function resetLevelColors(): void {
  levelColorCache.clear();
  shuffledPalette = null; // Reset palette so it gets reshuffled for new game
}

