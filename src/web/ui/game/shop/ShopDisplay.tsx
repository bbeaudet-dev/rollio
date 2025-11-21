import React from 'react';
import { StandardButton } from '../../components/StandardButton';
import { ShopState } from '../../../../game/types';
import { calculateShopDiscount } from '../../../../game/logic/shop';
import { ShopItemList } from './ShopItemList';

interface ShopDisplayProps {
  shopState: ShopState;
  playerMoney: number;
  blessings?: any[];
  onPurchaseCharm: (index: number) => void;
  onPurchaseConsumable: (index: number) => void;
  onPurchaseBlessing: (index: number) => void;
  onContinue: () => void;
  onRefresh?: () => void;
}

export const ShopDisplay: React.FC<ShopDisplayProps> = ({ 
  shopState,
  playerMoney,
  blessings = [],
  onPurchaseCharm,
  onPurchaseConsumable,
  onPurchaseBlessing,
  onContinue,
  onRefresh
}) => {
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
      height: '500px',
      minHeight: '500px',
      position: 'relative',
      overflow: 'hidden',
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
        padding: '12px 20px 100px 20px', // Extra bottom padding for tooltips
        borderRadius: '8px',
        border: '2px solid #4CAF50',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        boxSizing: 'border-box'
      }}>
        {/* Money and Refresh at top */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px', flexShrink: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
            Money: <span style={{ color: '#2d5a2d' }}>${playerMoney}</span>
          </div>
          {onRefresh && (
            <StandardButton
              onClick={onRefresh}
              variant="secondary"
              size="small"
            >
              Refresh Shop
            </StandardButton>
          )}
        </div>
        
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
      
        {/* Scrollable content area */}
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {/* Charms Section - Full width, 2 columns */}
          <div style={{ marginBottom: '12px' }}>
            <ShopItemList
              items={shopState.availableCharms}
              itemType="charm"
              playerMoney={playerMoney}
              discount={discount}
              onPurchase={onPurchaseCharm}
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
              onPurchase={onPurchaseConsumable}
            />
            
            <ShopItemList
              items={shopState.availableBlessings}
              itemType="blessing"
              playerMoney={playerMoney}
              discount={discount}
              onPurchase={onPurchaseBlessing}
            />
          </div>
        </div>
      
        {/* Continue button at bottom */}
        <div style={{ marginTop: '8px', textAlign: 'center', flexShrink: 0 }}>
          <div style={{ display: 'inline-block' }}>
            <StandardButton onClick={onContinue} variant="success" size="medium">
              Continue to Next Level
            </StandardButton>
          </div>
        </div>
      </div>
    </div>
  );
}; 