import { Die } from '../types';
import { debugAction, debugVerbose } from '../utils/debug';

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
  baseScore: number,
  gameState: any,
  roundState: any,
  charmManager?: any
) => { score: number };

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
   * Effect: 2x per crystal die held in hand.
   */
  crystal: (diceHand, selectedIndices, baseScore, gameState, roundState) => {
    let score = baseScore;
    const selectedDice = selectedIndices.map(i => diceHand[i]);
    const crystalCount = selectedDice.filter(die => die.material === 'crystal').length;
    
    // Count crystals held in hand (not selected/scored)
    const allCrystalDice = diceHand.filter(die => die.material === 'crystal');
    const heldCrystalCount = allCrystalDice.length - crystalCount; // Total crystals minus ones being scored
    
    if (crystalCount > 0 && heldCrystalCount > 0) {
      const multiplier = 1 + 1.0 * heldCrystalCount; // 2x per crystal held
      score *= multiplier;
    }
    score = Math.ceil(score);
    return { score };
  },
  /*
   * Flower Material Effect
   * ---------------------
   * Multiplier based on flowers scored previously in the round.
   * Effect: 1.20x for each flower played previously in the round.
   */
  flower: (diceHand, selectedIndices, baseScore, gameState, roundState) => {
    let score = baseScore;
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
      const multiplier = 1 + 0.20 * prevFlowerCount; // 1.20x per flower previously scored
      score *= multiplier;
    }
    return { score };
  },
  /*
   * Golden Material Effect
   * ---------------------
   * Provides money bonus when scored.
   * Effect: +$5 per golden die scored.
   */
  golden: (diceHand, selectedIndices, baseScore, gameState, roundState) => {
    let score = baseScore;
    const selectedDice = selectedIndices.map(i => diceHand[i]);
    const goldenCount = selectedDice.filter(die => die.material === 'golden').length;
    if (goldenCount > 0 && gameState) {
      gameState.money = (gameState.money || 0) + 5 * goldenCount;
    }
    return { score };
  },
  /*
   * Volcano Material Effect
   * ----------------------
   * Bonus based on hot dice counter.
   * Effect: +100 points per volcano die × hot dice counter.
   */
  volcano: (diceHand, selectedIndices, baseScore, gameState, roundState) => {
    let score = baseScore;
    const selectedDice = selectedIndices.map(i => diceHand[i]);
    const volcanoCount = selectedDice.filter(die => die.material === 'volcano').length;
    if (volcanoCount > 0 && roundState) {
      const hotDiceCounter = roundState.hotDiceCounter || 0;
      score += 100 * volcanoCount * hotDiceCounter;
    }
    return { score };
  },
  /*
   * Rainbow Material Effect
   * ----------------------
   * Lucky die with chance-based effects.
   * Effects: 20% chance for +200 points, 10% chance for +$10, 1% chance to clone itself.
   * Affected by Weighted Dice charm (doubles probabilities).
   * Triggers Rabbit's Foot charm on successful effects.
   */
  rainbow: (diceHand, selectedIndices, baseScore, gameState, roundState, charmManager) => {
    let score = baseScore;
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
        score += 200;
        // Notify Rabbit's Foot charm if active
        if (charmManager && typeof charmManager.getCharm === 'function') {
          const rabbitsFoot = charmManager.getCharm('rabbitsFoot');
          if (rabbitsFoot && typeof rabbitsFoot.incrementRainbowTrigger === 'function') {
            rabbitsFoot.incrementRainbowTrigger();
          }
        }
      }
      if (Math.random() < moneyProb) {
        if (gameState) gameState.money = (gameState.money || 0) + 10;
        // Notify Rabbit's Foot charm if active
        if (charmManager && typeof charmManager.getCharm === 'function') {
          const rabbitsFoot = charmManager.getCharm('rabbitsFoot');
          if (rabbitsFoot && typeof rabbitsFoot.incrementRainbowTrigger === 'function') {
            rabbitsFoot.incrementRainbowTrigger();
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
    return { score };
  },
  /*
   * Mirror Material Effect
   * ---------------------
   * Wild card die for combination checking.
   * Effect: Hardcoded as 3s for combination purposes.
   * Note: Actual combination logic is handled in scoring system.
   */
  mirror: (diceHand, selectedIndices, baseScore, gameState, roundState, charmManager) => {
    let score = baseScore;
    return { score };
  },
  /*
   * Ghost Material Effect
   * ---------------------
   * Ghost dice don't need to be scored to trigger hot dice.
   * Effect: No scoring bonus, but special hot dice logic (handled in scoring system).
   */
  ghost: (diceHand, selectedIndices, baseScore, gameState, roundState) => {
    let score = baseScore;
    return { score };
  },
  /*
   * Lead Material Effect
   * --------------------
   * Heavy die that stays in hand after scoring.
   * Effect: No scoring bonus, but special removal logic (handled in scoring system).
   */
  lead: (diceHand, selectedIndices, baseScore, gameState, roundState) => {
    let score = baseScore;
    return { score };
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
 * 2. Only ghost dice remain (ghost dice special effect)
 */
export function shouldTriggerHotDice(remainingDice: Die[]): boolean {
  if (remainingDice.length === 0) {
    return true; // Normal hot dice
  }
  
  // Ghost dice special effect: hot dice if only ghost dice remain
  const allGhost = remainingDice.every(die => die.material === 'ghost');
  return allGhost;
}

/**
 * Filters dice indices to remove, accounting for special material effects
 * Lead dice are not removed (they stay in hand after scoring)
 */
export function getDiceIndicesToRemove(diceHand: Die[], selectedIndices: number[]): number[] {
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
 */
export function applyMaterialEffects(
  diceHand: Die[],
  selectedIndices: number[],
  baseScore: number,
  gameState: any,
  roundState: any,
  charmManager?: any
): { score: number } {
  let score = baseScore;
  
  // Group selected dice by material
  const selectedDice = selectedIndices.map(i => diceHand[i]);
  const materialGroups: Record<string, number[]> = {};
  selectedDice.forEach((die, idx) => {
    if (!materialGroups[die.material]) materialGroups[die.material] = [];
    materialGroups[die.material].push(idx);
  });
  
  // Apply each material effect
  for (const material in materialGroups) {
    if (materialEffects[material]) {
      const { score: newScore } = materialEffects[material](
        diceHand, selectedIndices, score, gameState, roundState, charmManager
      );
      score = newScore;
    }
  }
  
  return { score };
} 