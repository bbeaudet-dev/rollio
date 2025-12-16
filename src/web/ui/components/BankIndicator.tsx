import React from 'react';

interface BankIndicatorProps {
  count: number;
  maxVisible?: number; // Maximum number of indicators to show before showing "+X"
}

export const BankIndicator: React.FC<BankIndicatorProps> = ({ 
  count, 
  maxVisible = 10 
}) => {
  const indicators = [];
  for (let i = 0; i < count && i < maxVisible; i++) {
    indicators.push(
      <div
        key={i}
        style={{
          width: '8px',
          height: '8px',
          backgroundColor: '#ffd700',
          border: '1px solid #ffed4e',
          borderRadius: '2px',
          transform: 'rotate(45deg)',
          boxShadow: '0 0 2px rgba(255, 215, 0, 0.5)'
        }}
      />
    );
  }
  if (count > maxVisible) {
    indicators.push(
      <span key="more" style={{ fontSize: '10px', lineHeight: '1', color: 'white' }}>
        +{count - maxVisible}
      </span>
    );
  }
  
  return (
    <div style={{ 
      display: 'flex', 
      gap: '4px', 
      alignItems: 'center', 
      justifyContent: 'center',
      marginTop: '1px'
    }}>
      {indicators}
    </div>
  );
};

