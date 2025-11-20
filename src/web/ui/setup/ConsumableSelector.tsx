import React from 'react';
import { WHIMS, WISHES } from '../../../game/data/consumables';
import { getConsumableColor } from '../../utils/colors';

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
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <h3 style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#17a2b8'
      }}>
        Consumables ({selectedConsumables.length}/{maxSlots})
      </h3>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '4px',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        {consumables.map((consumable, index) => {
          const isSelected = selectedConsumables.includes(index);
          const canSelect = isSelected || selectedConsumables.length < maxSlots;

          return (
            <div
              key={index}
              style={{
                border: isSelected ? '2px solid #17a2b8' : '1px solid #ddd',
                padding: '4px 6px',
                cursor: canSelect ? 'pointer' : 'not-allowed',
                opacity: canSelect ? 1 : 0.5,
                borderRadius: '4px',
                backgroundColor: getConsumableColor(consumable.id, WHIMS, WISHES)
              }}
              onClick={() => canSelect && onConsumableSelect(index)}
            >
              <div style={{ fontWeight: 'bold', fontSize: '11px', lineHeight: '1.2' }}>{consumable.name}</div>
              <div style={{ fontSize: '9px', color: '#666', lineHeight: '1.2' }}>{consumable.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

