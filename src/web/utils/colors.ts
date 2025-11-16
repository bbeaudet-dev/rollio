/**
 * Centralized color definitions for web UI
 * These colors are used across the web interface for consistent theming
 */

// Item type colors
export const ITEM_COLORS = {
  whim: '#fff9e6',      // Yellow for whims (common consumables)
  wish: '#e3f2fd',      // Blue for wishes (rare consumables)
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
    background: 'radial-gradient(circle at 30% 30%, #ffb3d9, #ffd700, #87ceeb, #98fb98)', 
    border: '#4caf50', 
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
    background: 'linear-gradient(135deg, #c0c0c0, #e8e8e8, #f0f0f0, #d3d3d3)', 
    border: '#808080', 
    pip: '#404040' 
  },
  rainbow: { 
    background: 'linear-gradient(45deg, #ff0000, #ffff00, #32cd32, #4169e1, #4b0082, #875fff, #ff69b4)', 
    border: '#333', 
    pip: '#fff' 
  },
  ghost: { background: '#1a1a2e', border: '#0a0a0f', pip: '#7fffd4' },
  lead: { background: '#4a4a4a', border: '#5a5a6a', pip: '#2a2a2a' },
} as const;

/**
 * Get the background color for a consumable based on whether it's a whim or wish
 */
export function getConsumableColor(consumableId: string, whims: Array<{ id: string }>, wishes: Array<{ id: string }>): string {
  const isWish = wishes.some(w => w.id === consumableId);
  const isWhim = whims.some(w => w.id === consumableId);
  
  if (isWish) return ITEM_COLORS.wish;
  if (isWhim) return ITEM_COLORS.whim;
  
  // Should not happen if all consumables are properly categorized
  // But throw error instead of defaulting to avoid silent bugs
  throw new Error(`Consumable ${consumableId} is not found in either whims or wishes`);
}

/**
 * Get the background color for an item type
 */
export function getItemTypeColor(itemType: 'whim' | 'wish' | 'charm' | 'blessing'): string {
  return ITEM_COLORS[itemType];
}

