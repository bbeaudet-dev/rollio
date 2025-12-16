import React from 'react';

interface LevelFlopCounterProps {
  flopsThisLevel: number;
  levelThreshold: number;
}

export const LevelFlopCounter: React.FC<LevelFlopCounterProps> = ({
  flopsThisLevel,
  levelThreshold
}) => {
  // Calculate next penalty using the same curve as the game logic
  const calculateFlopPenaltyPercentage = (flopCount: number): number => {
    if (flopCount <= 1) return 0;
    if (flopCount <= 5) return (flopCount - 1) * 5;
    if (flopCount <= 8) return 20 + (flopCount - 5) * 10;
    if (flopCount <= 12) return 50 + (flopCount - 8) * 25;
    if (flopCount <= 15) return 150 + (flopCount - 12) * 50;
    if (flopCount <= 17) return 300 + (flopCount - 15) * 100;
    if (flopCount <= 19) return 500 + (flopCount - 17) * 250;
    return 1000 + (flopCount - 19) * 500;
  };

  const nextPenaltyPct = calculateFlopPenaltyPercentage(flopsThisLevel + 1);
  const nextPenaltyAmount = Math.round(levelThreshold * (nextPenaltyPct / 100));
  // Penalty is always negative (subtracts from points), so format it with minus sign
  const formattedPenalty = nextPenaltyAmount < 0 ? nextPenaltyAmount : -nextPenaltyAmount;

  return (
    <div style={{
      backgroundColor: 'rgba(40, 44, 52, 0.9)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 'normal',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      minWidth: '180px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontWeight: 'bold' }}>Flops:</span>
        <span>{flopsThisLevel}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontWeight: 'bold' }}>Next Penalty:</span>
        <span style={{ color: '#ff5252' }}>{formattedPenalty}</span>
      </div>
    </div>
  );
};


