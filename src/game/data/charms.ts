import { Charm, CharmRarity } from '../core/types';

export type CharmType = 
  | 'flopShield'
  | 'scoreMultiplier' 
  | 'fourOfAKindBooster'
  | 'volcanoAmplifier'
  | 'straightCollector'
  | 'roundMultiplier'
  | 'consumableGenerator'
  | 'oddCollector'
  | 'evenPerfection'
  | 'moneyMagnet'
  | 'sizeMatters'
  | 'rabbitsFoot'
  | 'weightedDice'
  | 'highStakes'
  | 'lowHangingFruit';

// Rarity price mapping
export const CHARM_PRICES: Record<string, { buy: number; sell: number }> = {
  legendary: { buy: 10, sell: 5 },
  rare: { buy: 8, sell: 4 },
  uncommon: { buy: 6, sell: 3 },
  common: { buy: 4, sell: 2 },
};

export const CHARMS: Omit<Charm, 'active'>[] = [
  {
    id: 'flopShield',
    name: 'Flop Shield',
    description: 'Prevents three flops (breaks on final use)',
    rarity: 'common'
  },
  {
    id: 'scoreMultiplier',
    name: 'Score Multiplier',
    description: 'Multiplies all scored roll points by 1.25x',
    rarity: 'uncommon'
  },
  {
    id: 'fourOfAKindBooster',
    name: 'Four-of-a-Kind Booster',
    description: 'Multiplies 4+ of a kind scoring by 2.0x',
    rarity: 'rare'
  },
  {
    id: 'volcanoAmplifier',
    name: 'Volcano Amplifier',
    description: '+0.5x multiplier per volcano die × hot dice counter',
    rarity: 'legendary'
  },
  {
    id: 'straightCollector',
    name: 'Straight Collector',
    description: '+20 score per straight played (cumulative)',
    rarity: 'uncommon'
  },
  {
    id: 'roundMultiplier',
    name: 'Round Multiplier',
    description: 'Multiplies ROUND score by 1.25x when banking points',
    rarity: 'rare'
  },
  {
    id: 'consumableGenerator',
    name: 'Consumable Generator',
    description: 'Creates a random consumable when scoring 4+ of a digit',
    rarity: 'legendary'
  },
  {
    id: 'oddCollector',
    name: 'Odd Collector',
    description: '+15 points for each odd number in the selected dice',
    rarity: 'uncommon'
  },
  {
    id: 'evenPerfection',
    name: 'Even Perfection',
    description: 'If all selected dice are even, gain +300 points',
    rarity: 'rare'
  },
  {
    id: 'moneyMagnet',
    name: 'Money Magnet',
    description: '+5 points for every $1 you have',
    rarity: 'common'
  },
  {
    id: 'sizeMatters',
    name: 'Size Matters',
    description: 'Multiplier based on die size: 6 faces = 1x, below 6 = -0.5x per size, above 6 = +0.5x per size',
    rarity: 'rare'
  },
  {
    id: 'rabbitsFoot',
    name: "Rabbit's Foot",
    description: 'Score multiplier based on number of successful Rainbow die effect triggers.',
    rarity: 'legendary'
  },
  {
    id: 'weightedDice',
    name: 'Weighted Dice',
    description: 'Doubles probability of all chance-based effects (e.g., Rainbow dice, Lucky Token).',
    rarity: 'rare'
  },
  {
    id: 'highStakes',
    name: 'High Stakes',
    description: '3x scoring multiplier, but removes single 1 and single 5 as valid scoring combinations',
    rarity: 'legendary'
  },
  {
    id: 'lowHangingFruit',
    name: 'Low Hanging Fruit',
    description: 'Allows single 3s to be scored as valid combinations (worth 25 points each)',
    rarity: 'rare'
  }
]; 