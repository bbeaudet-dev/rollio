import React from 'react';

interface RoundInfoProps {
  levelNumber: number;
  roundNumber: number;
  rollNumber: number;
  consecutiveFlops?: number;
}

export const RoundInfo: React.FC<RoundInfoProps> = ({
  levelNumber,
  roundNumber,
  rollNumber,
  consecutiveFlops = 0
}) => {
  return (
    <>
      {/* Level, Round and Roll numbers overlay */}
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
        <div>Level {levelNumber}</div>
        <div style={{ fontSize: '12px', fontWeight: 'normal' }}>Round {roundNumber}</div>
        <div style={{ fontSize: '12px', fontWeight: 'normal' }}>Roll {rollNumber}</div>
      </div>

    </>
  );
};

