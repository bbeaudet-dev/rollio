import React from 'react';

interface LevelProgressBarProps {
  current: number;
  threshold: number;
  pot?: number; // Current pot (unbanked points)
}

export const LevelProgressBar: React.FC<LevelProgressBarProps> = ({ 
  current, 
  threshold,
  pot = 0
}) => {
  const bankedPercentage = threshold > 0 ? Math.min((current / threshold) * 100, 100) : 0;
  const potPercentage = threshold > 0 ? (pot / threshold) * 100 : 0;
  const isNegative = current < 0;
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '6px',
      minWidth: '180px'
    }}>
      {/* Text labels */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '3px'
      }}>
        {pot !== 0 && (
          <div style={{
            fontSize: '16px',
            color: pot < 0 ? '#dc3545' : '#ffc107',
            fontWeight: '600'
          }}>
            Pot: {pot}
          </div>
        )}
        <div style={{
          fontSize: '16px',
          color: isNegative ? '#dc3545' : 'white',
          fontWeight: '600'
        }}>
          {current} / {threshold}
        </div>
      </div>
      
      {/* Progress bars stacked */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: '100%'
      }}>
        {/* Top bar - Pot */}
        {pot !== 0 && (
          <div style={{
            width: '100%',
            height: '18px',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '9px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            display: 'flex',
            justifyContent: pot < 0 ? 'flex-start' : 'flex-end'
          }}>
            <div style={{
              width: `${Math.abs(potPercentage)}%`,
              height: '100%',
              backgroundColor: pot < 0 ? '#dc3545' : '#ffc107',
              transition: 'width 0.3s ease',
              borderRadius: '9px'
            }} />
          </div>
        )}
        
        {/* Bottom bar - Banked (green) */}
        <div style={{
          width: '100%',
          height: '18px',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '9px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.5)'
        }}>
          <div style={{
            width: `${Math.max(bankedPercentage, 0)}%`,
            height: '100%',
            backgroundColor: isNegative ? '#dc3545' : '#28a745',
            transition: 'width 0.3s ease, background-color 0.3s ease',
            borderRadius: '9px'
          }} />
        </div>
      </div>
    </div>
  );
};

