import React from 'react';

interface RoundInfoProps {
  roundNumber: number;
  rollNumber: number;
  consecutiveFlops?: number;
}

export const RoundInfo: React.FC<RoundInfoProps> = ({
  roundNumber,
  rollNumber,
  consecutiveFlops = 0
}) => {
  return (
    <>
      {/* Round and Roll numbers overlay */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '6px 10px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 'bold'
      }}>
        <div>Round {roundNumber}</div>
        <div style={{ fontSize: '12px', fontWeight: 'normal' }}>Roll {rollNumber}</div>
      </div>

      {/* Consecutive Flops warning - bottom left */}
      {consecutiveFlops > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          zIndex: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 'bold',
          maxWidth: '140px'
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

