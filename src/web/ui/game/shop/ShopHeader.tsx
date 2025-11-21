import React from 'react';
import { StandardButton } from '../../components/StandardButton';

interface ShopHeaderProps {
  playerMoney: number;
  discount: number;
  onRefresh?: () => void;
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({ playerMoney, discount, onRefresh }) => {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>🛒 Shop</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {onRefresh && (
            <StandardButton
              onClick={onRefresh}
              variant="secondary"
              size="medium"
            >
              Refresh Shop
            </StandardButton>
          )}
          <div style={{ fontSize: '14px' }}>
            <strong>Money:</strong> <span style={{ color: '#2d5a2d', fontWeight: 'bold' }}>${playerMoney}</span>
          </div>
        </div>
      </div>
      
      {discount > 0 && (
        <div style={{
          padding: '6px',
          backgroundColor: '#e8f5e9',
          borderRadius: '4px',
          marginBottom: '12px',
          fontSize: '11px',
          color: '#2d5a2d'
        }}>
          🎁 Shop Discount: {discount}% off!
        </div>
      )}
    </>
  );
};

