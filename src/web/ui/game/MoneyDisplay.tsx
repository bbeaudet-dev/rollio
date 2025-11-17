import React from 'react';

interface MoneyDisplayProps {
  money: number;
}

export const MoneyDisplay: React.FC<MoneyDisplayProps> = ({ money }) => {
  return (
    <div style={{
      padding: '6px 12px',
      backgroundColor: '#fff',
      borderRadius: '4px',
      border: '1px solid #dee2e6',
      fontSize: '14px',
      fontWeight: 'bold',
      textAlign: 'center'
    }}>
      <strong>Money:</strong> ${money}
    </div>
  );
};

