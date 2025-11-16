// Re-export whims and wishes for convenience
export { WHIMS, type Whim } from './whims';
export { WISHES, type Wish } from './wishes';

// Combined list for backwards compatibility (if needed)
import { WHIMS } from './whims';
import { WISHES } from './wishes';

export type Consumable = typeof WHIMS[number] | typeof WISHES[number];

export const CONSUMABLES: Consumable[] = [...WHIMS, ...WISHES];
