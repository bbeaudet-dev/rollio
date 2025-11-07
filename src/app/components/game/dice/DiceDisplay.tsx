import React from 'react';
import { DiceFace } from './DiceFace';

interface DiceDisplayProps {
  dice: any[];
  selectedIndices: number[];
  onDiceSelect: (index: number) => void;
  canSelect: boolean;
  isHotDice?: boolean;
  hotDiceCount?: number;
  roundNumber?: number;
  rollNumber?: number;
}

export const DiceDisplay: React.FC<DiceDisplayProps> = ({
  dice,
  selectedIndices,
  onDiceSelect,
  canSelect,
  isHotDice = false,
  hotDiceCount = 0,
  roundNumber = 0,
  rollNumber = 0
}) => {
  return (
    <div>
      {/* Round and Roll Display removed - now shown in CasinoDiceArea */}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {dice.map((die, index) => {
          const isSelected = selectedIndices.includes(index);
          const material = die.material || 'standard';
          
          return (
            <button
              key={index}
              onClick={() => canSelect && onDiceSelect(index)}
              disabled={!canSelect}
              style={{
                width: '64px',
                height: '64px',
                border: isSelected ? '3px solid #007bff' : '3px solid transparent',
                borderRadius: '8px',
                backgroundColor: isSelected ? '#e3f2fd' : 'transparent',
                cursor: !canSelect ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                opacity: !canSelect ? 0.6 : 1,
                padding: '2px'
              }}
            >
              <DiceFace 
                value={die.rolledValue || 0} 
                size={50} 
                material={material}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}; 