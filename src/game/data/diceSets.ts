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
  setType: 'beginner',
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
  setType: 'beginner',
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
    setType: 'beginner',
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
    setType: 'mayhem',
  };
}

/**
 * Helper function to create a Material Set dice set
 * Creates a set with 6 dice of the specified material
 */
export function createMaterialSet(material: DiceMaterialType): DiceSetConfig {
    return {
        name: `${material.charAt(0).toUpperCase() + material.slice(1)} Set`,
        dice: [
            { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material },
            { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material },
            { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material },
            { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material },
            { id: "d5", sides: 6, allowedValues: [1,2,3,4,5,6], material },
            { id: "d6", sides: 6, allowedValues: [1,2,3,4,5,6], material }
        ],
        startingMoney: 5,
        charmSlots: 4,
        consumableSlots: 2,
        baseLevelRerolls: 3,
        baseLevelBanks: 4,
        setType: 'advanced',
    };
}



// Static dice sets (for display/collection purposes)
export const STATIC_DICE_SETS: DiceSetConfig[] = [
    BASIC_DICE_SET,
    LOW_BALLER_SET,
    COLLECTOR_SET,
];

// All dice sets including dynamic ones (for game selection)
export const ALL_DICE_SETS: (DiceSetConfig | (() => DiceSetConfig))[] = [
    BASIC_DICE_SET,
    LOW_BALLER_SET,
    COLLECTOR_SET,
    RANDOM_SET,
]; 