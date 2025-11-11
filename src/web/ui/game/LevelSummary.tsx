import React from 'react';

interface LevelSummaryProps {
  gameState: any;
  roundState?: any;
}

export const LevelSummary: React.FC<LevelSummaryProps> = ({ gameState, roundState }) => {
  if (!gameState) return null;

  const levelNumber = gameState.currentLevel?.levelNumber || 1;
  const levelThreshold = gameState.currentLevel?.levelThreshold || 0;
  const pointsBanked = gameState.currentLevel?.pointsBanked || 0;
  const rerollsRemaining = gameState.currentLevel?.rerollsRemaining || 0;
  const livesRemaining = gameState.currentLevel?.livesRemaining || 0;
  const money = gameState.money || 0;

  return (
    <div style={{ 
      backgroundColor: '#e9ecef',
      border: '1px solid #dee2e6',
      borderBottom: 'none',
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
      borderBottomLeftRadius: '0',
      borderBottomRightRadius: '0',
      padding: '12px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        fontSize: '16px',
        gap: '30px',
        flexWrap: 'wrap'
      }}>
        <div><strong>Level:</strong> {levelNumber}</div>
        <div><strong>Points:</strong> {pointsBanked} / {levelThreshold}</div>
        <div><strong>Rerolls:</strong> {rerollsRemaining}</div>
        <div><strong>Lives:</strong> {livesRemaining}</div>
        <div style={{ marginLeft: 'auto' }}><strong>Money:</strong> ${money}</div>
      </div>
    </div>
  );
};

