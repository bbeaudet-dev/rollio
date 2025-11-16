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
    description: 'Doubles your current money when used.',
    uses: 1
  },
  {
    id: 'charmGiver',
    name: 'Charm Giver',
    description: 'Gain a random charm.',
    uses: 1
  },
  {
    id: 'createTwoConsumables',
    name: 'Consumable Pack',
    description: 'Create 2 random consumables.',
    uses: 1
  },
  {
    id: 'createLastConsumable',
    name: 'Consumable Echo',
    description: 'Create the last consumable used.',
    uses: 1
  },
  {
    id: 'addMoneyFromItems',
    name: 'Item Valuer',
    description: 'Add money equal to the value of your consumables, charms, and blessings.',
    uses: 1
  },
  {
    id: 'doubleMoneyCapped',
    name: 'Capped Doubler',
    description: 'Double money, up to $50.',
    uses: 1
  },
  {
    id: 'chisel',
    name: 'Chisel',
    description: 'Increase the values of 2 selected sides by 1 (cannot be same die).',
    uses: 1
  },
  {
    id: 'createTwoHandUpgrades',
    name: 'Hand Upgrader',
    description: 'Create 2 hand upgrades.',
    uses: 1
  },
  {
    id: 'potteryWheel',
    name: 'Pottery Wheel',
    description: 'Decrease the values of 2 selected sides by 1 (cannot be same die or side).',
    uses: 1
  },
  {
    id: 'forfeitRecovery',
    name: 'Flop Recovery',
    description: 'Recover 1.25x the last round\'s forfeited points and add to current round score.',
    uses: 1
  }
];

