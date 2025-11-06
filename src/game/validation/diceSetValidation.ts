import { DiceSetConfig } from '../core/types';

/**
 * Validates dice set configuration
 * @param config The dice set configuration to validate
 * @throws Error if validation fails
 */
export function validateDiceSetConfig(config: DiceSetConfig): void {
  if (!config.name || config.name.trim() === '') {
    throw new Error('Dice set must have a valid name');
  }
  
  if (!Array.isArray(config.dice) || config.dice.length === 0) {
    throw new Error('Dice set must contain at least one die');
  }
  
  if (config.startingMoney < 0) {
    throw new Error('Starting money cannot be negative');
  }
  
  if (config.charmSlots < 0) {
    throw new Error('Charm slots cannot be negative');
  }
  
  if (config.consumableSlots < 0) {
    throw new Error('Consumable slots cannot be negative');
  }
  
  if (config.rerollValue < 0) {
    throw new Error('Reroll value cannot be negative');
  }
  
  if (config.livesValue < 0) {
    throw new Error('Lives value cannot be negative');
  }
  
  // Validate each die
  const dieIds = new Set<string>();
  config.dice.forEach((die, index) => {
    if (!die.id || die.id.trim() === '') {
      throw new Error(`Die at index ${index} must have a valid ID`);
    }
    
    if (dieIds.has(die.id)) {
      throw new Error(`Duplicate die ID: ${die.id}`);
    }
    dieIds.add(die.id);
    
    if (die.sides < 1) {
      throw new Error(`Die ${die.id} must have at least 1 side`);
    }
    
    if (!Array.isArray(die.allowedValues) || die.allowedValues.length === 0) {
      throw new Error(`Die ${die.id} must have at least one allowed value`);
    }
    
    if (die.allowedValues.length > die.sides) {
      throw new Error(`Die ${die.id} has more allowed values than sides`);
    }
    
    if (!die.material) {
      throw new Error(`Die ${die.id} must have a material`);
    }
  });
} 