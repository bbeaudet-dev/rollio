import { DiceSetConfig, DiceMaterialType } from '../types';
import { MATERIALS } from './materials';
import { CHARMS } from './charms';
import { CONSUMABLES } from './consumables';
import { ALL_BLESSINGS } from './blessings';

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
  charmSlots: 6,
  consumableSlots: 2,
  baseLevelRerolls: 5,
  baseLevelBanks: 5,
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
  charmSlots: 6,
  consumableSlots: 2,
  baseLevelRerolls: 0,
  baseLevelBanks: 5,
  setType: 'standard',
  startingCharms: ['lowHangingFruit'],
  startingConsumables: [],
  startingBlessings: [],
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
    charmSlots: 5,
    consumableSlots: 1,
    baseLevelRerolls: 4,
    baseLevelBanks: 5,
    setType: 'standard',
    startingCharms: [],
    startingConsumables: [],
    startingBlessings: [],
};

export function RANDOM_SET(): DiceSetConfig {
  // Helper to pick a random element
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  // Helper to pick multiple random unique elements
  const pickMultiple = <T,>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, arr.length));
  };
  
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
  
  // Random base stats
  const baseLevelRerolls = Math.floor(Math.random() * 19) + 1; // 1-20
  const baseLevelBanks = Math.floor(Math.random() * 19) + 1; // 1-20
  const charmSlots = Math.floor(Math.random() * 19) + 1; // 1-20
  const consumableSlots = Math.floor(Math.random() * 19) + 1; // 1-20
  
  // Random starting items
  
  const numStartingCharms = Math.floor(Math.random() * (charmSlots + 1)); // 0 to charmSlots
  const numStartingConsumables = Math.floor(Math.random() * (consumableSlots + 1)); // 0 to consumableSlots
  const numStartingBlessings = Math.floor(Math.random() * 4); // 0-3
  
  const startingCharms: string[] = pickMultiple(CHARMS.map((c: { id: string }) => c.id), numStartingCharms);
  const startingConsumables: string[] = pickMultiple(CONSUMABLES.map((c: { id: string }) => c.id), numStartingConsumables);
  const startingBlessings: string[] = pickMultiple(ALL_BLESSINGS.map((b: { id: string }) => b.id), numStartingBlessings);
  
  return {
    name: "Random Set",
    dice,
    startingMoney: Math.floor(Math.random() * 20) + 1, // $1-$20
    charmSlots,
    consumableSlots,
    baseLevelRerolls,
    baseLevelBanks,
    setType: 'standard',
    startingCharms: startingCharms.length > 0 ? startingCharms : undefined,
    startingConsumables: startingConsumables.length > 0 ? startingConsumables : undefined,
    startingBlessings: startingBlessings.length > 0 ? startingBlessings : undefined,
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
    charmSlots: 6,
    consumableSlots: 2,
    baseLevelRerolls: 5,
    baseLevelBanks: 5,
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
    charmSlots: 6,
    consumableSlots: 2,
    baseLevelRerolls: 5,
    baseLevelBanks: 5,
    setType: 'cheat',
    startingCharms: ['crystalClear', 'resonance'],
    startingConsumables: [],
    startingBlessings: ['banksTier1', 'banksTier2', 'banksTier3'],
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
    charmSlots: 6,
    consumableSlots: 2,
    baseLevelRerolls: 5,
    baseLevelBanks: 5,
    setType: 'cheat',
    startingCharms: ['flowerPower', 'bloom'],
    startingConsumables: [],
    startingBlessings: ['rerollTier1', 'rerollTier2', 'rerollTier3', 'rerollAbilityTier1', 'rerollAbilityTier2', 'rerollAbilityTier3', 'flopSubversionTier1', 'flopSubversionTier2', 'flopSubversionTier3'],
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
    startingMoney: 20,
    charmSlots: 6,
    consumableSlots: 2,
    baseLevelRerolls: 5,
    baseLevelBanks: 5,
    setType: 'cheat',
    startingCharms: ['goldenTouch', 'moneyMagnet', 'hedgeFund'],
    startingConsumables: ['moneyDoubler'],
    startingBlessings: ['discountTier1', 'discountTier2', 'discountTier3', 'moneyTier1', 'moneyTier2', 'moneyTier3'],
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
    charmSlots: 6,
    consumableSlots: 2,
    baseLevelRerolls: 5,
    baseLevelBanks: 5,
    setType: 'cheat',
    startingCharms: ['vesuvius', 'hotDiceHero', 'hotPocket', 'perfectionist'],
    startingConsumables: [],
    startingBlessings: ['rerollTier1', 'rerollTier2', 'rerollTier3', 'rerollAbilityTier1', 'rerollAbilityTier2', 'rerollAbilityTier3', 'flopSubversionTier1', 'flopSubversionTier2', 'flopSubversionTier3'],
};

export const MIRROR_SET: DiceSetConfig = {
    name: "Mirror Set",
    dice: [
        { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "mirror" },
        { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material: "mirror" },
        { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "mirror" },
        { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material: "mirror" },
        { id: "d5", sides: 6, allowedValues: [1,2,3,4,5,6], material: "mirror" },
        { id: "d6", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" }
    ],
    startingMoney: 5,
    charmSlots: 6,
    consumableSlots: 2,
    baseLevelRerolls: 5,
    baseLevelBanks: 5,
    setType: 'cheat',
    startingCharms: [],
    startingConsumables: [],
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
    charmSlots: 6,
    consumableSlots: 2,
    baseLevelRerolls: 5,
    baseLevelBanks: 5,
    setType: 'cheat',
    startingCharms: ['weightedDice', 'rabbitsFoot', 'inheritance'],
    startingConsumables: ['freebie'],
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
    charmSlots: 6,
    consumableSlots: 2,
    baseLevelRerolls: 5,
    baseLevelBanks: 5,
    setType: 'cheat',
    startingCharms: ['ghostWhisperer', 'bodyDouble'],
    startingConsumables: ['createLastConsumable', 'createTwoConsumables'],
    startingBlessings: ['rerollTier1', 'rerollTier2', 'rerollTier3', 'rerollAbilityTier1', 'rerollAbilityTier2', 'rerollAbilityTier3'],
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
    charmSlots: 6,
    consumableSlots: 2,
    baseLevelRerolls: 5,
    baseLevelBanks: 5,
    setType: 'cheat',
    startingCharms: ['ironFortress', 'leadTitan', 'swordInTheStone'],
    startingConsumables: ['sacrifice'],
    startingBlessings: ['banksTier1', 'banksTier2', 'banksTier3', 'rerollTier1', 'rerollTier2', 'rerollTier3'],
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
  charmSlots: 6,
  consumableSlots: 2,
    baseLevelRerolls: 5,
    baseLevelBanks: 5,
    setType: 'cheat',
    startingCharms: ['tasteTheRainbow'],
    startingConsumables: [],
    startingBlessings: [],
};

// Test dice set with various pip effects for testing
export const PIP_EFFECTS_TEST_SET: DiceSetConfig = {
    name: "Pip Effects Test Set",
    dice: [
        // Die 1: Money pip effects on sides 1, 2, 3
        { 
            id: "d1", 
            sides: 6, 
            allowedValues: [1,2,3,4,5,6], 
            material: "plastic",
            pipEffects: {
                1: 'money',
                2: 'money',
                3: 'money',
                4: 'none',
                5: 'none',
                6: 'none'
            }
        },
        // Die 2: Blank pip effects on sides 4, 5, 6
        { 
            id: "d2", 
            sides: 6, 
            allowedValues: [1,2,3,4,5,6], 
            material: "plastic",
            pipEffects: {
                1: 'none',
                2: 'none',
                3: 'none',
                4: 'blank',
                5: 'blank',
                6: 'blank'
            }
        },
        // Die 3: Mix of money and blank
        { 
            id: "d3", 
            sides: 6, 
            allowedValues: [1,2,3,4,5,6], 
            material: "plastic",
            pipEffects: {
                1: 'money',
                2: 'money',
                3: 'blank',
                4: 'blank',
                5: 'none',
                6: 'none'
            }
        },
        // Die 4: Two-faced on sides 1-3, wild on sides 4-6
        { 
            id: "d4", 
            sides: 6, 
            allowedValues: [1,2,3,4,5,6], 
            material: "plastic",
            pipEffects: {
                1: 'twoFaced',
                2: 'twoFaced',
                3: 'twoFaced',
                4: 'wild',
                5: 'wild',
                6: 'wild'
            }
        },
        // Die 5: All money
        { 
            id: "d5", 
            sides: 6, 
            allowedValues: [1,2,3,4,5,6], 
            material: "plastic",
            pipEffects: {
                1: 'money',
                2: 'money',
                3: 'money',
                4: 'money',
                5: 'money',
                6: 'money'
            }
        },
        // Die 6: All blank
        { 
            id: "d6", 
            sides: 6, 
            allowedValues: [1,2,3,4,5,6], 
            material: "plastic",
            pipEffects: {
                1: 'blank',
                2: 'blank',
                3: 'blank',
                4: 'blank',
                5: 'blank',
                6: 'blank'
            }
        },
        { 
            id: "d7", 
            sides: 6, 
            allowedValues: [1,2,3,4,5,6], 
            material: "plastic",
            pipEffects: {
                1: 'upgradeCombo',
                2: 'upgradeCombo',
                3: 'upgradeCombo',
                4: 'createConsumable',
                5: 'createConsumable',
                6: 'createConsumable'
            }
        },
        { 
            id: "d8", 
            sides: 6, 
            allowedValues: [1,2,3,4,5,6], 
            material: "plastic",
            pipEffects: {
                1: 'money',
                2: 'blank',
                3: 'twoFaced',
                4: 'wild',
                5: 'upgradeCombo',
                6: 'createConsumable'
            }
        }
    ],
    startingMoney: 20,
    charmSlots: 6,
    consumableSlots: 2,
  baseLevelRerolls: 5,
  baseLevelBanks: 5,
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
    PIP_EFFECTS_TEST_SET,
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
    PIP_EFFECTS_TEST_SET,
    RANDOM_SET,
]; 