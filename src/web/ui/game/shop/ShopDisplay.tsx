import React from 'react';
import { Button } from '../../components/Button';
import { ShopState } from '../../../../game/types';
import { calculateShopDiscount } from '../../../../game/logic/shop';
import { ShopHeader } from './ShopHeader';
import { ShopItemList } from './ShopItemList';

interface ShopDisplayProps {
  shopState: ShopState;
  playerMoney: number;
  blessings?: any[];
  onPurchaseCharm: (index: number) => void;
  onPurchaseConsumable: (index: number) => void;
  onPurchaseBlessing: (index: number) => void;
  onContinue: () => void;
}

export const ShopDisplay: React.FC<ShopDisplayProps> = ({ 
  shopState,
  playerMoney,
  blessings = [],
  onPurchaseCharm,
  onPurchaseConsumable,
  onPurchaseBlessing,
  onContinue
}) => {
  const discount = calculateShopDiscount({ money: playerMoney, blessings } as any);
  return (
    <div style={{
      padding: '12px',
      border: '2px solid #4CAF50',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <ShopHeader playerMoney={playerMoney} discount={discount} />
      
      {/* Three Column Layout */}
      <div style={{ 
        display: 'flex', 
        gap: '12px',
        marginBottom: '16px',
        alignItems: 'flex-start'
      }}>
        <ShopItemList
          items={shopState.availableCharms}
          itemType="charm"
          playerMoney={playerMoney}
          discount={discount}
          onPurchase={onPurchaseCharm}
          title="Charms"
        />
        
        <ShopItemList
          items={shopState.availableConsumables}
          itemType="consumable"
          playerMoney={playerMoney}
          discount={discount}
          onPurchase={onPurchaseConsumable}
          title="Consumables"
        />
        
        <ShopItemList
          items={shopState.availableBlessings}
          itemType="blessing"
          playerMoney={playerMoney}
          discount={discount}
          onPurchase={onPurchaseBlessing}
          title="Blessings"
        />
      </div>
      
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block' }}>
          <Button onClick={onContinue}>
            Continue to Next Level
          </Button>
        </div>
      </div>
    </div>
  );
}; 