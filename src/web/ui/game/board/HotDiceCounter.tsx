import React from 'react';

interface HotDiceCounterProps {
  count: number;
}

export const HotDiceCounter: React.FC<HotDiceCounterProps> = ({ count }) => {
  if (count <= 0) return null;

  return (
    <div style={{
      color: '#ffa500',
      fontSize: '14px',
      fontWeight: 600,
      whiteSpace: 'nowrap',
      textAlign: 'center',
      pointerEvents: 'none',
      userSelect: 'none',
      textShadow: '0 0 8px rgba(255, 165, 0, 0.8)'
    }}>
      x{count}
    </div>
  );
};

