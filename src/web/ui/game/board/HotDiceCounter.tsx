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
      right: '10px',
      zIndex: 25,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
      maxWidth: 'calc(100% - 20px)',
      boxSizing: 'border-box'
    }}>
      {'🔥'.repeat(count)} Hot dice! x{count}
    </div>
  );
};

