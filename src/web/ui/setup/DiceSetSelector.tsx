import React from 'react';

interface DiceSetSelectorProps {
  diceSets: any[];
  selectedIndex: number;
  onDiceSetSelect: (index: number) => void;
}

export const DiceSetSelector: React.FC<DiceSetSelectorProps> = ({
  diceSets,
  selectedIndex,
  onDiceSetSelect
}) => {
  return (
    <div style={{
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <h3 style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '15px',
        color: '#007bff'
      }}>
        Dice Set
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {diceSets.map((diceSet, index) => {
          const diceSetConfig = typeof diceSet === 'function' ? diceSet() : diceSet;
          const isSelected = selectedIndex === index;

          return (
            <div
              key={index}
              style={{
                border: isSelected ? '2px solid #007bff' : '1px solid #ddd',
                padding: '8px',
                cursor: 'pointer',
                borderRadius: '4px',
                backgroundColor: isSelected ? '#f0f8ff' : '#fff'
              }}
              onClick={() => onDiceSetSelect(index)}
            >
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{diceSetConfig.name}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                💰 ${diceSetConfig.startingMoney} • 🎭 {diceSetConfig.charmSlots} • 🧪 {diceSetConfig.consumableSlots}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

