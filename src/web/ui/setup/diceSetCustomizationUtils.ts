import { Die, DiceSetConfig } from '../../../game/types';

/**
 * Convert customization state to DiceSetConfig
 * Unused credits become starting money
 */
export function createDiceSetConfigFromCustomization(
  dice: Die[],
  creditsRemaining: number,
  difficulty: string
): DiceSetConfig {
  return {
    name: 'Custom Set',
    dice: dice.map(d => ({
      id: d.id,
      sides: d.sides,
      allowedValues: d.allowedValues,
      material: d.material,
      pipEffects: d.pipEffects
    })),
    startingMoney: creditsRemaining, // Unused credits = starting money
    charmSlots: 6, // Default
    consumableSlots: 2, // Default
    baseLevelRerolls: 6, // Default
    baseLevelBanks: 6, // Default
    setType: 'standard'
  };
}

