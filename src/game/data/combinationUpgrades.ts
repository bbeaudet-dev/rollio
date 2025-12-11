export interface CombinationUpgrade {
  id: string;
  name: string;
  description: string;
  uses: number;
  combinationType: string; // The combination type this upgrades (e.g., 'nPairs', 'nOfAKind')
}

export const COMBINATION_UPGRADES: CombinationUpgrade[] = [
  {
    id: 'upgradeSingleN',
    name: 'Single Upgrade',
    description: 'Upgrade all Single combinations by 1 level',
    uses: 1,
    combinationType: 'singleN'
  },
  {
    id: 'upgradeNPairs',
    name: 'Pairs Upgrade',
    description: 'Upgrade all Pair combinations by 1 level',
    uses: 1,
    combinationType: 'nPairs'
  },
  {
    id: 'upgradeNOfAKind',
    name: 'Of a Kind Upgrade',
    description: 'Upgrade all Of a Kind combinations by 1 level',
    uses: 1,
    combinationType: 'nOfAKind'
  },
  {
    id: 'upgradeStraightOfN',
    name: 'Straight Upgrade',
    description: 'Upgrade all Straight combinations by 1 level',
    uses: 1,
    combinationType: 'straightOfN'
  },
  {
    id: 'upgradePyramidOfN',
    name: 'Pyramid Upgrade',
    description: 'Upgrade all Pyramid combinations by 1 level',
    uses: 1,
    combinationType: 'pyramidOfN'
  },
  {
    id: 'upgradeNTuplets',
    name: 'Tuplets Upgrade',
    description: 'Upgrade all Tuplet combinations (Triplets, Quadruplets, etc.) by 1 level',
    uses: 1,
    combinationType: 'nTuplets' // Special marker for all tuplet types
  }
];

