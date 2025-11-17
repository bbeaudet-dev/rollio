export interface Whim {
  id: string;
  name: string;
  description: string;
  uses: number;
}

export const WHIMS: Whim[] = [
  {
    id: 'moneyDoubler',
    name: 'Money Doubler',
    description: 'Doubles your current money',
    uses: 1
  },
  {
    id: 'addMoneyFromItems',
    name: 'Item Valuer',
    description: 'Gain the total sell value of your consumables, charms, and blessings.',
    uses: 1
  },
  {
    id: 'charmGiver',
    name: 'Charm Giver',
    description: 'Create a random charm',
    uses: 1
  },
  {
    id: 'createTwoConsumables',
    name: 'Consumable Pack',
    description: 'Create 2 random consumables',
    uses: 1
  },
  {
    id: 'createTwoHandUpgrades',
    name: 'Hand Upgrader',
    description: 'Create 2 hand upgrades.',
    uses: 1
  },
  {
    id: 'createLastConsumable',
    name: 'Consumable Echo',
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
    id: 'forfeitRecovery',
    name: 'Flop Recovery',
    description: 'Recover 1.25x of your last forfeited points (after a flop)',
    uses: 1
  }
];

