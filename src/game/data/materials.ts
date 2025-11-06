import { DiceMaterial, DiceMaterialType } from '../types';

export const MATERIALS: DiceMaterial[] = [
  {
    id: 'plastic',
    name: 'Plastic',
    description: 'A basic plastic die with no special effects',
    abbreviation: 'pl',
    color: 'white'
  },
  {
    id: 'crystal',
    name: 'Crystal',
    description: '1.5x roll score per crystal die already scored this round',
    abbreviation: 'cr',
    color: 'purple'
  },
  {
    id: 'wooden',
    name: 'Wooden',
    description: '1.25x roll score per wooden die in the set',
    abbreviation: 'wd',
    color: 'gold'
  },
  {
    id: 'golden',
    name: 'Golden',
    description: '2.0x roll score when all golden dice are scored together',
    abbreviation: 'gl',
    color: 'yellow'
  },
  {
    id: 'volcano',
    name: 'Volcano',
    description: 'Provides bonus multipliers based on hot dice counter',
    abbreviation: 'vl',
    color: 'fireRed'
  },
  {
    id: 'mirror',
    name: 'Mirror',
    description: 'Acts as a Wild die that can be any value when scored',
    abbreviation: 'mr',
    color: 'royalBlue'
  },
  // For future use
  {
    id: 'rainbow',
    name: 'Rainbow',
    description: 'Lucky die with possible special effects',
    abbreviation: 'rb',
    color: 'rainbow' // Special case for multi-color
  },

]; 