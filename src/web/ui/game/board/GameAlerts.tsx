import React from 'react';
import { Button } from '../../components/Button';

interface GameAlertsProps {
  canChooseFlopShield: boolean;
  onFlopShieldChoice: (useShield: boolean) => void;
  gameOver: boolean;
  canSelectDice: boolean;
  selectedDiceCount: number;
  previewScoring: {
    isValid: boolean;
    points: number;
    combinations: string[];
  } | null;
  onScoreSelectedDice: () => void;
  canContinueFlop: boolean;
}

export const GameAlerts: React.FC<GameAlertsProps> = ({
  canChooseFlopShield,
  onFlopShieldChoice,
  gameOver,
  canSelectDice,
  selectedDiceCount,
  previewScoring,
  onScoreSelectedDice,
  canContinueFlop
}) => {
  return (
    <>
      {/* Score Selected Dice Button - Center Overlay */}
      {canSelectDice && selectedDiceCount > 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 30,
          opacity: 0.9
        }}>
          <Button 
            onClick={onScoreSelectedDice}
            disabled={!previewScoring?.isValid}
          >
            Score Selected Dice ({selectedDiceCount})
            {previewScoring?.isValid && ` - ${previewScoring.points} pts`}
          </Button>
        </div>
      )}

      {/* Flop Shield Choice - Center Overlay */}
      {canChooseFlopShield && (
        <div style={{
          position: 'absolute',
          top: '50%',
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
      {canContinueFlop && (
        <div style={{
          position: 'absolute',
          top: '50%',
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

      {/* Game Over Notification - Center Overlay */}
      {gameOver && (
        <div style={{
          position: 'absolute',
          top: '50%',
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
          💀 GAME OVER 💀
          <div style={{ fontSize: '14px', marginTop: '8px', fontWeight: 'normal' }}>
            You ran out of lives!
          </div>
        </div>
      )}
    </>
  );
};

