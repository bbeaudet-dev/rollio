import React from 'react';
import { Die } from '../../../../game/types';
import { DiceFace } from '../../game/board/dice/DiceFace';
import { PipEffectIcon } from '../../collection/PipEffectIcon';
import { PIP_EFFECTS } from '../../../../game/data/pipEffects';
import { CreditIndicator } from '../../components/CreditIndicator';

interface SideValueEditorProps {
  die: Die;
  dieIndex: number;
  originalSideValues: Record<string, number[]>;
  onValueChange: (dieIndex: number, sideIndex: number, delta: number) => void;
  onPipEffectClick: (dieIndex: number, sideValue: number) => void;
  onRemovePipEffect: (dieIndex: number, sideValue: number) => void;
  creditsRemaining: number;
  costPerChange: number;
}

export const SideValueEditor: React.FC<SideValueEditorProps> = ({
  die,
  dieIndex,
  originalSideValues,
  onValueChange,
  onPipEffectClick,
  onRemovePipEffect,
  creditsRemaining,
  costPerChange
}) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        fontSize: '12px',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#2c3e50'
      }}>
        Values & Effects
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2px',
        padding: '0',
        margin: '0'
      }}>
        {die.allowedValues.map((value, sideIndex) => {
          const pipEffect = die.pipEffects?.[value];
          // Check if this side value has been modified from the original
          const originalValue = originalSideValues[die.id]?.[sideIndex] ?? value;
          const isModified = value !== originalValue;

          return (
            <div
              key={sideIndex}
              style={{
                padding: '0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                width: '80px',
                boxSizing: 'border-box',
                alignSelf: 'start'
              }}
            >
              <DiceFace
                value={value}
                size={40}
                material={die.material}
                pipEffect={pipEffect || undefined}
              />
              {/* Arrows and +Effect button side by side */}
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '2px',
                width: '100%',
                justifyContent: 'center'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0',
                  padding: '0',
                  margin: '0'
                }}>
                  <div
                    onClick={() => creditsRemaining >= costPerChange && value < 20 && onValueChange(dieIndex, sideIndex, 1)}
                    style={{
                      width: '12px',
                      height: '8px',
                      border: '1px solid #dee2e6',
                      borderRadius: '2px 2px 0 0',
                      backgroundColor: creditsRemaining >= costPerChange && value < 20 ? '#fff' : '#e9ecef',
                      cursor: creditsRemaining >= costPerChange && value < 20 ? 'pointer' : 'not-allowed',
                      fontSize: '8px',
                      padding: '0',
                      margin: '0',
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                      position: 'relative',
                      lineHeight: '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      userSelect: 'none'
                    }}
                    title={`Increase (+${costPerChange} credits)`}
                  >
                    ▲
                  </div>
                  <div
                    onClick={() => creditsRemaining >= costPerChange && value > 1 && onValueChange(dieIndex, sideIndex, -1)}
                    style={{
                      width: '12px',
                      height: '8px',
                      border: '1px solid #dee2e6',
                      borderRadius: '0 0 2px 2px',
                      backgroundColor: creditsRemaining >= costPerChange && value > 1 ? '#fff' : '#e9ecef',
                      cursor: creditsRemaining >= costPerChange && value > 1 ? 'pointer' : 'not-allowed',
                      fontSize: '8px',
                      padding: '0',
                      margin: '0',
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                      position: 'relative',
                      lineHeight: '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      userSelect: 'none'
                    }}
                    title={`Decrease (-${costPerChange} credits)`}
                  >
                    ▼
                  </div>
                </div>
                <div
                  onClick={() => onPipEffectClick(dieIndex, value)}
                  style={{
                    fontSize: '8px',
                    padding: '0',
                    border: '1px solid #28a745',
                    borderRadius: '2px',
                    backgroundColor: '#fff',
                    color: '#28a745',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    lineHeight: '1',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    userSelect: 'none',
                    height: '20px'
                  }}
                  title="Click to add pip effect"
                >
                  + Effect
                </div>
              </div>
              {/* Credit bars */}
              <CreditIndicator cost={costPerChange} canAfford={creditsRemaining >= costPerChange} size="medium" />
              {/* Pip Effect for this side */}
              {pipEffect && pipEffect !== 'none' && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  marginTop: '4px',
                  width: '100%'
                }}>
                  <PipEffectIcon type={pipEffect} size={16} />
                  <button
                    onClick={() => onRemovePipEffect(dieIndex, value)}
                    style={{
                      fontSize: '8px',
                      padding: '1px 4px',
                      border: '1px solid #dc3545',
                      borderRadius: '2px',
                      backgroundColor: '#fff',
                      color: '#dc3545',
                      cursor: 'pointer'
                    }}
                    title={`Remove pip effect`}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

