import React from 'react';
import { PipEffectType } from '../../../../game/data/pipEffects';
import { PIP_EFFECTS } from '../../../../game/data/pipEffects';
import { PipEffectIcon } from '../../collection/PipEffectIcon';
import { CreditCostDisplay } from './CreditCostDisplay';

interface PipEffectSelectorProps {
  selectedSideValue: number;
  onSelect: (effect: PipEffectType) => void;
  onCancel: () => void;
  creditsRemaining: number;
  cost: number;
}

export const PipEffectSelector: React.FC<PipEffectSelectorProps> = ({
  selectedSideValue,
  onSelect,
  onCancel,
  creditsRemaining,
  cost
}) => {
  return (
    <div style={{
      marginTop: '16px',
      padding: '12px',
      backgroundColor: '#fff',
      borderRadius: '6px',
      border: '1px solid #007bff'
    }}>
      <div style={{
        fontSize: '12px',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#2c3e50'
      }}>
        Select Pip Effect for Side {selectedSideValue}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
        gap: '8px'
      }}>
        {PIP_EFFECTS.map((effect) => {
          const canAfford = creditsRemaining >= cost;
          
          return (
            <div key={effect.id} style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  if (canAfford) {
                    onSelect(effect.type);
                  }
                }}
                disabled={!canAfford}
                style={{
                  padding: '8px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  backgroundColor: canAfford ? '#fff' : '#e9ecef',
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                  opacity: canAfford ? 1 : 0.5,
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  if (canAfford) {
                    e.currentTarget.style.borderColor = '#28a745';
                    e.currentTarget.style.backgroundColor = '#f0fff4';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (canAfford) {
                    e.currentTarget.style.borderColor = '#dee2e6';
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
                title={effect.description + ` (${cost} credits)`}
              >
                <PipEffectIcon type={effect.type} size={24} />
                <div style={{ fontSize: '10px', fontWeight: 'bold', textAlign: 'center' }}>
                  {effect.name}
                </div>
              </button>
              {/* Credit cost bars below button */}
              <div style={{
                display: 'flex',
                gap: '2px',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '4px',
                height: '6px'
              }}>
                <CreditCostDisplay cost={cost} canAfford={canAfford} />
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={onCancel}
        style={{
          marginTop: '8px',
          padding: '6px 12px',
          border: '1px solid #6c757d',
          borderRadius: '4px',
          backgroundColor: '#fff',
          color: '#6c757d',
          cursor: 'pointer',
          fontSize: '11px'
        }}
      >
        Cancel
      </button>
    </div>
  );
};

