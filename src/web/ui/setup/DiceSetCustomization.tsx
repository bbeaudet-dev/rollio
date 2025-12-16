import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Die, DiceMaterialType } from '../../../game/types';
import { DifficultyLevel, getStartingCredits } from '../../../game/logic/difficulty';
import { MATERIALS } from '../../../game/data/materials';
import { PIP_EFFECTS, PipEffectType } from '../../../game/data/pipEffects';
import { randomizeDiceSetConfig, CreditTransaction } from '../../../game/utils/factories';
import { BASIC_DICE_SET } from '../../../game/data/diceSets';
import { DiceFace } from '../game/board/dice/DiceFace';
import { PipEffectIcon } from '../collection/PipEffectIcon';
import { ActionButton } from '../components/ActionButton';
import { CreditsBar } from './DiceSetCustomization/CreditsBar';
import { DiceSetDisplay } from './DiceSetCustomization/DiceSetDisplay';
import { MaterialSelector } from './DiceSetCustomization/MaterialSelector';
import { SideValueEditor } from './DiceSetCustomization/SideValueEditor';
import { PipEffectSelector } from './DiceSetCustomization/PipEffectSelector';
import { ConfigOptions } from './DiceSetCustomization/ConfigOptions';
import { useUnlocks } from '../../contexts/UnlockContext';
import { playMaterialSound, playNewDieSound } from '../../utils/sounds';

interface DiceSetCustomizationProps {
  difficulty: DifficultyLevel;
  infiniteCredits?: boolean; // For Debug mode
  onComplete: (diceSet: Die[], creditsRemaining: number, customizationOptions?: {
    baseLevelRerolls?: number;
    baseLevelBanks?: number;
    charmSlots?: number;
    consumableSlots?: number;
  }) => void;
  onStartGameReady?: (startGame: () => void, isLocked: boolean) => void;
  onDiceSetChange?: (diceSet: Die[], creditsRemaining: number, customizationOptions?: {
    baseLevelRerolls?: number;
    baseLevelBanks?: number;
    charmSlots?: number;
    consumableSlots?: number;
  }) => void; // Optional callback for when dice set changes (for Debug mode)
}

export const DiceSetCustomization: React.FC<DiceSetCustomizationProps> = ({
  difficulty,
  infiniteCredits = false,
  onComplete,
  onStartGameReady,
  onDiceSetChange
}) => {
  const { unlockedItems } = useUnlocks();
  const isLocked = difficulty !== 'plastic' && !unlockedItems.has(`difficulty:${difficulty}`);
  const startingCredits = infiniteCredits ? 999999 : getStartingCredits(difficulty);
  
  // Create default 5 dice
  const createDefaultDice = (): Die[] => {
    return Array.from({ length: 5 }, (_, i) => ({
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
  
  // Track customization options - use defaults from BASIC_DICE_SET
  const baseRerolls = BASIC_DICE_SET.baseLevelRerolls;
  const baseBanks = BASIC_DICE_SET.baseLevelBanks;
  const baseCharmSlots = BASIC_DICE_SET.charmSlots;
  const baseConsumableSlots = BASIC_DICE_SET.consumableSlots;
  
  const [baseLevelRerolls, setBaseLevelRerolls] = useState(baseRerolls);
  const [baseLevelBanks, setBaseLevelBanks] = useState(baseBanks);
  const [charmSlots, setCharmSlots] = useState(baseCharmSlots);
  const [consumableSlots, setConsumableSlots] = useState(baseConsumableSlots);

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
  const COST_CHANGE_SIDE_VALUE = 2;
  
  // Compounding material costs - track how many of each material type have been purchased
  const getMaterialCost = (material: DiceMaterialType, currentDiceSet: Die[]): number => {
    if (material === 'plastic') return 0; // Plastic is free
    
    // Count how many dice of this material type currently exist (excluding plastic)
    const materialCount = currentDiceSet.filter(d => d.material === material).length;
    
    // Base cost for first non-plastic material: 3 credits
    // Each additional die of the same material costs +2 more
    // Ghost: 3, 5, 7, 9... (3 + 2*(n-1))
    // Crystal: 3, 5, 7, 9...
    // etc.
    return 3 + (materialCount * 2);
  };
  
  // New credit categories
  const COST_ADD_BASE_REROLL = 3; // 3 credits per reroll
  const COST_ADD_BASE_BANK = 4; // 4 credits per bank
  const COST_ADD_CHARM_SLOT = 10; // 10 credits per charm slot
  const COST_ADD_CONSUMABLE_SLOT = 8; // 8 credits per consumable slot

  // Dynamic cost calculation functions
  const getAddDieCost = (currentDiceCount: number): number => {
    const addedDiceCount = Math.max(0, currentDiceCount - 5); // How many dice beyond the original 5
    if (addedDiceCount === 0) return 5; // First extra die: 5 credits
    if (addedDiceCount === 1) return 10; // Second extra die: 10 credits
    return 20; // Third and beyond: 20 credits each
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
    playNewDieSound();
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
  const handleChangeMaterial = async (dieIndex: number, newMaterial: DiceMaterialType) => {
    const die = diceSet[dieIndex];
    if (!die || die.material === newMaterial) return;

    const oldMaterial = die.material;
    const wasPlastic = oldMaterial === 'plastic';
    const willBePlastic = newMaterial === 'plastic';
    
    // Unlock the material when it's used (if not plastic)
    if (!willBePlastic) {
      try {
        const { progressApi } = await import('../../services/api');
        await progressApi.unlockItem('material', newMaterial);
        window.dispatchEvent(new CustomEvent('unlock:refresh'));
      } catch (error) {
        console.debug('Failed to unlock material:', error);
      }
    }

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
          cost: -oldMaterialTransaction.cost,
          metadata: { material: oldMaterial }
        });
      }
    }
    // If changing from plastic to non-plastic, charge
    else if (wasPlastic && !willBePlastic) {
      const newMaterialCost = getMaterialCost(newMaterial, diceSet);
      if (creditsRemaining < newMaterialCost) return;
      
      // Unlock the material when it's used
      (async () => {
        try {
          const { progressApi } = await import('../../services/api');
          await progressApi.unlockItem('material', newMaterial);
          window.dispatchEvent(new CustomEvent('unlock:refresh'));
        } catch (error) {
          console.debug('Failed to unlock material:', error);
        }
      })();
      
      addTransaction({
        type: 'changeMaterial',
        dieIndex,
        cost: newMaterialCost,
        metadata: { material: newMaterial }
      });
    }
    // If changing from non-plastic to non-plastic, refund old and charge new
    else if (!wasPlastic && !willBePlastic) {
      const oldMaterialTransaction = creditTransactions
        .filter(t => t.dieIndex === dieIndex && t.type === 'changeMaterial' && t.cost > 0)
        .sort((a, b) => b.timestamp - a.timestamp)[0];

      if (oldMaterialTransaction) {
        addTransaction({
          type: 'changeMaterial',
          dieIndex,
          cost: -oldMaterialTransaction.cost, 
          metadata: { material: oldMaterial }
        });
      }

      // Charge new (with compounding cost)
      // Need to temporarily remove this die from the count to get correct cost
      const tempDiceSet = diceSet.map((d, i) => i === dieIndex ? { ...d, material: 'plastic' as DiceMaterialType } : d);
      const newMaterialCost = getMaterialCost(newMaterial, tempDiceSet);
      if (creditsRemaining + (oldMaterialTransaction?.cost || 0) < newMaterialCost) return;
      
      // Unlock the material when it's used
      (async () => {
        try {
          const { progressApi } = await import('../../services/api');
          await progressApi.unlockItem('material', newMaterial);
          window.dispatchEvent(new CustomEvent('unlock:refresh'));
        } catch (error) {
          console.debug('Failed to unlock material:', error);
        }
      })();
      
      addTransaction({
        type: 'changeMaterial',
        dieIndex,
        cost: newMaterialCost,
        metadata: { material: newMaterial }
      });
    }

    setDiceSet(prev => prev.map((d, i) =>
      i === dieIndex ? { ...d, material: newMaterial } : d
    ));
    
    // Play material-specific sound
    playMaterialSound(newMaterial);
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
      
      // Unlock the pip effect when it's used
      (async () => {
        try {
          const { progressApi } = await import('../../services/api');
          const { PIP_EFFECTS } = await import('../../../game/data/pipEffects');
          const pipEffect = PIP_EFFECTS.find(e => e.type === effect);
          if (pipEffect) {
            await progressApi.unlockItem('pip_effect', pipEffect.id);
            window.dispatchEvent(new CustomEvent('unlock:refresh'));
          }
        } catch (error) {
          console.debug('Failed to unlock pip effect:', error);
        }
      })();
      
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


  // Reset dice set to default
  const handleReset = () => {
    const defaultDice = createDefaultDice();
    const defaultOriginalSideValues: Record<string, number[]> = {};
    defaultDice.forEach(die => {
      defaultOriginalSideValues[die.id] = [...die.allowedValues];
    });
    
    setDiceSet(defaultDice);
    setCreditTransactions([]);
    setOriginalSideValues(defaultOriginalSideValues);
    setSelectedDieIndex(null);
    setSelectedSideForPipEffect(null);
    setBaseLevelRerolls(BASIC_DICE_SET.baseLevelRerolls);
    setBaseLevelBanks(BASIC_DICE_SET.baseLevelBanks);
    setCharmSlots(BASIC_DICE_SET.charmSlots);
    setConsumableSlots(BASIC_DICE_SET.consumableSlots);
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

  // Use refs to store latest values to avoid dependency issues
  const onCompleteRef = useRef(onComplete);
  const onStartGameReadyRef = useRef(onStartGameReady);
  const diceSetRef = useRef(diceSet);
  const creditsRemainingRef = useRef(creditsRemaining);
  const baseLevelRerollsRef = useRef(baseLevelRerolls);
  const baseLevelBanksRef = useRef(baseLevelBanks);
  const charmSlotsRef = useRef(charmSlots);
  const consumableSlotsRef = useRef(consumableSlots);
  const isLockedRef = useRef(isLocked);

  // Update refs when values change
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onStartGameReadyRef.current = onStartGameReady;
    diceSetRef.current = diceSet;
    creditsRemainingRef.current = creditsRemaining;
    baseLevelRerollsRef.current = baseLevelRerolls;
    baseLevelBanksRef.current = baseLevelBanks;
    charmSlotsRef.current = charmSlots;
    consumableSlotsRef.current = consumableSlots;
    isLockedRef.current = isLocked;
  }, [onComplete, onStartGameReady, diceSet, creditsRemaining, baseLevelRerolls, baseLevelBanks, charmSlots, consumableSlots, isLocked]);

  // Expose startGame function to parent via callback - stable reference
  const startGame = React.useCallback(() => {
    if (!isLockedRef.current) {
      onCompleteRef.current(
        diceSetRef.current, 
        creditsRemainingRef.current, 
        {
          baseLevelRerolls: baseLevelRerollsRef.current,
          baseLevelBanks: baseLevelBanksRef.current,
          charmSlots: charmSlotsRef.current,
          consumableSlots: consumableSlotsRef.current
        }
      );
    }
  }, []); // Empty deps - uses refs instead

  // Notify parent when startGame is ready - only on mount and when isLocked changes
  const prevIsLockedRef = useRef<boolean | null>(null);
  useEffect(() => {
    // Only notify if isLocked actually changed or this is the first render
    if (onStartGameReadyRef.current && prevIsLockedRef.current !== isLocked) {
      onStartGameReadyRef.current(startGame, isLocked);
      prevIsLockedRef.current = isLocked;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocked]); // Only depend on isLocked - startGame is stable 

  // Notify parent when dice set changes (for Debug mode to update config)
  const onDiceSetChangeRef = useRef(onDiceSetChange);
  useEffect(() => {
    onDiceSetChangeRef.current = onDiceSetChange;
  }, [onDiceSetChange]);

  // Call onDiceSetChange whenever relevant values change
  useEffect(() => {
    if (onDiceSetChangeRef.current) {
      onDiceSetChangeRef.current(
        diceSetRef.current,
        creditsRemainingRef.current,
        {
          baseLevelRerolls: baseLevelRerollsRef.current,
          baseLevelBanks: baseLevelBanksRef.current,
          charmSlots: charmSlotsRef.current,
          consumableSlots: consumableSlotsRef.current
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diceSet, creditsRemaining, baseLevelRerolls, baseLevelBanks, charmSlots, consumableSlots]);

  // If difficulty is locked, hide the entire customization UI 
  if (isLocked) {
    return null;
  }

  return (
    <div style={{
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '12px',
      border: '2px solid #dee2e6',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      maxWidth: '900px',
      margin: '0 auto'
    }}>

      <DiceSetDisplay
        diceSet={diceSet}
        rotatingValues={rotatingValues}
        selectedDieIndex={selectedDieIndex}
        onDieSelect={(index) => setSelectedDieIndex(selectedDieIndex === index ? null : index)}
        onAddDie={handleAddDie}
        canAddDie={creditsRemaining >= getAddDieCost(diceSet.length)}
        addDieCost={getAddDieCost(diceSet.length)}
        creditTransactions={creditTransactions}
        creditsRemaining={creditsRemaining}
        originalSideValues={originalSideValues}
      />

      {/* Selected Die Detail View */}
      {selectedDie && selectedDieIndex !== null && (
        <div style={{
          marginTop: '12px',
          paddingTop: '12px'
        }}>
          <div style={{
            display: 'grid',
          gridTemplateColumns: '3fr 2fr',
            gap: '16px',
            alignItems: 'flex-start'
          }}>
            {/* Left column: Dice sides and pip effects */}
            <div>
              <SideValueEditor
                die={selectedDie}
                dieIndex={selectedDieIndex}
                originalSideValues={originalSideValues}
                onValueChange={handleChangeSideValue}
                onPipEffectClick={(dieIndex, sideValue) => setSelectedSideForPipEffect({ dieIndex, sideValue })}
                onRemovePipEffect={(dieIndex, sideValue) => handlePipEffectChange(dieIndex, sideValue, 'none')}
                creditsRemaining={creditsRemaining}
                costPerChange={COST_CHANGE_SIDE_VALUE}
              />
            </div>

            {/* Right column: Material selection */}
            <div>
              <MaterialSelector
                selectedMaterial={selectedDie.material}
                onMaterialChange={(material) => handleChangeMaterial(selectedDieIndex, material)}
                materialCost={(material) => getMaterialCost(material, diceSet)}
                creditsRemaining={creditsRemaining}
              />
            </div>
          </div>

          {selectedSideForPipEffect && selectedSideForPipEffect.dieIndex === selectedDieIndex && (
            <PipEffectSelector
              selectedSideValue={selectedSideForPipEffect.sideValue}
              onSelect={(effect) => {
                handlePipEffectChange(selectedSideForPipEffect.dieIndex, selectedSideForPipEffect.sideValue, effect);
                setSelectedSideForPipEffect(null);
              }}
              onCancel={() => setSelectedSideForPipEffect(null)}
              creditsRemaining={creditsRemaining}
              cost={COST_ADD_PIP_EFFECT}
            />
          )}
        </div>
      )}

      <div style={{ marginBottom: '12px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px',
          alignItems: 'center'
        }}>
          <ConfigOptions
            options={[
            {
              label: 'Rerolls',
              value: baseLevelRerolls,
            onIncrement: () => {
              if (creditsRemaining >= COST_ADD_BASE_REROLL) {
                setBaseLevelRerolls(baseLevelRerolls + 1);
                addTransaction({ type: 'addBaseReroll', cost: COST_ADD_BASE_REROLL });
              }
            },
            onDecrement: () => {
              if (baseLevelRerolls > baseRerolls) {
                setBaseLevelRerolls(baseLevelRerolls - 1);
                addTransaction({ type: 'addBaseReroll', cost: -COST_ADD_BASE_REROLL });
              }
            },
            canIncrement: creditsRemaining >= COST_ADD_BASE_REROLL,
            canDecrement: baseLevelRerolls > baseRerolls,
            cost: COST_ADD_BASE_REROLL
          },
          {
            label: 'Banks',
            value: baseLevelBanks,
            onIncrement: () => {
              if (creditsRemaining >= COST_ADD_BASE_BANK) {
                setBaseLevelBanks(baseLevelBanks + 1);
                addTransaction({ type: 'addBaseBank', cost: COST_ADD_BASE_BANK });
              }
            },
            onDecrement: () => {
              if (baseLevelBanks > baseBanks) {
                setBaseLevelBanks(baseLevelBanks - 1);
                addTransaction({ type: 'addBaseBank', cost: -COST_ADD_BASE_BANK });
              }
            },
            canIncrement: creditsRemaining >= COST_ADD_BASE_BANK,
            canDecrement: baseLevelBanks > baseBanks,
            cost: COST_ADD_BASE_BANK
          },
          {
            label: 'Charm Slots',
            value: charmSlots,
            onIncrement: () => {
              if (creditsRemaining >= COST_ADD_CHARM_SLOT) {
                setCharmSlots(charmSlots + 1);
                addTransaction({ type: 'addCharmSlot', cost: COST_ADD_CHARM_SLOT });
              }
            },
            onDecrement: () => {
              if (charmSlots > baseCharmSlots) {
                setCharmSlots(charmSlots - 1);
                addTransaction({ type: 'addCharmSlot', cost: -COST_ADD_CHARM_SLOT });
              }
            },
            canIncrement: creditsRemaining >= COST_ADD_CHARM_SLOT,
            canDecrement: charmSlots > baseCharmSlots,
            cost: COST_ADD_CHARM_SLOT,
            minValue: 1
          },
          {
            label: 'Consumable Slots',
            value: consumableSlots,
            onIncrement: () => {
              if (creditsRemaining >= COST_ADD_CONSUMABLE_SLOT) {
                setConsumableSlots(consumableSlots + 1);
                addTransaction({ type: 'addConsumableSlot', cost: COST_ADD_CONSUMABLE_SLOT });
              }
            },
            onDecrement: () => {
              if (consumableSlots > baseConsumableSlots) {
                setConsumableSlots(consumableSlots - 1);
                addTransaction({ type: 'addConsumableSlot', cost: -COST_ADD_CONSUMABLE_SLOT });
              }
            },
            canIncrement: creditsRemaining >= COST_ADD_CONSUMABLE_SLOT,
            canDecrement: consumableSlots > baseConsumableSlots,
            cost: COST_ADD_CONSUMABLE_SLOT,
            minValue: 1
          },
          {
            label: 'Start with',
            value: creditsRemaining,
            displayOnly: true,
            displayValue: <span style={{ fontSize: '18px', color: '#28a745' }}>${creditsRemaining}</span>
          }
        ]}
        creditsRemaining={creditsRemaining}
      />
        </div>
      </div>

      {/* Reset / Randomize row and compact credits bar */}
      <div style={{
        display: 'flex',
      justifyContent: 'space-between',
        gap: '12px',
      alignItems: 'center',
      marginTop: '12px'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <ActionButton
          onClick={handleReset}
          variant="secondary"
          size="medium"
        >
          Reset
        </ActionButton>
        <ActionButton
          onClick={handleRandomize}
          variant="secondary"
          size="medium"
        >
          Randomize
        </ActionButton>
        </div>
        <div style={{ flexShrink: 0 }}>
          <CreditsBar
            creditsRemaining={creditsRemaining}
            startingCredits={startingCredits}
            creditsUsed={creditsUsed}
            compact
          />
        </div>
      </div>
    </div>
  );
};

