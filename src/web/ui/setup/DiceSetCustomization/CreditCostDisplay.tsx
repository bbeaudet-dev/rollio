import React from 'react';

interface CreditCostDisplayProps {
  cost: number;
  canAfford: boolean;
  size?: 'small' | 'medium';
}

export const CreditCostDisplay: React.FC<CreditCostDisplayProps> = ({
  cost,
  canAfford,
  size = 'small'
}) => {
  const dotSize = size === 'small' ? '4px' : '6px';
  const gap = size === 'small' ? '2px' : '3px';
  const height = size === 'small' ? '6px' : '8px';

  return (
    <div style={{
      display: 'flex',
      gap,
      justifyContent: 'center',
      alignItems: 'center',
      height,
      fontSize: '8px',
      color: canAfford ? '#28a745' : '#adb5bd',
      fontWeight: 'bold'
    }}>
      {cost > 5 ? (
        <>
          <span>{cost}</span>
          <div
            style={{
              width: dotSize,
              height: dotSize,
              backgroundColor: canAfford ? '#28a745' : '#adb5bd',
              borderRadius: '2px',
              flexShrink: 0
            }}
          />
        </>
      ) : (
        Array.from({ length: cost }, (_, i) => (
          <div
            key={i}
            style={{
              width: dotSize,
              height: dotSize,
              backgroundColor: canAfford ? '#28a745' : '#adb5bd',
              borderRadius: '2px',
              flexShrink: 0
            }}
          />
        ))
      )}
    </div>
  );
};

