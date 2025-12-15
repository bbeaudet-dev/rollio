export interface Wish {
  id: string;
  name: string;
  description: string;
  uses: number;
}

export const WISHES: Wish[] = [
  {
    id: 'midasTouch',
    name: 'Midas Touch',
    description: 'Copy the material of a random die in your hand to a selected die',
    uses: 1
  },
  {
    id: 'freebie',
    name: 'Freebie',
    description: 'Add a standard plastic die to your dice set',
    uses: 1
  },
  {
    id: 'sacrifice',
    name: 'Sacrifice',
    description: 'Destroy a random die, add a charm slot',
    uses: 1
  },
  {
    id: 'welfare',
    name: 'Welfare',
    description: 'Upgrade all combinations by 2',
    uses: 1
  },
  {
    id: 'origin',
    name: 'Origin',
    description: '1 in 2 chance to create a Legendary charm',
    uses: 1
  },
  {
    id: 'distortion',
    name: 'Distortion',
    description: 'Create 1 Rare charm',
    uses: 1
  },
  {
    id: 'frankenstein',
    name: 'Frankenstein',
    description: 'Copy 1 random Charm, destroy 2 others',
    uses: 1
  },
  {
    id: 'interest',
    name: 'Interest',
    description: 'Restore banks to maximum (after bonuses)',
    uses: 1
  },
  {
    id: 'mulligan',
    name: 'Mulligan',
    description: 'Restore rerolls to maximum (after bonuses)',
    uses: 1
  },
];

