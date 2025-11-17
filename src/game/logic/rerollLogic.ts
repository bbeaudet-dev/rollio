import { GameState } from '../types';
import { debugLog } from '../utils/debug';

/**
 * Calculates rerolls available for the current level
 * Based on baseLevelRerolls + modifiers from charms/blessings
 * 
 * @param gameState The current game state
 * @param charmManager Optional charm manager to check for reroll-modifying charms
 * @returns The number of rerolls available for this level
 */
export function calculateRerollsForLevel(gameState: GameState, charmManager?: any): number {
  let baseRerolls = gameState.baseLevelRerolls;
  
  // Apply modifiers from charms in order: overrides, bonuses, multipliers
  if (charmManager) {
    const activeCharms = charmManager.getActiveCharms?.() || [];
    
    // Collect all modifiers from charms
    const modifiers = { add: 0, multiply: 1, override: null as number | null };
    
    for (const charm of activeCharms) {
      if (charm.getRerollBonus) {
        const bonus = charm.getRerollBonus(gameState);
        if (bonus.override !== undefined) {
          modifiers.override = bonus.override;
        }
        if (bonus.add !== undefined) {
          modifiers.add += bonus.add;
        }
        if (bonus.multiply !== undefined) {
          modifiers.multiply *= bonus.multiply;
        }
      }
    }
    
    // Apply in order: override, add, multiply
    if (modifiers.override !== null) {
      baseRerolls = modifiers.override;
    } else {
      baseRerolls += modifiers.add;
      baseRerolls *= modifiers.multiply;
    }
  }
  
  // Apply bonuses from blessings (affects base value, already in baseLevelRerolls)
  // Blessings that modify baseLevelRerolls are permanent and already applied to gameState.baseLevelRerolls
  
  debugLog(`[REROLL CALC] Base rerolls: ${baseRerolls}, Final: ${baseRerolls}`);
  
  return baseRerolls;
}

/**
 * Calculates banks available for the current level
 * Based on baseLevelBanks + modifiers from charms/blessings
 * 
 * @param gameState The current game state
 * @param charmManager Optional charm manager to check for bank-modifying charms
 * @returns The number of banks available for this level
 */
export function calculateBanksForLevel(gameState: GameState, charmManager?: any): number {
  let baseBanks = gameState.baseLevelBanks || 5;
  
  // Apply bonuses and multipliers from charms
  if (charmManager) {
    const activeCharms = charmManager.getActiveCharms?.() || [];
    
    // Collect all modifiers from charms
    const modifiers = { add: 0, multiply: 1 };
    
    for (const charm of activeCharms) {
      if (charm.getBankBonus) {
        const bonus = charm.getBankBonus(gameState);
        if (bonus.add !== undefined) {
          modifiers.add += bonus.add;
        }
        if (bonus.multiply !== undefined) {
          modifiers.multiply *= bonus.multiply;
        }
      }
    }
    
    // Apply modifiers: add first, then multiply
    baseBanks += modifiers.add;
    baseBanks *= modifiers.multiply;
  }
  
  // Apply bonuses from blessings (affects base value, already in baseLevelBanks)
  // Blessings that modify baseLevelBanks are permanent and already applied to gameState.baseLevelBanks
  
  debugLog(`[BANKS CALC] Base banks: ${baseBanks}, Final: ${baseBanks}`);
  
  return baseBanks;
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

