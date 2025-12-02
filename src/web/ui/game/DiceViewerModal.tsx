import React, { useState, useMemo } from 'react';
import { Die, Consumable } from '../../../game/types';
import { DiceFace } from './board/dice/DiceFace';
import { ConsumableCard } from '../components/ConsumableCard';
import { ActionButton } from '../components/ActionButton';

interface DiceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  diceSet: Die[];
  consumables: Consumable[];
  onApplyConsumable: (consumableIndex: number, selectedDice: Array<{ dieIndex: number; sideValue: number }>) => void;
  title?: string;
}

interface DiceSideView {
  dieIndex: number;
  die: Die;
  sideValue: number;
}

export const DiceViewerModal: React.FC<DiceViewerModalProps> = ({
  isOpen,
  onClose,
  diceSet,
  consumables,
  onApplyConsumable,
  title = 'Dice Viewer'
}) => {
  // Generate random sides for each die (up to 10 dice, then random subset)
  const diceSides = useMemo(() => {
    const maxDice = 10;
    const diceToShow = diceSet.length <= maxDice 
      ? diceSet 
      : diceSet.sort(() => Math.random() - 0.5).slice(0, maxDice);
    
    return diceToShow.map((die, index) => {
      const originalIndex = diceSet.indexOf(die);
      // Pick a random side value from allowed values
      const randomIndex = Math.floor(Math.random() * die.allowedValues.length);
      const sideValue = die.allowedValues[randomIndex];
      
      return {
        dieIndex: originalIndex,
        die,
        sideValue
      };
    });
  }, [diceSet, isOpen]); // Regenerate when modal opens

  const [selectedViewIndices, setSelectedViewIndices] = useState<Set<number>>(new Set());
  const [selectedConsumableIndex, setSelectedConsumableIndex] = useState<number | null>(null);

  const handleSideClick = (viewIndex: number) => {
    setSelectedViewIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(viewIndex)) {
        newSet.delete(viewIndex);
      } else {
        newSet.add(viewIndex);
      }
      return newSet;
    });
  };

  const handleFinish = () => {
    if (selectedViewIndices.size === 0) {
      return;
    }

    // If no consumable selected, use index 0 (or handle differently based on your needs)
    const consumableIdx = selectedConsumableIndex !== null ? selectedConsumableIndex : 0;

    const selectedDice = Array.from(selectedViewIndices).map(viewIndex => {
      const side = diceSides[viewIndex];
      return {
        dieIndex: side.dieIndex,
        sideValue: side.sideValue
      };
    });

    onApplyConsumable(consumableIdx, selectedDice);
    
    // Clear selections and close modal
    setSelectedViewIndices(new Set());
    setSelectedConsumableIndex(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '900px',
        maxHeight: '90vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '2px solid #dee2e6',
          paddingBottom: '12px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#2c3e50',
            margin: 0
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#6c757d',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.color = '#2c3e50';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#6c757d';
            }}
          >
            ×
          </button>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '14px',
          color: '#6c757d',
          marginBottom: '16px',
          lineHeight: '1.5'
        }}>
          Click on dice to select them, then choose a consumable and click "Finished" to apply. Each die shows a random side from your dice set.
        </p>

        {/* Consumable Selector */}
        {consumables.length > 0 && (
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#2c3e50'
            }}>
              Select Consumable:
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {consumables.map((consumable, idx) => (
                <button
                  key={consumable.id}
                  onClick={() => setSelectedConsumableIndex(idx)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    backgroundColor: selectedConsumableIndex === idx ? '#007bff' : '#fff',
                    color: selectedConsumableIndex === idx ? '#fff' : '#2c3e50',
                    border: `2px solid ${selectedConsumableIndex === idx ? '#007bff' : '#dee2e6'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedConsumableIndex !== idx) {
                      e.currentTarget.style.backgroundColor = '#e9ecef';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedConsumableIndex !== idx) {
                      e.currentTarget.style.backgroundColor = '#fff';
                    }
                  }}
                >
                  {consumable.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '20px'
        }}>
          {/* Dice Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '8px',
            marginBottom: '24px',
            padding: '16px 0' // Add vertical padding so selected dice aren't cut off
          }}>
            {diceSides.map((side, viewIndex) => {
              const isSelected = selectedViewIndices.has(viewIndex);
              
              return (
                <div
                  key={`${side.dieIndex}-${viewIndex}`}
                  onClick={() => handleSideClick(viewIndex)}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    position: 'relative'
                  }}
                >
                  <DiceFace
                    value={side.sideValue}
                    size={60}
                    material={side.die.material}
                    pipEffect={side.die.pipEffects?.[side.sideValue]}
                  />
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#007bff',
                      borderRadius: '50%',
                      border: '2px solid #fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: '#fff',
                      fontWeight: 'bold'
                    }}>
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          borderTop: '2px solid #dee2e6',
          paddingTop: '16px'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#6c757d'
          }}>
            {selectedViewIndices.size > 0 && (
              <span>
                {selectedViewIndices.size} die{selectedViewIndices.size !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <ActionButton
              onClick={onClose}
              variant="secondary"
              size="medium"
            >
              Cancel
            </ActionButton>
            <ActionButton
              onClick={handleFinish}
              variant="primary"
              size="medium"
              disabled={selectedViewIndices.size === 0}
            >
              Apply
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};

