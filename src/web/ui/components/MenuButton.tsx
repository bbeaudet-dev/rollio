import React from 'react';
import { useNavigate } from 'react-router-dom';
import { playClickSound } from '../../utils/sounds';

interface MainMenuReturnButtonProps {
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const MainMenuReturnButton: React.FC<MainMenuReturnButtonProps> = ({ onClick, style }) => {
  const navigate = useNavigate();
  
  const defaultStyle: React.CSSProperties = {
    position: 'fixed',
    top: '10px',
    left: '10px',
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
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#5a6268';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#6c757d';
      }}
    >
      Main Menu
    </button>
  );
};

