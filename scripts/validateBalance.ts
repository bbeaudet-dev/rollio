/**
 * Balance Validation Script
 * 
 * Validates scoring algorithms against probability tables to check game balance.
 * 
 * Calculates:
 * - Points per combination
 * - Probability of rolling each combination
 * - Dice required for each combination
 * - Expected value (points * probability)
 * - Points/Probability ratio (balance metric)
 * 
 * Run: npm run validate:balance
 * or: ts-node scripts/validateBalance.ts
 */

import {
  calculateSingleNPoints,
  calculateNPairsPoints,
  calculateNOfAKindPoints,
  calculateNTripletsPoints,
  calculateNQuadrupletsPoints,
  calculateNQuintupletsPoints,
  calculateNSextupletsPoints,
  calculateNSeptupletsPoints,
  calculateNOctupletsPoints,
  calculateNNonupletsPoints,
  calculateNDecupletsPoints,
  calculateStraightOfNPoints,
  calculatePyramidOfNPoints,
  calculateCombinationPoints,
  ScoringCombinationType,
} from '../src/game/data/combinations';

import {
  calculateAllSpecificProbabilities,
  SpecificCombinationProbability,
  CombinationCategory,
  getDiceUsedByCombination,
} from '../src/game/logic/probability';

interface BalanceAnalysis {
  key: string;
  type: ScoringCombinationType;
  param: number;
  diceRequired: number;
  pointsMin: number;
  pointsMax: number;
  pointsAvg: number;
  probability: number;
  expectedValue: number;
  balanceRatio: number; // points / probability (higher = more valuable per probability)
}


/**
 * Calculate points for a combination, handling face value variations
 */
function getPointsForCombination(
  type: ScoringCombinationType,
  param: number
): { min: number; max: number; avg: number } {
  switch (type) {
    case 'singleN':
      if (param === 1) {
        const points = calculateSingleNPoints(1);
        return { min: points, max: points, avg: points };
      } else if (param === 5) {
        const points = calculateSingleNPoints(5);
        return { min: points, max: points, avg: points };
      }
      return { min: 0, max: 0, avg: 0 };
    
    case 'nPairs':
      // For pairs, face value can be 1-6
      const minPairs = calculateNPairsPoints(param, 1);
      const maxPairs = calculateNPairsPoints(param, 6);
      return {
        min: minPairs,
        max: maxPairs,
        avg: (minPairs + maxPairs) / 2,
      };
    
    case 'nOfAKind':
      // For n of a kind, face value can be 1-6
      const minNOfAKind = calculateNOfAKindPoints(1, param);
      const maxNOfAKind = calculateNOfAKindPoints(6, param);
      return {
        min: minNOfAKind,
        max: maxNOfAKind,
        avg: (minNOfAKind + maxNOfAKind) / 2,
      };
    
    case 'nTriplets':
      const triplets = calculateNTripletsPoints(param);
      return { min: triplets, max: triplets, avg: triplets };
    
    case 'nQuadruplets':
      const quadruplets = calculateNQuadrupletsPoints(param);
      return { min: quadruplets, max: quadruplets, avg: quadruplets };
    
    case 'nQuintuplets':
      const quintuplets = calculateNQuintupletsPoints(param);
      return { min: quintuplets, max: quintuplets, avg: quintuplets };
    
    case 'nSextuplets':
      const sextuplets = calculateNSextupletsPoints(param);
      return { min: sextuplets, max: sextuplets, avg: sextuplets };
    
    case 'nSeptuplets':
      const septuplets = calculateNSeptupletsPoints(param);
      return { min: septuplets, max: septuplets, avg: septuplets };
    
    case 'nOctuplets':
      const octuplets = calculateNOctupletsPoints(param);
      return { min: octuplets, max: octuplets, avg: octuplets };
    
    case 'nNonuplets':
      const nonuplets = calculateNNonupletsPoints(param);
      return { min: nonuplets, max: nonuplets, avg: nonuplets };
    
    case 'nDecuplets':
      const decuplets = calculateNDecupletsPoints(param);
      return { min: decuplets, max: decuplets, avg: decuplets };
    
    case 'straightOfN':
      const straight = calculateStraightOfNPoints(param);
      return { min: straight, max: straight, avg: straight };
    
    case 'pyramidOfN':
      const pyramid = calculatePyramidOfNPoints(param);
      return { min: pyramid, max: pyramid, avg: pyramid };
    
    default:
      return { min: 0, max: 0, avg: 0 };
  }
}

/**
 * Format a number for display
 */
function formatNumber(num: number, decimals: number = 2): string {
  if (num === 0) return '0';
  if (num < 0.01) return num.toExponential(2);
  return num.toFixed(decimals);
}

/**
 * Main validation function
 */
async function validateBalance(
  numDice: number = 6,
  category: CombinationCategory = 'beginner'
) {
  console.log(`\n=== Balance Validation (${numDice} dice, ${category}) ===\n`);

  // Create dice faces array (standard 6-sided dice)
  const diceFaces: number[][] = Array(numDice).fill([1, 2, 3, 4, 5, 6]);

  // Calculate probabilities
  console.log('Calculating probabilities...');
  const { combinations: probabilities } = await calculateAllSpecificProbabilities(
    diceFaces,
    category
  );

  // Filter out flop and hotDice
  const validProbabilities = probabilities.filter(
    (p) => p.key !== 'flop' && p.key !== 'hotDice' && p.isPossible
  );

  // Build balance analysis
  const analyses: BalanceAnalysis[] = [];

  for (const prob of validProbabilities) {
    const diceRequired = getDiceUsedByCombination(prob.type, prob.param);
    const points = getPointsForCombination(prob.type, prob.param);

    // Calculate expected value (points * probability)
    const expectedValue = points.avg * prob.probability;

    // Calculate balance ratio (points / probability)
    // Higher ratio = more valuable per unit of probability
    // We add a small epsilon to avoid division by zero
    const balanceRatio = prob.probability > 0 
      ? points.avg / prob.probability 
      : 0;

    analyses.push({
      key: prob.key,
      type: prob.type,
      param: prob.param,
      diceRequired,
      pointsMin: points.min,
      pointsMax: points.max,
      pointsAvg: points.avg,
      probability: prob.probability,
      expectedValue,
      balanceRatio,
    });
  }

  // Sort by expected value (probability * points)
  analyses.sort((a, b) => b.expectedValue - a.expectedValue);

  // Display results
  console.log('\n--- Balance Analysis (sorted by Expected Value: Probability × Points) ---\n');
  console.log(
    'Combination'.padEnd(25) +
    'Dice'.padEnd(6) +
    'Points'.padEnd(15) +
    'Prob%'.padEnd(10) +
    'Expected Value'.padEnd(18)
  );
  console.log('-'.repeat(74));

  for (const analysis of analyses) {
    const pointsStr = 
      analysis.pointsMin === analysis.pointsMax
        ? `${analysis.pointsAvg}`
        : `${analysis.pointsMin}-${analysis.pointsMax}`;
    
    const probPercent = (analysis.probability * 100).toFixed(2);
    const expectedStr = formatNumber(analysis.expectedValue);

    console.log(
      analysis.key.padEnd(25) +
      analysis.diceRequired.toString().padEnd(6) +
      pointsStr.padEnd(15) +
      probPercent.padEnd(10) +
      expectedStr.padEnd(18)
    );
  }

  // Summary statistics
  console.log('\n--- Summary Statistics ---\n');
  
  const avgExpected = analyses.reduce((sum, a) => sum + a.expectedValue, 0) / analyses.length;
  const medianExpected = analyses[Math.floor(analyses.length / 2)].expectedValue;
  const minExpected = analyses[analyses.length - 1].expectedValue;
  const maxExpected = analyses[0].expectedValue;

  console.log(`Total combinations analyzed: ${analyses.length}`);
  console.log(`Average expected value: ${formatNumber(avgExpected)}`);
  console.log(`Median expected value: ${formatNumber(medianExpected)}`);
  console.log(`Min expected value: ${formatNumber(minExpected)}`);
  console.log(`Max expected value: ${formatNumber(maxExpected)}`);
  console.log(`Expected value spread: ${formatNumber(maxExpected / minExpected)}x`);

  // Identify potential balance issues based on expected value
  console.log('\n--- Potential Balance Issues (based on Expected Value) ---\n');
  
  const highExpected = analyses.filter(a => a.expectedValue > avgExpected * 2);
  const lowExpected = analyses.filter(a => a.expectedValue < avgExpected / 2);

  if (highExpected.length > 0) {
    console.log(`High expected value (potentially overpowered): ${highExpected.length} combinations`);
    highExpected.slice(0, 5).forEach(a => {
      console.log(`  - ${a.key}: expected ${formatNumber(a.expectedValue)} (avg: ${formatNumber(avgExpected)})`);
    });
  }

  if (lowExpected.length > 0) {
    console.log(`\nLow expected value (potentially underpowered): ${lowExpected.length} combinations`);
    lowExpected.slice(0, 5).forEach(a => {
      console.log(`  - ${a.key}: expected ${formatNumber(a.expectedValue)} (avg: ${formatNumber(avgExpected)})`);
    });
  }

  console.log('\n=== Validation Complete ===\n');
}

// Run validation
const numDice = process.argv[2] ? parseInt(process.argv[2], 10) : 6;
const category = (process.argv[3] as CombinationCategory) || 'beginner';

validateBalance(numDice, category).catch((error) => {
  console.error('Error during validation:', error);
  process.exit(1);
});

