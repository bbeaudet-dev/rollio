import React from 'react';

interface HotDiceCounterProps {
  count: number;
}

export const HotDiceCounter: React.FC<HotDiceCounterProps> = ({ count }) => {
  if (count <= 0) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: '10px',
      right: '50%',
      transform: 'translateX(calc(-100% - 20px))', // Position to the left of center with gap
      zIndex: 25,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: 'bold',
      whiteSpace: 'nowrap'
    }}>
      {'🔥'.repeat(count)} Hot dice! x{count}
    </div>
  );
};

