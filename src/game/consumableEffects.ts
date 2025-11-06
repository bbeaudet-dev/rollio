import { CHARMS } from './data/charms';
import { getNextDieSize, getPreviousDieSize, getDieSizeDescription, DIE_SIZE_SEQUENCE } from './utils/dieSizeUtils';

export async function applyConsumableEffect(idx: number, gameState: any, roundState: any, gameInterface: any, charmManager: any): Promise<void> {
  const consumable = gameState.consumables[idx];
  if (!consumable) return;
  let shouldRemove = true;
  switch (consumable.id) {
    case 'moneyDoubler':
      gameState.money *= 2;
      await gameInterface.log(`💰 Money Doubler used! You now have $${gameState.money}.`);
      break;
    case 'extraDie': {
      // Add a new default die to the dice set
      const newDieId = `d${gameState.diceSet.length + 1}`;
      const newDie = {
        id: newDieId,
        sides: 6,
        allowedValues: [1, 2, 3, 4, 5, 6],
        material: 'plastic'
      };
      gameState.diceSet.push(newDie);
      await gameInterface.log('🎲 Extra Die added! You will have an extra die next round.');
      break;
    }
    case 'materialEnchanter': {
      // Find all plastic dice
      const plasticDice = gameState.diceSet
        .map((die: any, idx: number) => ({ die, idx }))
        .filter(({ die }: { die: any }) => die.material === 'plastic');
      if (plasticDice.length === 0) {
        await gameInterface.log('🔮 Material Enchanter: No plastic dice available to enchant!');
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
        await gameInterface.log('🔮 Material Enchanter: The enchantment failed!');
        shouldRemove = false;
        break;
      }
      
      // Pick a random plastic die
      const chosen = plasticDice[Math.floor(Math.random() * plasticDice.length)];
      // Pick a random non-plastic material
      const MATERIALS = require('./content/materials').MATERIALS;
      const nonPlasticMaterials = MATERIALS.filter((m: any) => m.id !== 'plastic');
      const newMaterial = nonPlasticMaterials[Math.floor(Math.random() * nonPlasticMaterials.length)];
      chosen.die.material = newMaterial.id;
      chosen.die.abbreviation = newMaterial.abbreviation;
      await gameInterface.log(`🔮 Material Enchanter: Die ${chosen.idx + 1} is now ${newMaterial.name}!`);
      break;
    }
    case 'charmGiver': {
      const maxCharms = gameState.charmSlots || 3;
      if (gameState.charms.length >= maxCharms) {
        await gameInterface.log('🎁 Charm Giver: No open charm slots!');
        shouldRemove = false;
        break;
      }
      // Find available charms not already owned
      const ownedIds = new Set(gameState.charms.map((c: any) => c.id));
      const available = CHARMS.filter(c => !ownedIds.has(c.id));
      if (available.length === 0) {
        await gameInterface.log('🎁 Charm Giver: No new charms available!');
        shouldRemove = false;
        break;
      }
      const randomIdx = Math.floor(Math.random() * available.length);
      const newCharm = { ...available[randomIdx], active: true };
      gameState.charms.push(newCharm);
      charmManager.addCharm(newCharm);
      await gameInterface.log(`🎁 Charm Giver: You gained a new charm: ${newCharm.name}!`);
      break;
    }
    case 'slotExpander':
      gameState.charmSlots = (gameState.charmSlots || 3) + 1;
      await gameInterface.log('🧳 Slot Expander used! You now have an extra charm slot.');
      break;
    case 'chisel': {
      // Let user select a die to reduce
      const selectedDieIndex = await gameInterface.askForDieSelection(
        gameState.diceSet,
        `🪓 Chisel: Select a die to reduce (Die sequence: ${DIE_SIZE_SEQUENCE.join(', ')}):`
      );
      const selectedDie = gameState.diceSet[selectedDieIndex];
      const newSize = getPreviousDieSize(selectedDie.sides);
      
      if (newSize === null) {
        await gameInterface.log(`🪓 Chisel: Cannot reduce die ${selectedDieIndex + 1} - it's already at minimum size (${selectedDie.sides}-sided).`);
        shouldRemove = false;
        break;
      }
      
      const oldSize = selectedDie.sides;
      selectedDie.sides = newSize;
      selectedDie.allowedValues = [1, 2, 3, 4, 5, 6]; // Keep same values for simplicity
      
      await gameInterface.log(`🪓 Chisel: Die ${selectedDieIndex + 1} ${getDieSizeDescription(oldSize, newSize)}!`);
      break;
    }
    case 'potteryWheel': {
      // Let user select a die to enlarge
      const selectedDieIndex = await gameInterface.askForDieSelection(
        gameState.diceSet,
        `🧱 Pottery Wheel: Select a die to enlarge (Die sequence: ${DIE_SIZE_SEQUENCE.join(', ')}):`
      );
      const selectedDie = gameState.diceSet[selectedDieIndex];
      const newSize = getNextDieSize(selectedDie.sides);
      
      if (newSize === null) {
        await gameInterface.log(`🧱 Pottery Wheel: Cannot enlarge die ${selectedDieIndex + 1} - it's already at maximum size (${selectedDie.sides}-sided).`);
        shouldRemove = false;
        break;
      }
      
      const oldSize = selectedDie.sides;
      selectedDie.sides = newSize;
      selectedDie.allowedValues = [1, 2, 3, 4, 5, 6]; // Keep same values for simplicity
      
      await gameInterface.log(`🧱 Pottery Wheel: Die ${selectedDieIndex + 1} ${getDieSizeDescription(oldSize, newSize)}!`);
      break;
    }
    case 'forfeitRecovery': {
      const lastForfeit = gameState.history.lastForfeitedPoints || 0;
      const recovered = Math.floor(lastForfeit * 1.25);
      if (recovered > 0) {
        roundState.roundPoints += recovered;
        await gameInterface.log(`🩹 Flop Recovery used! Recovered ${recovered} points and added to round score.`);
      } else {
        await gameInterface.log('🩹 Flop Recovery used, but there were no forfeited points to recover.');
        shouldRemove = false;
      }
      break;
    }
    case 'luckyToken': {
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
        roundState.roundPoints *= 2;
        await gameInterface.log('🍀 Lucky Token: Your round points have been doubled!');
      } else if (chosenEffect === 'extraReroll') {
        roundState.extraRerolls = (roundState.extraRerolls || 0) + 1;
        await gameInterface.log('🍀 Lucky Token: You gained an extra reroll this round!');
      } else if (chosenEffect === 'instantBank') {
        roundState.instantBank = true;
        await gameInterface.log('🍀 Lucky Token: Your points will be instantly banked!');
      }
      break;
    }
    default:
      await gameInterface.log('Unknown consumable effect.');
  }
  // Remove the used consumable only if it was actually used
  if (shouldRemove) {
    gameState.consumables.splice(idx, 1);
  }
} 