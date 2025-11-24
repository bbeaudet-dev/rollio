import React, { useState } from 'react';
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
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = () => {
    setIsSelected(!isSelected);
  };

  if (itemType === 'charm') {
    return (
      <div onClick={handleClick} style={{ position: 'relative' }}>
      <CharmCard
        charm={item as Charm}
        showPrice={true}
        price={finalPrice}
        basePrice={basePrice}
        discount={discount}
        canAfford={canAfford}
        showBuyButton={isSelected}
        onBuy={onPurchase}
        highlighted={isSelected}
        isInShop={true}
      />
        {isSelected && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '8px',
            borderRadius: '0 0 5px 5px',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPurchase();
              }}
              style={{
                backgroundColor: canAfford ? '#4CAF50' : '#999',
                color: 'white',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '4px',
                cursor: canAfford ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              Buy ${finalPrice}
            </button>
          </div>
        )}
      </div>
    );
  }
  
  if (itemType === 'consumable') {
    return (
      <div onClick={handleClick} style={{ position: 'relative' }}>
        <ConsumableCard
          consumable={item as Consumable}
          showPrice={true}
          price={finalPrice}
          basePrice={basePrice}
          discount={discount}
          canAfford={canAfford}
          showBuyButton={isSelected}
          onBuy={onPurchase}
          highlighted={isSelected}
        />
        {isSelected && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '8px',
            borderRadius: '0 0 5px 5px',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPurchase();
              }}
              style={{
                backgroundColor: canAfford ? '#4CAF50' : '#999',
                color: 'white',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '4px',
                cursor: canAfford ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              Buy ${finalPrice}
            </button>
          </div>
        )}
      </div>
    );
  }
  
  // blessing
  return (
    <div onClick={handleClick} style={{ position: 'relative' }}>
      <BlessingCard
        blessing={item as Blessing}
        showPrice={true}
        price={finalPrice}
        basePrice={basePrice}
        discount={discount}
        canAfford={canAfford}
        showBuyButton={isSelected}
        onBuy={onPurchase}
        highlighted={isSelected}
      />
      {isSelected && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '8px',
          borderRadius: '0 0 5px 5px',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPurchase();
            }}
            style={{
              backgroundColor: canAfford ? '#4CAF50' : '#999',
              color: 'white',
              border: 'none',
              padding: '6px 16px',
              borderRadius: '4px',
              cursor: canAfford ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            Buy ${finalPrice}
          </button>
        </div>
      )}
    </div>
  );
};

