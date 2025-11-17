import React from 'react';

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
    padding: '8px 12px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    minHeight: '44px',
    minWidth: '44px'
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

