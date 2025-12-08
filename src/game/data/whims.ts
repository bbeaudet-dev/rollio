export interface Whim {
  id: string;
  name: string;
  description: string;
  uses: number;
}

export const WHIMS: Whim[] = [
  {
    id: 'liquidation',
    name: 'Liquidation',
    description: 'Doubles your current money',
    uses: 1
  },
  {
    id: 'garagesale',
    name: 'Garage Sale',
    description: 'Gain the total sell value of your consumables, charms, and blessings.',
    uses: 1
  },
  {
    id: 'youGetACharm',
    name: 'You Get a Charm!',
    description: 'Create a random charm',
    uses: 1
  },
  {
    id: 'groceryList',
    name: 'Grocery List',
    description: 'Create 2 random consumables',
    uses: 1
  },
  {
    id: 'grabBag',
    name: 'Grab Bag',
    description: 'Create 2 combination upgrades.',
    uses: 1
  },
  {
    id: 'echo',
    name: 'Echo',
    description: 'Create the last consumable used',
    uses: 1
  },
  {
    id: 'chisel',
    name: 'Chisel',
    description: 'Increase the face-up value of 2 selected dice by 1',
    uses: 1
  },
  {
    id: 'potteryWheel',
    name: 'Pottery Wheel',
    description: 'Decrease the face-up value of 2 selected dice by 1',
    uses: 1
  },
  {
    id: 'hospital',
    name: 'Hospital',
    description: 'Recover 1.25x of your last forfeited points (after a flop)',
    uses: 1
  },
  {
    id: 'emptyAsAPocket',
    name: 'Empty as a Pocket',
    description: 'Turn one selected side to a Blank pip effect',
    uses: 1
  },
  {
    id: 'moneyPip',
    name: 'Money Pip',
    description: 'Turn one selected side to a Money pip effect',
    uses: 1
  },
  {
    id: 'stallion',
    name: 'Stallion',
    description: 'Turn one selected side to a Wild pip effect',
    uses: 1
  },
  {
    id: 'practice',
    name: 'Practice',
    description: 'Turn one selected side to an Upgrade Combo pip effect',
    uses: 1
  },
  {
    id: 'phantom',
    name: 'Phantom',
    description: 'Turn one selected side to a Two-Faced pip effect',
    uses: 1
  },
  {
    id: 'accumulation',
    name: 'Accumulation',
    description: 'Turn one selected side to a Create Consumable pip effect',
    uses: 1
  }
];

