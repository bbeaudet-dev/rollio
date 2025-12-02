import React, { useState, useEffect, useMemo } from 'react';
import { Die, DiceMaterialType } from '../../../game/types';
import { DifficultyLevel, getStartingCredits } from '../../../game/logic/difficulty';
import { MATERIALS } from '../../../game/data/materials';
import { PIP_EFFECTS, PipEffectType } from '../../../game/data/pipEffects';
import { randomizeDiceSetConfig, CreditTransaction } from '../../../game/utils/factories';
import { DiceFace } from '../game/board/dice/DiceFace';
import { PipEffectIcon } from '../collection/PipEffectIcon';
import { ActionButton } from '../components/ActionButton';

interface DiceSetCustomizationProps {
  difficulty: DifficultyLevel;
  onComplete: (diceSet: Die[], creditsRemaining: number) => void;
}

export const DiceSetCustomization: React.FC<DiceSetCustomizationProps> = ({
  difficulty,
  onComplete
}) => {
  const startingCredits = getStartingCredits(difficulty);
  
  // Create default 6 dice
  const createDefaultDice = (): Die[] => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: `d${i + 1}`,
      sides: 6,
      allowedValues: [1, 2, 3, 4, 5, 6],
      material: 'plastic' as DiceMaterialType,
      pipEffects: undefined
    }));
  };

  const [diceSet, setDiceSet] = useState<Die[]>(createDefaultDice());
  // Track original dice IDs (d1-d6 are always original, regardless of their position)
  const originalDiceIds = useMemo(() => {
    return new Set(createDefaultDice().map(die => die.id));
  }, []);
  // Track original side values for credit refund calculation
  const [originalSideValues, setOriginalSideValues] = useState<Record<string, number[]>>(() => {
    const defaults = createDefaultDice();
    const original: Record<string, number[]> = {};
    defaults.forEach(die => {
      original[die.id] = [...die.allowedValues];
    });
    return original;
  });
  const [selectedDieIndex, setSelectedDieIndex] = useState<number | null>(null);
  const [selectedSideForPipEffect, setSelectedSideForPipEffect] = useState<{ dieIndex: number; sideValue: number } | null>(null);
  const [rotatingValues, setRotatingValues] = useState<Record<string, number>>({});
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);

  // Initialize rotating values
  useEffect(() => {
    const initialValues: Record<string, number> = {};
    diceSet.forEach((die) => {
      initialValues[die.id] = die.allowedValues[0] || 1;
    });
    setRotatingValues(initialValues);
  }, [diceSet]);

  // Rotate dice values
  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingValues(prev => {
        const newValues: Record<string, number> = {};
        diceSet.forEach(die => {
          const randomIndex = Math.floor(Math.random() * die.allowedValues.length);
          newValues[die.id] = die.allowedValues[randomIndex];
        });
        return newValues;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [diceSet]);

  // Calculate credits used (sum of all transaction costs, negative costs are refunds)
  const creditsUsed = useMemo(() => {
    return Math.max(0, creditTransactions.reduce((sum, t) => sum + t.cost, 0));
  }, [creditTransactions]);

  const creditsRemaining = startingCredits - creditsUsed;

  // Credit costs - base costs
  const COST_CHANGE_MATERIAL = 3;
  const COST_CHANGE_SIDE_VALUE = 2;

  // Dynamic cost calculation functions
  const getAddDieCost = (currentDiceCount: number): number => {
    const addedDiceCount = Math.max(0, currentDiceCount - 6); // How many dice beyond the original 6
    if (addedDiceCount === 0) return 10;
    if (addedDiceCount === 1) return 20;
    return 30; // 30 for third and beyond (though unlikely to reach)
  };

  // Fixed pricing - all pip effects cost 2 credits
  const COST_ADD_PIP_EFFECT = 2;

  // Helper to add transaction
  const addTransaction = (transaction: Omit<CreditTransaction, 'timestamp'>) => {
    setCreditTransactions(prev => [...prev, {
      ...transaction,
      timestamp: Date.now()
    }]);
  };

  // Helper to calculate total credits spent on a die
  const getCreditsSpentOnDie = (dieIndex: number): number => {
    return creditTransactions
      .filter(t => t.dieIndex === dieIndex && t.cost > 0)
      .reduce((sum, t) => sum + t.cost, 0);
  };


  // Add die
  const handleAddDie = () => {
    const cost = getAddDieCost(diceSet.length);
    if (creditsRemaining < cost) return;

    const newDieIndex = diceSet.length;
    const newDie: Die = {
      id: `d${newDieIndex + 1}`,
      sides: 6,
      allowedValues: [1, 2, 3, 4, 5, 6],
      material: 'plastic',
      pipEffects: undefined
    };

    setDiceSet(prev => [...prev, newDie]);
    // Track original values for the new die
    setOriginalSideValues(prev => ({
      ...prev,
      [newDie.id]: [...newDie.allowedValues]
    }));
    addTransaction({
      type: 'addDie',
      dieIndex: newDieIndex,
      cost: cost
    });
  };


  // Change material
  const handleChangeMaterial = (dieIndex: number, newMaterial: DiceMaterialType) => {
    const die = diceSet[dieIndex];
    if (!die || die.material === newMaterial) return;

    const oldMaterial = die.material;
    const wasPlastic = oldMaterial === 'plastic';
    const willBePlastic = newMaterial === 'plastic';

    // If changing from non-plastic to plastic, refund
    if (!wasPlastic && willBePlastic) {
      // Find and refund the material change transaction
      const oldMaterialTransaction = creditTransactions
        .filter(t => t.dieIndex === dieIndex && t.type === 'changeMaterial' && t.cost > 0)
        .sort((a, b) => b.timestamp - a.timestamp)[0];

      if (oldMaterialTransaction) {
        addTransaction({
          type: 'changeMaterial',
          dieIndex,
          cost: -COST_CHANGE_MATERIAL,
          metadata: { material: oldMaterial }
        });
      }
    }
    // If changing from plastic to non-plastic, charge
    else if (wasPlastic && !willBePlastic) {
      if (creditsRemaining < COST_CHANGE_MATERIAL) return;
      addTransaction({
        type: 'changeMaterial',
        dieIndex,
        cost: COST_CHANGE_MATERIAL,
        metadata: { material: newMaterial }
      });
    }
    // If changing from non-plastic to non-plastic, refund old and charge new
    else if (!wasPlastic && !willBePlastic) {
      // Refund old
      const oldMaterialTransaction = creditTransactions
        .filter(t => t.dieIndex === dieIndex && t.type === 'changeMaterial' && t.cost > 0)
        .sort((a, b) => b.timestamp - a.timestamp)[0];

      if (oldMaterialTransaction) {
        addTransaction({
          type: 'changeMaterial',
          dieIndex,
          cost: -COST_CHANGE_MATERIAL,
          metadata: { material: oldMaterial }
        });
      }

      // Charge new
      if (creditsRemaining + COST_CHANGE_MATERIAL < COST_CHANGE_MATERIAL) return;
      addTransaction({
        type: 'changeMaterial',
        dieIndex,
        cost: COST_CHANGE_MATERIAL,
        metadata: { material: newMaterial }
      });
    }

    setDiceSet(prev => prev.map((d, i) =>
      i === dieIndex ? { ...d, material: newMaterial } : d
    ));
  };

  // Change side value (increment/decrement)
  // Each change costs 2 credits. Track the value path to determine if we're reverting.
  const handleChangeSideValue = (dieIndex: number, sideIndex: number, delta: number) => {
    const die = diceSet[dieIndex];
    if (!die) return;

    const oldValue = die.allowedValues[sideIndex];
    const newValue = Math.max(1, Math.min(20, oldValue + delta)); // Clamp between 1 and 20

    if (newValue === oldValue) return;

    const dieId = die.id;
    const originalValue = originalSideValues[dieId]?.[sideIndex] ?? oldValue;

    // Get all transactions for this side, sorted by timestamp
    const allTransactions = creditTransactions
      .filter(t => 
        t.dieIndex === dieIndex && 
        t.sideIndex === sideIndex && 
        t.type === 'changeSideValue'
      )
      .sort((a, b) => a.timestamp - b.timestamp); // Oldest first

    // Build the value path: track what value we're at after each transaction
    let currentValue = originalValue;
    const valuePath: Array<{ value: number; transaction: typeof allTransactions[0] | null }> = [
      { value: originalValue, transaction: null }
    ];

    for (const txn of allTransactions) {
      if (txn.cost > 0) {
        // Charge: moving to a new value
        if (txn.metadata?.oldValue === currentValue) {
          currentValue = txn.metadata.newValue || currentValue;
          valuePath.push({ value: currentValue, transaction: txn });
        }
      } else {
        // Refund: reverting to a previous value
        if (txn.metadata?.newValue !== undefined) {
          currentValue = txn.metadata.newValue;
          // Remove the last entry from valuePath (the one being refunded)
          const lastEntry = valuePath[valuePath.length - 1];
          if (lastEntry && lastEntry.transaction) {
            valuePath.pop();
          }
        }
      }
    }

    // Check if newValue is in the valuePath (meaning we're reverting to a previous value)
    const isReverting = valuePath.some(entry => entry.value === newValue && entry.value !== currentValue);

    if (isReverting) {
      // Find the transaction that changed FROM newValue TO oldValue (the one we need to refund)
      const transactionToRefund = allTransactions
        .filter(t => 
          t.cost > 0 && 
          t.metadata?.oldValue === newValue && 
          t.metadata?.newValue === oldValue
        )
        .sort((a, b) => b.timestamp - a.timestamp)[0]; // Most recent first

      if (transactionToRefund) {
        // Refund this specific transaction
        addTransaction({
          type: 'changeSideValue',
          dieIndex,
          sideIndex,
          cost: -transactionToRefund.cost,
          metadata: { oldValue: oldValue, newValue: newValue }
        });
      }

      // Update the dice set
      setDiceSet(prev => prev.map((d, i) =>
        i === dieIndex
          ? {
              ...d,
              allowedValues: d.allowedValues.map((val, idx) =>
                idx === sideIndex ? newValue : val
              )
            }
          : d
      ));
      return;
    }

    // This is a NEW change - charge 2 credits
    if (creditsRemaining < COST_CHANGE_SIDE_VALUE) return;

    // Update the dice set
    setDiceSet(prev => prev.map((d, i) =>
      i === dieIndex
        ? {
            ...d,
            allowedValues: d.allowedValues.map((val, idx) =>
              idx === sideIndex ? newValue : val
            )
          }
        : d
    ));

    // Charge for the new change
    addTransaction({
      type: 'changeSideValue',
      dieIndex,
      sideIndex,
      cost: COST_CHANGE_SIDE_VALUE,
      metadata: { oldValue, newValue }
    });
  };

  // Add/remove pip effect
  const handlePipEffectChange = (dieIndex: number, sideValue: number, effect: PipEffectType | 'none') => {
    const die = diceSet[dieIndex];
    if (!die) return;

    const currentEffect = die.pipEffects?.[sideValue];
    const isRemoving = effect === 'none' && currentEffect;
    const isAdding = effect !== 'none' && !currentEffect;

    if (isAdding) {
      if (creditsRemaining < COST_ADD_PIP_EFFECT) return;
      
      addTransaction({
        type: 'addPipEffect',
        dieIndex,
        sideIndex: sideValue,
        cost: COST_ADD_PIP_EFFECT,
        metadata: { pipEffect: effect as PipEffectType }
      });
    } else if (isRemoving && currentEffect && currentEffect !== 'none') {
      // Find the transaction that added this effect to refund it
      const addTransactionRecord = creditTransactions
        .filter(t => 
          t.type === 'addPipEffect' &&
          t.dieIndex === dieIndex &&
          t.sideIndex === sideValue &&
          t.metadata?.pipEffect === currentEffect
        )
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      
      const refundAmount = addTransactionRecord ? addTransactionRecord.cost : COST_ADD_PIP_EFFECT;
      
      addTransaction({
        type: 'removePipEffect',
        dieIndex,
        sideIndex: sideValue,
        cost: -refundAmount,
        metadata: { pipEffect: currentEffect as PipEffectType }
      });
    }

    setDiceSet(prev => prev.map((d, i) => {
      if (i !== dieIndex) return d;
      const newPipEffects = { ...(d.pipEffects || {}) };
      if (effect === 'none') {
        delete newPipEffects[sideValue];
      } else {
        newPipEffects[sideValue] = effect;
      }
      return {
        ...d,
        pipEffects: Object.keys(newPipEffects).length > 0 ? newPipEffects : undefined
      };
    }));
  };


  // Randomize dice set
  const handleRandomize = () => {
    const result = randomizeDiceSetConfig(difficulty);
    
    // Update all state
    setDiceSet(result.diceSet);
    setCreditTransactions(result.creditTransactions);
    setOriginalSideValues(result.originalSideValues);
    setSelectedDieIndex(null);
    setSelectedSideForPipEffect(null);
  };

  // Get credit color
  const getCreditColor = () => {
    const percentage = creditsRemaining / startingCredits;
    if (percentage > 0.5) return '#28a745'; // Green
    if (percentage > 0.25) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  const selectedDie = selectedDieIndex !== null ? diceSet[selectedDieIndex] : null;

  return (
    <div style={{
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #dee2e6',
      maxWidth: '900px',
      margin: '0 auto'
    }}>

      {/* Header */}
      <h2 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '16px',
        marginTop: '0'
      }}>
        Customize your starting Dice Set
      </h2>

      {/* Credit Display - Fallout Style Bars */}
      <div style={{
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#2c3e50' }}>
            Credits: <span style={{ color: getCreditColor() }}>{creditsRemaining}</span> / {startingCredits}
          </span>
        </div>
        {/* 30 Individual Bars - Order: Green (available) on left -> Gray (used) in middle -> Red (unavailable) on right */}
        <div style={{
          display: 'flex',
          gap: '4px',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
          alignItems: 'center'
        }}>
          {Array.from({ length: 30 }, (_, index) => {
            // Order: Green (available) on left -> Gray (used) in middle -> Red (unavailable) on right
            // Green: index < creditsRemaining (available, not used)
            // Gray: creditsRemaining <= index < startingCredits (used)
            // Red: index >= startingCredits (unavailable due to difficulty)
            const isGreen = index < creditsRemaining;
            const isGray = index >= creditsRemaining && index < startingCredits;
            const isRed = index >= startingCredits;
            
            let backgroundColor = '#28a745'; // Green for available
            let borderColor = '#dee2e6';
            
            if (isRed) {
              backgroundColor = 'transparent';
              borderColor = '#dc3545'; // Red outline for unavailable
            } else if (isGray) {
              backgroundColor = '#adb5bd'; // Lighter gray for used
              borderColor = '#dee2e6';
            }
            
            return (
              <div
                key={index}
                style={{
                  width: '20px',
                  height: '24px',
                  backgroundColor,
                  border: `2px solid ${borderColor}`,
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                title={
                  isRed
                    ? `Unavailable (difficulty restriction)`
                    : isGray
                      ? `Used (${index - creditsRemaining + 1}/${creditsUsed})`
                      : `Available (${index + 1}/${creditsRemaining})`
                }
              />
            );
          })}
        </div>
      </div>

      {/* Dice Summary Row */}
      <div style={{
        marginBottom: '12px'
      }}>
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
                  onClick={() => setSelectedDieIndex(isSelected ? null : index)}
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
              onClick={handleAddDie}
              disabled={creditsRemaining < getAddDieCost(diceSet.length)}
              style={{
                width: '52px',
                height: '52px',
                border: '2px dashed #6c757d',
                borderRadius: '8px',
                backgroundColor: creditsRemaining >= getAddDieCost(diceSet.length) ? '#f8f9fa' : '#e9ecef',
                color: creditsRemaining >= getAddDieCost(diceSet.length) ? '#6c757d' : '#adb5bd',
                cursor: creditsRemaining >= getAddDieCost(diceSet.length) ? 'pointer' : 'not-allowed',
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
              title={`Add die (${getAddDieCost(diceSet.length)} credits)`}
            >
              +
            </button>
            <div style={{
              display: 'flex',
              gap: '2px',
              justifyContent: 'center',
              alignItems: 'center',
              height: '8px',
              fontSize: '8px',
              color: creditsRemaining >= getAddDieCost(diceSet.length) ? '#28a745' : '#adb5bd',
              fontWeight: 'bold'
            }}>
              {getAddDieCost(diceSet.length) > 5 ? (
                <>
                  <span>{getAddDieCost(diceSet.length)}</span>
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: creditsRemaining >= getAddDieCost(diceSet.length) ? '#28a745' : '#adb5bd',
                      borderRadius: '2px',
                      flexShrink: 0
                    }}
                  />
                </>
              ) : (
                Array.from({ length: getAddDieCost(diceSet.length) }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: creditsRemaining >= getAddDieCost(diceSet.length) ? '#28a745' : '#adb5bd',
                      borderRadius: '2px',
                      flexShrink: 0
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Die Detail View */}
      {selectedDie && selectedDieIndex !== null && (
        <div style={{
          marginTop: '12px',
          paddingTop: '12px'
        }}>

          {/* Material Selection */}
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
                const isSelected = selectedDie.material === material.id;
                const isPlastic = material.id === 'plastic';
                const canAfford = isPlastic || creditsRemaining >= COST_CHANGE_MATERIAL;

                return (
                  <button
                    key={material.id}
                    onClick={() => handleChangeMaterial(selectedDieIndex, material.id as DiceMaterialType)}
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
                    title={material.description + (isPlastic ? '' : ` (${COST_CHANGE_MATERIAL} credits)`)}
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
                      <div style={{
                        display: 'flex',
                        gap: '2px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '8px',
                        fontSize: '8px',
                        color: canAfford || isSelected ? '#28a745' : '#adb5bd',
                        fontWeight: 'bold'
                      }}>
                        {COST_CHANGE_MATERIAL > 5 ? (
                          <>
                            <span>{COST_CHANGE_MATERIAL}</span>
                            <div
                              style={{
                                width: '6px',
                                height: '6px',
                                backgroundColor: canAfford || isSelected ? '#28a745' : '#adb5bd',
                                borderRadius: '2px',
                                flexShrink: 0
                              }}
                            />
                          </>
                        ) : (
                          Array.from({ length: COST_CHANGE_MATERIAL }, (_, i) => (
                            <div
                              key={i}
                              style={{
                                width: '6px',
                                height: '6px',
                                backgroundColor: canAfford || isSelected ? '#28a745' : '#adb5bd',
                                borderRadius: '2px',
                                flexShrink: 0
                              }}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Side Values */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#2c3e50'
            }}>
              Side Values
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2px',
              padding: '0',
              margin: '0'
            }}>
              {selectedDie.allowedValues.map((value, sideIndex) => {
                const pipEffect = selectedDie.pipEffects?.[value];

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
                      material={selectedDie.material}
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
                          onClick={() => creditsRemaining >= COST_CHANGE_SIDE_VALUE && value < 20 && handleChangeSideValue(selectedDieIndex, sideIndex, 1)}
                          style={{
                            width: '12px',
                            height: '8px',
                            border: '1px solid #dee2e6',
                            borderRadius: '2px 2px 0 0',
                            backgroundColor: creditsRemaining >= COST_CHANGE_SIDE_VALUE && value < 20 ? '#fff' : '#e9ecef',
                            cursor: creditsRemaining >= COST_CHANGE_SIDE_VALUE && value < 20 ? 'pointer' : 'not-allowed',
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
                          title={`Increase (+${COST_CHANGE_SIDE_VALUE} credits)`}
                        >
                          ▲
                        </div>
                        <div
                          onClick={() => creditsRemaining >= COST_CHANGE_SIDE_VALUE && value > 1 && handleChangeSideValue(selectedDieIndex, sideIndex, -1)}
                          style={{
                            width: '12px',
                            height: '8px',
                            border: '1px solid #dee2e6',
                            borderRadius: '0 0 2px 2px',
                            backgroundColor: creditsRemaining >= COST_CHANGE_SIDE_VALUE && value > 1 ? '#fff' : '#e9ecef',
                            cursor: creditsRemaining >= COST_CHANGE_SIDE_VALUE && value > 1 ? 'pointer' : 'not-allowed',
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
                          title={`Decrease (-${COST_CHANGE_SIDE_VALUE} credits)`}
                        >
                          ▼
                        </div>
                      </div>
                      <div
                        onClick={() => setSelectedSideForPipEffect({ dieIndex: selectedDieIndex, sideValue: value })}
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
                    <div style={{
                      display: 'flex',
                      gap: '2px',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '6px',
                      fontSize: '8px',
                      color: creditsRemaining >= COST_CHANGE_SIDE_VALUE ? '#28a745' : '#adb5bd',
                      fontWeight: 'bold'
                    }}>
                      {COST_CHANGE_SIDE_VALUE > 5 ? (
                        <>
                          <span>{COST_CHANGE_SIDE_VALUE}</span>
                          <div
                            style={{
                              width: '5px',
                              height: '5px',
                              backgroundColor: creditsRemaining >= COST_CHANGE_SIDE_VALUE ? '#28a745' : '#adb5bd',
                              borderRadius: '2px',
                              flexShrink: 0
                            }}
                          />
                        </>
                      ) : (
                        Array.from({ length: COST_CHANGE_SIDE_VALUE }, (_, i) => (
                          <div
                            key={i}
                            style={{
                              width: '5px',
                              height: '5px',
                              backgroundColor: creditsRemaining >= COST_CHANGE_SIDE_VALUE ? '#28a745' : '#adb5bd',
                              borderRadius: '2px',
                              flexShrink: 0
                            }}
                          />
                        ))
                      )}
                    </div>
                    {/* Pip Effect for this side */}
                    {pipEffect && pipEffect !== 'none' && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        width: '100%'
                      }}>
                        <PipEffectIcon type={pipEffect as PipEffectType} size={16} />
                        <button
                          onClick={() => handlePipEffectChange(selectedDieIndex, value, 'none')}
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

          {/* Pip Effect Selector (shown when adding pip effect) */}
          {selectedSideForPipEffect && selectedSideForPipEffect.dieIndex === selectedDieIndex && (
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
                Select Pip Effect for Side {selectedSideForPipEffect.sideValue}
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: '8px'
              }}>
                {PIP_EFFECTS.map((effect) => {
                  const canAfford = creditsRemaining >= COST_ADD_PIP_EFFECT;
                  
                  return (
                    <div key={effect.id} style={{ position: 'relative' }}>
                      <button
                        onClick={() => {
                          if (canAfford) {
                            handlePipEffectChange(selectedSideForPipEffect.dieIndex, selectedSideForPipEffect.sideValue, effect.type);
                            setSelectedSideForPipEffect(null);
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
                        title={effect.description + ` (${COST_ADD_PIP_EFFECT} credits)`}
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
                        height: '6px',
                        fontSize: '8px',
                        color: canAfford ? '#28a745' : '#adb5bd',
                        fontWeight: 'bold'
                      }}>
                        {COST_ADD_PIP_EFFECT > 5 ? (
                          <>
                            <span>{COST_ADD_PIP_EFFECT}</span>
                            <div
                              style={{
                                width: '4px',
                                height: '4px',
                                backgroundColor: canAfford ? '#28a745' : '#adb5bd',
                                borderRadius: '2px',
                                flexShrink: 0
                              }}
                            />
                          </>
                        ) : (
                          Array.from({ length: COST_ADD_PIP_EFFECT }, (_, i) => (
                            <div
                              key={i}
                              style={{
                                width: '4px',
                                height: '4px',
                                backgroundColor: canAfford ? '#28a745' : '#adb5bd',
                                borderRadius: '2px',
                                flexShrink: 0
                              }}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setSelectedSideForPipEffect(null)}
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
          )}
        </div>
      )}

      {/* Complete Button and Randomize Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        alignItems: 'center'
      }}>
        <ActionButton
          onClick={handleRandomize}
          variant="secondary"
          size="medium"
        >
          Randomize Dice Set
        </ActionButton>
        <ActionButton
          onClick={() => onComplete(diceSet, creditsRemaining)}
          variant="success"
          size="medium"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>Start Game</span>
          <span style={{ fontSize: '11px', opacity: 0.9, fontWeight: 'normal' }}>
            {creditsRemaining} credits → ${creditsRemaining}
          </span>
        </ActionButton>
      </div>
    </div>
  );
};

