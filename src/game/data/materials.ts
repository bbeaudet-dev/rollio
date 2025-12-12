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
    description: '1.5x MLT for each crystal die held in hand (i.e. not scored)',
    abbreviation: 'cr'
  },
  {
    id: 'flower',
    name: 'Flower',
    description: '+0.5 MLT for each flower die scored during current level without flopping (Current: [+0.0] MLT)',
    abbreviation: 'fl'
  },
  {
    id: 'golden',
    name: 'Golden',
    description: '+$3 when golden die is scored',
    abbreviation: 'gl'
  },
  {
    id: 'volcano',
    name: 'Volcano',
    description: 'Scoring a volcano die gives +100 PTS for each Hot Dice counter',
    abbreviation: 'vl'
  },
  {
    id: 'mirror',
    name: 'Mirror',
    description: 'Mirror dice copy the value of a non-mirror die when rolled',
    abbreviation: 'mr'
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    description: 'Multiple possible effects when scored: +200 points, +$10, or clone itself',
    abbreviation: 'rb'
  },
  {
    id: 'ghost',
    name: 'Ghost',
    description: 'Ghost dice do not need to be scored to trigger Hot Dice',
    abbreviation: 'gh'
  },
  {
    id: 'lead',
    name: 'Lead',
    description: 'Lead dice remain in your hand after being scored',
    abbreviation: 'ld'
  },
]; 

/* 

*/  