import React from 'react';
import { Die } from '../../../../game/types';
import { DiceFace } from '../board/dice/DiceFace';
import { INVENTORY_ICON_SIZE } from '../../components/cardSizes';

interface ViewDiceSetIconProps {
  diceSet: Die[];
  onClick: () => void;
}

export const ViewDiceSetIcon: React.FC<ViewDiceSetIconProps> = ({
  diceSet,
  onClick
}) => {
  if (diceSet.length === 0) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      style={{
        width: `${INVENTORY_ICON_SIZE}px`,
        height: `${INVENTORY_ICON_SIZE}px`,
        border: '2px solid rgba(0, 0, 0, 0.2)',
        borderRadius: '6px',
        backgroundColor: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        padding: '4px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f8f9fa';
        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.3)';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#fff';
        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      title="View Dice Set"
    >
      <DiceFace
        value={diceSet[0].allowedValues[0] || 1}
        size={Math.round(INVENTORY_ICON_SIZE * 0.8)}
        material={diceSet[0].material}
        pipEffect={diceSet[0].pipEffects?.[diceSet[0].allowedValues[0] || 1]}
      />
    </button>
  );
};

