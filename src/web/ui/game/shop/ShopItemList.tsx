import React from 'react';
import { ShopItem } from './ShopItem';
import { Charm, Consumable, Blessing } from '../../../../game/types';
import { getCharmPrice, getConsumablePrice, getBlessingPrice, applyDiscount } from '../../../../game/logic/shop';

interface ShopItemListProps {
  items: (Charm | Consumable | Blessing)[];
  itemType: 'charm' | 'consumable' | 'blessing';
  playerMoney: number;
  discount: number;
  onPurchase: (index: number) => void;
  title: string;
}

export const ShopItemList: React.FC<ShopItemListProps> = ({
  items,
  itemType,
  playerMoney,
  discount,
  onPurchase,
  title
}) => {
  const getPrice = (item: Charm | Consumable | Blessing) => {
    if (itemType === 'charm') {
      return getCharmPrice(item as Charm);
    } else if (itemType === 'consumable') {
      return getConsumablePrice(item as Consumable);
    } else {
      return getBlessingPrice(item as Blessing);
    }
  };

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <h3 style={{ marginBottom: '8px', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' }}>
        {title}
      </h3>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {items.map((item, index) => {
            const basePrice = getPrice(item);
            const finalPrice = applyDiscount(basePrice, discount);
            const canAfford = playerMoney >= finalPrice;

            return (
              <ShopItem
                key={item.id}
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

