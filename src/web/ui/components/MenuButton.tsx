import React from 'react';
import { useNavigate } from 'react-router-dom';

interface MenuButtonProps {
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const MenuButton: React.FC<MenuButtonProps> = ({ onClick, style }) => {
  const navigate = useNavigate();
  
  const defaultStyle: React.CSSProperties = {
    position: 'fixed',
    top: '10px',
    left: '10px',
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

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/');
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{ ...defaultStyle, ...style }}
    >
      🏠 Menu
    </button>
  );
};

