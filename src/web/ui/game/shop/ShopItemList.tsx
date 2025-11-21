import React from 'react';
import { ShopItem } from './ShopItem';
import { Charm, Consumable, Blessing } from '../../../../game/types';
import { useDifficulty } from '../../../contexts/DifficultyContext';
import { getCharmPrice, getConsumablePrice, getBlessingPrice, applyDiscount } from '../../../../game/logic/shop';

interface ShopItemListProps {
  items: (Charm | Consumable | Blessing | null)[];
  itemType: 'charm' | 'consumable' | 'blessing';
  playerMoney: number;
  discount: number;
  onPurchase: (index: number) => void;
}

export const ShopItemList: React.FC<ShopItemListProps> = ({
  items,
  itemType,
  playerMoney,
  discount,
  onPurchase
}) => {
  const difficulty = useDifficulty();
  
  const getPrice = (item: Charm | Consumable | Blessing | null) => {
    if (!item) return 0;
    // Convert string to DifficultyLevel type when calling game functions
    const difficultyLevel = difficulty as any;
    if (itemType === 'charm') {
      return getCharmPrice(item as Charm, difficultyLevel);
    } else if (itemType === 'consumable') {
      return getConsumablePrice(item as Consumable, difficultyLevel);
    } else {
      return getBlessingPrice(item as Blessing, difficultyLevel);
    }
  };

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      {items.length === 0 ? (
        <div style={{ 
          padding: '8px', 
          backgroundColor: 'white', 
          borderRadius: '4px', 
          color: '#666', 
          textAlign: 'center', 
          fontSize: '10px' 
        }}>
          (None)
        </div>
      ) : (
        <div style={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center'
        }}>
          {items.map((item, index) => {
            // Show blank spot if item was purchased (null)
            if (!item) {
              return (
                <div
                  key={`empty-${index}`}
                  style={{
                    padding: '6px 8px',
                    border: '1px dashed #ccc',
                    borderRadius: '3px',
                    backgroundColor: '#f5f5f5',
                    fontSize: '11px',
                    minHeight: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontStyle: 'italic'
                  }}
                >
                  Sold
                </div>
              );
            }

            const basePrice = getPrice(item);
            const finalPrice = applyDiscount(basePrice, discount);
            const canAfford = playerMoney >= finalPrice;

            return (
              <ShopItem
                key={item.id || `item-${index}`}
                item={item}
                itemType={itemType}
                basePrice={basePrice}
                finalPrice={finalPrice}
                discount={discount}
                canAfford={canAfford}
                onPurchase={() => onPurchase(index)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

