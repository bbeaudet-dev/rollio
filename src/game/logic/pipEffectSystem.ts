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
      // Create consumable pip effect: creates a random consumable, no score change
      // TODO: Implement consumable creation logic
      // For now, just mark that a consumable should be created
      result.sideEffects = {
        ...result.sideEffects,
        consumableCreated: true,
      };
      break;

    case 'upgradeHand':
      // Upgrade hand pip effect: upgrades combination point values
      // This is handled during combination finding/upgrading, not here
      // But we mark it for tracking
      result.sideEffects = {
        ...result.sideEffects,
        combinationUpgraded: true,
      };
      break;

    case 'blank':
      // Blank pip effect: ^1.1 exponent (or ^1.25 if BlankSlate charm is active)
      let blankExponent = 1.1;
      if (context.charmManager) {
        const activeCharms = context.charmManager.getActiveCharms?.() || [];
        const hasBlankSlate = activeCharms.some((c: any) => c.id === 'blankSlate');
        if (hasBlankSlate) {
          blankExponent = 1.25;
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

  // Apply pip effects in order (left to right of selected dice)
  for (let i = 0; i < selectedIndices.length; i++) {
    const dieIndex = selectedIndices[i];
    const die = diceHand[dieIndex];
    
    if (!die) continue;

    // Check for per-die charm triggers BEFORE applying pip effect
    const activeCharms = charmManager.getActiveCharms();
    for (const charm of activeCharms) {
      if (charm.onDieScored && charm.canUse()) {
        const dieContext = {
          gameState,
          roundState,
          scoringElements: values,
          die,
          dieIndex: i,
          sideValue: die.rolledValue || 0,
          selectedIndices,
        };
        
        const charmResult = charm.onDieScored(dieContext);
        
        if (charmResult !== null && charmResult !== undefined) {
          // Apply charm modification
          const mod = charmResult as any;
          if (mod.basePointsDelta !== undefined) {
            values.basePoints += mod.basePointsDelta;
          }
          if (mod.multiplierAdd !== undefined) {
            values.multiplier += mod.multiplierAdd;
          }
          if (mod.multiplierMultiply !== undefined) {
            values.multiplier *= mod.multiplierMultiply;
          }
          if (mod.exponentAdd !== undefined) {
            values.exponent += mod.exponentAdd;
          }
          if (mod.exponentMultiply !== undefined) {
            values.exponent *= mod.exponentMultiply;
          }
          
          // Track in breakdown if builder provided
          if (breakdownBuilder) {
            breakdownBuilder.addStep(
              `charm_perDie_${charm.id}_die${i + 1}`,
              values,
              `Charm ${charm.name} triggered on die ${i + 1} (value ${die.rolledValue})`
            );
          }
        }
      }
    }

    const pipEffectType = getPipEffectForDie(die);
    
    // Skip two-faced and wild as they're handled during combination finding
    if (pipEffectType === 'twoFaced' || pipEffectType === 'wild') {
      continue;
    }

    const context: PipEffectContext = {
      die,
      dieIndex: i,
      sideValue: die.rolledValue || 0,
      gameState,
      roundState,
      charmManager,
    };

    const beforePipEffect = { ...values };
    const result = applyPipEffect(pipEffectType, values, context);
    values = result.scoringElements;
    
    // Track each pip effect individually in breakdown if builder provided
    if (breakdownBuilder && JSON.stringify(beforePipEffect) !== JSON.stringify(values)) {
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

  return {
    scoringElements: values,
    sideEffects: allSideEffects,
  };
}

