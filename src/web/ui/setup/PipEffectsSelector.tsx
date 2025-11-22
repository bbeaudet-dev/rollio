import React, { useState } from 'react';
import { Die, Consumable } from '../../../game/types';
import { PIP_EFFECTS, PipEffectType } from '../../../game/data/pipEffects';
import { PipEffectIcon } from '../collection/PipEffectIcon';
import { DiceFace } from '../game/board/dice/DiceFace';
import { DiceViewerModal } from '../game/DiceViewerModal';
import { StandardButton } from '../components/StandardButton';

interface PipEffectsSelectorProps {
  diceSet: Die[];
  onDiceSetChange: (diceSet: Die[]) => void;
}

export const PipEffectsSelector: React.FC<PipEffectsSelectorProps> = ({
  diceSet,
  onDiceSetChange
}) => {
  const [selectedDieIndex, setSelectedDieIndex] = useState<number | null>(null);
  const [selectedSide, setSelectedSide] = useState<number | null>(null);
  const [showDiceModal, setShowDiceModal] = useState(false);

  const handleSideClick = (dieIndex: number, sideValue: number) => {
    setSelectedDieIndex(dieIndex);
    setSelectedSide(sideValue);
  };

  const handlePipEffectSelect = (effectType: PipEffectType | 'none') => {
    if (selectedDieIndex === null || selectedSide === null) return;

    const newDiceSet = diceSet.map((die, idx) => {
      if (idx === selectedDieIndex) {
        const newPipEffects = { ...(die.pipEffects || {}) };
        if (effectType === 'none') {
          delete newPipEffects[selectedSide];
        } else {
          newPipEffects[selectedSide] = effectType;
        }
        return {
          ...die,
          pipEffects: Object.keys(newPipEffects).length > 0 ? newPipEffects : undefined
        };
      }
      return die;
    });

    onDiceSetChange(newDiceSet);
    setSelectedDieIndex(null);
    setSelectedSide(null);
  };

  const handleApplyConsumable = (consumableIndex: number, selectedDice: Array<{ dieIndex: number; sideValue: number }>) => {
    // This is just a demo - in a real scenario, this would apply the consumable effect
    console.log('Apply consumable', consumableIndex, 'to dice:', selectedDice);
    // For now, just close the modal
    setShowDiceModal(false);
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <h3 style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#dc3545'
        }}>
          Pip Effects
        </h3>
        <StandardButton
          onClick={() => setShowDiceModal(true)}
          variant="secondary"
          size="small"
        >
          View Dice Modal
        </StandardButton>
      </div>
      
      <p style={{
        fontSize: '10px',
        color: '#6c757d',
        marginBottom: '12px',
        lineHeight: '1.3'
      }}>
        Click on a die side to assign a pip effect. Pip effects modify how dice behave when scored.
      </p>

      {/* Dice Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: '12px',
        marginBottom: '16px',
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        {diceSet.map((die, dieIndex) => (
          <div key={die.id} style={{
            padding: '8px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            border: selectedDieIndex === dieIndex ? '2px solid #007bff' : '1px solid #dee2e6'
          }}>
            <div style={{
              fontSize: '10px',
              fontWeight: 'bold',
              marginBottom: '6px',
              color: '#2c3e50',
              textAlign: 'center'
            }}>
              {die.id}
            </div>
            
            {/* Show all sides of the die */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '4px',
              marginBottom: '4px'
            }}>
              {die.allowedValues.map((sideValue) => {
                const currentEffect = die.pipEffects?.[sideValue] || 'none';
                const isSelected = selectedDieIndex === dieIndex && selectedSide === sideValue;
                
                return (
                  <button
                    key={sideValue}
                    onClick={() => handleSideClick(dieIndex, sideValue)}
                    style={{
                      width: '24px',
                      height: '24px',
                      padding: '1px',
                      border: isSelected 
                        ? '2px solid #007bff' 
                        : currentEffect !== 'none' 
                          ? '2px solid #28a745' 
                          : '1px solid #dee2e6',
                      borderRadius: '3px',
                      backgroundColor: isSelected ? '#e7f3ff' : '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                    title={`Side ${sideValue}${currentEffect !== 'none' ? ` - ${PIP_EFFECTS.find(e => e.type === currentEffect)?.name}` : ''}`}
                  >
                    <DiceFace
                      value={sideValue}
                      size={22}
                      material={die.material}
                      pipEffect={currentEffect !== 'none' ? currentEffect : undefined}
                    />
                    {currentEffect !== 'none' && (
                      <div style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#28a745',
                        borderRadius: '50%',
                        border: '1px solid #fff'
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Pip Effect Selection (shown when a side is selected) */}
      {selectedDieIndex !== null && selectedSide !== null && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          border: '1px solid #dee2e6',
          marginTop: '8px'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#2c3e50'
          }}>
            Select Pip Effect for {diceSet[selectedDieIndex]?.id} - Side {selectedSide}
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '6px'
          }}>
            {/* None option */}
            <button
              onClick={() => handlePipEffectSelect('none')}
              style={{
                padding: '8px',
                backgroundColor: '#fff',
                border: '2px solid #dee2e6',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#adb5bd';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#dee2e6';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 'bold' }}>None</div>
              <div style={{ fontSize: '8px', color: '#6c757d' }}>Remove</div>
            </button>

            {/* Pip effect options */}
            {PIP_EFFECTS.map((effect) => (
              <button
                key={effect.id}
                onClick={() => handlePipEffectSelect(effect.type)}
                style={{
                  padding: '8px',
                  backgroundColor: '#fff',
                  border: '2px solid #dee2e6',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#007bff';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#dee2e6';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <PipEffectIcon type={effect.type} size={24} />
                <div style={{ fontSize: '10px', fontWeight: 'bold', textAlign: 'center' }}>
                  {effect.name}
                </div>
                <div style={{ fontSize: '8px', color: '#6c757d', textAlign: 'center' }}>
                  {effect.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dice Viewer Modal */}
      <DiceViewerModal
        isOpen={showDiceModal}
        onClose={() => setShowDiceModal(false)}
        diceSet={diceSet}
        consumables={[]} // Empty for demo - in real use, pass actual consumables
        onApplyConsumable={handleApplyConsumable}
        title="Dice Viewer Sample"
      />
    </div>
  );
};

