import React from 'react';
import { DiceFace } from './dice/DiceFace';

interface DiceDisplayProps {
  dice: any[];
  selectedIndices: number[];
  onDiceSelect: (index: number) => void;
  canSelect: boolean;
  dicePositions: Map<string, { x: number; y: number }>;
}

export const DiceDisplay: React.FC<DiceDisplayProps> = ({
  dice,
  selectedIndices,
  onDiceSelect,
  canSelect,
  dicePositions
}) => {
  // Only show dice that have been rolled (have a rolledValue)
  const rolledDice = dice.filter((die, index) => die.rolledValue !== undefined && die.rolledValue !== null);
  
  return (
    <>
      {rolledDice.map((die, rolledIndex) => {
        // Find the original index in the full dice array
        const originalIndex = dice.findIndex((d, idx) => 
          d === die && d.rolledValue === die.rolledValue
        );
        const isSelected = selectedIndices.includes(originalIndex);
        const material = die.material || 'standard';
        const position = dicePositions.get(die.id);
        
        // If no position found, don't render this die
        if (!position) {
          console.warn(`No position found for die ${die.id}`);
          return null;
        }
        
        return (
          <button
            key={`${originalIndex}-${die.rolledValue}`}
            onClick={() => canSelect && onDiceSelect(originalIndex)}
            disabled={!canSelect}
            style={{
              position: 'absolute',
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: 'translate(-50%, -50%)',
              width: '70px',
              height: '70px',
              border: isSelected ? '3px solid #007bff' : '3px solid transparent',
              borderRadius: '8px',
              backgroundColor: isSelected ? '#e3f2fd' : 'transparent',
              cursor: !canSelect ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: !canSelect ? 0.6 : 1,
              padding: '2px',
              zIndex: isSelected ? 10 : 1
            }}
          >
            <DiceFace 
              value={die.rolledValue || 0} 
              size={55}
              material={material}
            />
          </button>
        );
      })}
    </>
  );
};

