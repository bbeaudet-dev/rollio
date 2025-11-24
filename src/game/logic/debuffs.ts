/**
 * Debuff System
 * Handles checking and marking combinations as debuffed based on world/level effects
 * Debuffed combinations can still be played but score 0 points
 */

import { Die, EffectContext } from '../types';
import { ScoringCombination } from '../types';

/**
 * Check if a combination type is allowed based on effect context
 * Returns true if allowed, false if debuffed
 */
export function isCombinationAllowed(combinationType: string, effectContext: EffectContext): boolean {
  const { world, level } = effectContext;
  
  // Check world restrictions
  if (combinationType === 'straightOfN' && (world.noStraights || level.noStraights)) return false;
  if (combinationType === 'nPairs' && (world.noPairs || level.noPairs)) return false;
  if (combinationType === 'singleN' && (world.noSingles || level.noSingles)) return false;
  if (combinationType === 'nOfAKind' && (world.noNOfAKind || level.noNOfAKind)) return false;
  if (combinationType === 'pyramidOfN' && (world.noPyramids || level.noPyramids)) return false;
  
  return true;
}

/**
 * Check if dice values are allowed based on effect context
 * Returns true if all dice values are allowed, false if any are restricted
 */
export function areDiceValuesAllowed(
  diceIndices: number[],
  diceHand: Die[],
  effectContext: EffectContext
): boolean {
  const { world, level } = effectContext;
  
  for (const idx of diceIndices) {
    const die = diceHand[idx];
    if (!die || die.rolledValue === undefined) continue;
    
    const value = die.rolledValue;
    
    // Check value restrictions
    if ((world.noOnes || level.noOnes) && value === 1) return false;
    if ((world.noTwos || level.noTwos) && value === 2) return false;
    if ((world.noThrees || level.noThrees) && value === 3) return false;
    if ((world.noFours || level.noFours) && value === 4) return false;
    if ((world.noFives || level.noFives) && value === 5) return false;
    if ((world.noSixes || level.noSixes) && value === 6) return false;
    if ((world.noOddValues || level.noOddValues) && value % 2 === 1) return false;
    if ((world.noEvenValues || level.noEvenValues) && value % 2 === 0) return false;
  }
  
  return true;
}

/**
 * Get reason for debuff (for display in scoring breakdown)
 * Returns a human-readable string explaining why the combination is debuffed
 */
export function getDebuffReason(
  combinationType: string,
  diceIndices: number[],
  diceHand: Die[],
  effectContext: EffectContext
): string {
  const { world, level } = effectContext;
  const reasons: string[] = [];
  
  // Check combination type restrictions
  if (combinationType === 'straightOfN' && (world.noStraights || level.noStraights)) {
    reasons.push('Straights are debuffed');
  }
  if (combinationType === 'nPairs' && (world.noPairs || level.noPairs)) {
    reasons.push('Pairs are debuffed');
  }
  if (combinationType === 'singleN' && (world.noSingles || level.noSingles)) {
    reasons.push('Singles are debuffed');
  }
  if (combinationType === 'nOfAKind' && (world.noNOfAKind || level.noNOfAKind)) {
    reasons.push('N-of-a-kind is debuffed');
  }
  if (combinationType === 'pyramidOfN' && (world.noPyramids || level.noPyramids)) {
    reasons.push('Pyramids are debuffed');
  }
  
  // Check dice value restrictions (only add unique reasons)
  const valueRestrictions = new Set<string>();
  for (const idx of diceIndices) {
    const die = diceHand[idx];
    if (!die || die.rolledValue === undefined) continue;
    
    const value = die.rolledValue;
    
    if ((world.noOnes || level.noOnes) && value === 1) {
      valueRestrictions.add('Ones are debuffed');
    }
    if ((world.noTwos || level.noTwos) && value === 2) {
      valueRestrictions.add('Twos are debuffed');
    }
    if ((world.noThrees || level.noThrees) && value === 3) {
      valueRestrictions.add('Threes are debuffed');
    }
    if ((world.noFours || level.noFours) && value === 4) {
      valueRestrictions.add('Fours are debuffed');
    }
    if ((world.noFives || level.noFives) && value === 5) {
      valueRestrictions.add('Fives are debuffed');
    }
    if ((world.noSixes || level.noSixes) && value === 6) {
      valueRestrictions.add('Sixes are debuffed');
    }
    if ((world.noOddValues || level.noOddValues) && value % 2 === 1) {
      valueRestrictions.add('Odd values are debuffed');
    }
    if ((world.noEvenValues || level.noEvenValues) && value % 2 === 0) {
      valueRestrictions.add('Even values are debuffed');
    }
  }
  
  reasons.push(...Array.from(valueRestrictions));
  
  return reasons.length > 0 ? reasons.join(', ') : 'Debuffed';
}

/**
 * Mark combinations as debuffed based on effect context
 * Modifies combinations in place to add isDebuffed and debuffReason properties
 */
export function markDebuffedCombinations(
  combinations: ScoringCombination[],
  diceHand: Die[],
  effectContext: EffectContext
): void {
  for (const combo of combinations) {
    const isDebuffed = !isCombinationAllowed(combo.type as any, effectContext) || 
                      !areDiceValuesAllowed(combo.dice, diceHand, effectContext);
    
    if (isDebuffed) {
      (combo as any).isDebuffed = true;
      (combo as any).debuffReason = getDebuffReason(combo.type as any, combo.dice, diceHand, effectContext);
    }
  }
}

