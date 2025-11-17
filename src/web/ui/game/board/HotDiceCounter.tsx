import React from 'react';

interface HotDiceCounterProps {
  count: number;
}

export const HotDiceCounter: React.FC<HotDiceCounterProps> = ({ count }) => {
  if (count <= 0) return null;

  return (
    <div style={{
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: 500, // Less bold - informational display
      whiteSpace: 'nowrap',
      textAlign: 'center',
      pointerEvents: 'none', // Not clickable
      userSelect: 'none' // Can't select text
    }}>
      {'🔥'.repeat(count)} Hot dice! x{count}
    </div>
  );
};

