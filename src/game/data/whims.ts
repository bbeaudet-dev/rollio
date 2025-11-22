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
    description: 'Create 2 hand upgrades.',
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
  }
];

