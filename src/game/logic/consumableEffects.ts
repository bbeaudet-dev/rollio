import { CHARMS, CHARM_PRICES } from '../data/charms';
import { CONSUMABLES, WHIMS, WISHES } from '../data/consumables';
import { MATERIALS } from '../data/materials';
import { getNextDieSize, getPreviousDieSize } from '../utils/dieSizeUtils';
import { GameState, RoundState, DiceMaterialType } from '../types';
import { PipEffectType } from '../data/pipEffects';

const CONSUMABLE_PRICES: Record<string, { buy: number; sell: number }> = {
  wish: { buy: 8, sell: 4 },
  whim: { buy: 4, sell: 2 },
};

/**
 * Update last consumable used tracking and Echo consumable description
 * Pure function that modifies gameState in place
 */
export function updateLastConsumableUsed(gameState: GameState, consumable: any): void {
  // Track the last consumable used (for Echo consumable) - but only if it's not Echo itself
  if (consumable && consumable.id !== 'echo') {
    (gameState as any).lastConsumableUsed = { ...consumable };
    
    // Update Echo consumable description
    const echoIndex = gameState.consumables.findIndex((c: any) => c.id === 'echo');
    if (echoIndex >= 0) {
      gameState.consumables[echoIndex] = {
        ...gameState.consumables[echoIndex],
        description: `Create the last consumable used: ${consumable.name || 'Unknown'}`
      };
    }
  }
}

export interface ConsumableEffectResult {
  success: boolean;
  shouldRemove: boolean;
  requiresInput?: {
    type: 'dieSelection' | 'dieSideSelection' | 'twoDieSelection';
    consumableId: 'chisel' | 'potteryWheel' | 'midasTouch' | 'emptyAsAPocket' | 'moneyPip' | 'stallion' | 'practice' | 'phantom' | 'accumulation';
    diceSet: any[];
  };
  gameState: GameState;
  roundState?: RoundState;
}

/**
 * Apply consumable effect with die selection (for consumables that require die selection)
 * This is called from applyConsumableEffect when input is provided
 */
function applyConsumableWithDieSelection(
  consumableId: 'chisel' | 'potteryWheel' | 'midasTouch',
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
 * Apply consumable effect - pure function
 * Returns only state changes - no messages, no I/O
 */
export function applyConsumableEffect(
  idx: number,
  gameState: GameState,
  roundState: RoundState | null,
  charmManager: any,
  dieSelectionInput?: number | [number, number], // For chisel, potteryWheel, midasTouch
  dieSideSelectionInput?: { dieIndex: number; sideValue: number } // For pip effect consumables
): ConsumableEffectResult {
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
  
  // Handle consumables that require input - if input is provided, process it
  if (dieSelectionInput !== undefined && (consumable.id === 'chisel' || consumable.id === 'potteryWheel' || consumable.id === 'midasTouch')) {
    const result = applyDieSelectionConsumable(
      consumable.id as 'chisel' | 'potteryWheel' | 'midasTouch',
      dieSelectionInput,
      newGameState,
      newRoundState || null
    );
    // Update last consumable used and return
    if (result.success && result.shouldRemove) {
      updateLastConsumableUsed(result.gameState, consumable);
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
    // Update last consumable used and return
    if (result.success && result.shouldRemove) {
      updateLastConsumableUsed(result.gameState, consumable);
    }
    return result;
  }

  switch (consumable.id) {
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
      break;
    }

    case 'materialEnchanter': { // Legacy/placeholder - not in current consumable data
      // Find all plastic dice
      const plasticDice = newGameState.diceSet
        .map((die: any, idx: number) => ({ die, idx }))
        .filter(({ die }: { die: any }) => die.material === 'plastic');
      
      if (plasticDice.length === 0) {
        shouldRemove = false;
        wasSuccessfullyUsed = false;
        break;
      }
      
      // Check for Weighted Dice charm
      let baseProbability = 0.5; // 50% chance
      if (charmManager && typeof charmManager.hasCharm === 'function' && charmManager.hasCharm('weightedDice')) {
        baseProbability = Math.min(baseProbability * 2, 1.0); // 100% chance with Weighted Dice
      }
      
      // Check if enchantment succeeds
      if (Math.random() >= baseProbability) {
        shouldRemove = false;
        wasSuccessfullyUsed = false;
        break;
      }
      
      // Pick a random plastic die
      const chosen = plasticDice[Math.floor(Math.random() * plasticDice.length)];
      // Pick a random non-plastic material
      const nonPlasticMaterials = MATERIALS.filter((m: any) => m.id !== 'plastic');
      const newMaterial = nonPlasticMaterials[Math.floor(Math.random() * nonPlasticMaterials.length)];
      
      newGameState.diceSet = newGameState.diceSet.map((die, i) => 
        i === chosen.idx 
          ? { ...die, material: newMaterial.id as DiceMaterialType, abbreviation: newMaterial.abbreviation }
          : die
      );
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
      const maxConsumables = newGameState.consumableSlots || 2;
      // Account for the fact that groceryList will be removed, so we have 1 more slot
      const availableSlots = maxConsumables - (newGameState.consumables.length - 1);
      if (availableSlots < 2) {
        shouldRemove = false;
        wasSuccessfullyUsed = false;
        break;
      }
      // Get all consumables, excluding ones already owned
      const ownedIds = new Set(newGameState.consumables.map(c => c.id));
      const allConsumables = [...CONSUMABLES, ...WHIMS, ...WISHES];
      const available = allConsumables.filter(c => !ownedIds.has(c.id));
      if (available.length === 0) {
        shouldRemove = false;
        wasSuccessfullyUsed = false;
        break;
      }
      // Select 2 random consumables
      const selected: any[] = [];
      const indices = new Set<number>();
      while (selected.length < 2 && indices.size < available.length) {
        const randomIdx = Math.floor(Math.random() * available.length);
        if (!indices.has(randomIdx)) {
          indices.add(randomIdx);
          selected.push(available[randomIdx]);
        }
      }
      const toAdd = Math.min(selected.length, availableSlots);
      // Create consumable objects with uses property
      const consumablesToAdd = selected.slice(0, toAdd).map(c => ({ ...c, uses: 1 }));
      newGameState.consumables = [...newGameState.consumables, ...consumablesToAdd];
      break;
    }

    case 'echo': {
      // Get the last consumable used (tracked by GameAPI when other consumables are used)
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
      const copiedConsumable = { ...lastConsumable, uses: 1 };
      newGameState.consumables = [...newGameState.consumables, copiedConsumable];
      break;
    }

    case 'garagesale': {
      let totalValue = 0;
      // Add value of consumables
      for (const consumable of newGameState.consumables) {
        const isWish = WISHES.some(w => w.id === consumable.id);
        const isWhim = WHIMS.some(w => w.id === consumable.id);
        const category = isWish ? 'wish' : (isWhim ? 'whim' : 'whim');
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
      newGameState.money = (newGameState.money || 0) + totalValue;
      break;
    }

    case 'doubleMoneyCapped': { // Legacy/placeholder - not in current consumable data
      const currentMoney = newGameState.money || 0;
      const doubled = currentMoney * 2;
      newGameState.money = Math.min(doubled, 50);
      break;
    }

    case 'grabBag': {
      // TODO: Implement combination upgrade system
      // For now, this is a placeholder - combination upgrades need infrastructure
      // Combination upgrades likely modify combination point values
      shouldRemove = false; // Don't remove until implemented
      break;
    }

    case 'midasTouch': {
      // Requires user input - return request for two die selection
      return {
        success: true,
        shouldRemove: false,
        requiresInput: {
          type: 'twoDieSelection',
          consumableId: 'midasTouch',
          diceSet: newGameState.diceSet
        },
        gameState: newGameState,
        roundState: newRoundState
      };
    }

    case 'freebie': {
      const newDieId = `d${newGameState.diceSet.length + 1}`;
      const newDie = {
        id: newDieId,
        sides: 6,
        allowedValues: [1, 2, 3, 4, 5, 6],
        material: 'plastic' as DiceMaterialType
      };
      newGameState.diceSet = [...newGameState.diceSet, newDie];
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
      
      // Add charm slot
      newGameState.charmSlots = (newGameState.charmSlots || 3) + 1;
      break;
    }

    case 'welfare': {
      // TODO: Implement combination upgrade system
      // For now, this is a placeholder - combination upgrades need infrastructure
      shouldRemove = false; // Don't remove until implemented
      break;
    }

    case 'origin': {
      const maxCharms = newGameState.charmSlots || 3;
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
      // For 'origin', 50% chance to create legendary charm
      if (Math.random() >= 0.5) {
        shouldRemove = false;
        wasSuccessfullyUsed = false;
        break;
      }
      const randomIdx = Math.floor(Math.random() * available.length);
      const newCharm = { ...available[randomIdx], active: true };
      newGameState.charms = [...newGameState.charms, newCharm];
      charmManager.addCharm(newCharm);
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
      newCharms.forEach(charm => charmManager.addCharm(charm));
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

  // success = true if the consumable was successfully used
  // success = false if the consumable couldn't be used (e.g., no valid targets)
  return {
    success: wasSuccessfullyUsed,
    shouldRemove,
    gameState: newGameState,
    roundState: newRoundState
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
  consumableId: 'chisel' | 'potteryWheel' | 'midasTouch',
  selectedDieIndex: number | [number, number],
  gameState: GameState,
  roundState: RoundState | null
): ConsumableEffectResult {
  const newGameState = { ...gameState };
  const newRoundState = roundState ? { ...roundState } : undefined;
  let shouldRemove = true;

  if (consumableId === 'midasTouch') {
    // Handle two die selection for midasTouch
    if (!Array.isArray(selectedDieIndex) || selectedDieIndex.length !== 2) {
      return {
        success: false,
        shouldRemove: false,
        gameState: newGameState
      };
    }
    const [sourceDieIndex, targetDieIndex] = selectedDieIndex;
    const sourceDie = newGameState.diceSet[sourceDieIndex];
    const targetDie = newGameState.diceSet[targetDieIndex];
    
    if (!sourceDie || !targetDie) {
      return {
        success: false,
        shouldRemove: false,
        gameState: newGameState
      };
    }
    
    // Copy material from source to target
    newGameState.diceSet = newGameState.diceSet.map((die, i) =>
      i === targetDieIndex
        ? { ...die, material: sourceDie.material }
        : die
    );
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

    // Modify rolled values: chisel increases, potteryWheel decreases
    newRoundState.diceHand = newRoundState.diceHand.map((die, i) => {
      if (selectedIndices.includes(i)) {
        const currentValue = die.rolledValue ?? 1;
        if (consumableId === 'chisel') {
          return { ...die, rolledValue: Math.min(6, currentValue + 1) };
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
