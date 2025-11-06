import { GameState } from '../core/types';
import { debugLog } from '../utils/debug';

/**
 * Calculates rerolls available for the current level
 * Based on rerollValue + modifiers from charms/blessings
 * 
 * @param gameState The current game state
 * @returns The number of rerolls available for this level
 */
export function calculateRerollsForLevel(gameState: GameState): number {
  let baseRerolls = gameState.rerollValue;
  
  // Apply multipliers from charms (e.g., "Double Rerolls" charm)
  // TODO: Add charm multipliers when charms are implemented
  // For now, just use base value
  
  // Apply bonuses from blessings (affects base value, already in rerollValue)
  // Blessings that modify rerollValue are permanent and already applied to gameState.rerollValue
  
  debugLog(`[REROLL CALC] Base rerolls: ${baseRerolls}, Final: ${baseRerolls}`);
  
  return baseRerolls;
}

/**
 * Calculates lives available for the current level
 * Based on livesValue + modifiers from charms/blessings
 * 
 * @param gameState The current game state
 * @returns The number of lives available for this level
 */
export function calculateLivesForLevel(gameState: GameState): number {
  let baseLives = gameState.livesValue;
  
  // Apply bonuses from charms (e.g., "+2 Lives" charm)
  // TODO: Add charm bonuses when charms are implemented
  // For now, just use base value
  
  // Apply bonuses from blessings (affects base value, already in livesValue)
  // Blessings that modify livesValue are permanent and already applied to gameState.livesValue
  
  debugLog(`[LIVES CALC] Base lives: ${baseLives}, Final: ${baseLives}`);
  
  return baseLives;
}

/**
 * Validates a reroll selection
 * 
 * IMPORTANT: 1 reroll = 1 action where you can reroll 0 to ALL dice.
 * The number of dice selected does NOT affect how many rerolls are used.
 * 
 * @param selectedIndices Indices of dice to reroll (can be 0 to all dice)
 * @param diceHand Current dice hand
 * @returns Validation result
 */
export function validateRerollSelection(
  selectedIndices: number[],
  diceHand: any[]
): { valid: boolean; error?: string } {
  // Skipping reroll (0 dice) is valid
  if (selectedIndices.length === 0) {
    return { valid: true };
  }
  
  // Check for duplicate indices
  const uniqueIndices = new Set(selectedIndices);
  if (uniqueIndices.size !== selectedIndices.length) {
    return { valid: false, error: 'Cannot reroll the same die multiple times' };
  }
  
  // Validate indices exist and are within bounds
  for (const index of selectedIndices) {
    if (index < 0 || index >= diceHand.length) {
      return { valid: false, error: `Invalid die index: ${index + 1}. Valid range: 1-${diceHand.length}` };
    }
  }
  
  return { valid: true };
}

