import React from 'react';

interface ShopHeaderProps {
  playerMoney: number;
  discount: number;
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({ playerMoney, discount }) => {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>🛒 Shop</h2>
        <div style={{ fontSize: '14px' }}>
          <strong>Money:</strong> <span style={{ color: '#2d5a2d', fontWeight: 'bold' }}>${playerMoney}</span>
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

