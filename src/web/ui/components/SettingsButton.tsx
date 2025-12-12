import React from 'react';
import { playClickSound } from '../../utils/sounds';

interface SettingsButtonProps {
  onClick: () => void;
  style?: React.CSSProperties;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick, style }) => {
  const defaultStyle: React.CSSProperties = {
    position: 'fixed',
    top: '10px',
    right: '10px',
    zIndex: 100,
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '500',
    whiteSpace: 'nowrap'
  };

  const handleClick = () => {
    playClickSound();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      style={{ ...defaultStyle, ...style }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#5a6268';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#6c757d';
      }}
    >
      Settings
    </button>
  );
};

