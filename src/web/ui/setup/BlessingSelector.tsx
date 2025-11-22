import React from 'react';
import { Blessing } from '../../../game/types';
import { getBlessingName, getBlessingDescription } from '../../../game/data/blessings';

interface BlessingSelectorProps {
  blessings: Blessing[];
  selectedBlessings: number[];
  onBlessingSelect: (index: number) => void;
}

export const BlessingSelector: React.FC<BlessingSelectorProps> = ({
  blessings,
  selectedBlessings,
  onBlessingSelect
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
        color: '#6f42c1'
      }}>
        Blessings ({selectedBlessings.length})
      </h3>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '4px',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        {blessings.map((blessing, index) => {
          const isSelected = selectedBlessings.includes(index);
          return (
            <div
              key={blessing.id}
              style={{
                border: isSelected ? '2px solid #6f42c1' : '1px solid #ddd',
                padding: '4px 6px',
                cursor: 'pointer',
                borderRadius: '4px',
                backgroundColor: isSelected ? '#f3e8ff' : '#fff'
              }}
              onClick={() => onBlessingSelect(index)}
            >
              <div style={{ fontWeight: 'bold', fontSize: '11px', lineHeight: '1.2' }}>
                {getBlessingName(blessing)} {isSelected && '✓'}
              </div>
              <div style={{ fontSize: '9px', color: '#666', lineHeight: '1.2' }}>
                {getBlessingDescription(blessing)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

