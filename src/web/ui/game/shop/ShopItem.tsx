import React from 'react';
import { Button } from '../../components/Button';
import { Charm, Consumable, Blessing } from '../../../../game/types';
import { RarityDot } from '../../../utils/rarityColors';
import { getBlessingName, getBlessingDescription } from '../../../../game/data/blessings';
import { WHIMS, WISHES } from '../../../../game/data/consumables';
import { getConsumableColor, getItemTypeColor } from '../../../utils/colors';

interface ShopItemProps {
  item: Charm | Consumable | Blessing;
  itemType: 'charm' | 'consumable' | 'blessing';
  basePrice: number;
  finalPrice: number;
  discount: number;
  canAfford: boolean;
  onPurchase: () => void;
}

export const ShopItem: React.FC<ShopItemProps> = ({
  item,
  itemType,
  basePrice,
  finalPrice,
  discount,
  canAfford,
  onPurchase
}) => {
  const getItemName = () => {
    if (itemType === 'blessing') {
      return getBlessingName(item as Blessing);
    }
    if (itemType === 'consumable') {
      return (item as Consumable).name;
    }
    return (item as Charm).name;
  };

  const getItemDescription = () => {
    if (itemType === 'blessing') {
      return getBlessingDescription(item as Blessing);
    }
    if (itemType === 'consumable') {
      return (item as Consumable).description;
    }
    return (item as Charm).description;
  };

  const getRarity = () => {
    if (itemType === 'blessing') {
      return 'common'; // Blessings don't have rarity
    }
    if (itemType === 'consumable') {
      // Consumables use category, not rarity
      return 'common'; // Default for display purposes
    }
    return (item as Charm).rarity || 'common';
  };

  const name = getItemName();
  const description = getItemDescription();
  const rarity = getRarity();

  // Get background color for items
  const getBackgroundColor = () => {
    if (itemType === 'consumable') {
      return getConsumableColor((item as Consumable).id, WHIMS, WISHES);
    }
    if (itemType === 'charm') return getItemTypeColor('charm');
    if (itemType === 'blessing') return getItemTypeColor('blessing');
    return 'white';
  };

  return (
    <div style={{
      padding: '6px 8px',
      border: '1px solid #ddd',
      borderRadius: '3px',
      backgroundColor: getBackgroundColor(),
      opacity: canAfford ? 1 : 0.6,
      fontSize: '11px',
      marginBottom: '4px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          {itemType !== 'blessing' && <RarityDot rarity={rarity} />}
          <span style={{ fontWeight: 'bold', fontSize: '11px', marginRight: '4px' }}>{name}</span>
          <span style={{ fontSize: '10px', color: '#666' }}>${finalPrice}</span>
          {discount > 0 && basePrice !== finalPrice && (
            <span style={{ fontSize: '9px', color: '#999', textDecoration: 'line-through', marginLeft: '4px' }}>
              ${basePrice}
            </span>
          )}
        </div>
        <Button 
          onClick={onPurchase}
          disabled={!canAfford}
          style={{ padding: '4px 8px', fontSize: '10px' }}
        >
          Buy
        </Button>
      </div>
      <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
        {description}
      </div>
    </div>
  );
};

