import React from 'react';

interface ConsumableSelectorProps {
  consumables: any[];
  selectedConsumables: number[];
  maxSlots: number;
  onConsumableSelect: (index: number) => void;
}

export const ConsumableSelector: React.FC<ConsumableSelectorProps> = ({
  consumables,
  selectedConsumables,
  maxSlots,
  onConsumableSelect
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
        color: '#17a2b8'
      }}>
        Consumables ({selectedConsumables.length}/{maxSlots})
      </h3>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '6px'
      }}>
        {consumables.map((consumable, index) => {
          const isSelected = selectedConsumables.includes(index);
          const canSelect = isSelected || selectedConsumables.length < maxSlots;

          return (
            <div
              key={index}
              style={{
                border: isSelected ? '2px solid #17a2b8' : '1px solid #ddd',
                padding: '6px',
                cursor: canSelect ? 'pointer' : 'not-allowed',
                opacity: canSelect ? 1 : 0.5,
                borderRadius: '4px',
                backgroundColor: isSelected ? '#f0f8ff' : '#fff'
              }}
              onClick={() => canSelect && onConsumableSelect(index)}
            >
              <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{consumable.name}</div>
              <div style={{ fontSize: '10px', color: '#666' }}>{consumable.description}</div>
              <div style={{ fontSize: '9px', color: '#999' }}>{consumable.rarity}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

