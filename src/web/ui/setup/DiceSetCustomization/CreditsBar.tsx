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
      {/* Credits text and indicators on the same row */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Credits text */}
        <span style={{  fontWeight: 'bold' }}>
          <span style={{ fontSize: '24px', color: getCreditColor(), fontWeight: 'bold' }}>{creditsRemaining}</span>
          <span style={{ fontSize: '20px', color: '#2c3e50' }}> / </span>
          <span style={{ fontSize: '24px', color: '#2c3e50', fontWeight: 'bold' }}>{startingCredits}</span>
        </span>
        {/* Individual Bars - Order: Green (available) on left -> Gray (used) in middle -> Red (unavailable) on right */}
        <div style={{
          display: 'flex',
          gap: '4px',
          flexWrap: 'wrap',
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
    </div>
  );
};

