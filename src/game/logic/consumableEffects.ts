import { CHARMS, CHARM_PRICES } from '../data/charms';
import { CONSUMABLES, WHIMS, WISHES, COMBINATION_UPGRADES, Consumable } from '../data/consumables';
import { MATERIALS } from '../data/materials';
import { getNextDieSize, getPreviousDieSize } from '../utils/dieSizeUtils';
import { GameState, RoundState, DiceMaterialType } from '../types';
import { PipEffectType } from '../data/pipEffects';
import { upgradeCombinations } from '../utils/combinationTracking';
import { CONSUMABLE_PRICES } from './shop';

/**
 * Update last consumable used tracking and Echo consumable description
 * Pure function that modifies gameState in place
 */
export function updateLastConsumableUsed(gameState: GameState, consumable: any): void {
  // Track the last consumable used (for Echo consumable) - but only if it's not Echo itself
  if (consumable && consumable.id !== 'echo') {
    (gameState as any).lastConsumableUsed = { ...consumable };
    
    // Update Echo consumable description
    updateEchoDescription(gameState);
  }
}

/**
 * Determine what dice selection requirements a consumable has
 * Returns the min/max dice count required for the consumable
 */
export function getDiceSelectionRequirement(consumableId: string): { requires: boolean; min: number; max: number } {
  // Consumables that require exactly 1 die
  if (['alchemist', 'midasTouch', 'emptyAsAPocket', 'moneyPip', 'stallion', 'practice', 'phantom', 'accumulation'].includes(consumableId)) {
    return { requires: true, min: 1, max: 1 };
  }
  // Consumables that require 1 or 2 dice
  if (['chisel', 'potteryWheel'].includes(consumableId)) {
    return { requires: true, min: 1, max: 2 };
  }
  // No dice selection required
  return { requires: false, min: 0, max: 0 };
}

/**
 * Determine consumable inputs from selected dice indices
 * Converts selectedDiceIndices (from UI) into the proper format for applyConsumableEffect
 * This handles validation and formatting for all consumable types that require dice selection
 */
export function determineConsumableInputs(
  consumable: any,
  selectedDiceIndices: number[] | undefined,
  roundState: RoundState | null
): {
  dieSelectionInput?: number | [number, number];
  dieSideSelectionInput?: { dieIndex: number; sideValue: number };
} {
  const result: {
    dieSelectionInput?: number | [number, number];
    dieSideSelectionInput?: { dieIndex: number; sideValue: number };
  } = {};

  if (!selectedDiceIndices || selectedDiceIndices.length === 0) {
    return result;
  }

  const diceHand = roundState?.diceHand || [];

  // Check if this consumable needs die selection 
  if (consumable.id === 'chisel' || consumable.id === 'potteryWheel' || consumable.id === 'midasTouch' || consumable.id === 'alchemist') {
    if (consumable.id === 'midasTouch' || consumable.id === 'alchemist') {
      // MidasTouch and Alchemist require exactly 1 die selected
      if (selectedDiceIndices.length === 1) {
        result.dieSelectionInput = selectedDiceIndices[0];
      }
    } else if (selectedDiceIndices.length >= 1 && selectedDiceIndices.length <= 2) {
      // For chisel/potteryWheel, can select 1 or 2 dice (but not more)
      result.dieSelectionInput = selectedDiceIndices.length === 1 
        ? selectedDiceIndices[0] 
        : [selectedDiceIndices[0], selectedDiceIndices[1]] as [number, number];
    }
  }

  // Check if this consumable needs die side selection (pip effect consumables)
  // dieIndex here is from diceHand (the board), not diceSet
  // Pip effect consumables require exactly 1 die selected
  if (consumable.id === 'emptyAsAPocket' || consumable.id === 'moneyPip' || 
      consumable.id === 'stallion' || consumable.id === 'practice' || 
      consumable.id === 'phantom' || consumable.id === 'accumulation') {
    if (selectedDiceIndices.length === 1) {
      const dieIndex = selectedDiceIndices[0];
      const die = diceHand[dieIndex];
      if (die && die.rolledValue !== undefined) {
        // dieIndex is from diceHand, pass it through - the function will find the corresponding diceSet die
        result.dieSideSelectionInput = { dieIndex, sideValue: die.rolledValue };
      }
    }
    // If not exactly 1 die, dieSideSelectionInput remains undefined and will fail
  }

  return result;
}

/**
 * Update Echo consumable description based on last consumable used
 * Pure function that modifies gameState in place
 */
export function updateEchoDescription(gameState: GameState): void {
  const echoIndex = gameState.consumables.findIndex((c: any) => c.id === 'echo');
  if (echoIndex >= 0) {
    const lastConsumable = (gameState as any).lastConsumableUsed;
    if (lastConsumable) {
      gameState.consumables[echoIndex] = {
        ...gameState.consumables[echoIndex],
        description: `Create the last consumable used: ${lastConsumable.name || 'Unknown'}`
      };
    } else {
      // Reset to default description if no last consumable
      gameState.consumables[echoIndex] = {
        ...gameState.consumables[echoIndex],
        description: 'Create the last consumable used'
      };
    }
  }
}

export interface ConsumableEffectResult {
  success: boolean;
  shouldRemove: boolean;
  requiresInput?: {
    type: 'dieSelection' | 'dieSideSelection' | 'twoDieSelection';
    consumableId: 'chisel' | 'potteryWheel' | 'midasTouch' | 'alchemist' | 'emptyAsAPocket' | 'moneyPip' | 'stallion' | 'practice' | 'phantom' | 'accumulation';
    diceSet: any[];
  };
  gameState: GameState;
  roundState?: RoundState;
  // Unlock information for items that should be unlocked after use
  unlockInfo?: {
    type: 'pip_effect' | 'material';
    id: string;
  };
}

/**
 * Apply consumable effect with die selection (for consumables that require die selection)
 * This is called from applyConsumableEffect when input is provided
 */
function applyConsumableWithDieSelection(
  consumableId: 'chisel' | 'potteryWheel' | 'midasTouch' | 'alchemist',
  selectedDieIndex: number | [number, number],
  gameState: GameState,
  roundState: RoundState | null
): ConsumableEffectResult {
  return applyDieSelectionConsumable(consumableId, selectedDieIndex, gameState, roundState);
}

/**
 * Apply consumable effect with die side selection (for pip effect consumables)
 * This is called from applyConsumableEffect when input is provided
 */
function applyConsumableWithDieSideSelectionInternal(
  consumableId: 'emptyAsAPocket' | 'moneyPip' | 'stallion' | 'practice' | 'phantom' | 'accumulation',
  dieIndex: number,
  sideValue: number,
  gameState: GameState,
  roundState: RoundState | null
): ConsumableEffectResult {
  return applyDieSideSelectionConsumable(consumableId, dieIndex, sideValue, gameState, roundState);
}

/**
 * Track consumable usage for charm effects (Whim Whisperer, Shooting Star, etc.)
 */
async function trackConsumableUsage(gameState: GameState, consumable: Consumable, charmManager?: any): Promise<void> {
  // Track in charmState for charm-specific tracking
  if (!gameState.history.charmState) {
    gameState.history.charmState = {};
  }
  
  // Track consumable usage count
  if (!gameState.history.charmState.consumableUsage) {
    gameState.history.charmState.consumableUsage = { totalUsed: 0, whimUsed: 0, wishUsed: 0 };
  }
  gameState.history.charmState.consumableUsage.totalUsed = 
    (gameState.history.charmState.consumableUsage.totalUsed || 0) + 1;
  
  // Track individual consumable ID usage (for profile stats)
  if (!gameState.history.charmState.consumableUsage[consumable.id]) {
    gameState.history.charmState.consumableUsage[consumable.id] = 0;
  }
  gameState.history.charmState.consumableUsage[consumable.id] = 
    (gameState.history.charmState.consumableUsage[consumable.id] || 0) + 1;
  
  // Track by type - check if it's a whim or wish by checking if it's in the respective arrays
  const isWhim = WHIMS.some(w => w.id === consumable.id);
  const isWish = WISHES.some(w => w.id === consumable.id);
  
  if (isWhim) {
    gameState.history.charmState.consumableUsage.whimUsed = 
      (gameState.history.charmState.consumableUsage.whimUsed || 0) + 1;
  } else if (isWish) {
    gameState.history.charmState.consumableUsage.wishUsed = 
      (gameState.history.charmState.consumableUsage.wishUsed || 0) + 1;
  }
  
  // Update lastConsumableUsed for Echo consumable - store as object so Echo can copy it
  // This is set here for tracking purposes, but updateLastConsumableUsed will set it properly after successful use
  // We don't set it here to avoid overwriting the object set by updateLastConsumableUsed
  
  // Check for Antimatter charm (15% chance to not consume consumable)
  if (charmManager) {
    const whimWhisperer = charmManager.getActiveCharms().find((c: any) => c.id === 'whimWhisperer');
    if (whimWhisperer && Math.random() < 0.15) {
      // 15% chance to not consume - this will be handled by the caller
      // We'll set a flag that the consumable should not be removed
      (gameState as any).whimWhispererPreventedConsumption = true;
    }
  }
  
  // Check for Shooting Star charm (10% chance to create random wish when using whim)
  if (isWhim && charmManager) {
    const shootingStar = charmManager.getActiveCharms().find((c: any) => c.id === 'shootingStar');
    if (shootingStar && Math.random() < 0.10) {
      // 10% chance to create a random wish
      const wishes = WISHES;
      if (wishes.length > 0 && gameState.consumables.length < (gameState.consumableSlots || 2)) {
        const randomWish = wishes[Math.floor(Math.random() * wishes.length)];
        gameState.consumables.push({ ...randomWish });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('itemGenerated', {
            detail: { type: 'consumable', id: randomWish.id }
          }));
        }
      }
    }
  }
}

/**
 * Apply consumable effect - pure function
 * Returns only state changes - no messages, no I/O
 */
export async function applyConsumableEffect(
  idx: number,
  gameState: GameState,
  roundState: RoundState | null,
  charmManager: any,
  dieSelectionInput?: number | [number, number], // For chisel, potteryWheel, midasTouch
  dieSideSelectionInput?: { dieIndex: number; sideValue: number } // For pip effect consumables
): Promise<ConsumableEffectResult> {
  const consumable = gameState.consumables[idx];
  if (!consumable) {
    return {
      success: false,
      shouldRemove: false,
      gameState
    };
  }

  const newGameState = { ...gameState };
  const newRoundState = roundState ? { ...roundState } : undefined;
  
  // Create a copy of the consumables array
  newGameState.consumables = [...newGameState.consumables];
  let wasSuccessfullyUsed = true;
  let shouldRemove = true;
  let unlockInfo: { type: 'pip_effect' | 'material'; id: string } | undefined = undefined;
  
  // Track consumable usage for charms (before applying effects)
  // This needs to be async because Shooting Star might import CONSUMABLES
  await trackConsumableUsage(newGameState, consumable, charmManager);
  
  // Handle consumables that require input - if input is provided, process it
  if (dieSelectionInput !== undefined && (consumable.id === 'chisel' || consumable.id === 'potteryWheel' || consumable.id === 'midasTouch' || consumable.id === 'alchemist')) {
    const result = applyDieSelectionConsumable(
        consumable.id as 'chisel' | 'potteryWheel' | 'midasTouch' | 'alchemist',
      dieSelectionInput,
      newGameState,
      newRoundState || null
    );
    // Update last consumable used and add unlock info
    if (result.success && result.shouldRemove) {
      updateLastConsumableUsed(result.gameState, consumable);
      // Add unlock info for alchemist (material unlock)
      if (consumable.id === 'alchemist' && (result.gameState as any).__unlockMaterial) {
        const materialId = (result.gameState as any).__unlockMaterial;
        delete (result.gameState as any).__unlockMaterial; // Clean up temporary flag
        result.unlockInfo = { type: 'material', id: materialId };
      }
    }
    return result;
  }
  
  if (dieSideSelectionInput !== undefined && (
    consumable.id === 'emptyAsAPocket' || consumable.id === 'moneyPip' || 
    consumable.id === 'stallion' || consumable.id === 'practice' || 
    consumable.id === 'phantom' || consumable.id === 'accumulation'
  )) {
    const result = applyDieSideSelectionConsumable(
      consumable.id as 'emptyAsAPocket' | 'moneyPip' | 'stallion' | 'practice' | 'phantom' | 'accumulation',
      dieSideSelectionInput.dieIndex,
      dieSideSelectionInput.sideValue,
      newGameState,
      newRoundState || null
    );
    // Update last consumable used and add unlock info
    if (result.success && result.shouldRemove) {
      updateLastConsumableUsed(result.gameState, consumable);
      // Add unlock info for pip effects
      const pipEffectMap: Record<string, string> = {
        'emptyAsAPocket': 'blank',
        'moneyPip': 'money',
        'stallion': 'wild',
        'practice': 'upgradeCombo',
        'phantom': 'twoFaced',
        'accumulation': 'createConsumable'
      };
      const pipEffectId = pipEffectMap[consumable.id];
      if (pipEffectId) {
        result.unlockInfo = { type: 'pip_effect', id: pipEffectId };
      }
    }
    return result;
  }

  switch (consumable.id) {
    case 'alchemist':
      // Alchemist works with selected dice on the board - no special handling needed
      // If no dice are selected, it will fail when dieSelectionInput is undefined
      shouldRemove = false;
      wasSuccessfullyUsed = false;
      break;

    case 'liquidation':
      newGameState.money = (newGameState.money || 0) * 2;
      break;

    case 'freebie': {
      // Add a new default die to the dice set
      const newDieId = `d${newGameState.diceSet.length + 1}`;
      const newDie = {
        id: newDieId,
        sides: 6,
        allowedValues: [1, 2, 3, 4, 5, 6],
        material: 'plastic' as DiceMaterialType
      };
      newGameState.diceSet = [...newGameState.diceSet, newDie];
      (newGameState as any).__newDieAdded = true; // Flag for sound effect
      break;
    }

    case 'youGetACharm': {
      const maxCharms = newGameState.charmSlots || 3;
      if (newGameState.charms.length >= maxCharms) {
        shouldRemove = false;
        break;
      }
      // Find available charms not already owned
      const ownedIds = new Set(newGameState.charms.map((c: any) => c.id));
      const available = CHARMS.filter((c: any) => !ownedIds.has(c.id));
      if (available.length === 0) {
        shouldRemove = false;
        break;
      }
      const randomIdx = Math.floor(Math.random() * available.length);
      const newCharm = { ...available[randomIdx], active: true };
      newGameState.charms = [...newGameState.charms, newCharm];
      charmManager.addCharm(newCharm);
      break;
    }

    case 'slotExpander': { // Legacy/placeholder - not in current consumable data
      newGameState.charmSlots = (newGameState.charmSlots || 3) + 1;
      newGameState.consumableSlots = (newGameState.consumableSlots || 2) + 1;
      break;
    }

    case 'groceryList': {
      // Try to create 2 random consumables
      const maxConsumables = newGameState.consumableSlots || 2;
      const availableSlotsAfterRemoval = maxConsumables - (newGameState.consumables.length - 1);
      
      // Get all consumables, excluding ones already owned
      const ownedIds = new Set(newGameState.consumables.map(c => c.id));
      const allConsumables = [...CONSUMABLES, ...WHIMS, ...WISHES];
      const available = allConsumables.filter(c => !ownedIds.has(c.id));
      if (available.length === 0) {
        shouldRemove = false;
        wasSuccessfullyUsed = false;
        break;
      }
      
      // Select up to 2 random consumables
      const selected: any[] = [];
      const indices = new Set<number>();
      const numToSelect = Math.min(2, available.length);
      while (selected.length < numToSelect && indices.size < available.length) {
        const randomIdx = Math.floor(Math.random() * available.length);
        if (!indices.has(randomIdx)) {
          indices.add(randomIdx);
          selected.push(available[randomIdx]);
        }
      }
      
      // Create consumable objects with uses property
      const newConsumables = selected.map(c => ({ ...c, uses: 1 }));
      
      // If we have 1+ slots available after removal, we can create 2 (1 in new slot + 1 replacing groceryList)
      if (availableSlotsAfterRemoval >= 1 && newConsumables.length >= 2) {
        // Add both consumables and remove groceryList
        newGameState.consumables = [...newGameState.consumables, ...newConsumables];
        // Remove groceryList (will be handled by shouldRemove = true)
      } else if (newConsumables.length >= 1) {
        // If 0 slots available, only create 1 (replacing groceryList)
        newGameState.consumables[idx] = newConsumables[0];
        shouldRemove = false;
      } else {
        shouldRemove = false;
        wasSuccessfullyUsed = false;
      }
      
      // Flag for sound effect
      (newGameState as any).__consumableGenerated = true;
      // Dispatch events to unlock each generated consumable
      if (typeof window !== 'undefined') {
        newConsumables.forEach((consumable: any) => {
          window.dispatchEvent(new CustomEvent('itemGenerated', { 
            detail: { type: 'consumable', id: consumable.id } 
          }));
        });
      }
      break;
    }

    case 'echo': {
      // Get the last consumable used (tracked by updateLastConsumableUsed when other consumables are used)
      const lastConsumable = (newGameState as any).lastConsumableUsed;
      if (!lastConsumable) {
        shouldRemove = false;
        wasSuccessfullyUsed = false;
        break;
      }
      const maxConsumables = newGameState.consumableSlots || 2;
      if (newGameState.consumables.length >= maxConsumables) {
        shouldRemove = false;
        wasSuccessfullyUsed = false;
        break;
      }
      // Create a copy of the last consumable used (reset uses to 1)
      // Handle both object and string ID formats for backwards compatibility
      let copiedConsumable: any;
      if (typeof lastConsumable === 'string') {
        // If it's just an ID string, try to find the consumable in the available consumables
        const allConsumables = [...CONSUMABLES, ...WHIMS, ...WISHES, ...COMBINATION_UPGRADES];
        const foundConsumable = allConsumables.find(c => c.id === lastConsumable);
        if (!foundConsumable) {
          shouldRemove = false;
          wasSuccessfullyUsed = false;
          break;
        }
        copiedConsumable = { ...foundConsumable, uses: 1 };
      } else {
        // It's already an object, just copy it
        copiedConsumable = { ...lastConsumable, uses: 1 };
      }
      newGameState.consumables = [...newGameState.consumables, copiedConsumable];
      break;
    }

    case 'garagesale': {
      let totalValue = 0;
      // Add value of consumables
      for (const consumable of newGameState.consumables) {
        const isWish = WISHES.some(w => w.id === consumable.id);
        const isWhim = WHIMS.some(w => w.id === consumable.id);
        const isCombinationUpgrade = COMBINATION_UPGRADES.some(cu => cu.id === consumable.id);
        const category = isWish ? 'wish' : (isWhim ? 'whim' : (isCombinationUpgrade ? 'combinationUpgrade' : 'whim'));
        const priceInfo = CONSUMABLE_PRICES[category] || CONSUMABLE_PRICES.whim;
        totalValue += priceInfo.sell;
      }
      // Add value of charms
      for (const charm of newGameState.charms) {
        const rarity = charm.rarity || 'common';
        const priceInfo = CHARM_PRICES[rarity] || CHARM_PRICES.common;
        totalValue += priceInfo.sell;
      }
      // Add value of blessings (fixed price)
      totalValue += (newGameState.blessings.length * 5); // BLESSING_PRICE = 5
      newGameState.money = (newGameState.money || 0) + Math.min(totalValue, 100);
      break;
    }

    case 'doubleMoneyCapped': { // Legacy/placeholder - not in current consumable data
      const currentMoney = newGameState.money || 0;
      const doubled = currentMoney * 2;
      newGameState.money = Math.min(doubled, 100);
      break;
    }

    case 'grabBag': {
      // Try to create 2 random combination upgrades
      // Available slots after removing grab bag = max slots - (current consumables - 1)
      const maxConsumables = newGameState.consumableSlots || 2;
      const availableSlotsAfterRemoval = maxConsumables - (newGameState.consumables.length - 1);
      
      // Get all combination upgrades, excluding ones already owned
      const ownedIds = new Set(newGameState.consumables.map(c => c.id));
      const available = COMBINATION_UPGRADES.filter(c => !ownedIds.has(c.id));
      if (available.length === 0) {
        shouldRemove = false;
        wasSuccessfullyUsed = false;
        break;
      }
      
      // Select up to 2 random combination upgrades
      const selected: any[] = [];
      const indices = new Set<number>();
      const numToSelect = Math.min(2, available.length);
      while (selected.length < numToSelect && indices.size < available.length) {
        const randomIdx = Math.floor(Math.random() * available.length);
        if (!indices.has(randomIdx)) {
          indices.add(randomIdx);
          selected.push(available[randomIdx]);
        }
      }
      
      // Create consumable objects with uses property
      const newConsumables = selected.map(c => ({ ...c, uses: c.uses || 1 }));
      
      if (availableSlotsAfterRemoval >= 1 && newConsumables.length >= 2) {
        newGameState.consumables = [...newGameState.consumables, ...newConsumables];
      } else if (newConsumables.length >= 1) {
        newGameState.consumables[idx] = newConsumables[0];
        shouldRemove = false;
      } else {
        shouldRemove = false;
        wasSuccessfullyUsed = false;
      }
      break;
    }

    case 'midasTouch': {
      // Requires user input - return request for single die selection
      return {
        success: true,
        shouldRemove: false,
        requiresInput: {
          type: 'dieSelection',
          consumableId: 'midasTouch',
          diceSet: newGameState.diceSet
        },
        gameState: newGameState,
        roundState: newRoundState
      };
    }

    case 'freebie': {
      // Generate unique ID by finding the highest existing die number and incrementing
      // Parse all existing IDs to find the max numeric part
      const existingIds = newGameState.diceSet.map(d => {
        // Match patterns like "d1", "d2_1234567890", etc.
        const match = d.id.match(/^d(\d+)(?:_\d+)?$/);
        return match ? parseInt(match[1], 10) : 0;
      });
      const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
      // Use timestamp + random to ensure uniqueness even if multiple freebies are used simultaneously
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const newDieId = `d${maxId + 1}_${timestamp}_${random}`;
      const newDie = {
        id: newDieId,
        sides: 6,
        allowedValues: [1, 2, 3, 4, 5, 6],
        material: 'plastic' as DiceMaterialType
      };
      newGameState.diceSet = [...newGameState.diceSet, newDie];
      // Track that a new die was added for sound effects
      (newGameState as any).__newDieAdded = true;
      break;
    }

    case 'jackpot': {
      // Give shop vouchers (2 by default, 5 if blessing tier 2)
      let vouchersToGive = 2;
      for (const blessing of newGameState.blessings || []) {
        if (blessing.effect.type === 'shopVoucherBonus') {
          vouchersToGive = blessing.effect.amount;
          break;
        }
      }
      newGameState.shopVouchers = (newGameState.shopVouchers || 0) + vouchersToGive;
      break;
    }

    case 'sacrifice': {
      if (!newRoundState || !newRoundState.diceHand || newRoundState.diceHand.length <= 1) {
        shouldRemove = false;
        wasSuccessfullyUsed = false;
        break;
      }
      
      // Delete a random die from diceHand (the dice currently on the board)
      const randomIndex = Math.floor(Math.random() * newRoundState.diceHand.length);
      const dieToRemove = newRoundState.diceHand[randomIndex];
      
      // Remove from diceHand
      newRoundState.diceHand = newRoundState.diceHand.filter((_, i) => i !== randomIndex);
      
      // Also remove from diceSet by matching ID
      newGameState.diceSet = newGameState.diceSet.filter(d => d.id !== dieToRemove.id);
      
      // Track for Assassin charm (cumulative destroyed dice)
      const { incrementAssassinDestroyedDice } = await import('./charms/UncommonCharms');
      incrementAssassinDestroyedDice(newGameState);
      
      // Add charm slot
      newGameState.charmSlots = (newGameState.charmSlots || 3) + 1;
      break;
    }

    case 'welfare': {
      // Upgrade all combination categories by 2 levels
      const combinationLevels = { ...newGameState.history.combinationLevels };
      
      for (const key in combinationLevels) {
        const currentLevel = combinationLevels[key] || 1;
        combinationLevels[key] = currentLevel + 2;
      }
      
      (newGameState as any).__combinationUpgraded = true;
      
      newGameState.history = {
        ...newGameState.history,
        combinationLevels
      };
      break;
    }

    // Combination Upgrade consumables - upgrade all combinations of a specific type by 1 level
    case 'upgradeSingleN':
    case 'upgradeNPairs':
    case 'upgradeNOfAKind':
    case 'upgradeStraightOfN':
    case 'upgradePyramidOfN': {
      // Get the combination type from the consumable
      const combinationUpgrade = COMBINATION_UPGRADES.find(cu => cu.id === consumable.id);
      if (!combinationUpgrade) {
        shouldRemove = false;
        wasSuccessfullyUsed = false;
        break;
      }
      
      const targetType = combinationUpgrade.combinationType;
      const combinationLevels = { ...newGameState.history.combinationLevels };
      const numDice = newGameState.diceSet.length;
      
      // Generate all possible combination keys for this type based on dice set
      const possibleKeys: string[] = [];
      
      if (targetType === 'singleN') {
        possibleKeys.push('singleN:1', 'singleN:5');
      } else if (targetType === 'nPairs') {
        for (let n = 1; n <= Math.floor(numDice / 2); n++) {
          possibleKeys.push(`nPairs:${n}`);
        }
      } else if (targetType === 'nOfAKind') {
        for (let n = 3; n <= numDice; n++) {
          possibleKeys.push(`nOfAKind:${n}`);
        }
      } else if (targetType === 'straightOfN') {
        for (let n = 4; n <= numDice; n++) {
          possibleKeys.push(`straightOfN:${n}`);
        }
      } else if (targetType === 'pyramidOfN') {
        for (let n = 3; ; n++) {
          const pyramidSize = (n * (n + 1)) / 2;
          if (pyramidSize > numDice) break;
          possibleKeys.push(`pyramidOfN:${pyramidSize}`);
        }
      }
      
      // Upgrade all possible combinations of this type by 1 level
      for (const key of possibleKeys) {
        combinationLevels[key] = (combinationLevels[key] || 1) + 1;
      }
      
      // Flag for sound effect
      (newGameState as any).__combinationUpgraded = true;
      
      newGameState.history = {
        ...newGameState.history,
        combinationLevels
      };
      break;
    }

    case 'upgradeNTuplets': {
      // Upgrade all existing tuplet combination levels by 1
      const combinationLevels = { ...newGameState.history.combinationLevels };
      const tupletTypes = ['nTriplets', 'nQuadruplets', 'nQuintuplets', 'nSextuplets', 'nSeptuplets', 'nOctuplets', 'nNonuplets', 'nDecuplets'];
      
      for (const key in combinationLevels) {
        if (tupletTypes.some(type => key.startsWith(`${type}:`))) {
          combinationLevels[key] = combinationLevels[key] + 1;
        }
      }
      
      // Flag for sound effect
      (newGameState as any).__combinationUpgraded = true;
      
      newGameState.history = {
        ...newGameState.history,
        combinationLevels
      };
      break;
    }

    case 'origin': {
      const maxCharms = newGameState.charmSlots || 3;
      // Check if use was successful (has slot and available charms)
      if (newGameState.charms.length >= maxCharms) {
        shouldRemove = false;
        wasSuccessfullyUsed = false;
        break;
      }
      // Find available legendary charms not already owned
      const ownedIds = new Set(newGameState.charms.map(c => c.id));
      const available = CHARMS.filter(c => !ownedIds.has(c.id) && c.rarity === 'legendary');
      if (available.length === 0) {
        shouldRemove = false;
        wasSuccessfullyUsed = false;
        break;
      }
      // Use was successful - consume the consumable
      // For 'origin', 50% chance to create legendary charm
      if (Math.random() < 0.5) {
        const randomIdx = Math.floor(Math.random() * available.length);
        const newCharm = { ...available[randomIdx], active: true };
        newGameState.charms = [...newGameState.charms, newCharm];
        charmManager.addCharm(newCharm);
        // Dispatch event to unlock the generated charm
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('itemGenerated', { 
            detail: { type: 'charm', id: newCharm.id } 
          }));
        }
      }
      // Consume the consumable regardless of whether legendary was created
      break;
    }

    case 'distortion': {
      const maxCharms = newGameState.charmSlots || 3;
      const availableSlots = maxCharms - newGameState.charms.length;
      const numToCreate = 1; // Distortion creates 1 rare charm
      if (availableSlots < numToCreate) {
        shouldRemove = false;
        break;
      }
      // Find available rare charms not already owned
      const ownedIds = new Set(newGameState.charms.map(c => c.id));
      const available = CHARMS.filter(c => !ownedIds.has(c.id) && c.rarity === 'rare');
      if (available.length < numToCreate) {
        shouldRemove = false;
        break;
      }
      // Select random rare charms
      const selected: typeof CHARMS = [];
      const indices = new Set<number>();
      while (selected.length < numToCreate && indices.size < available.length) {
        const randomIdx = Math.floor(Math.random() * available.length);
        if (!indices.has(randomIdx)) {
          indices.add(randomIdx);
          selected.push(available[randomIdx]);
        }
      }
      const newCharms = selected.map(c => ({ ...c, active: true }));
      newGameState.charms = [...newGameState.charms, ...newCharms];
      newCharms.forEach(charm => {
        charmManager.addCharm(charm);
        // Dispatch event to unlock each generated charm
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('itemGenerated', { 
            detail: { type: 'charm', id: charm.id } 
          }));
        }
      });
      break;
    }

    case 'frankenstein': {
      if (newGameState.charms.length < 1) {
        shouldRemove = false;
        wasSuccessfullyUsed = false;
        break;
      }
      
      // Step 1: Copy a random charm first
      const charmToCopyIndex = Math.floor(Math.random() * newGameState.charms.length);
      const charmToCopy = newGameState.charms[charmToCopyIndex];
      const copiedCharm = { 
        ...charmToCopy, 
        id: `${charmToCopy.id}_copy_${Date.now()}`
      };
      
      // Step 2: Add the copy to the charms array
      newGameState.charms = [...newGameState.charms, copiedCharm];
      
      // Step 3: Destroy 0, 1, or 2 random charms (never the original or the copy)
      const numToDestroy = Math.floor(Math.random() * 3); // 0, 1, or 2
      const indicesToDelete = new Set<number>();
      const protectedIndices = new Set([charmToCopyIndex, newGameState.charms.length - 1]); // Original and copy
      
      // Get all indices that can be deleted (not protected)
      const availableIndices = newGameState.charms
        .map((_, i) => i)
        .filter(i => !protectedIndices.has(i));
      
      // Randomly select up to numToDestroy indices to delete
      const shuffled = [...availableIndices].sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(numToDestroy, shuffled.length); i++) {
        indicesToDelete.add(shuffled[i]);
      }
      
      // Remove the selected charms
      if (indicesToDelete.size > 0) {
        // Update charm manager - remove deleted charms
        indicesToDelete.forEach(idx => {
          const charmToRemove = newGameState.charms[idx];
          if (charmToRemove) {
            charmManager.removeCharm(charmToRemove.id);
          }
        });
        
        // Remove from charms array
        newGameState.charms = newGameState.charms.filter((_, i) => !indicesToDelete.has(i));
      }
      
      // Add the copied charm to charm manager
      charmManager.addCharm(copiedCharm);
      break;
    }

    case 'chisel': {
      // Requires user input - return request for up to two dice selection
      return {
        success: true,
        shouldRemove: false, // Will be set after user input
        requiresInput: {
          type: 'twoDieSelection',
          consumableId: 'chisel',
          diceSet: newGameState.diceSet
        },
        gameState: newGameState,
        roundState: newRoundState
      };
    }

    case 'potteryWheel': {
      // Requires user input - return request for two die selection
      return {
        success: true,
        shouldRemove: false, // Will be set after user input
        requiresInput: {
          type: 'twoDieSelection',
          consumableId: 'potteryWheel',
          diceSet: newGameState.diceSet
        },
        gameState: newGameState,
        roundState: newRoundState
      };
    }

    case 'hospital': {
      if (!newRoundState) {
        shouldRemove = false;
        wasSuccessfullyUsed = false;
        break;
      }
      const lastForfeit = newRoundState.forfeitedPoints || 0;
      const recovered = Math.floor(lastForfeit * 1.25);
      if (recovered > 0) {
        newRoundState.roundPoints += recovered;
      } else {
        shouldRemove = false;
        wasSuccessfullyUsed = false;
      }
      break;
    }

    case 'emptyAsAPocket':
    case 'moneyPip':
    case 'stallion':
    case 'practice':
    case 'phantom':
    case 'accumulation': {
      // These require die side selection - return request
      return {
        success: true,
        shouldRemove: false, // Will be set after user input
        requiresInput: {
          type: 'dieSideSelection',
          consumableId: consumable.id as any,
          diceSet: newGameState.diceSet
        },
        gameState: newGameState,
        roundState: newRoundState
      };
    }

    case 'luckyToken': { // Legacy/placeholder - not in current consumable data
      if (!newRoundState) {
        shouldRemove = false;
        break;
      }
      // Check for Weighted Dice charm
      let weighted = false;
      if (charmManager && typeof charmManager.hasCharm === 'function') {
        weighted = charmManager.hasCharm('weightedDice');
      }
      // Three possible effects
      const effects = ['doublePoints', 'extraReroll', 'instantBank'];
      let probabilities = [1/3, 1/3, 1/3];
      if (weighted) {
        // Double each probability, cap at 1.0
        probabilities = probabilities.map(p => Math.min(p * 2, 1.0));
      }
      // Normalize if any probability > 1.0 (shouldn't happen with 3 effects)
      const total = probabilities.reduce((a, b) => a + b, 0);
      probabilities = probabilities.map(p => p / total);
      // Pick effect
      let rand = Math.random();
      let acc = 0;
      let chosenEffect = effects[0];
      for (let i = 0; i < effects.length; i++) {
        acc += probabilities[i];
        if (rand < acc) {
          chosenEffect = effects[i];
          break;
        }
      }
      if (chosenEffect === 'doublePoints') {
        newRoundState.roundPoints *= 2;
      } else if (chosenEffect === 'extraReroll') {
        // Add extra reroll to level state (not round state)
        if (newGameState.currentWorld?.currentLevel) {
          newGameState.currentWorld = {
            ...newGameState.currentWorld,
            currentLevel: {
              ...newGameState.currentWorld.currentLevel,
              rerollsRemaining: (newGameState.currentWorld.currentLevel.rerollsRemaining || 0) + 1
            }
          };
        }
      } else if (chosenEffect === 'instantBank') {
        // Store instant bank flag in round state
        (newRoundState as any).instantBank = true;
      }
      break;
    }

    case 'interest': {
      // Restore banks to maximum (after bonuses)
      if (!newGameState.currentWorld?.currentLevel) {
        shouldRemove = false;
        wasSuccessfullyUsed = false;
        break;
      }
      const maxBanks = newGameState.currentWorld.currentLevel.maxBanksAfterBonuses ?? 0;
      newGameState.currentWorld = {
        ...newGameState.currentWorld,
        currentLevel: {
          ...newGameState.currentWorld.currentLevel,
          banksRemaining: maxBanks
        }
      };
      break;
    }

    case 'mulligan': {
      // Restore rerolls to maximum (after bonuses)
      if (!newGameState.currentWorld?.currentLevel) {
        shouldRemove = false;
        wasSuccessfullyUsed = false;
        break;
      }
      const maxRerolls = newGameState.currentWorld.currentLevel.maxRerollsAfterBonuses ?? 0;
      newGameState.currentWorld = {
        ...newGameState.currentWorld,
        currentLevel: {
          ...newGameState.currentWorld.currentLevel,
          rerollsRemaining: maxRerolls
        }
      };
      break;
    }

    default:
      shouldRemove = false;
      wasSuccessfullyUsed = false;
  }

  // All consumables have 1 use, so if successfully used (shouldRemove = true), always remove it
  if (shouldRemove) {
    // Consumable was successfully used, mark as such
    wasSuccessfullyUsed = true;
    // All consumables have 1 use, so always remove after successful use
    shouldRemove = true;
    
    // Update last consumable used tracking (for Echo consumable) - only after successful use
    updateLastConsumableUsed(newGameState, consumable);
  } else {
    // shouldRemove is false, so the consumable couldn't be used
    wasSuccessfullyUsed = false;
  }

  // Check if Whim Whisperer prevented consumption
  if ((newGameState as any).whimWhispererPreventedConsumption) {
    shouldRemove = false;
    delete (newGameState as any).whimWhispererPreventedConsumption;
  }
  
  // success = true if the consumable was successfully used
  // success = false if the consumable couldn't be used (e.g., no valid targets)
  return {
    success: wasSuccessfullyUsed,
    shouldRemove,
    gameState: newGameState,
    roundState: newRoundState,
    unlockInfo
  };
}

/**
 * Apply die side selection for pip effect consumables
 * Pure function - processes the user's die and side selection
 */
export function applyDieSideSelectionConsumable(
  consumableId: 'emptyAsAPocket' | 'moneyPip' | 'stallion' | 'practice' | 'phantom' | 'accumulation',
  dieIndex: number,
  sideValue: number,
  gameState: GameState,
  roundState: RoundState | null
): ConsumableEffectResult {
  const newGameState = { ...gameState };
  const newRoundState = roundState ? { ...roundState } : undefined;
  let shouldRemove = true;

  // dieIndex is from diceHand, find the corresponding die in diceSet by matching the die from diceHand
  const diceHandDie = roundState?.diceHand?.[dieIndex];
  if (!diceHandDie) {
    return {
      success: false,
      shouldRemove: false,
      gameState: newGameState
    };
  }

  // Find the die in diceSet by matching ID
  const diceSetIndex = newGameState.diceSet.findIndex(d => d.id === diceHandDie.id);
  if (diceSetIndex === -1) {
    return {
      success: false,
      shouldRemove: false,
      gameState: newGameState
    };
  }

  const selectedDie = newGameState.diceSet[diceSetIndex];

  // Check if the side value is valid for this die
  if (!selectedDie.allowedValues.includes(sideValue)) {
    return {
      success: false,
      shouldRemove: false,
      gameState: newGameState
    };
  }

  // Map consumable IDs to pip effect types
  const pipEffectMap: Record<string, PipEffectType> = {
    'emptyAsAPocket': 'blank',
    'moneyPip': 'money',
    'stallion': 'wild',
    'practice': 'upgradeCombo',
    'phantom': 'twoFaced',
    'accumulation': 'createConsumable'
  };

  const pipEffectType = pipEffectMap[consumableId];
  if (!pipEffectType) {
    return {
      success: false,
      shouldRemove: false,
      gameState: newGameState
    };
  }

  // Add pip effect to the selected side in diceSet
  newGameState.diceSet = newGameState.diceSet.map((die, i) => {
    if (i === diceSetIndex) {
      const newPipEffects = { ...(die.pipEffects || {}) };
      newPipEffects[sideValue] = pipEffectType;
      return {
        ...die,
        pipEffects: newPipEffects
      };
    }
    return die;
  });

  // Also update the die in diceHand so it shows immediately on the board
  if (newRoundState && newRoundState.diceHand) {
    newRoundState.diceHand = newRoundState.diceHand.map((die, i) => {
      if (i === dieIndex) {
        const newPipEffects = { ...(die.pipEffects || {}) };
        newPipEffects[sideValue] = pipEffectType;
        return {
          ...die,
          pipEffects: newPipEffects
        };
      }
      return die;
    });
  }

  return {
    success: true,
    shouldRemove,
    gameState: newGameState,
    roundState: newRoundState
  };
}

/**
 * Apply die selection for consumables that require die selection
 * Pure function - processes the user's die selection
 */
export function applyDieSelectionConsumable(
  consumableId: 'chisel' | 'potteryWheel' | 'midasTouch' | 'alchemist',
  selectedDieIndex: number | [number, number],
  gameState: GameState,
  roundState: RoundState | null
): ConsumableEffectResult {
  const newGameState = { ...gameState };
  const newRoundState = roundState ? { ...roundState } : undefined;
  let shouldRemove = true;

  if (consumableId === 'midasTouch') {
    // Handle single die selection for midasTouch
    // Copy material from a random die in the hand (excluding the selected die) to the selected die
    if (typeof selectedDieIndex !== 'number') {
      return {
        success: false,
        shouldRemove: false,
        gameState: newGameState
      };
    }
    
    // Find the die in diceHand first
    const diceHandDie = newRoundState?.diceHand?.[selectedDieIndex];
    if (!diceHandDie) {
      return {
        success: false,
        shouldRemove: false,
        gameState: newGameState
      };
    }
    
    // Find the corresponding die in diceSet by matching ID
    const targetDiceSetIndex = newGameState.diceSet.findIndex(d => d.id === diceHandDie.id);
    if (targetDiceSetIndex === -1) {
      return {
        success: false,
        shouldRemove: false,
        gameState: newGameState
      };
    }
    
    // Get all dice in the hand EXCEPT the selected die
    const availableDice = (newRoundState?.diceHand || []).filter((_, idx) => idx !== selectedDieIndex);
    
    if (availableDice.length === 0) {
      // No other dice in hand - can't copy, but this shouldn't happen in normal gameplay
      return {
        success: false,
        shouldRemove: false,
        gameState: newGameState
      };
    }
    
    // Pick a random die from the available dice (excluding the selected die)
    const randomSourceDie = availableDice[Math.floor(Math.random() * availableDice.length)];
    
    // Find the source die in diceSet by matching ID
    const sourceDiceSetIndex = newGameState.diceSet.findIndex(d => d.id === randomSourceDie.id);
    if (sourceDiceSetIndex === -1) {
      return {
        success: false,
        shouldRemove: false,
        gameState: newGameState
      };
    }
    
    const sourceDie = newGameState.diceSet[sourceDiceSetIndex];
    
    // Copy material from source to target
    const copiedMaterial = sourceDie.material;
    newGameState.diceSet = newGameState.diceSet.map((die, i) =>
      i === targetDiceSetIndex
        ? { ...die, material: copiedMaterial }
        : die
    );
    
    // Also update material in diceHand so it shows immediately on the board
    if (newRoundState && newRoundState.diceHand) {
      newRoundState.diceHand = newRoundState.diceHand.map((die, i) =>
        i === selectedDieIndex
          ? { ...die, material: copiedMaterial }
          : die
      );
    }
    
    // Track the material change for sound effects
    (newGameState as any).__materialChanged = copiedMaterial;
  } else if (consumableId === 'alchemist') {
    // Handle single die selection for alchemist
    // selectedDieIndex is from diceHand, need to find corresponding die in diceSet
    if (typeof selectedDieIndex !== 'number') {
      return {
        success: false,
        shouldRemove: false,
        gameState: newGameState
      };
    }
    
    // Find the die in diceHand first
    const diceHandDie = newRoundState?.diceHand?.[selectedDieIndex];
    if (!diceHandDie) {
      return {
        success: false,
        shouldRemove: false,
        gameState: newGameState
      };
    }
    
    // Find the corresponding die in diceSet by matching ID
    const diceSetIndex = newGameState.diceSet.findIndex(d => d.id === diceHandDie.id);
    if (diceSetIndex === -1) {
      return {
        success: false,
        shouldRemove: false,
        gameState: newGameState
      };
    }
    
    const currentDie = newGameState.diceSet[diceSetIndex];
    const currentMaterial = currentDie.material;
    
    // Get all non-plastic materials (excluding plastic as it's the default)
    const nonPlasticMaterials: DiceMaterialType[] = ['crystal', 'flower', 'golden', 'volcano', 'mirror', 'rainbow', 'ghost', 'lead', 'lunar'];
    
    // Exclude the current material to guarantee a change
    const availableMaterials = nonPlasticMaterials.filter(m => m !== currentMaterial);
    
    // If somehow all materials are excluded (shouldn't happen), fall back to all non-plastic
    const materialsToChooseFrom = availableMaterials.length > 0 ? availableMaterials : nonPlasticMaterials;
    
    // Pick a random material from available options
    const randomMaterial = materialsToChooseFrom[Math.floor(Math.random() * materialsToChooseFrom.length)];
    
    // Update material in diceSet
    newGameState.diceSet = newGameState.diceSet.map((die, i) =>
      i === diceSetIndex
        ? { ...die, material: randomMaterial }
        : die
    );
    
    // Also update material in diceHand so it shows immediately on the board
    if (newRoundState && newRoundState.diceHand) {
      newRoundState.diceHand = newRoundState.diceHand.map((die, i) =>
        i === selectedDieIndex
          ? { ...die, material: randomMaterial }
          : die
      );
    }
    
    // Track the new material for unlocking (will be handled by WebGameManager)
    (newGameState as any).__unlockMaterial = randomMaterial;
    // Track the material change for sound effects
    (newGameState as any).__materialChanged = randomMaterial;
  } else if (consumableId === 'chisel' || consumableId === 'potteryWheel') {
    // Handle up to two die selection for chisel/potteryWheel - modify rolled values in diceHand
    if (!Array.isArray(selectedDieIndex)) {
      return {
        success: false,
        shouldRemove: false,
        gameState: newGameState
      };
    }

    const numSelected: number = selectedDieIndex.length;
    if (numSelected === 0 || numSelected > 2) {
      return {
        success: false,
        shouldRemove: false,
        gameState: newGameState
      };
    }

    if (!newRoundState || !newRoundState.diceHand || newRoundState.diceHand.length === 0) {
      return {
        success: false,
        shouldRemove: false,
        gameState: newGameState
      };
    }

    // Validate all selected dice exist
    const selectedIndices: number[] = numSelected === 1 ? [selectedDieIndex[0] as number] : [...selectedDieIndex] as number[];
    for (const dieIndex of selectedIndices) {
      if (dieIndex < 0 || dieIndex >= newRoundState.diceHand.length || !newRoundState.diceHand[dieIndex]) {
        return {
          success: false,
          shouldRemove: false,
          gameState: newGameState
        };
      }
    }

    // Modify both diceSet (allowed values) and diceHand (rolled values)
    // First, find the corresponding dice in diceSet by matching IDs
    const diceToModify: Array<{ diceSetIndex: number; die: any }> = [];
    for (const dieIndex of selectedIndices) {
      const diceHandDie = newRoundState.diceHand[dieIndex];
      if (!diceHandDie) continue;
      
      const diceSetIndex = newGameState.diceSet.findIndex(d => d.id === diceHandDie.id);
      if (diceSetIndex !== -1) {
        diceToModify.push({ diceSetIndex, die: newGameState.diceSet[diceSetIndex] });
      }
    }

    // Modify diceSet - update allowed values
    newGameState.diceSet = newGameState.diceSet.map((die, i) => {
      const toModify = diceToModify.find(d => d.diceSetIndex === i);
      if (toModify) {
        const newAllowedValues = die.allowedValues.map(val => {
          if (consumableId === 'chisel') {
            return val + 1 as any; 
          } else {
            return Math.max(1, val - 1) as any;
          }
        });
        return { ...die, allowedValues: newAllowedValues };
      }
      return die;
    });

    // Modify diceHand - update rolled values
    newRoundState.diceHand = newRoundState.diceHand.map((die, i) => {
      if (selectedIndices.includes(i)) {
        const currentValue = die.rolledValue ?? 1;
        if (consumableId === 'chisel') {
          return { ...die, rolledValue: currentValue + 1 };
        } else {
          return { ...die, rolledValue: Math.max(1, currentValue - 1) };
        }
      }
      return die;
    });
  }

  return {
    success: true,
    shouldRemove,
    gameState: newGameState,
    roundState: newRoundState
  };
}
