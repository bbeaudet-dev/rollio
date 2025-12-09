import React from 'react';
import { Die } from '../../../../game/types';
import { PipEffectType } from '../../../../game/data/pipEffects';
import { DiceFace } from '../../game/board/dice/DiceFace';
import { PipEffectIcon } from '../../collection/PipEffectIcon';
import { CreditCostDisplay } from './CreditCostDisplay';

interface DiceSetDisplayProps {
  diceSet: Die[];
  rotatingValues: Record<string, number>;
  selectedDieIndex: number | null;
  onDieSelect: (index: number) => void;
  onAddDie: () => void;
  canAddDie: boolean;
  addDieCost: number;
  creditTransactions: Array<{ dieIndex?: number; type: string; cost: number }>;
}

export const DiceSetDisplay: React.FC<DiceSetDisplayProps> = ({
  diceSet,
  rotatingValues,
  selectedDieIndex,
  onDieSelect,
  onAddDie,
  canAddDie,
  addDieCost,
  creditTransactions
}) => {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        alignItems: 'flex-start'
      }}>
        {diceSet.map((die, index) => {
          const currentValue = rotatingValues[die.id] || die.allowedValues[0] || 1;
          const isSelected = selectedDieIndex === index;

          // Count side value changes for this die
          const sideValueChangeCount = creditTransactions.filter(
            t => t.dieIndex === index && t.type === 'changeSideValue' && t.cost > 0
          ).length;

          // Get all unique pip effects for this die
          const pipEffects = die.pipEffects ? Object.values(die.pipEffects).filter((effect): effect is PipEffectType => effect !== 'none') : [];
          const uniquePipEffects = [...new Set(pipEffects)];

          return (
            <div key={die.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button
                onClick={() => onDieSelect(index)}
                style={{
                  width: '52px',
                  height: '52px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? '#e7f3ff' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0',
                  transition: 'all 0.2s ease',
                  outline: isSelected ? '2px solid #007bff' : 'none',
                  outlineOffset: '0px',
                  boxSizing: 'border-box',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#f0f8ff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <DiceFace
                  value={currentValue}
                  size={52}
                  material={die.material}
                  pipEffect={die.pipEffects?.[currentValue] || undefined}
                />
              </button>
              {/* Indicators for side value changes and pip effects */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                marginTop: '4px',
                minHeight: '12px',
                fontSize: '10px'
              }}>
                {sideValueChangeCount > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    color: '#6c757d'
                  }}>
                    <span style={{ fontSize: '10px' }}>↕</span>
                    <span style={{ fontSize: '9px', fontWeight: 'bold' }}>{sideValueChangeCount}</span>
                  </div>
                )}
                {uniquePipEffects.map((effect, effectIndex) => (
                  <div
                    key={effectIndex}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '12px',
                      height: '12px'
                    }}
                  >
                    <PipEffectIcon type={effect} size={12} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={onAddDie}
            disabled={!canAddDie}
            style={{
              width: '52px',
              height: '52px',
              border: '2px dashed #6c757d',
              borderRadius: '8px',
              backgroundColor: canAddDie ? '#f8f9fa' : '#e9ecef',
              color: canAddDie ? '#6c757d' : '#adb5bd',
              cursor: canAddDie ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
              padding: '0',
              margin: '0',
              boxSizing: 'border-box'
            }}
            title={`Add die (${addDieCost} credits)`}
          >
            +
          </button>
          <CreditCostDisplay cost={addDieCost} canAfford={canAddDie} />
        </div>
      </div>
    </div>
  );
};

