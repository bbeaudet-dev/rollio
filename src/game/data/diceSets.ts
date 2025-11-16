import { DiceSetConfig, DiceMaterialType } from '../types';
import { MATERIALS } from './materials';

export const BASIC_DICE_SET: DiceSetConfig = {
  name: "Beginner Set",
  dice: [
    { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
    { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
    { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
    { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
    { id: "d5", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
    { id: "d6", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" }
  ],
  startingMoney: 10,
  charmSlots: 4,
  consumableSlots: 2,
  baseLevelRerolls: 3,
  baseLevelBanks: 3,
  setType: 'standard',
};

export const LOW_BALLER_SET: DiceSetConfig = {
  name: "Low Baller Set",
  dice: [
    { id: "d1", sides: 6, allowedValues: [1,1,2,2,3,3], material: "plastic" },
    { id: "d2", sides: 6, allowedValues: [1,1,2,2,3,3], material: "plastic" },
    { id: "d3", sides: 6, allowedValues: [1,1,2,2,3,3], material: "plastic" },
    { id: "d4", sides: 6, allowedValues: [1,1,2,2,3,3], material: "plastic" },
    { id: "d5", sides: 6, allowedValues: [1,1,2,2,3,3], material: "plastic" }
  ],
  startingMoney: 5,
  charmSlots: 4,
  consumableSlots: 2,
  baseLevelRerolls: 0,
  baseLevelBanks: 4,
  setType: 'standard',
};

export const COLLECTOR_SET: DiceSetConfig = {
    name: "Hoarder Set",
    dice: [
        { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        { id: "d5", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        { id: "d6", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        { id: "d7", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        { id: "d8", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" }
    ],
    startingMoney: 5,
    charmSlots: 3,
    consumableSlots: 1,
    baseLevelRerolls: 2,
    baseLevelBanks: 4,
    setType: 'standard',
};

export function RANDOM_SET(): DiceSetConfig {
  // Helper to pick a random element
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const materials: DiceMaterialType[] = MATERIALS.map(m => m.id) as DiceMaterialType[];
  const numDice = Math.floor(Math.random() * 6) + 3; // 3-8 dice
  const dice = Array.from({ length: numDice }, (_, i) => {
    const sides = pick([4, 6, 8, 10, 12, 20]);
    const allowedValues = Array.from({ length: sides }, (_, j) => pick([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20])).slice(0, sides);
    const material = (Math.random() < 0.5 ? "plastic" : pick(materials.filter(m => m !== "plastic"))) as DiceMaterialType;
    return {
      id: `d${i+1}`,
      sides,
      allowedValues,
      material,
    };
  });
  return {
    name: "Random Set",
    dice,
    startingMoney: Math.floor(Math.random() * 20) + 1, // $1-$20
    charmSlots: Math.floor(Math.random() * 5) + 1, // 1-5
    consumableSlots: Math.floor(Math.random() * 4), // 0-3
    baseLevelRerolls: 3,
    baseLevelBanks: 3,
    setType: 'standard',
  };
}

// Material-specific dice sets
export const PLASTIC_SET: DiceSetConfig = {
    name: "Plastic Set",
    dice: [
        { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        { id: "d5", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        { id: "d6", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" }
    ],
    startingMoney: 5,
    charmSlots: 4,
    consumableSlots: 2,
    baseLevelRerolls: 3,
    baseLevelBanks: 4,
    setType: 'cheat',
};

export const CRYSTAL_SET: DiceSetConfig = {
    name: "Crystal Set",
    dice: [
        { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "crystal" },
        { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material: "crystal" },
        { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "crystal" },
        { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material: "crystal" },
        { id: "d5", sides: 6, allowedValues: [1,2,3,4,5,6], material: "crystal" },
        { id: "d6", sides: 6, allowedValues: [1,2,3,4,5,6], material: "crystal" }
    ],
    startingMoney: 5,
    charmSlots: 4,
    consumableSlots: 2,
    baseLevelRerolls: 3,
    baseLevelBanks: 4,
    setType: 'cheat',
    startingCharms: ['crystalClear'],
    startingConsumables: [],
    startingBlessings: ['rerollTier1', 'rerollTier2', 'rerollTier3', 'banksTier1', 'banksTier2', 'banksTier3'],
};

export const FLOWER_SET: DiceSetConfig = {
    name: "Flower Set",
    dice: [
        { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "flower" },
        { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material: "flower" },
        { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "flower" },
        { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material: "flower" },
        { id: "d5", sides: 6, allowedValues: [1,2,3,4,5,6], material: "flower" },
        { id: "d6", sides: 6, allowedValues: [1,2,3,4,5,6], material: "flower" }
    ],
    startingMoney: 5,
    charmSlots: 4,
    consumableSlots: 2,
    baseLevelRerolls: 3,
    baseLevelBanks: 4,
    setType: 'cheat',
    startingCharms: ['flowerWonder'],
    startingConsumables: [],
  startingBlessings: ['banksTier1', 'banksTier2', 'banksTier3', 'rerollAbilityTier1', 'rerollAbilityTier2', 'rerollAbilityTier3'],
};

export const GOLDEN_SET: DiceSetConfig = {
    name: "Golden Set",
    dice: [
        { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "golden" },
        { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material: "golden" },
        { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "golden" },
        { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material: "golden" },
        { id: "d5", sides: 6, allowedValues: [1,2,3,4,5,6], material: "golden" },
        { id: "d6", sides: 6, allowedValues: [1,2,3,4,5,6], material: "golden" }
    ],
    startingMoney: 5,
    charmSlots: 4,
    consumableSlots: 2,
    baseLevelRerolls: 3,
    baseLevelBanks: 4,
    setType: 'cheat',
    startingCharms: ['goldenGuard'],
    startingConsumables: ['moneyDoubler'],
    startingBlessings: ['discountTier1', 'discountTier2', 'discountTier3'],
};

export const VOLCANO_SET: DiceSetConfig = {
    name: "Volcano Set",
    dice: [
        { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "volcano" },
        { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material: "volcano" },
        { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "volcano" },
        { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material: "volcano" },
        { id: "d5", sides: 6, allowedValues: [1,2,3,4,5,6], material: "volcano" },
        { id: "d6", sides: 6, allowedValues: [1,2,3,4,5,6], material: "volcano" }
    ],
    startingMoney: 5,
    charmSlots: 4,
    consumableSlots: 2,
    baseLevelRerolls: 3,
    baseLevelBanks: 4,
    setType: 'cheat',
    startingCharms: ['volcanoAmplifier'],
    startingConsumables: [],
    startingBlessings: ['rerollAbilityTier1', 'rerollAbilityTier2', 'rerollAbilityTier3', 'rerollBlessingTier1', 'rerollBlessingTier2', 'rerollBlessingTier3'],
};

export const MIRROR_SET: DiceSetConfig = {
    name: "Mirror Set",
    dice: [
        { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "mirror" },
        { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material: "mirror" },
        { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "mirror" },
        { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material: "mirror" },
        { id: "d5", sides: 6, allowedValues: [1,2,3,4,5,6], material: "mirror" },
        { id: "d6", sides: 6, allowedValues: [1,2,3,4,5,6], material: "mirror" }
    ],
    startingMoney: 5,
    charmSlots: 4,
    consumableSlots: 2,
    baseLevelRerolls: 3,
    baseLevelBanks: 4,
    setType: 'cheat',
    startingCharms: ['mirrorMage'],
    startingConsumables: ['copyMaterial'],
    startingBlessings: ['slotTier1', 'slotTier2', 'slotTier3'],
};

export const RAINBOW_SET: DiceSetConfig = {
    name: "Rainbow Set",
    dice: [
        { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "rainbow" },
        { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material: "rainbow" },
        { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "rainbow" },
        { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material: "rainbow" },
        { id: "d5", sides: 6, allowedValues: [1,2,3,4,5,6], material: "rainbow" },
        { id: "d6", sides: 6, allowedValues: [1,2,3,4,5,6], material: "rainbow" }
    ],
    startingMoney: 5,
    charmSlots: 4,
    consumableSlots: 2,
    baseLevelRerolls: 3,
    baseLevelBanks: 4,
    setType: 'cheat',
    startingCharms: ['rainbowRider'],
    startingConsumables: ['addStandardDie'],
    startingBlessings: ['flopSubversionTier1', 'flopSubversionTier2', 'flopSubversionTier3'],
};

export const GHOST_SET: DiceSetConfig = {
    name: "Ghost Set",
    dice: [
        { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "ghost" },
        { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material: "ghost" },
        { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "ghost" },
        { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material: "ghost" },
        { id: "d5", sides: 6, allowedValues: [1,2,3,4,5,6], material: "ghost" },
        { id: "d6", sides: 6, allowedValues: [1,2,3,4,5,6], material: "ghost" }
    ],
    startingMoney: 5,
    charmSlots: 4,
    consumableSlots: 2,
    baseLevelRerolls: 3,
    baseLevelBanks: 4,
    setType: 'cheat',
    startingConsumables: ['createLastConsumable', 'createTwoConsumables'],
    startingBlessings: ['rerollAbilityTier1'],
};

export const LEAD_SET: DiceSetConfig = {
    name: "Lead Set",
    dice: [
        { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "lead" },
        { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material: "lead" },
        { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "lead" },
        { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material: "lead" },
        { id: "d5", sides: 6, allowedValues: [1,2,3,4,5,6], material: "lead" },
        { id: "d6", sides: 6, allowedValues: [1,2,3,4,5,6], material: "lead" }
    ],
    startingMoney: 5,
    charmSlots: 4,
    consumableSlots: 2,
    baseLevelRerolls: 3,
    baseLevelBanks: 4,
    setType: 'cheat',
    startingConsumables: ['deleteDieAddCharmSlot'],
    startingBlessings: ['banksTier1', 'banksTier2', 'banksTier3', 'rerollAbilityTier1', 'rerollAbilityTier2', 'rerollAbilityTier3'],
};

/**
 * Mixed Material Set - one die of each material
 */
export const MIXED_MATERIAL_SET: DiceSetConfig = {
    name: "Mixed Material Set",
    dice: [
        { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material: "crystal" },
        { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "flower" },
        { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material: "golden" },
        { id: "d5", sides: 6, allowedValues: [1,2,3,4,5,6], material: "volcano" },
        { id: "d6", sides: 6, allowedValues: [1,2,3,4,5,6], material: "mirror" },
        { id: "d7", sides: 6, allowedValues: [1,2,3,4,5,6], material: "rainbow" },
        { id: "d8", sides: 6, allowedValues: [1,2,3,4,5,6], material: "ghost" },
        { id: "d9", sides: 6, allowedValues: [1,2,3,4,5,6], material: "lead" }
    ],
    startingMoney: 10,
    charmSlots: 4,
    consumableSlots: 2,
    baseLevelRerolls: 3,
    baseLevelBanks: 4,
    setType: 'cheat',
};

// Static dice sets (for display/collection purposes)
export const STATIC_DICE_SETS: DiceSetConfig[] = [
    BASIC_DICE_SET,
    LOW_BALLER_SET,
    COLLECTOR_SET,
    PLASTIC_SET,
    CRYSTAL_SET,
    FLOWER_SET,
    GOLDEN_SET,
    VOLCANO_SET,
    MIRROR_SET,
    RAINBOW_SET,
    GHOST_SET,
    LEAD_SET,
    MIXED_MATERIAL_SET,
];

// All dice sets including dynamic ones (for game selection)
export const ALL_DICE_SETS: (DiceSetConfig | (() => DiceSetConfig))[] = [
    BASIC_DICE_SET,
    LOW_BALLER_SET,
    COLLECTOR_SET,
    PLASTIC_SET,
    CRYSTAL_SET,
    FLOWER_SET,
    GOLDEN_SET,
    VOLCANO_SET,
    MIRROR_SET,
    RAINBOW_SET,
    GHOST_SET,
    LEAD_SET,
    MIXED_MATERIAL_SET,
    RANDOM_SET,
]; 