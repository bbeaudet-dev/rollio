import { CHARMS, CHARM_PRICES } from '../data/charms';
import { CONSUMABLES, WHIMS, WISHES } from '../data/consumables';
import { MATERIALS } from '../data/materials';
import { getNextDieSize, getPreviousDieSize } from '../utils/dieSizeUtils';
import { GameState, RoundState, DiceMaterialType } from '../types';

const CONSUMABLE_PRICES: Record<string, { buy: number; sell: number }> = {
  wish: { buy: 8, sell: 4 },
  whim: { buy: 4, sell: 2 },
};

export interface ConsumableEffectResult {
  success: boolean;
  shouldRemove: boolean;
  requiresInput?: {
    type: 'dieSelection' | 'dieSideSelection' | 'twoDieSelection';
    consumableId: 'chisel' | 'potteryWheel' | 'copyMaterial' | 'copyDieSide';
    diceSet: any[];
  };
  gameState: GameState;
  roundState?: RoundState;
}

/**
 * Apply consumable effect - pure function
 * Returns only state changes - no messages, no I/O
 */
export function applyConsumableEffect(
  idx: number,
  gameState: GameState,
  roundState: RoundState | null,
  charmManager: any
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
  let shouldRemove = true;

  switch (consumable.id) {
    case 'moneyDoubler':
      newGameState.money = (newGameState.money || 0) * 2;
      break;

    case 'extraDie': {
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

    case 'materialEnchanter': {
      // Find all plastic dice
      const plasticDice = newGameState.diceSet
        .map((die: any, idx: number) => ({ die, idx }))
        .filter(({ die }: { die: any }) => die.material === 'plastic');
      
      if (plasticDice.length === 0) {
        shouldRemove = false;
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

    case 'charmGiver': {
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

    case 'slotExpander':
      newGameState.charmSlots = (newGameState.charmSlots || 3) + 1;
      newGameState.consumableSlots = (newGameState.consumableSlots || 2) + 1;
      break;

    case 'createTwoConsumables': {
      const maxConsumables = newGameState.consumableSlots || 2;
      const availableSlots = maxConsumables - newGameState.consumables.length;
      if (availableSlots < 2) {
        shouldRemove = false;
        break;
      }
      // Get all consumables, excluding ones already owned
      const ownedIds = new Set(newGameState.consumables.map(c => c.id));
      const available = CONSUMABLES.filter(c => !ownedIds.has(c.id));
      if (available.length === 0) {
        shouldRemove = false;
        break;
      }
      // Select 2 random consumables
      const selected: typeof CONSUMABLES = [];
      const indices = new Set<number>();
      while (selected.length < 2 && indices.size < available.length) {
        const randomIdx = Math.floor(Math.random() * available.length);
        if (!indices.has(randomIdx)) {
          indices.add(randomIdx);
          selected.push(available[randomIdx]);
        }
      }
      newGameState.consumables = [...newGameState.consumables, ...selected];
      break;
    }

    case 'createLastConsumable': {
      // Track last consumable used - stored in gameState.history or we can add a field
      // For now, use the last consumable in the list (most recently added)
      // TODO: Properly track last consumable used in GameState
      const lastConsumable = (newGameState as any).lastConsumableUsed;
      if (!lastConsumable) {
        shouldRemove = false;
        break;
      }
      const maxConsumables = newGameState.consumableSlots || 2;
      if (newGameState.consumables.length >= maxConsumables) {
        shouldRemove = false;
        break;
      }
      newGameState.consumables = [...newGameState.consumables, { ...lastConsumable }];
      break;
    }

    case 'addMoneyFromItems': {
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

    case 'doubleMoneyCapped': {
      const currentMoney = newGameState.money || 0;
      const doubled = currentMoney * 2;
      newGameState.money = Math.min(doubled, 50);
      break;
    }

    case 'createTwoHandUpgrades': {
      // TODO: Implement hand upgrade system
      // For now, this is a placeholder - hand upgrades need infrastructure
      // Hand upgrades likely modify combination point values
      shouldRemove = false; // Don't remove until implemented
      break;
    }

    case 'copyMaterial': {
      // Requires user input - return request for two die selection
      return {
        success: true,
        shouldRemove: false,
        requiresInput: {
          type: 'twoDieSelection',
          consumableId: 'copyMaterial',
          diceSet: newGameState.diceSet
        },
        gameState: newGameState,
        roundState: newRoundState
      };
    }

    case 'addStandardDie': {
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

    case 'deleteDieAddCharmSlot': {
      if (newGameState.diceSet.length <= 1) {
        shouldRemove = false;
        break;
      }
      // Delete a random die
      const randomIndex = Math.floor(Math.random() * newGameState.diceSet.length);
      newGameState.diceSet = newGameState.diceSet.filter((_, i) => i !== randomIndex);
      // Add charm slot
      newGameState.charmSlots = (newGameState.charmSlots || 3) + 1;
      break;
    }

    case 'upgradeAllHands': {
      // TODO: Implement hand upgrade system
      // For now, this is a placeholder - hand upgrades need infrastructure
      shouldRemove = false; // Don't remove until implemented
      break;
    }

    case 'createLegendaryCharm': {
      const maxCharms = newGameState.charmSlots || 3;
      if (newGameState.charms.length >= maxCharms) {
        shouldRemove = false;
        break;
      }
      // Find available legendary charms not already owned
      const ownedIds = new Set(newGameState.charms.map(c => c.id));
      const available = CHARMS.filter(c => !ownedIds.has(c.id) && c.rarity === 'legendary');
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

    case 'createTwoRareCharms': {
      const maxCharms = newGameState.charmSlots || 3;
      const availableSlots = maxCharms - newGameState.charms.length;
      if (availableSlots < 2) {
        shouldRemove = false;
        break;
      }
      // Find available rare charms not already owned
      const ownedIds = new Set(newGameState.charms.map(c => c.id));
      const available = CHARMS.filter(c => !ownedIds.has(c.id) && c.rarity === 'rare');
      if (available.length < 2) {
        shouldRemove = false;
        break;
      }
      // Select 2 random rare charms
      const selected: typeof CHARMS = [];
      const indices = new Set<number>();
      while (selected.length < 2 && indices.size < available.length) {
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

    case 'deleteTwoCopyOneCharm': {
      if (newGameState.charms.length < 3) {
        shouldRemove = false;
        break;
      }
      // Delete 2 random charms
      const indicesToDelete = new Set<number>();
      while (indicesToDelete.size < 2) {
        const randomIdx = Math.floor(Math.random() * newGameState.charms.length);
        indicesToDelete.add(randomIdx);
      }
      const remaining = newGameState.charms.filter((_, i) => !indicesToDelete.has(i));
      if (remaining.length === 0) {
        shouldRemove = false;
        break;
      }
      // Copy 1 random remaining charm
      const randomIdx = Math.floor(Math.random() * remaining.length);
      const copiedCharm = { ...remaining[randomIdx], id: `${remaining[randomIdx].id}_copy_${Date.now()}` };
      newGameState.charms = [...remaining, copiedCharm];
      // Update charm manager
      newGameState.charms.forEach((charm: any) => {
        if (!charmManager.getAllCharms().some((c: any) => c.id === charm.id)) {
          charmManager.addCharm(charm);
        }
      });
      break;
    }

    case 'chisel': {
      // Requires user input - return request
      return {
        success: true,
        shouldRemove: false, // Will be set after user input
        requiresInput: {
          type: 'dieSelection',
          consumableId: 'chisel',
          diceSet: newGameState.diceSet
        },
        gameState: newGameState,
        roundState: newRoundState
      };
    }

    case 'potteryWheel': {
      // Requires user input - return request
      return {
        success: true,
        shouldRemove: false, // Will be set after user input
        requiresInput: {
          type: 'dieSelection',
          consumableId: 'potteryWheel',
          diceSet: newGameState.diceSet
        },
        gameState: newGameState,
        roundState: newRoundState
      };
    }

    case 'forfeitRecovery': {
      if (!newRoundState) {
        shouldRemove = false;
        break;
      }
      const lastForfeit = newRoundState.forfeitedPoints || 0;
      const recovered = Math.floor(lastForfeit * 1.25);
      if (recovered > 0) {
        newRoundState.roundPoints += recovered;
      } else {
        shouldRemove = false;
      }
      break;
    }

    case 'luckyToken': {
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
        newGameState.currentLevel.rerollsRemaining = (newGameState.currentLevel.rerollsRemaining || 0) + 1;
      } else if (chosenEffect === 'instantBank') {
        // Store instant bank flag in round state
        (newRoundState as any).instantBank = true;
      }
      break;
    }

    default:
      shouldRemove = false;
  }

  return {
    success: true,
    shouldRemove,
    gameState: newGameState,
    roundState: newRoundState
  };
}

/**
 * Apply die selection for chisel/potteryWheel consumables
 * Pure function - processes the user's die selection
 */
export function applyDieSelectionConsumable(
  consumableId: 'chisel' | 'potteryWheel',
  selectedDieIndex: number,
  gameState: GameState,
  roundState: RoundState | null
): ConsumableEffectResult {
  const newGameState = { ...gameState };
  const newRoundState = roundState ? { ...roundState } : undefined;
  let shouldRemove = true;

  const selectedDie = newGameState.diceSet[selectedDieIndex];
  if (!selectedDie) {
    return {
      success: false,
      shouldRemove: false,
      gameState: newGameState
    };
  }

  if (consumableId === 'chisel') {
    const newSize = getPreviousDieSize(selectedDie.sides);
    if (newSize === null) {
      shouldRemove = false;
    } else {
      newGameState.diceSet = newGameState.diceSet.map((die, i) =>
        i === selectedDieIndex
          ? { ...die, sides: newSize, allowedValues: [1, 2, 3, 4, 5, 6] }
          : die
      );
    }
  } else if (consumableId === 'potteryWheel') {
    const newSize = getNextDieSize(selectedDie.sides);
    if (newSize === null) {
      shouldRemove = false;
    } else {
      newGameState.diceSet = newGameState.diceSet.map((die, i) =>
        i === selectedDieIndex
          ? { ...die, sides: newSize, allowedValues: [1, 2, 3, 4, 5, 6] }
          : die
      );
    }
  }

  return {
    success: true,
    shouldRemove,
    gameState: newGameState,
    roundState: newRoundState
  };
}
