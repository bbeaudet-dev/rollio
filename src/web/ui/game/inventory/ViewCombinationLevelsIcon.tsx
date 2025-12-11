import React from 'react';
import { INVENTORY_ICON_SIZE } from '../../components/cardSizes';

interface ViewCombinationLevelsIconProps {
  onClick: () => void;
}

export const ViewCombinationLevelsIcon: React.FC<ViewCombinationLevelsIconProps> = ({
  onClick
}) => {
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
        fontSize: `${Math.round(INVENTORY_ICON_SIZE * 0.5)}px`,
        transition: 'all 0.2s ease',
        padding: 0
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
      title="View Combination Levels"
    >
      ✋
    </button>
  );
};

