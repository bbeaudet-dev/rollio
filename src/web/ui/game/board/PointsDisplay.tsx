import React from 'react';

interface PointsDisplayProps {
  roundPoints: number;
  justBanked: boolean;
  canSelectDice: boolean; // While actively selecting/scoring dice
  canBank: boolean; // After scoring, when bank is available
  bankingDisplayInfo?: {
    pointsJustBanked: number;
    previousTotal: number;
    newTotal: number;
  } | null;
}

export const PointsDisplay: React.FC<PointsDisplayProps> = ({
  roundPoints,
  justBanked,
  canSelectDice,
  canBank,
  bankingDisplayInfo
}) => {
  // Determine Pot color based on state
  // Red: While actively selecting/scoring dice
  // Yellow/orange: After scoring (when Bank is available)
  // Green with "+": After banking
  // Back to red: After clicking Roll again
  const getPotColor = () => {
    if (justBanked) {
      return '#28a745'; // Green after banking
    } else if (canBank && roundPoints > 0) {
      return '#ff9800'; // Yellow/orange while deciding to Bank/Roll
    } else if (canSelectDice) {
      return '#dc3545'; // Red while selecting/scoring
    } else {
      return '#dc3545'; // Default red
    }
  };

  return (
    <>
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '13px',
        maxWidth: 'calc(100% - 20px)',
        fontWeight: 500, // Less bold - informational display
        textAlign: 'center',
        pointerEvents: 'none', // Not clickable
        userSelect: 'none' // Can't select text
      }}>
        {/* Pot */}
        <div style={{ 
          color: getPotColor(),
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          Pot: {justBanked && bankingDisplayInfo ? '+' : ''}{justBanked && bankingDisplayInfo ? bankingDisplayInfo.pointsJustBanked : roundPoints}
        </div>
        
        {/* Bank display - show when Pot is green (after banking) */}
        {justBanked && bankingDisplayInfo && (
          <div style={{ 
            marginTop: '5px',
            color: '#28a745',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            Bank: {bankingDisplayInfo.pointsJustBanked} → {bankingDisplayInfo.newTotal}
          </div>
        )}
      </div>

    </>
  );
};

