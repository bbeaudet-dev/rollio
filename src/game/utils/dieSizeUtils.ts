import { Die } from '../types';

// Die size sequence
export const DIE_SIZE_SEQUENCE = [3, 4, 6, 8, 10, 12, 20] as const;
export type DieSize = typeof DIE_SIZE_SEQUENCE[number];

/**
 * Get the next die size in the sequence (for Pottery Wheel)
 */
export function getNextDieSize(currentSize: number): number | null {
  const currentIndex = DIE_SIZE_SEQUENCE.indexOf(currentSize as DieSize);
  if (currentIndex === -1 || currentIndex === DIE_SIZE_SEQUENCE.length - 1) {
    return null; // Already at max size or invalid size
  }
  return DIE_SIZE_SEQUENCE[currentIndex + 1];
}

/**
 * Get the previous die size in the sequence (for Chisel)
 */
export function getPreviousDieSize(currentSize: number): number | null {
  const currentIndex = DIE_SIZE_SEQUENCE.indexOf(currentSize as DieSize);
  if (currentIndex <= 0) {
    return null; // Already at min size or invalid size
  }
  return DIE_SIZE_SEQUENCE[currentIndex - 1];
}

/**
 * Check if a die size is valid (in our sequence)
 */
export function isValidDieSize(size: number): size is DieSize {
  return DIE_SIZE_SEQUENCE.includes(size as DieSize);
}

/**
 * Generate allowed values for a die of given size
 * For simplicity, we keep values 1-6 for all dice sizes as specified
 */
export function generateAllowedValues(size: number): number[] {
  // For now, all dice use 1-6 values regardless of size
  // This could be expanded later to use the full range
  return [1, 2, 3, 4, 5, 6];
}

/**
 * Get a human-readable description of die size changes
 */
export function getDieSizeDescription(oldSize: number, newSize: number): string {
  if (newSize > oldSize) {
    return `upgraded from ${oldSize}-sided to ${newSize}-sided`;
  } else if (newSize < oldSize) {
    return `downgraded from ${oldSize}-sided to ${newSize}-sided`;
  }
  return `remains ${oldSize}-sided`;
}

/**
 * Get the size multiplier for the "Size Matters" charm
 * 6 faces = 1x, every size below 6 is -0.5x, every size above 6 is +0.5x
 */
export function getSizeMultiplier(size: number): number {
  if (size === 6) return 1.0;
  if (size < 6) return 1.0 - (6 - size) * 0.5;
  return 1.0 + (size - 6) * 0.5;
} 