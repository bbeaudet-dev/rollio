import { Die, DiceSetConfig } from '../../../game/types';
import { BASIC_DICE_SET } from '../../../game/data/diceSets';

/**
 * Convert customization state to DiceSetConfig
 * Unused credits become starting money
 */
export function createDiceSetConfigFromCustomization(
  dice: Die[],
  creditsRemaining: number,
  difficulty: string,
  customizationOptions?: {
    baseLevelRerolls?: number;
    baseLevelBanks?: number;
    charmSlots?: number;
    consumableSlots?: number;
  }
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
    charmSlots: customizationOptions?.charmSlots ?? BASIC_DICE_SET.charmSlots,
    consumableSlots: customizationOptions?.consumableSlots ?? BASIC_DICE_SET.consumableSlots,
    baseLevelRerolls: customizationOptions?.baseLevelRerolls ?? BASIC_DICE_SET.baseLevelRerolls,
    baseLevelBanks: customizationOptions?.baseLevelBanks ?? BASIC_DICE_SET.baseLevelBanks,
    setType: 'standard'
  };
}

