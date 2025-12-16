import React from 'react';
import { ActionButton } from './ActionButton';

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
    whiteSpace: 'nowrap',
    ...style
  };

  return (
    <ActionButton
      onClick={onClick}
      variant="secondary"
      size="medium"
      style={defaultStyle}
    >
      Settings
    </ActionButton>
  );
};

