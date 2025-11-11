import React from 'react';
import { DiceFace } from './dice/DiceFace';

interface DiceDisplayProps {
  dice: any[];
  selectedIndices: number[];
  onDiceSelect: (index: number) => void;
  canSelect: boolean;
  dicePositions: Array<{ x: number; y: number }>;
}

export const DiceDisplay: React.FC<DiceDisplayProps> = ({
  dice,
  selectedIndices,
  onDiceSelect,
  canSelect,
  dicePositions
}) => {
  return (
    <>
      {dice.map((die, index) => {
        const isSelected = selectedIndices.includes(index);
        const material = die.material || 'standard';
        const position = dicePositions[index] || { x: 50, y: 50 }; // Fallback to center
        
        return (
          <button
            key={index}
            onClick={() => canSelect && onDiceSelect(index)}
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

