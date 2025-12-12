import React from 'react';

interface ShopVoucherDisplayProps {
  vouchers: number;
}

export const ShopVoucherDisplay: React.FC<ShopVoucherDisplayProps> = ({ vouchers }) => {
  return (
    <div style={{
      padding: '6px 12px',
      backgroundColor: '#fff',
      borderRadius: '6px',
      border: '2px solid rgba(0, 0, 0, 0.2)',
      fontSize: '16px',
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#2c3e50',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '60px',
      gap: '4px'
    }}>
      🎫 {vouchers}
    </div>
  );
};

