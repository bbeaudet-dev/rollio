import { Charm, Consumable } from '../../game/types';

export interface CharmInventoryProps {
  charms: Charm[];
  onSellCharm?: (index: number) => void;
}
 
export interface ConsumableInventoryProps {
  consumables: Consumable[];
  onConsumableUse: (index: number) => void;
  onSellConsumable?: (index: number) => void;
} 