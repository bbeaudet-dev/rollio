import { Charm, Consumable } from '../../game/types';

export interface CharmInventoryProps {
  charms: Charm[];
  onSellCharm?: (index: number) => void;
  maxSlots?: number;
  charmState?: Record<string, any> | null;
}
 
export interface ConsumableInventoryProps {
  consumables: Consumable[];
  onConsumableUse: (index: number) => void;
  onSellConsumable?: (index: number) => void;
  maxSlots?: number;
  selectedDiceCount?: number;
} 