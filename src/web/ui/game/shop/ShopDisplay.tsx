import React from 'react';
import { ActionButton } from '../../components/ActionButton';
import { ShopState } from '../../../../game/types';
import { calculateShopDiscount } from '../../../../game/logic/shop';
import { ShopItemList } from './ShopItemList';
import { useShopActions } from '../../../contexts/ShopActionsContext';
import { NextLevelPreview } from './NextLevelPreview';
import { DifficultyLevel } from '../../../../game/logic/difficulty';

interface ShopDisplayProps {
  shopState: ShopState;
  playerMoney: number;
  shopVouchers?: number;
  blessings?: any[];
  currentLevelNumber?: number;
  difficulty?: DifficultyLevel;
  gameState?: any; // For accessing pre-generated level configs
}

export const ShopDisplay: React.FC<ShopDisplayProps> = ({ 
  shopState,
  playerMoney,
  shopVouchers = 0,
  blessings = [],
  currentLevelNumber,
  difficulty,
  gameState
}) => {
  const { purchaseCharm, purchaseConsumable, purchaseBlessing, exitShop, refreshShop } = useShopActions();
  const discount = calculateShopDiscount({ money: playerMoney, blessings } as any);
  return (
    <div style={{
      width: '100%',
      padding: '10px',
      backgroundColor: '#8B4513', // Brown wood color for shop counter
      backgroundImage: `
        repeating-linear-gradient(90deg, 
          transparent, 
          transparent 98px, 
          rgba(139, 69, 19, 0.3) 98px, 
          rgba(139, 69, 19, 0.3) 100px
        ),
        repeating-linear-gradient(0deg, 
          transparent, 
          transparent 48px, 
          rgba(101, 67, 33, 0.2) 48px, 
          rgba(101, 67, 33, 0.2) 50px
        )
      `,
      minHeight: '500px',
      position: 'relative',
      overflow: 'visible', // No scrollbar - everything should be visible
      boxSizing: 'border-box'
    }}>
      {/* Shop counter/shelves background */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '200px',
        backgroundColor: '#654321', // Darker brown for counter
        borderTop: '4px solid #3E2723',
        boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.3)',
        backgroundImage: `
          linear-gradient(to bottom, 
            rgba(101, 67, 33, 0.8) 0%,
            rgba(62, 39, 35, 0.9) 100%
          )
        `
      }} />
      
      {/* Content container */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'rgba(249, 249, 249, 0.85)',
        padding: '20px 30px 20px 30px', 
        borderRadius: '8px',
        border: '2px solid #4CAF50',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible', // No scrollbar - everything should be visible
        boxSizing: 'border-box'
      }}>
        
        {discount > 0 && (
          <div style={{
            padding: '4px 6px',
            backgroundColor: 'rgba(232, 245, 233, 0.8)',
            borderRadius: '4px',
            marginBottom: '8px',
            fontSize: '10px',
            color: '#2d5a2d',
            flexShrink: 0
          }}>
            Shop Discount: {discount}% off!
          </div>
        )}
      
        {/* Content area */}
        <div style={{ flex: 1, overflow: 'visible', minHeight: 0, display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          {/* Left side: Shop items */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Charms Section - Full width, 2 columns */}
            <div style={{ marginBottom: '12px' }}>
              <ShopItemList
                items={shopState.availableCharms}
                itemType="charm"
                playerMoney={playerMoney}
                discount={discount}
                onPurchase={purchaseCharm}
              />
            </div>
            
            {/* Consumables and Blessings - Side by side */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '12px',
              alignItems: 'flex-start'
            }}>
              <ShopItemList
                items={shopState.availableConsumables}
                itemType="consumable"
                playerMoney={playerMoney}
                discount={discount}
                onPurchase={purchaseConsumable}
              />
              
              <ShopItemList
                items={shopState.availableBlessings}
                itemType="blessing"
                playerMoney={playerMoney}
                discount={discount}
                onPurchase={purchaseBlessing}
              />
            </div>
          </div>
          
          {/* Right side: Next Level Preview */}
          {currentLevelNumber !== undefined && difficulty && (
            <div style={{ flexShrink: 0, width: '400px' }}>
              <NextLevelPreview 
                currentLevelNumber={currentLevelNumber}
                difficulty={difficulty}
                gameState={gameState}
              />
            </div>
          )}
        </div>
      
        {/* Continue button and Refresh at bottom */}
        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <ActionButton
            onClick={refreshShop}
            variant="secondary"
            size="medium"
          >
            Refresh Shop {shopVouchers > 0 ? `(1 voucher)` : `(No vouchers)`}
          </ActionButton>
          <ActionButton onClick={exitShop} variant="success" size="medium">
            Continue to Next Level
          </ActionButton>
        </div>
      </div>
    </div>
  );
}; 