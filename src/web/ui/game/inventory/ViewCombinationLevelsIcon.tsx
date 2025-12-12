import React from 'react';
import { INVENTORY_ICON_SIZE } from '../../components/cardSizes';
import { playClickSound } from '../../../utils/sounds';

interface ViewCombinationLevelsIconProps {
  onClick: () => void;
}

export const ViewCombinationLevelsIcon: React.FC<ViewCombinationLevelsIconProps> = ({
  onClick
}) => {
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
        fontSize: `${Math.round(INVENTORY_ICON_SIZE * 0.6)}px`,
        transition: 'all 0.2s ease',
        padding: 0,
        color: 'white',
        fontWeight: 'bold',
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
      title="View Combination Levels"
    >
      <span style={{
        color: 'white',
        WebkitTextStroke: '2.5px black',
        fontWeight: 'bold',
        fontSize: `${Math.round(INVENTORY_ICON_SIZE * 0.7)}px`,
        lineHeight: 1,
        display: 'inline-block',
        textShadow: `
          -1px -1px 0 #000,
          1px -1px 0 #000,
          -1px 1px 0 #000,
          1px 1px 0 #000,
          -2px -2px 0 #000,
          2px -2px 0 #000,
          -2px 2px 0 #000,
          2px 2px 0 #000
        `
      }}>
        ↑
      </span>
    </button>
  );
};

