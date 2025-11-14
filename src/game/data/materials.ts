import { DiceMaterial, DiceMaterialType } from '../types';

export const MATERIALS: DiceMaterial[] = [
  {
    id: 'plastic',
    name: 'Plastic',
    description: 'A basic plastic die with no special effects',
    abbreviation: 'pl'
  },
  {
    id: 'crystal',
    name: 'Crystal',
    description: '1.5x roll score per crystal die held in hand',
    abbreviation: 'cr'
  },
  {
    id: 'flower',
    name: 'Flower',
    description: '1.5x roll score per flower die previously scored in round',
    abbreviation: 'fl'
  },
  {
    id: 'golden',
    name: 'Golden',
    description: '+$3 when golden die is banked',
    abbreviation: 'gl'
  },
  {
    id: 'volcano',
    name: 'Volcano',
    description: 'Score multiplier increases with hot dice counter',
    abbreviation: 'vl'
  },
  {
    id: 'mirror',
    name: 'Mirror',
    description: 'All mirror dice copy a non-mirror die value when rolled',
    abbreviation: 'mr'
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    description: 'Lucky die with multiple possible effects: +200 points, +$10, or 1% chance to clone itself',
    abbreviation: 'rb'
  },
  {
    id: 'ghost',
    name: 'Ghost',
    description: 'Ghost dice do not need to be scored for hot dice',
    abbreviation: 'gh'
  },
  {
    id: 'lead',
    name: 'Lead',
    description: 'Remains in your hand even after being scored',
    abbreviation: 'ld'
  },
]; 

/* 

*/  