import React from 'react';

interface CreditsBarProps {
  creditsRemaining: number;
  startingCredits: number;
  creditsUsed: number;
}

export const CreditsBar: React.FC<CreditsBarProps> = ({
  creditsRemaining,
  startingCredits,
  creditsUsed
}) => {
  const getCreditColor = () => {
    const percentage = creditsRemaining / startingCredits;
    if (percentage > 0.5) return '#28a745'; // Green
    if (percentage > 0.25) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#2c3e50' }}>
          Credits: <span style={{ color: getCreditColor(), fontSize: '24px' }}>{creditsRemaining}</span> <span style={{ fontSize: '20px' }}>/</span> <span style={{ fontSize: '24px' }}>{startingCredits}</span>
        </span>
      </div>
      {/* 30 Individual Bars - Order: Green (available) on left -> Gray (used) in middle -> Red (unavailable) on right */}
      <div style={{
        display: 'flex',
        gap: '4px',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'center'
      }}>
        {Array.from({ length: 30 }, (_, index) => {
          // Order: Green (available) on left -> Gray (used) in middle -> Red (unavailable) on right
          // Green: index < creditsRemaining (available, not used)
          // Gray: creditsRemaining <= index < startingCredits (used)
          // Red: index >= startingCredits (unavailable due to difficulty)
          const isGreen = index < creditsRemaining;
          const isGray = index >= creditsRemaining && index < startingCredits;
          const isRed = index >= startingCredits;
          
          let backgroundColor = '#28a745'; // Green for available
          let borderColor = '#dee2e6';
          
          if (isRed) {
            backgroundColor = 'transparent';
            borderColor = '#dc3545'; // Red outline for unavailable
          } else if (isGray) {
            backgroundColor = '#adb5bd'; // Lighter gray for used
            borderColor = '#dee2e6';
          }
          
          return (
            <div
              key={index}
              style={{
                width: '20px',
                height: '24px',
                backgroundColor,
                border: `2px solid ${borderColor}`,
                borderRadius: '4px',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              title={
                isRed
                  ? `Unavailable (difficulty restriction)`
                  : isGray
                    ? `Used (${index - creditsRemaining + 1}/${creditsUsed})`
                    : `Available (${index + 1}/${creditsRemaining})`
              }
            />
          );
        })}
      </div>
    </div>
  );
};

