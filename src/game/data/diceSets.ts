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
  rerollValue: 3,
  livesValue: 3,
  setType: 'beginner',
};

export const HIGH_ROLLER_SET: DiceSetConfig = {
    name: "High Roller Set",
    dice: [
        { id: "d1", sides: 6, allowedValues: [4,4,5,5,6,6], material: "plastic" },
        { id: "d2", sides: 6, allowedValues: [4,4,5,5,6,6], material: "plastic" },
        { id: "d3", sides: 6, allowedValues: [4,4,5,5,6,6], material: "plastic" },
        { id: "d4", sides: 6, allowedValues: [4,4,5,5,6,6], material: "plastic" },
        { id: "d5", sides: 6, allowedValues: [4,4,5,5,6,6], material: "plastic" },
        { id: "d6", sides: 6, allowedValues: [4,4,5,5,6,6], material: "plastic" }
    ],
    startingMoney: 5,
    charmSlots: 3,
    consumableSlots: 2,
    rerollValue: 3,
    livesValue: 3,
    setType: 'beginner',
};

export const LOW_BALLER_SET: DiceSetConfig = {
  name: "Low Baller Set",
  dice: [
    { id: "d1", sides: 6, allowedValues: [1,1,2,2,3,3], material: "plastic" },
    { id: "d2", sides: 6, allowedValues: [1,1,2,2,3,3], material: "plastic" },
    { id: "d3", sides: 6, allowedValues: [1,1,2,2,3,3], material: "plastic" },
    { id: "d4", sides: 6, allowedValues: [1,1,2,2,3,3], material: "plastic" },
    { id: "d5", sides: 6, allowedValues: [1,1,2,2,3,3], material: "plastic" },
    { id: "d6", sides: 6, allowedValues: [1,1,2,2,3,3], material: "plastic" }
  ],
  startingMoney: 15,
  charmSlots: 3,
  consumableSlots: 2,
  rerollValue: 3,
  livesValue: 3,
  setType: 'beginner',
};

export const COLLECTOR_SET: DiceSetConfig = {
    name: "Collector Set",
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
    charmSlots: 2,
    consumableSlots: 1,
    rerollValue: 3,
    livesValue: 3,
    setType: 'beginner',
};

export const LUXURY_SET: DiceSetConfig = {
    name: "Luxurious Set",
    dice: [
        { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "crystal" },
        { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material: "crystal" },
        { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "crystal" },
        { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material: "crystal" },
        { id: "d5", sides: 6, allowedValues: [1,2,3,4,5,6], material: "crystal" },
        { id: "d6", sides: 6, allowedValues: [1,2,3,4,5,6], material: "crystal" }
    ],
    startingMoney: 15,
    charmSlots: 3,
    consumableSlots: 2,
    rerollValue: 3,
    livesValue: 3,
    setType: 'advanced',
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
    rerollValue: 3,
    livesValue: 3,
    setType: 'mayhem',
  };
}

// Advanced Dice Sets - One for each material
export const CHACHING_SET: DiceSetConfig = {
    name: "Cha-Ching Set",
    dice: [
        { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "golden" },
        { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material: "golden" },
        { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "golden" },
        { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material: "golden" },
        { id: "d5", sides: 6, allowedValues: [1,2,3,4,5,6], material: "golden" },
        { id: "d6", sides: 6, allowedValues: [1,2,3,4,5,6], material: "golden" }
    ],
    startingMoney: 20,
    charmSlots: 3,
    consumableSlots: 2,
    rerollValue: 3,
    livesValue: 3,
    setType: 'advanced',
};

export const WOODEN_SET: DiceSetConfig = {
    name: "Wooden Set",
    dice: [
        { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "wooden" },
        { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material: "wooden" },
        { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "wooden" },
        { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material: "wooden" },
        { id: "d5", sides: 6, allowedValues: [1,2,3,4,5,6], material: "wooden" },
        { id: "d6", sides: 6, allowedValues: [1,2,3,4,5,6], material: "wooden" }
    ],
    startingMoney: 12,
    charmSlots: 3,
    consumableSlots: 2,
    rerollValue: 3,
    livesValue: 3,
    setType: 'advanced',
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
    startingMoney: 10,
    charmSlots: 3,
    consumableSlots: 2,
    rerollValue: 3,
    livesValue: 3,
    setType: 'advanced',
};

export const MIRROR_SET: DiceSetConfig = {
    name: "Mirror Set | teS rorriM",
    dice: [
        { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "mirror" },
        { id: "d2", sides: 6, allowedValues: [1,2,3,4,5,6], material: "mirror" },
        { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "mirror" },
        { id: "d4", sides: 6, allowedValues: [1,2,3,4,5,6], material: "mirror" },
        { id: "d5", sides: 6, allowedValues: [1,2,3,4,5,6], material: "mirror" },
        { id: "d6", sides: 6, allowedValues: [1,2,3,4,5,6], material: "mirror" }
    ],
    startingMoney: 10,
    charmSlots: 3,
    consumableSlots: 2,
    rerollValue: 3,
    livesValue: 3,
    setType: 'advanced',
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
    startingMoney: 10,
    charmSlots: 3,
    consumableSlots: 2,
    rerollValue: 3,
    livesValue: 3,
    setType: 'advanced',
};



export const ALL_DICE_SETS: (DiceSetConfig | (() => DiceSetConfig))[] = [
    BASIC_DICE_SET,
    HIGH_ROLLER_SET,
    LOW_BALLER_SET,
    COLLECTOR_SET,
    LUXURY_SET,
    CHACHING_SET,
    WOODEN_SET,
    VOLCANO_SET,
    MIRROR_SET,
    RAINBOW_SET,
    RANDOM_SET,
]; 