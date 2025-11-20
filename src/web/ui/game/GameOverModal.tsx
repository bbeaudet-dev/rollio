import React from 'react';
import { Modal } from '../components/Modal';

interface GameOverModalProps {
  isOpen: boolean;
  endReason: 'lost' | 'win';
  onReturnToMenu: () => void;
  onNewGame: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  endReason,
  onReturnToMenu,
  onNewGame
}) => {
  const containerStyle: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    minWidth: '300px',
    maxWidth: '400px',
    textAlign: 'center'
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: endReason === 'win' ? '#2d5a2d' : '#c62828',
    textAlign: 'center'
  };

  const messageStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#6c757d',
    marginBottom: '24px',
    lineHeight: '1.5'
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  const primaryButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  };

  const getHeaderText = () => {
    return endReason === 'win' ? '🏆 Victory! 🏆' : '💀 Game Over 💀';
  };

  const getMessage = () => {
    return endReason === 'win' 
      ? 'Congratulations! You completed the game!'
      : 'You ran out of banks. Better luck next time!';
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="" showCloseButton={false}>
      <div style={containerStyle}>
        <h2 style={headerStyle}>{getHeaderText()}</h2>
        <div style={messageStyle}>
          {getMessage()}
        </div>
        <div style={buttonContainerStyle}>
          <button 
            onClick={onNewGame}
            style={primaryButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#45a049';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4CAF50';
            }}
          >
            New Game
          </button>
          <button 
            onClick={onReturnToMenu}
            style={secondaryButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5a6268';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6c757d';
            }}
          >
            Return to Menu
          </button>
        </div>
      </div>
    </Modal>
  );
};

