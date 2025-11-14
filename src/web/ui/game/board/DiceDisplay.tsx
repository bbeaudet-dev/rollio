import React from 'react';
import { DiceFace } from './dice/DiceFace';

interface DiceDisplayProps {
  allDice: any[]; // Full dice array (for index mapping)
  rolledDice: any[]; // Already filtered and sorted rolled dice
  selectedIndices: number[];
  onDiceSelect: (index: number) => void;
  canSelect: boolean;
  animatingDiceIds: Set<string>; // Dice IDs that should animate
}

export const DiceDisplay: React.FC<DiceDisplayProps> = ({
  allDice,
  rolledDice,
  selectedIndices,
  onDiceSelect,
  canSelect,
  animatingDiceIds
}) => {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '15px',
      padding: '20px',
      minHeight: '100px',
      position: 'absolute',
      top: '55%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '100%',
      maxWidth: 'calc(100% - 40px)',
      boxSizing: 'border-box'
    }}>
      {rolledDice.map((die) => {
        // Find the original index in the full dice array by matching id
        const originalIndex = allDice.findIndex(d => d.id === die.id);
        if (originalIndex === -1) {
          console.warn(`Die ${die.id} not found in allDice array`);
          return null;
        }
        
        const isSelected = selectedIndices.includes(originalIndex);
        const material = die.material || 'plastic';
        const isAnimating = animatingDiceIds.has(die.id);
        
        return (
          <button
            key={`${die.id}-${die.rolledValue}`}
            onClick={() => canSelect && onDiceSelect(originalIndex)}
            disabled={!canSelect}
            style={{
              width: '70px',
              height: '70px',
              border: isSelected ? '3px solid rgba(0, 123, 255, 0.3)' : '3px solid transparent',
              borderRadius: '8px',
              backgroundColor: isSelected ? 'rgba(227, 242, 253, 0.3)' : 'transparent',
              cursor: !canSelect ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: !canSelect ? 0.6 : 1,
              padding: '2px',
              transition: isAnimating ? 'transform 0.3s ease-in-out' : 'none',
              transform: isAnimating ? 'rotate(360deg) scale(1.1)' : 'none',
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
    </div>
  );
};

