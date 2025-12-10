import React from 'react';

interface CreditIndicatorProps {
  cost: number;
  canAfford: boolean;
  size?: 'small' | 'medium' | 'large';
  maxDots?: number; // When to switch from dots to number + indicator
}

export const CreditIndicator: React.FC<CreditIndicatorProps> = ({
  cost,
  canAfford,
  size = 'medium',
  maxDots = 5
}) => {
  const dotSize = size === 'small' ? '5px' : size === 'medium' ? '7px' : '9px';
  const gap = size === 'small' ? '3px' : size === 'medium' ? '4px' : '5px';
  const height = size === 'small' ? '8px' : size === 'medium' ? '10px' : '12px';
  const fontSize = size === 'small' ? '10px' : size === 'medium' ? '12px' : '14px';

  const showDots = cost <= maxDots;

  return (
    <div style={{
      display: 'flex',
      gap,
      justifyContent: 'center',
      alignItems: 'center',
      height,
      fontSize,
      color: canAfford ? '#28a745' : '#adb5bd',
      fontWeight: 'bold'
    }}>
      {showDots ? (
        // Show individual dots
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
      ) : (
        // Show number + indicator
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
      )}
    </div>
  );
};

