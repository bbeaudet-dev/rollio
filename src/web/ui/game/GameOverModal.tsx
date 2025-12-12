import React, { useEffect } from 'react';
import { Modal } from '../components/Modal';
import { ActionButton } from '../components/ActionButton';
import { playGameOverSound } from '../../utils/sounds';

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
  // Play game over sound when modal opens (only for losses)
  useEffect(() => {
    if (isOpen && endReason === 'lost') {
      playGameOverSound();
    }
  }, [isOpen, endReason]);
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
          <ActionButton 
            onClick={onNewGame}
            variant="success"
            size="large"
            style={{ width: '100%' }}
          >
            New Game
          </ActionButton>
          <ActionButton 
            onClick={onReturnToMenu}
            variant="secondary"
            size="large"
            style={{ width: '100%' }}
          >
            Return to Menu
          </ActionButton>
        </div>
      </div>
    </Modal>
  );
};

