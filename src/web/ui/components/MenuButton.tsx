import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButton } from './ActionButton';

interface MainMenuReturnButtonProps {
  onClick?: () => void;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export const MainMenuReturnButton: React.FC<MainMenuReturnButtonProps> = ({ onClick, style, disabled }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick();
    } else {
      navigate('/');
    }
  };

  const defaultStyle: React.CSSProperties = {
    position: 'fixed',
    top: '10px',
    left: '10px',
    zIndex: 100,
    whiteSpace: 'nowrap',
    ...style
  };

  return (
    <ActionButton
      onClick={handleClick}
      variant="secondary"
      size="medium"
      disabled={disabled}
      style={defaultStyle}
    >
      Main Menu
    </ActionButton>
  );
};

