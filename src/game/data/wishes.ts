export interface Wish {
  id: string;
  name: string;
  description: string;
  uses: number;
}

export const WISHES: Wish[] = [
  {
    id: 'luckyToken',
    name: 'Lucky Token',
    description: 'Probability-based effects: double points, extra reroll, or instant bank.',
    uses: 1
  },
  {
    id: 'copyMaterial',
    name: 'Material Copier',
    description: 'Copy the material of a selected die to another selected die.',
    uses: 1
  },
  {
    id: 'addStandardDie',
    name: 'Die Adder',
    description: 'Add a standard die to your dice set.',
    uses: 1
  },
  {
    id: 'deleteDieAddCharmSlot',
    name: 'Die Sacrifice',
    description: 'Delete a random die, add a charm slot.',
    uses: 1
  },
  {
    id: 'upgradeAllHands',
    name: 'Universal Upgrader',
    description: 'Upgrade all hands by 3.',
    uses: 1
  },
  {
    id: 'createLegendaryCharm',
    name: 'Legendary Charm',
    description: 'Create a Legendary charm.',
    uses: 1
  },
  {
    id: 'createTwoRareCharms',
    name: 'Rare Charm Pack',
    description: 'Create 2 Rare charms.',
    uses: 1
  },
  {
    id: 'deleteTwoCopyOneCharm',
    name: 'Charm Reforger',
    description: 'Delete 2 random charms, then copy 1 random remaining charm.',
    uses: 1
  },
  {
    id: 'extraDie',
    name: 'Extra Die',
    description: 'Adds an extra die to your dice set.',
    uses: 1
  },
  {
    id: 'materialEnchanter',
    name: 'Material Enchanter',
    description: 'Change the material of any die.',
    uses: 1
  },
  {
    id: 'slotExpander',
    name: 'Slot Expander',
    description: 'Permanently increases your consumable and charm slots by 1.',
    uses: 1
  }
];

