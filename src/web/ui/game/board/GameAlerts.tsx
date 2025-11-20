import React from 'react';
import { Button } from '../../components/Button';

interface GameAlertsProps {
  canChooseFlopShield: boolean;
  onFlopShieldChoice: (useShield: boolean) => void;
  canSelectDice: boolean;
  selectedDiceCount: number;
  previewScoring: {
    isValid: boolean;
    points: number;
    combinations: string[];
  } | null;
  justFlopped: boolean;
}

export const GameAlerts: React.FC<GameAlertsProps> = ({
  canChooseFlopShield,
  onFlopShieldChoice,
  canSelectDice,
  selectedDiceCount,
  previewScoring,
  justFlopped
}) => {
  return (
    <>
      {/* Flop Shield Choice - Center Overlay */}
      {canChooseFlopShield && (
        <div style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 30,
          backgroundColor: 'rgba(255, 243, 224, 0.9)',
          border: '2px solid #ff9800',
          borderRadius: '8px',
          padding: '16px',
          fontSize: '16px',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#e65100',
          minWidth: '300px'
        }}>
          🛡️ Flop Shield Available!
          <div style={{ fontSize: '14px', marginTop: '8px', fontWeight: 'normal', marginBottom: '12px' }}>
            Would you like to use your Flop Shield to prevent this flop?
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => onFlopShieldChoice(true)}
              style={{
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Use Shield
            </button>
            <button
              onClick={() => onFlopShieldChoice(false)}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Flop Notification - Center Overlay */}
      {justFlopped && (
        <div style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 30,
          backgroundColor: 'rgba(255, 235, 238, 0.9)',
          border: '2px solid #f44336',
          borderRadius: '8px',
          padding: '16px',
          fontSize: '16px',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#c62828',
          minWidth: '250px'
        }}>
          🎲 FLOP! 🎲
          <div style={{ fontSize: '14px', marginTop: '8px', fontWeight: 'normal' }}>
            No valid scoring combinations found
          </div>
        </div>
      )}

    </>
  );
};

