import React from 'react';
import { Charm, Consumable, Blessing } from '../../../../game/types';
import { CharmCard } from '../../components/CharmCard';
import { ConsumableCard } from '../../components/ConsumableCard';
import { BlessingCard } from '../../components/BlessingCard';

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
  if (itemType === 'charm') {
    return (
      <CharmCard
        charm={item as Charm}
        showPrice={true}
        price={finalPrice}
        basePrice={basePrice}
        discount={discount}
        canAfford={canAfford}
        showBuyButton={true}
        onBuy={onPurchase}
      />
    );
  }
  
  if (itemType === 'consumable') {
    return (
      <ConsumableCard
        consumable={item as Consumable}
        showPrice={true}
        price={finalPrice}
        basePrice={basePrice}
        discount={discount}
        canAfford={canAfford}
        showBuyButton={true}
        onBuy={onPurchase}
      />
    );
  }
  
  // blessing
  return (
    <BlessingCard
      blessing={item as Blessing}
      showPrice={true}
      price={finalPrice}
      basePrice={basePrice}
      discount={discount}
      canAfford={canAfford}
      showBuyButton={true}
      onBuy={onPurchase}
    />
  );
};

