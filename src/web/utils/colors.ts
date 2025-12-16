/**
 * Centralized color definitions for web UI
 * These colors are used across the web interface for consistent theming
 */

// Item type colors
export const ITEM_COLORS = {
  whim: '#fff9e6',      // Yellow for whims (common consumables)
  wish: '#e3f2fd',      // Blue for wishes (rare consumables)
  combinationUpgrade: '#f0e6ff',  // Purple/lavender for combination upgrades
  charm: '#d1fae5',     // Green pastel for charms
  blessing: '#fce7f3',  // Pink/magenta for blessings
} as const;

// Dice material colors (for UI elements, not the dice themselves)
// These match the colors used in DiceFace.tsx exactly
// Note: Actual dice rendering uses gradients for backgrounds, but these are the solid color equivalents
// and the border/pip colors that match the dice rendering
export const MATERIAL_COLORS = {
  plastic: { background: '#fff', border: '#333', pip: '#333' },
  crystal: { 
    background: 'radial-gradient(ellipse at top left, #f3e5f5, #ce93d8, #9c27b0, #6a1b9a)', 
    border: '#6a1b9a', 
    pip: '#f3e5f5' 
  },
  flower: { 
    background: 'radial-gradient(circle at 30% 30%, #ffb3d9, #ffd700, #87ceeb, #4caf50, #98fb98)',
    border: '#ff1493',
    pip: '#ff1493' 
  },
  golden: { 
    background: 'linear-gradient(135deg, #ffd700, #ffed4e, #ffc107, #daa520)', 
    border: '#b8860b', 
    pip: '#b87333' 
  },
  volcano: { 
    background: 'radial-gradient(circle at 50% 50%, #ff4500, #ff6600, #ff8c00, #800000, #4a0000)', 
    border: '#000000', 
    pip: '#8b0000' 
  },
  mirror: { 
    // Very slight cool/blue tint while remaining mostly metallic
    background: 'linear-gradient(135deg, #cfd8dc, #e3f2fd, #eceff1, #d3d3d3)', 
    border: '#78909c', 
    pip: '#607d8b' // was #404040
  },
  rainbow: { 
    background: 'linear-gradient(45deg, #ff0000, #ffff00, #32cd32, #4169e1, #4b0082, #875fff, #ff69b4)', 
    border: '#333', 
    pip: '#fff' 
  },
  ghost: { 
    background: 'radial-gradient(circle at 30% 20%, #22243a, #17172a)', 
    border: '#0a0a0f', 
    pip: '#7fffd4' 
  },
  lead: { 
    background: 'linear-gradient(135deg, #5a5a5a 0%, #6b6b6b 50%, #555555 100%)', 
    border: '#5a5a6a', 
    pip: '#1a1a1a' 
  },
  lunar: { 
    background: 'radial-gradient(circle at 30% 20%, #f0fff8, #d5fff4, #a5f2e1, #53c5a5)', 
    border: '#2e7d6b', 
    pip: '#b8860b' 
  },
} as const;

// Difficulty level colors for d20 display
// Progressively more brilliant from plastic to diamond
export const DIFFICULTY_COLORS = {
  plastic: { 
    background: '#f5f5f5', 
    border: '#999', 
    number: '#333',
    // Use same style as plastic material
  },
  copper: { 
    background: 'linear-gradient(135deg, #b87333, #cd853f, #daa520)', 
    border: '#8b4513', 
    number: '#fff',
  },
  silver: { 
    background: 'linear-gradient(135deg, #c0c0c0, #e8e8e8, #f5f5f5)', 
    border: '#808080', 
    number: '#333',
  },
  gold: { 
    background: 'linear-gradient(135deg, #ffd700, #ffed4e, #ffc107)', 
    border: '#b8860b', 
    number: '#8b4513',
  },
  roseGold: {
    background: 'linear-gradient(135deg, #e8b4b8, #f4c2c2, #ffb6c1, #ffc0cb, #ffd1dc)', 
    border: '#c08081', 
    number: '#8b4a4a',
  },
  platinum: { 
    background: 'linear-gradient(135deg, #e5e4e2, #f5f5f5, #ffffff)', 
    border: '#c0c0c0', 
    number: '#555',
  },
  sapphire: { 
    background: 'radial-gradient(ellipse at top left, #0f52ba, #4169e1, #6495ed, #87ceeb)', 
    border: '#000080', 
    number: '#fff',
  },
  emerald: { 
    background: 'radial-gradient(ellipse at top left, #50c878, #00ff7f, #90ee90, #98fb98)', 
    border: '#006400', 
    number: '#003300',
  },
  ruby: { 
    background: 'radial-gradient(ellipse at top left, #e0115f, #dc143c, #ff1493, #ff69b4)', 
    border: '#8b0000', 
    number: '#fff',
  },
  diamond: { 
    background: 'linear-gradient(135deg, #b9f2ff, #e0f7fa, #ffffff, #f0f8ff)', 
    border: '#00bcd4', 
    number: '#006064',
    // Diamond will have animated shimmer effect
  },
  quantum: { 
    background: 'linear-gradient(135deg, #6a0dad, #8a2be2, #4b0082, #ff8c00, #ff1493)', 
    border: '#8a2be2', 
    number: '#fff',
    // Quantum will have 4D wireframe effects
  },
} as const;

// Scoring element colors (for formatted descriptions)
export const SCORING_ELEMENT_COLORS = {
  PTS: {
    text: '#2e7d32',      // Dark green
    background: '#c8e6c9' // Light green
  },
  MLT: {
    text: '#c2185b',      // Magenta
    background: '#f8bbd0' // Light pink
  },
  EXP: {
    text: '#7b1fa2',      // Purple
    background: '#ce93d8' // Light purple
  },
  MONEY: {
    text: '#f57c00',      // Dark yellow/orange
    background: '#fff9c4' // Light yellow
  }
} as const;

// Game concept colors (for formatted descriptions)
export const GAME_CONCEPT_COLORS = {
  // Blue: combinations, Hot Dice,
  combination: '#4A90E2',
  combinations: '#4A90E2',
  hotDice: '#4A90E2',
  hot: '#4A90E2',
  // Green: Reroll, Bank, Level, Round, World
  reroll: '#4caf50',
  rerolls: '#4caf50',
  bank: '#4caf50',
  banks: '#4caf50',
  level: '#4caf50',
  levels: '#4caf50',
  round: '#4caf50',
  rounds: '#4caf50',
  world: '#4caf50',
  worlds: '#4caf50',
  // Red: Flop
  flop: '#f44336',
  flops: '#f44336',
  // Orange: Consumable, Charm, Blessing, Materials, pip effects
  consumable: '#ff9800',
  consumables: '#ff9800',
  charm: '#ff9800',
  charms: '#ff9800',
  blessing: '#ff9800',
  blessings: '#ff9800',
  material: '#ff9800',
  materials: '#ff9800',
  pip: '#ff9800',
  pipEffect: '#ff9800',
  pipEffects: '#ff9800',
  // Material names (orange)
  plastic: '#ff9800',
  crystal: '#ff9800',
  flower: '#ff9800',
  golden: '#ff9800',
  volcano: '#ff9800',
  mirror: '#ff9800',
  rainbow: '#ff9800',
  ghost: '#ff9800',
  lead: '#ff9800',
  lunar: '#ff9800',
} as const;

/**
 * Get the background color for a consumable based on whether it's a whim, wish, or combination upgrade
 */
export function getConsumableColor(
  consumableId: string, 
  whims: Array<{ id: string }>, 
  wishes: Array<{ id: string }>,
  combinationUpgrades?: Array<{ id: string }>
): string {
  const isWish = wishes.some(w => w.id === consumableId);
  const isWhim = whims.some(w => w.id === consumableId);
  const isCombinationUpgrade = combinationUpgrades?.some(cu => cu.id === consumableId);
  
  if (isWish) return ITEM_COLORS.wish;
  if (isWhim) return ITEM_COLORS.whim;
  if (isCombinationUpgrade) return ITEM_COLORS.combinationUpgrade;
  
  // Should not happen if all consumables are properly categorized
  // But throw error instead of defaulting to avoid silent bugs
  throw new Error(`Consumable ${consumableId} is not found in whims, wishes, or combination upgrades`);
}

/**
 * Get the background color for an item type
 */
export function getItemTypeColor(itemType: 'whim' | 'wish' | 'charm' | 'blessing'): string {
  return ITEM_COLORS[itemType];
}

