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
    top: '20px',
    left: '20px',
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

