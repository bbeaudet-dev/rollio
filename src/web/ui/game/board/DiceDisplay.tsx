import React from 'react';
import { DiceFace } from './dice/DiceFace';

// CSS keyframes for dice wiggle animation
const wiggleStyle = document.createElement('style');
wiggleStyle.textContent = `
  @keyframes diceWiggle {
    0%, 100% { transform: translateX(0) rotate(0deg); }
    10% { transform: translateX(-3px) rotate(-2deg); }
    20% { transform: translateX(3px) rotate(2deg); }
    30% { transform: translateX(-3px) rotate(-2deg); }
    40% { transform: translateX(3px) rotate(2deg); }
    50% { transform: translateX(-2px) rotate(-1deg); }
    60% { transform: translateX(2px) rotate(1deg); }
    70% { transform: translateX(-1px) rotate(-0.5deg); }
    80% { transform: translateX(1px) rotate(0.5deg); }
    90% { transform: translateX(0) rotate(0deg); }
  }
`;
if (!document.head.querySelector('style[data-dice-wiggle]')) {
  wiggleStyle.setAttribute('data-dice-wiggle', 'true');
  document.head.appendChild(wiggleStyle);
}

interface DiceDisplayProps {
  allDice: any[]; // Full dice array (for index mapping)
  rolledDice: any[]; // Already filtered and sorted rolled dice
  selectedIndices: number[];
  onDiceSelect: (index: number) => void;
  canSelect: boolean;
  animatingDiceIds: Set<string>; // Dice IDs that should animate (for reroll)
  allDiceWiggling?: boolean; // If true, all dice should wiggle (for initial roll)
  highlightedDiceIndices?: number[]; // Dice indices to highlight during breakdown
}

export const DiceDisplay: React.FC<DiceDisplayProps> = ({
  allDice,
  rolledDice,
  selectedIndices,
  onDiceSelect,
  canSelect,
  animatingDiceIds,
  allDiceWiggling = false,
  highlightedDiceIndices = []
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
      maxWidth: 'calc(100% - clamp(20px, 4vw, 40px))',
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
        const isHighlighted = highlightedDiceIndices.includes(originalIndex);
        const shouldWiggle = allDiceWiggling || isAnimating;
        
        return (
          <button
            key={`${die.id}-${die.rolledValue}`}
            onClick={() => canSelect && onDiceSelect(originalIndex)}
            disabled={!canSelect}
            style={{
              width: '95px',
              height: '95px',
              border: isHighlighted 
                ? '4px solid #ffc107' 
                : isSelected 
                  ? '3px solid rgba(0, 123, 255, 0.3)' 
                  : '3px solid transparent',
              borderRadius: '8px',
              backgroundColor: isHighlighted 
                ? 'rgba(255, 193, 7, 0.2)' 
                : isSelected 
                  ? 'rgba(227, 242, 253, 0.3)' 
                  : 'transparent',
              cursor: !canSelect ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: !canSelect ? 0.6 : 1,
              padding: '4px',
              transition: shouldWiggle ? 'transform 0.3s ease-in-out' : isHighlighted ? 'all 0.3s ease' : 'none',
              transform: isAnimating 
                ? 'rotate(360deg) scale(1.1)' 
                : allDiceWiggling 
                  ? 'translateX(0) rotate(0deg)' 
                  : isHighlighted 
                    ? 'scale(1.1)' 
                    : 'none',
              animation: allDiceWiggling ? 'diceWiggle 0.5s ease-in-out' : 'none',
              zIndex: isHighlighted ? 15 : isSelected ? 10 : 1,
              boxShadow: isHighlighted ? '0 0 15px rgba(255, 193, 7, 0.6)' : 'none'
            }}
          >
            <DiceFace 
              value={die.rolledValue || 0} 
              size={80}
              material={die.material}
              pipEffect={die.pipEffects?.[die.rolledValue || 0]}
            />
          </button>
        );
      })}
    </div>
  );
};

