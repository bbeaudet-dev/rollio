import React from 'react';
import { PipEffectType } from '../../../../game/data/pipEffects';
import { PIP_EFFECTS } from '../../../../game/data/pipEffects';
import { PipEffectIcon } from '../../collection/PipEffectIcon';
import { CreditIndicator } from '../../components/CreditIndicator';
import { useUnlocks } from '../../../contexts/UnlockContext';
import { LockIcon } from '../../components/LockIcon';

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
  const { unlockedItems } = useUnlocks();
  
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
          const isLocked = !unlockedItems.has(`pip_effect:${effect.id}`);
          const isDisabled = !canAfford || isLocked;
          
          return (
            <div key={effect.id} style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  if (!isDisabled) {
                    onSelect(effect.type);
                  }
                }}
                disabled={isDisabled}
                style={{
                  padding: '8px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  backgroundColor: isDisabled && !isLocked ? '#e9ecef' : '#fff',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                  opacity: isDisabled && !isLocked ? 0.5 : 1,
                  width: '100%',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!isDisabled) {
                    e.currentTarget.style.borderColor = '#28a745';
                    e.currentTarget.style.backgroundColor = '#f0fff4';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDisabled) {
                    e.currentTarget.style.borderColor = '#dee2e6';
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
                title={isLocked ? 'Locked - Use this pip effect in a game to unlock it' : (effect.description + ` (${cost} credits)`)}
              >
                <div style={{
                  filter: isLocked ? 'grayscale(100%) brightness(0.5)' : 'none',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <PipEffectIcon type={effect.type} size={24} />
                  <div style={{ 
                    fontSize: '10px', 
                    fontWeight: 'bold', 
                    textAlign: 'center'
                  }}>
                    {effect.name}
                  </div>
                </div>
                {isLocked && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1
                  }}>
                    <LockIcon size={20} color="white" strokeWidth={2} />
                  </div>
                )}
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
                <CreditIndicator cost={cost} canAfford={canAfford} size="medium" />
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

