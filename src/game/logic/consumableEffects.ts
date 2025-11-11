import { CHARMS } from '../data/charms';
import { MATERIALS } from '../data/materials';
import { getNextDieSize, getPreviousDieSize, DIE_SIZE_SEQUENCE } from '../utils/dieSizeUtils';
import { GameState, RoundState, DiceMaterialType } from '../types';

export interface ConsumableEffectResult {
  success: boolean;
  shouldRemove: boolean;
  requiresInput?: {
    type: 'dieSelection';
    consumableId: 'chisel' | 'potteryWheel';
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
      break;

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
