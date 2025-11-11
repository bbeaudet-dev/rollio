import React from 'react';

interface CharmSelectorProps {
  charms: any[];
  selectedCharms: number[];
  maxSlots: number;
  onCharmSelect: (index: number) => void;
}

export const CharmSelector: React.FC<CharmSelectorProps> = ({
  charms,
  selectedCharms,
  maxSlots,
  onCharmSelect
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
        color: '#28a745'
      }}>
        Charms ({selectedCharms.length}/{maxSlots})
      </h3>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '6px'
      }}>
        {charms.map((charm, index) => {
          const isSelected = selectedCharms.includes(index);
          const canSelect = isSelected || selectedCharms.length < maxSlots;

          return (
            <div
              key={index}
              style={{
                border: isSelected ? '2px solid #28a745' : '1px solid #ddd',
                padding: '6px',
                cursor: canSelect ? 'pointer' : 'not-allowed',
                opacity: canSelect ? 1 : 0.5,
                borderRadius: '4px',
                backgroundColor: isSelected ? '#f0fff0' : '#fff'
              }}
              onClick={() => canSelect && onCharmSelect(index)}
            >
              <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{charm.name}</div>
              <div style={{ fontSize: '10px', color: '#666' }}>{charm.description}</div>
              <div style={{ fontSize: '9px', color: '#999' }}>{charm.rarity}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

