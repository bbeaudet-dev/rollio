/**
 * Pip Effect configurations and definitions
 * Pip effects are special properties that can be applied to individual die faces
 * Similar to Balatro's enhancements/seals system
 */

export type PipEffectType = 
  | 'money'
  | 'createConsumable'
  | 'upgradeHand'
  | 'twoFaced'
  | 'wild'
  | 'blank';

export interface PipEffect {
  id: string;
  name: string;
  description: string;
  type: PipEffectType;
  // Effect properties (will be applied when die with this pip effect is scored)
  moneyAmount?: number; // For 'money' type
  multiplier?: number; // For score multiplier effects
  [key: string]: any; // Allow other effect properties
}

/**
 * Pip Effect definitions
 */
export const PIP_EFFECTS: PipEffect[] = [
  {
    id: 'money',
    name: 'Money',
    description: '+$1 when scored',
    type: 'money',
    moneyAmount: 1,
  },
  {
    id: 'createConsumable',
    name: 'Create Consumable',
    description: 'Creates a random consumable when scored',
    type: 'createConsumable',
  },
  {
    id: 'upgradeHand',
    name: 'Upgrade Hand',
    description: 'Upgrades the scored combination(s)',
    type: 'upgradeHand',
  },
  {
    id: 'twoFaced',
    name: 'Two-Faced',
    description: 'Die can be scored as either face value',
    type: 'twoFaced',
  },
  {
    id: 'wild',
    name: 'Wild',
    description: 'Can be used as any value for scoring combinations',
    type: 'wild',
  },
  {
    id: 'blank',
    name: 'Blank',
    description: '1.1x score multiplier',
    type: 'blank',
    multiplier: 1.1,
  },
];

/**
 * Get a pip effect by ID
 */
export function getPipEffectById(id: string): PipEffect | undefined {
  return PIP_EFFECTS.find(effect => effect.id === id);
}

/**
 * Get pip effect by type
 */
export function getPipEffectByType(type: PipEffectType): PipEffect | undefined {
  return PIP_EFFECTS.find(effect => effect.type === type);
}

