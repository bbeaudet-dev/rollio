/**
 * Pip Effect System
 * 
 * Handles application of pip effects during scoring.
 * Pip effects are applied per die side in the order dice are selected.
 */

import { PipEffectType } from '../data/pipEffects';
import { ScoringElements, addExponent, addBasePoints } from './scoringElements';
import { Die, GameState, RoundState } from '../types';
import { CharmManager } from './charmSystem';
import { CONSUMABLES } from '../data/consumables';

export interface PipEffectContext {
  die: Die;
  dieIndex: number; // Index in selectedIndices
  sideValue: number; // The rolled value (which side is face up)
  gameState: GameState;
  roundState: RoundState;
  charmManager: CharmManager;
}

export interface PipEffectResult {
  scoringElements: ScoringElements;
  sideEffects?: {
    money?: number;
    consumableCreated?: boolean;
    combinationUpgraded?: boolean;
  };
}

/**
 * Internal helper to apply all per-die charm triggers for a single die.
 * This is used for both normal processing and retrigger sources like Lunar.
 */
function applyPerDieCharmsForDie(
  diceHand: Die[],
  selectedIndices: number[],
  dieSelectionIndex: number,
  currentValues: ScoringElements,
  gameState: GameState,
  roundState: RoundState,
  charmManager: CharmManager,
  breakdownBuilder: any | undefined,
  triggerSource: 'normal' | 'lunar'
): ScoringElements {
  let values = currentValues;

  const dieIndex = selectedIndices[dieSelectionIndex];
  const die = diceHand[dieIndex];
  if (!die) return values;

  const activeCharms = charmManager.getActiveCharms();
  for (const charm of activeCharms) {
    if (charm.onDieScored && charm.canUse()) {
      const dieContext = {
        gameState,
        roundState,
        scoringElements: values,
        die,
        dieIndex: dieSelectionIndex,
        sideValue: die.rolledValue || 0,
        selectedIndices,
        triggerSource,
      };

      const charmResult = charm.onDieScored(dieContext);

      if (charmResult !== null && charmResult !== undefined) {
        const mod = charmResult as any;

        // Points: ADD → MULTIPLY → EXPONENT
        if (mod.basePointsAdd !== undefined) {
          values.basePoints += mod.basePointsAdd;
        }
        if (mod.basePointsMultiply !== undefined) {
          values.basePoints *= mod.basePointsMultiply;
        }
        if (mod.basePointsExponent !== undefined) {
          values.basePoints = Math.pow(values.basePoints, mod.basePointsExponent);
        }

        // Multiplier: ADD → MULTIPLY → EXPONENT
        if (mod.multiplierAdd !== undefined) {
          values.multiplier += mod.multiplierAdd;
        }
        if (mod.multiplierMultiply !== undefined) {
          values.multiplier *= mod.multiplierMultiply;
        }
        if (mod.multiplierExponent !== undefined) {
          values.multiplier = Math.pow(values.multiplier, mod.multiplierExponent);
        }

        // Exponent: ADD → MULTIPLY → EXPONENT
        if (mod.exponentAdd !== undefined) {
          values.exponent += mod.exponentAdd;
        }
        if (mod.exponentMultiply !== undefined) {
          values.exponent *= mod.exponentMultiply;
        }
        if (mod.exponentExponent !== undefined) {
          values.exponent = Math.pow(values.exponent, mod.exponentExponent);
        }

        // Track in breakdown if builder provided
        if (breakdownBuilder) {
          const suffix = triggerSource === 'lunar' ? '_lunar' : '';
          const labelSuffix = triggerSource === 'lunar' ? ' (Lunar retrigger)' : '';
          breakdownBuilder.addStep(
            `charm_perDie_${charm.id}_die${dieSelectionIndex + 1}${suffix}`,
            values,
            `Charm ${charm.name} triggered on die ${dieSelectionIndex + 1} (value ${die.rolledValue})${labelSuffix}`
          );
        }
      }
    }
  }

  return values;
}

/**
 * Apply a pip effect to scoring values
 */
export function applyPipEffect(
  pipEffectType: PipEffectType | 'none',
  currentValues: ScoringElements,
  context: PipEffectContext
): PipEffectResult {
  // If no pip effect, return unchanged
  if (pipEffectType === 'none' || !pipEffectType) {
    return { scoringElements: currentValues };
  }

  const result: PipEffectResult = {
    scoringElements: currentValues,
    sideEffects: {},
  };

  switch (pipEffectType) {
    case 'money':
      // Money pip effect: adds money to gameState, no score change
      const moneyAmount = 1; // Could be configurable per pip effect
      result.sideEffects = {
        ...result.sideEffects,
        money: moneyAmount,
      };
      // Apply money to gameState (mutation, but that's okay for side effects)
      context.gameState.money = (context.gameState.money || 0) + moneyAmount;
      break;

    case 'createConsumable':
      // Create consumable pip effect: 1 in 3 chance to create a random consumable, no score change
      const maxSlots = context.gameState.consumableSlots ?? 2;
      // 1 in 3 chance (33.33%)
      if (Math.random() < 1/3 && context.gameState.consumables.length < maxSlots) {
        const availableConsumables = CONSUMABLES.filter((c: any) => 
          !context.gameState.consumables.some((owned: any) => owned.id === c.id)
        );
        if (availableConsumables.length > 0) {
          const randomIdx = Math.floor(Math.random() * availableConsumables.length);
          const newConsumable = { ...availableConsumables[randomIdx] };
          context.gameState.consumables.push(newConsumable);
          // Dispatch event to unlock the generated consumable
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('itemGenerated', { 
              detail: { type: 'consumable', id: newConsumable.id } 
            }));
          }
        }
      }
      break;

    case 'upgradeCombo':
      // Upgrade hand pip effect: upgrades combination point values
      // This is handled during combination finding/upgrading, not here
      // But we mark it for tracking
      result.sideEffects = {
        ...result.sideEffects,
        combinationUpgraded: true,
      };
      break;

    case 'blank':
      // Blank pip effect: ^1.1 exponent (or ^1.5 if BlankSlate charm is active)
      let blankExponent = 1.1;
      if (context.charmManager) {
        const activeCharms = context.charmManager.getActiveCharms?.() || [];
        const hasBlankSlate = activeCharms.some((c: any) => c.id === 'blankSlate');
        if (hasBlankSlate) {
          blankExponent = 1.5;
        }
      }
      result.scoringElements = addExponent(currentValues, blankExponent);
      break;

    case 'twoFaced':
      // Two-faced pip effect: handled during combination finding (special case)
      // No scoring modification here
      break;

    case 'wild':
      // Wild pip effect: handled during combination finding (special case)
      // No scoring modification here
      break;

    default:
      // Unknown pip effect type, return unchanged
      break;
  }

  return result;
}

/**
 * Get pip effect for a die's rolled side
 */
export function getPipEffectForDie(die: Die): PipEffectType | 'none' {
  if (!die.pipEffects || !die.rolledValue) {
    return 'none';
  }
  return die.pipEffects[die.rolledValue] || 'none';
}

/**
 * Expand dice values based on pip effects for combination finding
 * 
 * Two-faced: Duplicates the value (a 1 becomes two 1s)
 * Wild: Can be any value (returns all possible values the die could be)
 * 
 * Returns an array of expanded value arrays, where each array represents
 * one possible way the dice could be interpreted for combination finding.
 * For non-wild dice, returns a single array. For wild dice, returns multiple arrays.
 */
export function expandDiceValuesForCombinations(
  diceHand: Die[],
  selectedIndices: number[]
): number[][] {
  // First, check if we have any wild dice
  const hasWild = selectedIndices.some(idx => {
    const die = diceHand[idx];
    if (!die || !die.rolledValue) return false;
    const pipEffect = getPipEffectForDie(die);
    return pipEffect === 'wild';
  });

  // If no wild dice, we can do a simple expansion
  if (!hasWild) {
    const expandedValues: number[] = [];
    for (const idx of selectedIndices) {
      const die = diceHand[idx];
      if (!die || die.rolledValue === undefined) continue;
      
      const pipEffect = getPipEffectForDie(die);
      if (pipEffect === 'twoFaced') {
        // Two-faced: duplicate the value
        expandedValues.push(die.rolledValue);
        expandedValues.push(die.rolledValue);
      } else {
        // Normal or other pip effects: just add the value once
        expandedValues.push(die.rolledValue);
      }
    }
    return [expandedValues];
  }

  // If we have wild dice, we need to generate all possible combinations
  // This is more complex - for now, we'll generate combinations for common values (1-6)
  // In practice, wild dice should be able to be any value in the die's allowedValues
  const possibleValues = [1, 2, 3, 4, 5, 6]; // Default range, could be expanded based on die.allowedValues
  
  const wildIndices: number[] = [];
  const nonWildValues: number[] = [];
  
  // Separate wild and non-wild dice
  for (let i = 0; i < selectedIndices.length; i++) {
    const idx = selectedIndices[i];
    const die = diceHand[idx];
    if (!die || die.rolledValue === undefined) continue;
    
    const pipEffect = getPipEffectForDie(die);
    if (pipEffect === 'wild') {
      wildIndices.push(i);
    } else if (pipEffect === 'twoFaced') {
      nonWildValues.push(die.rolledValue);
      nonWildValues.push(die.rolledValue);
    } else {
      nonWildValues.push(die.rolledValue);
    }
  }

  // If no wild dice after all, return simple expansion
  if (wildIndices.length === 0) {
    return [nonWildValues];
  }

  // Generate all possible combinations for wild dice
  // For each wild die, try each possible value
  const results: number[][] = [];
  
  function generateWildCombinations(wildIndex: number, currentValues: number[]): void {
    if (wildIndex >= wildIndices.length) {
      // All wild dice have been assigned values
      results.push([...nonWildValues, ...currentValues]);
      return;
    }
    
    // Try each possible value for this wild die
    for (const value of possibleValues) {
      generateWildCombinations(wildIndex + 1, [...currentValues, value]);
    }
  }
  
  generateWildCombinations(0, []);
  
  return results;
}

/**
 * Apply all pip effects for selected dice in order
 * Also checks for per-die charm triggers before each pip effect
 */
export function applyAllPipEffects(
  diceHand: Die[],
  selectedIndices: number[],
  currentValues: ScoringElements,
  gameState: GameState,
  roundState: RoundState,
  charmManager: CharmManager,
  breakdownBuilder?: any // Optional breakdown builder to track per-die charm triggers
): { scoringElements: ScoringElements; sideEffects: any[] } {
  let values = currentValues;
  const allSideEffects: any[] = [];

  // Check if Howl at the Moon charm is active (adds extra Lunar retriggers)
  const howlAtTheMoonActive = (gameState.charms || []).some((c: any) => c.id === 'howlAtTheMoon');
  const extraLunarPassesFromHowl = howlAtTheMoonActive ? 2 : 0;

  // Track how many times Lunar retriggers actually fired this scoring (for Lunar multiplier charm)
  let lunarTriggerCount = 0;

  // Apply pip effects in order (left to right of selected dice)
  for (let i = 0; i < selectedIndices.length; i++) {
    const dieIndex = selectedIndices[i];
    const die = diceHand[dieIndex];
    
    if (!die) continue;

    // First, run per-die charm triggers for this die (normal pass)
    values = applyPerDieCharmsForDie(
      diceHand,
      selectedIndices,
      i,
      values,
      gameState,
      roundState,
      charmManager,
      breakdownBuilder,
      'normal'
    );

    const pipEffectType = getPipEffectForDie(die);

    // Prepare common context for pip effects
    const context: PipEffectContext = {
      die,
      dieIndex: i,
      sideValue: die.rolledValue || 0,
      gameState,
      roundState,
      charmManager,
    };

    // For non-twoFaced / non-wild, apply the base pip effect once (normal pass)
    if (pipEffectType !== 'twoFaced' && pipEffectType !== 'wild') {
      const beforePipEffect = { ...values };
      const result = applyPipEffect(pipEffectType, values, context);
      values = result.scoringElements;
      
      const changed = JSON.stringify(beforePipEffect) !== JSON.stringify(values);
      const hasSideEffects = !!(result.sideEffects && Object.keys(result.sideEffects).length > 0);

      // Track each pip effect individually in breakdown if builder provided.
      if (
        breakdownBuilder &&
        (changed ||
          pipEffectType === 'money' ||
          pipEffectType === 'createConsumable' ||
          pipEffectType === 'upgradeCombo' ||
          hasSideEffects)
      ) {
        breakdownBuilder.addStep(
          `pipEffect_${pipEffectType}_die${i + 1}`,
          values,
          `Pip effect ${pipEffectType} on die ${i + 1} (value ${die.rolledValue})`
        );
      }
      
      if (result.sideEffects) {
        allSideEffects.push({
          dieIndex,
          pipEffect: pipEffectType,
          ...result.sideEffects,
        });
      }
    }

    // Handle Lunar retriggers (material + Howl At The Moon charm)
    if (die.material === 'lunar') {
      // One Lunar pass from the material itself + extra passes from Howl At The Moon
      const totalLunarPasses = 1 + extraLunarPassesFromHowl;

      for (let pass = 0; pass < totalLunarPasses; pass++) {
        // Retrigger per-die charms for this die
        values = applyPerDieCharmsForDie(
          diceHand,
          selectedIndices,
          i,
          values,
          gameState,
          roundState,
          charmManager,
          breakdownBuilder,
          'lunar'
        );

        // Retrigger pip effect for scoring-time pip effects
        if (pipEffectType !== 'twoFaced' && pipEffectType !== 'wild') {
          const beforeLunarPip = { ...values };
          const lunarResult = applyPipEffect(pipEffectType, values, context);
          values = lunarResult.scoringElements;

          const changed = JSON.stringify(beforeLunarPip) !== JSON.stringify(values);
          const hasSideEffects = !!(lunarResult.sideEffects && Object.keys(lunarResult.sideEffects).length > 0);

          if (
            breakdownBuilder &&
            (changed ||
              pipEffectType === 'money' ||
              pipEffectType === 'createConsumable' ||
              pipEffectType === 'upgradeCombo' ||
              hasSideEffects)
          ) {
            breakdownBuilder.addStep(
              `pipEffect_${pipEffectType}_die${i + 1}_lunar_pass${pass + 1}`,
              values,
              `Pip effect ${pipEffectType} on die ${i + 1} (value ${die.rolledValue}) (Lunar retrigger #${pass + 1})`
            );
          }

          if (lunarResult.sideEffects) {
            allSideEffects.push({
              dieIndex,
              pipEffect: pipEffectType,
              retriggerSource: 'lunar',
              pass: pass + 1,
              ...lunarResult.sideEffects,
            });
          }
        }

        // Count each Lunar retrigger pass (for Lunar multiplier charm)
        lunarTriggerCount++;
      }
    } else if (pipEffectType === 'twoFaced' || pipEffectType === 'wild') {
      // For non-Lunar dice with twoFaced/wild, we skip scoring-time pip work entirely
      continue;
    }
  }

  // Persist total Lunar trigger count for this scoring into gameState history
  if (!gameState.history.charmState) {
    gameState.history.charmState = {};
  }
  if (!gameState.history.charmState.lunar) {
    gameState.history.charmState.lunar = {};
  }
  gameState.history.charmState.lunar.triggersThisScore = lunarTriggerCount;

  return {
    scoringElements: values,
    sideEffects: allSideEffects,
  };
}

