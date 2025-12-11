// Re-export whims, wishes, and combination upgrades for convenience
export { WHIMS, type Whim } from './whims';
export { WISHES, type Wish } from './wishes';
export { COMBINATION_UPGRADES, type CombinationUpgrade } from './combinationUpgrades';

// Combined list for backwards compatibility (if needed)
import { WHIMS } from './whims';
import { WISHES } from './wishes';
import { COMBINATION_UPGRADES } from './combinationUpgrades';

export type Consumable = typeof WHIMS[number] | typeof WISHES[number] | typeof COMBINATION_UPGRADES[number];

export const CONSUMABLES: Consumable[] = [...WHIMS, ...WISHES, ...COMBINATION_UPGRADES];
