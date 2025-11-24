/**
 * World Effects Module
 * Handles application of world effects to level state
 */

import { World, WorldEffect } from '../data/worlds';
import { LevelState, EffectContext } from '../types';
import { LevelEffect } from '../data/levels';

export interface WorldEffectContext {
  // Rerolls/banks modifiers
  rerollsModifier: number;
  banksModifier: number;
  rerollsMultiplier: number;
  banksMultiplier: number;
  // Combination multipliers
  straightsMultiplier: number;
  pairsMultiplier: number;
  singlesMultiplier: number;
  nOfAKindMultiplier: number;
  pyramidsMultiplier: number;
  // Combination restrictions
  noStraights: boolean;
  noPairs: boolean;
  noSingles: boolean;
  noNOfAKind: boolean;
  noPyramids: boolean;
  // Dice value restrictions
  noOnes: boolean;
  noTwos: boolean;
  noThrees: boolean;
  noFours: boolean;
  noFives: boolean;
  noSixes: boolean;
  noOddValues: boolean;
  noEvenValues: boolean;
  // Money bonuses
  endOfLevelBonusMultiplier: number;
  banksRemainingBonusMultiplier: number;
}

/**
 * Create an empty world effect context
 */
function createEmptyWorldEffectContext(): WorldEffectContext {
  return {
    rerollsModifier: 0,
    banksModifier: 0,
    rerollsMultiplier: 1,
    banksMultiplier: 1,
    straightsMultiplier: 1,
    pairsMultiplier: 1,
    singlesMultiplier: 1,
    nOfAKindMultiplier: 1,
    pyramidsMultiplier: 1,
    noStraights: false,
    noPairs: false,
    noSingles: false,
    noNOfAKind: false,
    noPyramids: false,
    noOnes: false,
    noTwos: false,
    noThrees: false,
    noFours: false,
    noFives: false,
    noSixes: false,
    noOddValues: false,
    noEvenValues: false,
    endOfLevelBonusMultiplier: 1,
    banksRemainingBonusMultiplier: 1,
  };
}

/**
 * Apply world effects to level state
 * Modifies rerolls/banks and stores world effect metadata
 */
export function applyWorldEffects(
  world: World | null,
  baseRerolls: number,
  baseBanks: number
): { rerolls: number; banks: number; context: WorldEffectContext } {
  if (!world || !world.effects || world.effects.length === 0) {
    return {
      rerolls: baseRerolls,
      banks: baseBanks,
      context: createEmptyWorldEffectContext(),
    };
  }

  const context = getWorldEffectContext(world);
  
  // Apply modifiers
  let rerolls = baseRerolls + context.rerollsModifier;
  let banks = baseBanks + context.banksModifier;
  
  // Apply multipliers
  rerolls = Math.floor(rerolls * context.rerollsMultiplier);
  banks = Math.floor(banks * context.banksMultiplier);
  
  // Ensure values don't go below 0
  rerolls = Math.max(0, rerolls);
  banks = Math.max(0, banks);

  return { rerolls, banks, context };
}

/**
 * Get world effect context for combination filtering and scoring
 * Combines all world effects into a single context object
 */
export function getWorldEffectContext(world: World | null): WorldEffectContext {
  const context = createEmptyWorldEffectContext();

  if (!world || !world.effects || world.effects.length === 0) {
    return context;
  }

  // Combine all world effects
  for (const effect of world.effects) {
    // Rerolls/banks modifiers
    if (effect.rerollsModifier !== undefined) {
      context.rerollsModifier += effect.rerollsModifier;
    }
    if (effect.banksModifier !== undefined) {
      context.banksModifier += effect.banksModifier;
    }
    if (effect.rerollsMultiplier !== undefined) {
      context.rerollsMultiplier *= effect.rerollsMultiplier;
    }
    if (effect.banksMultiplier !== undefined) {
      context.banksMultiplier *= effect.banksMultiplier;
    }

    // Combination multipliers
    if (effect.straightsMultiplier !== undefined) {
      context.straightsMultiplier *= effect.straightsMultiplier;
    }
    if (effect.pairsMultiplier !== undefined) {
      context.pairsMultiplier *= effect.pairsMultiplier;
    }
    if (effect.singlesMultiplier !== undefined) {
      context.singlesMultiplier *= effect.singlesMultiplier;
    }
    if (effect.nOfAKindMultiplier !== undefined) {
      context.nOfAKindMultiplier *= effect.nOfAKindMultiplier;
    }
    if (effect.pyramidsMultiplier !== undefined) {
      context.pyramidsMultiplier *= effect.pyramidsMultiplier;
    }

    // Combination restrictions (OR logic - if any effect restricts it, it's restricted)
    if (effect.noStraights) context.noStraights = true;
    if (effect.noPairs) context.noPairs = true;
    if (effect.noSingles) context.noSingles = true;
    if (effect.noNOfAKind) context.noNOfAKind = true;
    if (effect.noPyramids) context.noPyramids = true;

    // Dice value restrictions (OR logic)
    if (effect.noOnes) context.noOnes = true;
    if (effect.noTwos) context.noTwos = true;
    if (effect.noThrees) context.noThrees = true;
    if (effect.noFours) context.noFours = true;
    if (effect.noFives) context.noFives = true;
    if (effect.noSixes) context.noSixes = true;
    if (effect.noOddValues) context.noOddValues = true;
    if (effect.noEvenValues) context.noEvenValues = true;

    // Money bonuses
    if (effect.endOfLevelBonusMultiplier !== undefined) {
      context.endOfLevelBonusMultiplier *= effect.endOfLevelBonusMultiplier;
    }
    if (effect.banksRemainingBonusMultiplier !== undefined) {
      context.banksRemainingBonusMultiplier *= effect.banksRemainingBonusMultiplier;
    }
  }

  return context;
}

/**
 * Get level effect context for combination filtering and scoring
 * Combines all level effects into a level context object
 */
function getLevelEffectContextFromEffects(levelEffects: LevelEffect[]): EffectContext['level'] {
  const context: EffectContext['level'] = {
    // Combination multipliers
    straightsMultiplier: 1,
    pairsMultiplier: 1,
    singlesMultiplier: 1,
    nOfAKindMultiplier: 1,
    pyramidsMultiplier: 1,
    // Combination restrictions
    noStraights: false,
    noPairs: false,
    noSingles: false,
    noNOfAKind: false,
    noPyramids: false,
    // Dice value restrictions
    noOnes: false,
    noTwos: false,
    noThrees: false,
    noFours: false,
    noFives: false,
    noSixes: false,
    noOddValues: false,
    noEvenValues: false,
  };

  if (!levelEffects || levelEffects.length === 0) {
    return context;
  }

  // Combine all level effects
  for (const effect of levelEffects) {
    // Combination multipliers
    if (effect.straightsMultiplier !== undefined) {
      context.straightsMultiplier *= effect.straightsMultiplier;
    }
    if (effect.pairsMultiplier !== undefined) {
      context.pairsMultiplier *= effect.pairsMultiplier;
    }
    if (effect.singlesMultiplier !== undefined) {
      context.singlesMultiplier *= effect.singlesMultiplier;
    }
    if (effect.nOfAKindMultiplier !== undefined) {
      context.nOfAKindMultiplier *= effect.nOfAKindMultiplier;
    }
    if (effect.pyramidsMultiplier !== undefined) {
      context.pyramidsMultiplier *= effect.pyramidsMultiplier;
    }

    // Combination restrictions (OR logic - if any effect restricts it, it's restricted)
    if (effect.noStraights) context.noStraights = true;
    if (effect.noPairs) context.noPairs = true;
    if (effect.noSingles) context.noSingles = true;
    if (effect.noNOfAKind) context.noNOfAKind = true;
    if (effect.noPyramids) context.noPyramids = true;

    // Dice value restrictions (OR logic)
    if (effect.noOnes) context.noOnes = true;
    if (effect.noTwos) context.noTwos = true;
    if (effect.noThrees) context.noThrees = true;
    if (effect.noFours) context.noFours = true;
    if (effect.noFives) context.noFives = true;
    if (effect.noSixes) context.noSixes = true;
    if (effect.noOddValues) context.noOddValues = true;
    if (effect.noEvenValues) context.noEvenValues = true;
  }

  return context;
}

/**
 * Get combined effect context (world + level) for filtering and scoring
 * Combines world effects and level effects into a single EffectContext
 */
export function getLevelEffectContext(world: World | null, levelEffects: LevelEffect[]): EffectContext {
  const worldContext = getWorldEffectContext(world);
  const levelContext = getLevelEffectContextFromEffects(levelEffects);

  return {
    world: worldContext,
    level: levelContext,
  };
}

