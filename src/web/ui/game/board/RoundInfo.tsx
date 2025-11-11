import React from 'react';

interface RoundInfoProps {
  roundNumber: number;
  rollNumber: number;
  hotDiceCount?: number;
  consecutiveFlops?: number;
}

export const RoundInfo: React.FC<RoundInfoProps> = ({
  roundNumber,
  rollNumber,
  hotDiceCount = 0,
  consecutiveFlops = 0
}) => {
  return (
    <>
      {/* Round and Roll numbers overlay */}
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '15px',
        zIndex: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 'bold'
      }}>
        <div>Round {roundNumber}</div>
        <div style={{ fontSize: '12px', fontWeight: 'normal' }}>Roll {rollNumber}</div>
        {hotDiceCount > 0 && (
          <div style={{ fontSize: '12px', fontWeight: 'normal', color: '#ffd700' }}>
            🔥 Hot Dice: {hotDiceCount}
          </div>
        )}
      </div>

      {/* Consecutive Flops warning - bottom left */}
      {consecutiveFlops > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '15px',
          left: '15px',
          zIndex: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 'bold',
          maxWidth: '150px'
        }}>
          ⚠️ Consecutive flops: {consecutiveFlops}/3
          {consecutiveFlops >= 3 && (
            <div style={{ color: '#ff6b6b', fontWeight: 'bold', fontSize: '12px' }}>
              Flop penalty: -1000
            </div>
          )}
        </div>
      )}
    </>
  );
};

