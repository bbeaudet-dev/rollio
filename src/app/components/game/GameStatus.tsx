import React from 'react';

interface GameStatusProps {
  gameState: any;
  roundState: any;
}

export const GameStatus: React.FC<GameStatusProps> = ({ gameState, roundState }) => {
  if (!gameState) return null;

  const levelNumber = gameState.currentLevel?.levelNumber || 1;
  const levelThreshold = gameState.currentLevel?.levelThreshold || 0;
  const pointsBanked = gameState.currentLevel?.pointsBanked || 0;
  const rerollsRemaining = gameState.currentLevel?.rerollsRemaining || 0;
  const livesRemaining = gameState.currentLevel?.livesRemaining || 0;
  const consecutiveFlops = gameState.currentLevel?.consecutiveFlops || 0;
  const roundNumber = roundState?.roundNumber || 0;
  const roundPoints = roundState?.roundPoints || 0;
  const totalScore = gameState.history?.totalScore || 0;
  const money = gameState.money || 0;

  return (
    <div>
      <div style={{ 
        padding: '12px', 
        border: '1px solid #ddd', 
        borderRadius: '4px',
        backgroundColor: '#f9f9f9'
      }}>
        <div><strong>Level:</strong> {levelNumber}</div>
        <div><strong>Points:</strong> {pointsBanked} / {levelThreshold}</div>
        <div><strong>Rerolls:</strong> {rerollsRemaining}</div>
        <div><strong>Lives:</strong> {livesRemaining}</div>
        {roundNumber > 0 && <div><strong>Round:</strong> {roundNumber}</div>}
        {roundPoints > 0 && <div><strong>Round Points:</strong> {roundPoints}</div>}
        <div><strong>Total Score:</strong> {totalScore}</div>
        <div><strong>Money:</strong> ${money}</div>
        {consecutiveFlops > 0 && <div><strong>Consecutive Flops:</strong> {consecutiveFlops}</div>}
      </div>
    </div>
  );
}; 