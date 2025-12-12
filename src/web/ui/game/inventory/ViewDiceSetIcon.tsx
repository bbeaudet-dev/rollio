import React from 'react';
import { Die } from '../../../../game/types';
import { DiceFace } from '../board/dice/DiceFace';
import { INVENTORY_ICON_SIZE } from '../../components/cardSizes';
import { playClickSound } from '../../../utils/sounds';

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

  const handleClick = () => {
    playClickSound();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      style={{
        width: `${INVENTORY_ICON_SIZE}px`,
        height: `${INVENTORY_ICON_SIZE}px`,
        border: '2px solid #000',
        borderRadius: '8px',
        backgroundColor: '#ff9800',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        padding: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2), 0 0 6px rgba(255, 255, 255, 0.1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#fb8c00';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3), 0 0 10px rgba(255, 255, 255, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#ff9800';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2), 0 0 6px rgba(255, 255, 255, 0.1)';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
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

