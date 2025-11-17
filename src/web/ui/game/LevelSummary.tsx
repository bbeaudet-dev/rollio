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
  const banksRemaining = gameState.currentLevel?.banksRemaining || 0;

  return (
    <div style={{ 
      backgroundColor: '#e9ecef',
      border: '1px solid #dee2e6',
      borderBottom: 'none',
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
      borderBottomLeftRadius: '0',
      borderBottomRightRadius: '0',
      padding: '8px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        fontSize: '14px',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <div><strong>Level:</strong> {levelNumber}</div>
        <div><strong>Points:</strong> {pointsBanked} / {levelThreshold}</div>
        <div><strong>Rerolls:</strong> {rerollsRemaining}</div>
        <div><strong>Banks:</strong> {banksRemaining}</div>
      </div>
    </div>
  );
};

