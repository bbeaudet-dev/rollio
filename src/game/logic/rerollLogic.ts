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
  
  // Apply modifiers from charms in order: bonuses, multipliers, overrides
  if (charmManager) {
    const activeCharms = charmManager.getActiveCharms?.() || [];
    
    // First, check for overrides (Purist sets rerolls to 0, so it overrides everything)
    const hasPurist = activeCharms.some((charm: any) => charm.id === 'purist');
    if (hasPurist) {
      baseRerolls = 0;
    } else {
      // Apply bonuses first
      for (const charm of activeCharms) {
        // Comeback Kid: +3 rerolls
        if (charm.id === 'comebackKid') {
          baseRerolls += 3;
        }
      }
      
      // Then apply multipliers
      for (const charm of activeCharms) {
        // Double Agent: Doubles rerolls
        if (charm.id === 'doubleAgent') {
          baseRerolls *= 2;
        }
      }
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
    for (const charm of activeCharms) {
      // Hoarder: +2 banks
      if (charm.id === 'hoarder') {
        baseBanks += 2;
      }
      // Purist: Doubles banks
      if (charm.id === 'purist') {
        baseBanks *= 2;
      }
    }
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

