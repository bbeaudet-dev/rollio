import React from 'react';
import { DiceMaterialType } from '../../../../game/types';
import { MATERIALS } from '../../../../game/data/materials';
import { CreditCostDisplay } from './CreditCostDisplay';

interface MaterialSelectorProps {
  selectedMaterial: DiceMaterialType;
  onMaterialChange: (material: DiceMaterialType) => void;
  materialCost: (material: DiceMaterialType) => number;
  creditsRemaining: number;
}

export const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  selectedMaterial,
  onMaterialChange,
  materialCost,
  creditsRemaining
}) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        fontSize: '12px',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#2c3e50'
      }}>
        Material
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
        gap: '6px'
      }}>
        {MATERIALS.map((material) => {
          const isSelected = selectedMaterial === material.id;
          const isPlastic = material.id === 'plastic';
          const cost = materialCost(material.id as DiceMaterialType);
          const canAfford = isPlastic || creditsRemaining >= cost;

          return (
            <button
              key={material.id}
              onClick={() => onMaterialChange(material.id as DiceMaterialType)}
              disabled={!canAfford && !isSelected}
              style={{
                padding: '6px 8px',
                border: '2px solid',
                borderColor: isSelected ? '#007bff' : '#dee2e6',
                borderRadius: '4px',
                backgroundColor: isSelected ? '#e7f3ff' : '#fff',
                cursor: canAfford || isSelected ? 'pointer' : 'not-allowed',
                opacity: canAfford || isSelected ? 1 : 0.5,
                fontSize: '11px',
                textAlign: 'center',
                transition: 'border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease',
                boxSizing: 'border-box',
                position: 'relative'
              }}
              title={material.description + (isPlastic ? '' : ` (${cost} credits)`)}
              onMouseEnter={(e) => {
                if (!isSelected && (canAfford || isSelected)) {
                  e.currentTarget.style.borderColor = '#28a745';
                  e.currentTarget.style.backgroundColor = '#f0fff4';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#dee2e6';
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{material.name}</div>
              {!isPlastic && (
                <CreditCostDisplay cost={cost} canAfford={canAfford || isSelected} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

