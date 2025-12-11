import { Die } from '../types';
import { debugAction, debugVerbose } from '../utils/debug';
import { ScoringElements, addMultiplier, multiplyMultiplier, addBasePoints } from './scoringElements';

/*
 * =============================
 * Material System
 * =============================
 * Handles all dice material effects during scoring.
 * Each material type provides unique bonuses and effects.
 */

// Material effect function type
export type MaterialEffectFn = (
  diceHand: Die[],
  selectedIndices: number[],
  scoringElements: ScoringElements,
  gameState: any,
  roundState: any,
  charmManager?: any,
  currentDieIndex?: number // Index in selectedIndices array for per-die processing
) => ScoringElements;

/*
 * =============================
 * Material Effects Registry
 * =============================
 * Registry of material effect functions by material id.
 * Each function applies the specific material's effect to scoring.
 */
export const materialEffects: Record<string, MaterialEffectFn> = {
  /*
   * Crystal Material Effect
   * ----------------------
   * Multiplier based on crystals held in hand (not scored).
   * Effect: Multiply multiplier by 1.5x for each crystal die held in hand.
   */
  crystal: (diceHand, selectedIndices, scoringElements, gameState, roundState, charmManager, currentDieIndex) => {
    // Crystal effect: Multiply by 1.5x for EACH crystal NOT scored (held in hand)
    // Similar to ghost dice - we don't care if crystal dice are scored, only if they're held
    // This effect applies based on held crystals, regardless of what's being scored
    // currentDieIndex === -1 means this is being called as a global effect (not per-die)
    
    // Count how many crystals are held (not being scored)
    // Crystals "held" = total crystals in hand - crystals being scored
    const allCrystalDice = diceHand.filter(die => die.material === 'crystal');
    const crystalsBeingScored = selectedIndices.filter(idx => diceHand[idx].material === 'crystal').length;
    const heldCrystalCount = allCrystalDice.length - crystalsBeingScored;
    
    // Apply effect: multiply by 1.5x for each crystal held
    if (heldCrystalCount > 0) {
      let values = scoringElements;
      for (let i = 0; i < heldCrystalCount; i++) {
        values = multiplyMultiplier(values, 1.5);
      }
      return values;
    }
    return scoringElements;
  },
  /*
   * Flower Material Effect
   * ---------------------
   * Multiplier based on flowers scored previously in the round.
   * Effect: +0.20x multiplier for each flower played previously in the round.
   */
  flower: (diceHand, selectedIndices, scoringElements, gameState, roundState) => {
    const selectedDice = selectedIndices.map(i => diceHand[i]);
    const flowerCount = selectedDice.filter(die => die.material === 'flower').length;
    
    // Count flowers scored previously in this round
    let prevFlowerCount = 0;
    if (roundState && roundState.rollHistory) {
      for (const roll of roundState.rollHistory) {
        if (roll.scoringSelection && roll.scoringSelection.length > 0) {
          const scoredDice = roll.scoringSelection.map((idx: number) => roll.diceHand[idx]).filter(Boolean);
          prevFlowerCount += scoredDice.filter((die: any) => die.material === 'flower').length;
        }
      }
    }
    
    if (flowerCount > 0 && prevFlowerCount > 0) {
      // Add to multiplier: +0.20x per flower previously scored
      return addMultiplier(scoringElements, 0.20 * prevFlowerCount);
    }
    return scoringElements;
  },
  /*
   * Golden Material Effect
   * ---------------------
   * Provides money bonus when scored.
   * Effect: +$5 per golden die scored.
   */
  golden: (diceHand, selectedIndices, scoringElements, gameState, roundState) => {
    const selectedDice = selectedIndices.map(i => diceHand[i]);
    const goldenCount = selectedDice.filter(die => die.material === 'golden').length;
    if (goldenCount > 0 && gameState) {
      gameState.money = (gameState.money || 0) + 1 * goldenCount; // $1 per golden die
    }
    // No scoring change, just side effect (money)
    return scoringElements;
  },
  /*
   * Volcano Material Effect
   * ----------------------
   * Bonus based on hot dice counter.
   * Effect: Add +0.5x to multiplier per volcano die × hot dice counter.
   */
  volcano: (diceHand, selectedIndices, scoringElements, gameState, roundState) => {
    const selectedDice = selectedIndices.map(i => diceHand[i]);
    const volcanoCount = selectedDice.filter(die => die.material === 'volcano').length;
    if (volcanoCount > 0 && roundState) {
      const hotDiceCounter = roundState.hotDiceCounter || 0;
      // Add to multiplier: +0.5x per volcano die × hot dice counter
      const multiplierBonus = 0.5 * volcanoCount * hotDiceCounter;
      return addMultiplier(scoringElements, multiplierBonus);
    }
    return scoringElements;
  },
  /*
   * Rainbow Material Effect
   * ----------------------
   * Lucky die with chance-based effects.
   * Effects: 20% chance for +200 base points, 10% chance for +$10, 1% chance to clone itself.
   * Affected by Weighted Dice charm (doubles probabilities).
   * Triggers Rabbit's Foot charm on successful effects.
   */
  rainbow: (diceHand, selectedIndices, scoringElements, gameState, roundState, charmManager) => {
    let values = scoringElements;
    const selectedDice = selectedIndices.map(i => diceHand[i]);
    const rainbowDice = selectedDice.filter(die => (die.material as string) === 'rainbow');
    
    // Check for Weighted Dice charm
    let weighted = false;
    if (charmManager && typeof charmManager.hasCharm === 'function') {
      weighted = charmManager.hasCharm('weightedDice');
    }
    
    for (const die of rainbowDice) {
      // Base probabilities
      let pointProb = 1/5;
      let moneyProb = 1/10;
      let cloneProb = 1/100;
      
      // Apply Weighted Dice effect if active
      if (weighted) {
        pointProb = Math.min(pointProb * 2, 1.0);
        moneyProb = Math.min(moneyProb * 2, 1.0);
        cloneProb = Math.min(cloneProb * 2, 1.0);
      }
      
      if (Math.random() < pointProb) {
        // Add to base points
        values = addBasePoints(values, 200);
        // Notify Rabbit's Foot charm if active
        if (charmManager && typeof charmManager.getCharm === 'function') {
          const rabbitsFoot = charmManager.getCharm('rabbitsFoot');
          if (rabbitsFoot && typeof rabbitsFoot.incrementRainbowTrigger === 'function') {
            rabbitsFoot.incrementRainbowTrigger(gameState);
          }
        }
      }
      if (Math.random() < moneyProb) {
        if (gameState) gameState.money = (gameState.money || 0) + 10;
        // Notify Rabbit's Foot charm if active
        if (charmManager && typeof charmManager.getCharm === 'function') {
          const rabbitsFoot = charmManager.getCharm('rabbitsFoot');
          if (rabbitsFoot && typeof rabbitsFoot.incrementRainbowTrigger === 'function') {
            rabbitsFoot.incrementRainbowTrigger(gameState);
          }
        }
      }
      if (Math.random() < cloneProb) {
        if (gameState && gameState.diceSet) {
          const newDie = { ...die, id: `d${gameState.diceSet.length + 1}` };
          gameState.diceSet.push(newDie);
          // Notify Rabbit's Foot charm if active
          if (charmManager && typeof charmManager.getCharm === 'function') {
            const rabbitsFoot = charmManager.getCharm('rabbitsFoot');
            if (rabbitsFoot && typeof rabbitsFoot.incrementRainbowTrigger === 'function') {
              rabbitsFoot.incrementRainbowTrigger();
            }
          }
        }
      }
    }
    return values;
  },
  /*
   * Mirror Material Effect
   * ---------------------
   * Wild card die for combination checking.
   * Effect: No scoring change, handled during dice rolling.
   * Note: Mirror dice copy values from non-mirror dice during rolling.
   */
  mirror: (diceHand, selectedIndices, scoringElements, gameState, roundState, charmManager) => {
    // No scoring change, handled during dice rolling
    return scoringElements;
  },
  /*
   * Ghost Material Effect
   * ---------------------
   * Ghost dice don't need to be scored to trigger hot dice.
   * Effect: No scoring bonus, but special hot dice logic (handled in scoring system).
   */
  ghost: (diceHand, selectedIndices, scoringElements, gameState, roundState) => {
    // No scoring change, handled in hot dice logic
    return scoringElements;
  },
  /*
   * Lead Material Effect
   * --------------------
   * Heavy die that stays in hand after scoring.
   * Effect: No scoring bonus, but special removal logic (handled in scoring system).
   */
  lead: (diceHand, selectedIndices, scoringElements, gameState, roundState) => {
    // No scoring change, handled in dice removal logic
    return scoringElements;
  },
};

/*
 * =============================
 * Material Special Effects
 * =============================
 * Functions to check for special material behaviors that affect game logic
 * (not scoring bonuses, but things like hot dice triggers, dice removal, etc.)
 */

/**
 * Checks if hot dice should trigger based on remaining dice materials
 * Hot dice triggers if:
 * 1. All dice are removed (normal hot dice), OR
 * 2. Only ghost dice remain (ghost dice special effect), OR
 * 3. All dice were scored, including one or more Lead dice, and SwordInTheStone charm is active
 * 
 * @param remainingDice - Dice remaining in hand after scoring
 * @param charmManager - Charm manager to check for SwordInTheStone charm
 * @param allDiceWereScored - Whether all dice in the original hand were scored (before removal)
 */
export function shouldTriggerHotDice(remainingDice: Die[], charmManager?: any, allDiceWereScored?: boolean): boolean {
  if (remainingDice.length === 0) {
    return true; // Normal hot dice - all dice scored and removed
  }
  
  // Ghost dice special effect: hot dice if only ghost dice remain
  const allGhost = remainingDice.every(die => die.material === 'ghost');
  if (allGhost) {
    return true;
  }
  
  // SwordInTheStone charm special case: hot dice if all dice were scored and one or more is Lead
  if (allDiceWereScored && charmManager) {
    const activeCharms = charmManager.getActiveCharms?.() || [];
    const hasSwordInTheStone = activeCharms.some((c: any) => c.id === 'swordInTheStone');
    
    if (hasSwordInTheStone) {
      const allLead = remainingDice.every(die => die.material === 'lead');
      if (allLead) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Handle mirror dice rolling logic
 * Mirror dice copy a non-mirror die's value, or if all dice are mirror, they all get the same random value
 * This should be called during dice rolling (processRoll) and rerolling (randomizeSelectedDice)
 */
export function handleMirrorDiceRolling(diceHand: Die[]): void {
  const mirrorDiceIndices: number[] = [];
  const nonMirrorDiceIndices: number[] = [];
  
  for (let i = 0; i < diceHand.length; i++) {
    if (diceHand[i].material === 'mirror') {
      mirrorDiceIndices.push(i);
    } else {
      nonMirrorDiceIndices.push(i);
    }
  }
  
  // If no mirror dice, nothing to do
  if (mirrorDiceIndices.length === 0) {
    return;
  }
  
  // First, ensure all non-mirror dice have rolled values
  // (This should already be done, but just in case)
  for (const i of nonMirrorDiceIndices) {
    if (diceHand[i].rolledValue === undefined) {
      diceHand[i].rolledValue = diceHand[i].allowedValues[Math.floor(Math.random() * diceHand[i].allowedValues.length)];
    }
  }
  
  // Then, set mirror dice values
  if (nonMirrorDiceIndices.length > 0) {
    // Copy from a random non-mirror die
    const sourceIndex = nonMirrorDiceIndices[Math.floor(Math.random() * nonMirrorDiceIndices.length)];
    const sourceValue = diceHand[sourceIndex].rolledValue!;
    
    for (const i of mirrorDiceIndices) {
      // Mirror dice should have the same value as the source, but only if it's in their allowedValues
      // Otherwise, pick a random value from their allowedValues
      if (diceHand[i].allowedValues.includes(sourceValue)) {
        diceHand[i].rolledValue = sourceValue;
      } else {
        diceHand[i].rolledValue = diceHand[i].allowedValues[Math.floor(Math.random() * diceHand[i].allowedValues.length)];
      }
    }
  } else {
    // All dice are mirror - they all get the same random value
    // Find the intersection of all allowedValues, or use a common value
    let commonValues: number[] = [];
    if (mirrorDiceIndices.length > 0) {
      // Start with first die's allowedValues
      commonValues = [...diceHand[mirrorDiceIndices[0]].allowedValues];
      // Find intersection with all other mirror dice
      for (let i = 1; i < mirrorDiceIndices.length; i++) {
        const die = diceHand[mirrorDiceIndices[i]];
        commonValues = commonValues.filter(v => die.allowedValues.includes(v));
      }
    }
    
    // If there's a common value, use it; otherwise pick from first die's allowedValues
    const valuesToChooseFrom = commonValues.length > 0 ? commonValues : diceHand[mirrorDiceIndices[0]].allowedValues;
    const chosenValue = valuesToChooseFrom[Math.floor(Math.random() * valuesToChooseFrom.length)];
    
    // Set all mirror dice to the same value
    for (const i of mirrorDiceIndices) {
      if (diceHand[i].allowedValues.includes(chosenValue)) {
        diceHand[i].rolledValue = chosenValue;
      } else {
        // Fallback: pick random from this die's allowedValues
        diceHand[i].rolledValue = diceHand[i].allowedValues[Math.floor(Math.random() * diceHand[i].allowedValues.length)];
      }
    }
  }
}

/**
 * Filters dice indices to remove, accounting for special material effects
 * Lead dice are not removed (they stay in hand after scoring)
 * Iron Fortress charm: If at least 2 lead dice are scored, ALL scored dice stay in hand
 */
export function getDiceIndicesToRemove(
  diceHand: Die[], 
  selectedIndices: number[],
  charmManager?: any
): number[] {
  // Check for Iron Fortress charm
  if (charmManager) {
    const ironFortress = charmManager.getActiveCharms().find((charm: any) => charm.id === 'ironFortress');
    if (ironFortress) {
      // Count lead dice in selected indices
      const leadCount = selectedIndices.filter(i => {
        const die = diceHand[i];
        return die && die.material === 'lead';
      }).length;
      
      // If at least 2 lead dice are scored, keep ALL dice (return empty array)
      if (leadCount >= 2) {
        return [];
      }
    }
  }
  
  // Normal behavior: lead dice stay in hand, others are removed
  return selectedIndices.filter(i => {
    const die = diceHand[i];
    // Lead dice stay in hand
    if (die && die.material === 'lead') {
      return false;
    }
    return true;
  });
}

/*
 * =============================
 * Material Effects Application
 * =============================
 * Main function to apply all material effects to scoring.
 * Groups dice by material and applies each material's effect.
 * Optionally tracks each material in breakdown if breakdownBuilder is provided.
 */
export function applyMaterialEffects(
  diceHand: Die[],
  selectedIndices: number[],
  scoringElements: ScoringElements,
  gameState: any,
  roundState: any,
  charmManager?: any,
  breakdownBuilder?: any // Optional breakdown builder to track each die individually
): ScoringElements {
  let values = scoringElements;
  
  // Special case: Crystal effect applies based on held crystals, regardless of selected or scored dice
  const allCrystalDice = diceHand.filter(die => die.material === 'crystal');
  const crystalsBeingScored = selectedIndices.filter(idx => diceHand[idx].material === 'crystal').length;
  const heldCrystalCount = allCrystalDice.length - crystalsBeingScored;
  
  if (heldCrystalCount > 0 && materialEffects.crystal) {
    const beforeCrystal = { ...values };
    // Apply crystal effect once (pass -1 as currentDieIndex to indicate global effect)
    values = materialEffects.crystal(
      diceHand, selectedIndices, values, gameState, roundState, charmManager, -1
    );
    
    if (breakdownBuilder) {
      const changed = JSON.stringify(beforeCrystal) !== JSON.stringify(values);
      const changeDesc = changed ? ' (modified)' : ` (no effect - ${heldCrystalCount} held, ${crystalsBeingScored} being scored)`;
      breakdownBuilder.addStep(
        `material_crystal_global`,
        values,
        `Crystal material effect (${heldCrystalCount} held in hand)${changeDesc}`
      );
    }
  }
  
  // Apply material effect for each die individually (in order of selection)
  for (let i = 0; i < selectedIndices.length; i++) {
    const dieIndex = selectedIndices[i];
    const die = diceHand[dieIndex];
    
    if (!die) continue;
    
    const material = die.material;
    
    // Skip crystal material - already handled globally above
    if (material === 'crystal') {
      continue;
    }
    
    if (materialEffects[material]) {
      const beforeDie = { ...values };
      
      // Pass currentDieIndex for per-die processing
      values = materialEffects[material](
        diceHand, selectedIndices, values, gameState, roundState, charmManager, i
      );
      
      // Track each die individually in breakdown
      if (breakdownBuilder) {
        const changed = JSON.stringify(beforeDie) !== JSON.stringify(values);
        const changeDesc = changed ? ' (modified)' : ' (no effect)';
        breakdownBuilder.addStep(
          `material_${material}_die${i + 1}`,
          values,
          `Material ${material} on die ${i + 1} (value ${die.rolledValue})${changeDesc}`
        );
      }
    }
  }
  
  return values;
} 