import { Die } from '../core/types';
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
) => { score: number, materialLogs: string[] };

/*
 * =============================
 * Material Effects Registry
 * =============================
 * Registry of material effect functions by material id.
 * Each function applies the specific material's effect to scoring.
 */
const materialEffects: Record<string, MaterialEffectFn> = {
  /*
   * Crystal Material Effect
   * ----------------------
   * Multiplier based on crystals scored this round.
   * Effect: 1.5x per crystal already scored this round.
   */
  crystal: (diceHand, selectedIndices, baseScore, gameState, roundState) => {
    let score = baseScore;
    const materialLogs: string[] = [];
    const selectedDice = selectedIndices.map(i => diceHand[i]);
    const crystalCount = selectedDice.filter(die => die.material === 'crystal').length;
    let prevCrystalCount = 0;
    if (typeof roundState.crystalsScoredThisRound === 'number') {
      prevCrystalCount = roundState.crystalsScoredThisRound;
    }
    if (crystalCount > 0) {
      const multiplier = 1 + 0.5 * prevCrystalCount;
      materialLogs.push(`Crystal: ${crystalCount} scored, ${prevCrystalCount} previously scored this round, multiplier: x${multiplier}`);
      score *= multiplier;
    }
    score = Math.ceil(score);
    return { score, materialLogs };
  },
  /*
   * Wooden Material Effect
   * ---------------------
   * Exponential multiplier based on wooden dice count.
   * Effect: 1.25x per wooden die (exponential).
   */
  wooden: (diceHand, selectedIndices, baseScore, gameState, roundState) => {
    let score = baseScore;
    const materialLogs: string[] = [];
    const selectedDice = selectedIndices.map(i => diceHand[i]);
    const woodenCount = selectedDice.filter(die => die.material === 'wooden').length;
    if (woodenCount > 0) {
      materialLogs.push(`Wooden: ${woodenCount} scored, multiplier: x${Math.pow(1.25, woodenCount).toFixed(2)}`);
      score *= Math.pow(1.25, woodenCount);
    }
    return { score, materialLogs };
  },
  /*
   * Golden Material Effect
   * ---------------------
   * Provides money bonus when scored.
   * Effect: +$5 per golden die scored.
   */
  golden: (diceHand, selectedIndices, baseScore, gameState, roundState) => {
    let score = baseScore;
    const materialLogs: string[] = [];
    const selectedDice = selectedIndices.map(i => diceHand[i]);
    const goldenCount = selectedDice.filter(die => die.material === 'golden').length;
    if (goldenCount > 0 && gameState) {
      materialLogs.push(`Golden: ${goldenCount} scored, +$${5 * goldenCount}`);
      gameState.money = (gameState.money || 0) + 5 * goldenCount;
    }
    return { score, materialLogs };
  },
  /*
   * Volcano Material Effect
   * ----------------------
   * Bonus based on hot dice counter.
   * Effect: +100 points per volcano die × hot dice counter.
   */
  volcano: (diceHand, selectedIndices, baseScore, gameState, roundState) => {
    let score = baseScore;
    const materialLogs: string[] = [];
    const selectedDice = selectedIndices.map(i => diceHand[i]);
    const volcanoCount = selectedDice.filter(die => die.material === 'volcano').length;
    if (volcanoCount > 0 && roundState) {
      const hotDiceCounter = roundState.hotDiceCounter || 0;
      materialLogs.push(`Volcano: ${volcanoCount} scored, hot dice count: ${hotDiceCounter}, bonus: +${100 * volcanoCount * hotDiceCounter}`);
      score += 100 * volcanoCount * hotDiceCounter;
    }
    return { score, materialLogs };
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
    const materialLogs: string[] = [];
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
        materialLogs.push('Rainbow: +200 points!');
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
        materialLogs.push('Rainbow: +$10! New total: $' + gameState.money);
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
          materialLogs.push('Rainbow: Cloned itself! New number of dice: ' + gameState.diceSet.length);
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
    return { score, materialLogs };
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
    const materialLogs: string[] = [];
    const selectedDice = selectedIndices.map(i => diceHand[i]);
    const mirrorDice = selectedDice.filter(die => (die.material as string) === 'mirror');
    
    if (mirrorDice.length > 0) {
      materialLogs.push(`Mirror: ${mirrorDice.length} mirror dice (WIP)`);
    }
    
    return { score, materialLogs };
  },
  // Add more materials as needed
};

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
): { score: number, materialLogs: string[] } {
  debugAction('materialEffects', 'Applying material effects', {
    baseScore,
    selectedDice: selectedIndices.length,
    materials: selectedIndices.map(i => diceHand[i].material)
  });
  
  let score = baseScore;
  let allLogs: string[] = [];
  
  // Group selected dice by material
  const selectedDice = selectedIndices.map(i => diceHand[i]);
  const materialGroups: Record<string, number[]> = {};
  selectedDice.forEach((die, idx) => {
    if (!materialGroups[die.material]) materialGroups[die.material] = [];
    materialGroups[die.material].push(idx);
  });
  
  debugVerbose(`Material groups:`, materialGroups);
  
  // Track if any effect logs were added
  let hadEffect = false;
  
  // Apply each material effect
  for (const material in materialGroups) {
    if (materialEffects[material]) {
      debugVerbose(`Applying ${material} material effect`);
      const { score: newScore, materialLogs } = materialEffects[material](
        diceHand, selectedIndices, score, gameState, roundState, charmManager
      );
      if (materialLogs.length > 0) {
        allLogs.push(...materialLogs);
        hadEffect = true;
        debugAction('materialEffects', `${material} effect activated`, { 
          scoreChange: newScore - score,
          newScore
        });
      }
      score = newScore;
    }
  }
  
  if (!hadEffect) {
    debugVerbose('No material effects applied');
  }
  
  return { score, materialLogs: allLogs };
} 