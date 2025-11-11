import React from 'react';

interface PointsDisplayProps {
  lastRollPoints: number;
  roundPoints: number;
  gameScore: number;
  canReroll: boolean;
  justBanked: boolean;
}

export const PointsDisplay: React.FC<PointsDisplayProps> = ({
  lastRollPoints,
  roundPoints,
  gameScore,
  canReroll,
  justBanked
}) => {
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 25,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: 'bold',
      textAlign: 'center'
    }}>
      {/* Roll Points - GREEN when just scored dice */}
      {lastRollPoints > 0 && canReroll && !justBanked && (
        <div style={{ color: '#28a745' }}>
          Roll points: +{lastRollPoints}
        </div>
      )}
      
      {/* Round Points - BLUE when just banked points, WHITE otherwise */}
      <div style={{ 
        color: justBanked ? '#007bff' : 'white'
      }}>
        Round points: {justBanked ? '+' : ''}{roundPoints}
      </div>
      
      {/* Game Score - show only when just banked points */}
      {justBanked && (
        <div style={{ 
          marginTop: '5px',
          color: 'white',
          fontWeight: 'bold'
        }}>
          Game score: {gameScore}
        </div>
      )}
    </div>
  );
};

