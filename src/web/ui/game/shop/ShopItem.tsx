import React, { useRef } from 'react';
import { Charm, Consumable, Blessing } from '../../../../game/types';
import { CharmCard } from '../../components/CharmCard';
import { ConsumableCard } from '../../components/ConsumableCard';
import { BlessingCard } from '../../components/BlessingCard';
import { useUnlocks } from '../../../contexts/UnlockContext';

interface ShopItemProps {
  item: Charm | Consumable | Blessing;
  itemType: 'charm' | 'consumable' | 'blessing';
  basePrice: number;
  finalPrice: number;
  discount: number;
  canAfford: boolean;
  onPurchase: () => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const ShopItem: React.FC<ShopItemProps> = ({
  item,
  itemType,
  basePrice,
  finalPrice,
  discount,
  canAfford,
  onPurchase,
  isSelected = false,
  onSelect
}) => {
  const { unlockedItems } = useUnlocks();
  const itemRef = useRef<HTMLDivElement>(null);
  const isLocked = !unlockedItems.has(`${itemType}:${item.id}`);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect();
    }
  };

  const handlePurchase = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPurchase) {
      onPurchase();
    }
  };

  if (itemType === 'charm') {
    return (
      <div ref={itemRef} onClick={handleClick} style={{ position: 'relative' }}>
      <CharmCard
        charm={item as Charm}
        showPrice={true}
        price={finalPrice}
        basePrice={basePrice}
        discount={discount}
        canAfford={canAfford}
        showBuyButton={isSelected}
        onBuy={() => handlePurchase({} as React.MouseEvent)}
        highlighted={isSelected}
        isInActiveGame={true}
        isLocked={isLocked}
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
              onClick={handlePurchase}
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
              <span style={{ whiteSpace: 'nowrap' }}>Buy ${finalPrice}</span>
            </button>
          </div>
        )}
      </div>
    );
  }
  
  if (itemType === 'consumable') {
    return (
      <div ref={itemRef} onClick={handleClick} style={{ position: 'relative' }}>
        <ConsumableCard
          consumable={item as Consumable}
          showPrice={true}
          price={finalPrice}
          basePrice={basePrice}
          discount={discount}
          canAfford={canAfford}
          showBuyButton={isSelected}
          onBuy={() => handlePurchase({} as React.MouseEvent)}
          highlighted={isSelected}
          isInActiveGame={true}
          isLocked={isLocked}
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
              onClick={handlePurchase}
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
              <span style={{ whiteSpace: 'nowrap' }}>Buy ${finalPrice}</span>
            </button>
          </div>
        )}
      </div>
    );
  }
  
  // blessing
  return (
    <div ref={itemRef} onClick={handleClick} style={{ position: 'relative' }}>
      <BlessingCard
        blessing={item as Blessing}
        showPrice={true}
        price={finalPrice}
        basePrice={basePrice}
        discount={discount}
        canAfford={canAfford}
        showBuyButton={isSelected}
        onBuy={() => handlePurchase({} as React.MouseEvent)}
        highlighted={isSelected}
        isInActiveGame={true}
        isLocked={isLocked}
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
            <span style={{ whiteSpace: 'nowrap' }}>Buy ${finalPrice}</span>
          </button>
        </div>
      )}
    </div>
  );
};

