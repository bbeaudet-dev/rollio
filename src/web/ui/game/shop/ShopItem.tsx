import React from 'react';
import { Button } from '../../components/Button';
import { Charm, Consumable, Blessing } from '../../../../game/types';
import { RarityDot } from '../../../utils/rarityColors';
import { getBlessingName, getBlessingDescription } from '../../../../game/data/blessings';

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
    return item.name;
  };

  const getItemDescription = () => {
    if (itemType === 'blessing') {
      return getBlessingDescription(item as Blessing);
    }
    return item.description;
  };

  const getRarity = () => {
    if (itemType === 'blessing') {
      return 'common'; // Blessings don't have rarity
    }
    return (item as Charm | Consumable).rarity || 'common';
  };

  const name = getItemName();
  const description = getItemDescription();
  const rarity = getRarity();

  return (
    <div style={{
      padding: '6px 8px',
      border: '1px solid #ddd',
      borderRadius: '3px',
      backgroundColor: 'white',
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

