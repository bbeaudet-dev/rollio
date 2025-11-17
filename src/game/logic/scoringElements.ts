/**
 * Scoring Elements System
 * 
 * Represents the three components of scoring:
 * - basePoints: Base point value from combinations
 * - multiplier: Multiplicative multiplier (starts at 1, can be added to or multiplied)
 * - exponent: Exponential multiplier (starts at 1, can be added to or multiplied)
 * 
 * Final score = basePoints * (multiplier ** exponent)
 */

export interface ScoringElements {
  basePoints: number;
  multiplier: number;
  exponent: number;
}

/**
 * Create initial scoring elements (default state)
 */
export function createInitialScoringElements(): ScoringElements {
  return {
    basePoints: 0,
    multiplier: 1,
    exponent: 1,
  };
}

/**
 * Create scoring elements from base points
 */
export function createScoringElementsFromPoints(basePoints: number): ScoringElements {
  return {
    basePoints,
    multiplier: 1,
    exponent: 1,
  };
}

/**
 * Add to multiplier (additive operation)
 */
export function addMultiplier(values: ScoringElements, amount: number): ScoringElements {
  return {
    ...values,
    multiplier: values.multiplier + amount,
  };
}

/**
 * Multiply multiplier (multiplicative operation)
 */
export function multiplyMultiplier(values: ScoringElements, factor: number): ScoringElements {
  return {
    ...values,
    multiplier: values.multiplier * factor,
  };
}

/**
 * Add to exponent (additive operation)
 */
export function addExponent(values: ScoringElements, amount: number): ScoringElements {
  return {
    ...values,
    exponent: values.exponent + amount,
  };
}

/**
 * Multiply exponent (multiplicative operation)
 */
export function multiplyExponent(values: ScoringElements, factor: number): ScoringElements {
  return {
    ...values,
    exponent: values.exponent * factor,
  };
}

/**
 * Add to base points
 */
export function addBasePoints(values: ScoringElements, amount: number): ScoringElements {
  return {
    ...values,
    basePoints: values.basePoints + amount,
  };
}

/**
 * Calculate final score from scoring elements
 */
export function calculateFinalScore(values: ScoringElements): number {
  return Math.ceil(values.basePoints * (values.multiplier ** values.exponent));
}

/**
 * Clone scoring elements (for immutability)
 */
export function cloneScoringElements(values: ScoringElements): ScoringElements {
  return {
    basePoints: values.basePoints,
    multiplier: values.multiplier,
    exponent: values.exponent,
  };
}

