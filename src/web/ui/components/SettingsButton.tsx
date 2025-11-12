import React from 'react';

interface SettingsButtonProps {
  onClick: () => void;
  style?: React.CSSProperties;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick, style }) => {
  const defaultStyle: React.CSSProperties = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 100,
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  };

  return (
    <button
      onClick={onClick}
      style={{ ...defaultStyle, ...style }}
    >
      ⚙️ Settings
    </button>
  );
};

