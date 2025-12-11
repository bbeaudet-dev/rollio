/**
 * Simple test script for scoring algorithms
 * 
 * Just modify the test cases below and run: npm run test:scoring
 * or: ts-node scripts/testScoring.ts
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
  getBaseScoringElementValues,
  ScoringCombinationType,
} from '../src/game/data/combinations';

// ============================================
// TEST CASES - Modify these to test your algorithms
// ============================================

console.log('=== Scoring Algorithm Tests ===\n');

// Test singleN
console.log('--- singleN ---');
console.log('Single 1:', calculateSingleNPoints(1));
console.log('Single 5:', calculateSingleNPoints(5));
console.log('Single 3:', calculateSingleNPoints(3));
console.log('Single 2:', calculateSingleNPoints(2));
console.log('Single 4:', calculateSingleNPoints(4));
console.log('Single 6:', calculateSingleNPoints(6));
console.log('');

// Test nPairs
console.log('--- nPairs ---');
console.log('1 pair:', calculateNPairsPoints(1, 1), "-", calculateNPairsPoints(1, 6));
console.log('2 pairs:', calculateNPairsPoints(2, 1), "-", calculateNPairsPoints(2, 6));
console.log('3 pairs:', calculateNPairsPoints(3, 1), "-", calculateNPairsPoints(3, 6));
console.log('4 pairs:', calculateNPairsPoints(4, 1), "-", calculateNPairsPoints(4, 6));
console.log('5 pairs:', calculateNPairsPoints(5, 1), "-", calculateNPairsPoints(5, 6));
console.log('6 pairs:', calculateNPairsPoints(6, 1), "-", calculateNPairsPoints(6, 6));
console.log('7 pairs:', calculateNPairsPoints(7, 1), "-", calculateNPairsPoints(7, 6));
console.log('8 pairs:', calculateNPairsPoints(8, 1), "-", calculateNPairsPoints(8, 6));
console.log('9 pairs:', calculateNPairsPoints(9, 1), "-", calculateNPairsPoints(9, 6));
console.log('10 pairs:', calculateNPairsPoints(10, 1), "-", calculateNPairsPoints(10, 6));
console.log('');

// Test nOfAKind
console.log('--- nOfAKind ---');
console.log('3 of a kind:', calculateNOfAKindPoints(1, 3), "-", calculateNOfAKindPoints(6, 3));
console.log('4 of a kind:', calculateNOfAKindPoints(1, 4), "-", calculateNOfAKindPoints(6, 4));
console.log('5 of a kind:', calculateNOfAKindPoints(1, 5), "-", calculateNOfAKindPoints(6, 5));
console.log('6 of a kind:', calculateNOfAKindPoints(1, 6), "-", calculateNOfAKindPoints(6, 6));
console.log('7 of a kind:', calculateNOfAKindPoints(1, 7), "-", calculateNOfAKindPoints(6, 7));
console.log('8 of a kind:', calculateNOfAKindPoints(1, 8), "-", calculateNOfAKindPoints(6, 8));
console.log('9 of a kind:', calculateNOfAKindPoints(1, 9), "-", calculateNOfAKindPoints(6, 9));
console.log('10 of a kind:', calculateNOfAKindPoints(1, 10), "-", calculateNOfAKindPoints(6, 10));
console.log('11 of a kind:', calculateNOfAKindPoints(1, 11), "-", calculateNOfAKindPoints(6, 11));
console.log('12 of a kind:', calculateNOfAKindPoints(1, 12), "-", calculateNOfAKindPoints(6, 12));
console.log('13 of a kind:', calculateNOfAKindPoints(1, 13), "-", calculateNOfAKindPoints(6, 13));
console.log('14 of a kind:', calculateNOfAKindPoints(1, 14), "-", calculateNOfAKindPoints(6, 14));
console.log('15 of a kind:', calculateNOfAKindPoints(1, 15), "-", calculateNOfAKindPoints(6, 15));
console.log('16 of a kind:', calculateNOfAKindPoints(1, 16), "-", calculateNOfAKindPoints(6, 16));
console.log('17 of a kind:', calculateNOfAKindPoints(1, 17), "-", calculateNOfAKindPoints(6, 17));
console.log('18 of a kind:', calculateNOfAKindPoints(1, 18), "-", calculateNOfAKindPoints(6, 18));
console.log('19 of a kind:', calculateNOfAKindPoints(1, 19), "-", calculateNOfAKindPoints(6, 19));
console.log('20 of a kind:', calculateNOfAKindPoints(1, 20), "-", calculateNOfAKindPoints(6, 20));
console.log('');

// Test straights
console.log('--- straightOfN ---');
console.log('Straight of 4:', calculateStraightOfNPoints(4));
console.log('Straight of 5:', calculateStraightOfNPoints(5));
console.log('Straight of 6:', calculateStraightOfNPoints(6));
console.log('Straight of 7:', calculateStraightOfNPoints(7));
console.log('Straight of 8:', calculateStraightOfNPoints(8));
console.log('Straight of 9:', calculateStraightOfNPoints(9));
console.log('Straight of 10:', calculateStraightOfNPoints(10));
console.log('Straight of 11:', calculateStraightOfNPoints(11));
console.log('Straight of 12:', calculateStraightOfNPoints(12));
console.log('Straight of 13:', calculateStraightOfNPoints(13));
console.log('Straight of 14:', calculateStraightOfNPoints(14));
console.log('Straight of 15:', calculateStraightOfNPoints(15));
console.log('Straight of 16:', calculateStraightOfNPoints(16));
console.log('Straight of 17:', calculateStraightOfNPoints(17));
console.log('Straight of 18:', calculateStraightOfNPoints(18));
console.log('Straight of 19:', calculateStraightOfNPoints(19));
console.log('Straight of 20:', calculateStraightOfNPoints(20));
console.log('');

// Test pyramid
console.log('--- pyramidOfN ---');
console.log('Pyramid of 6:', calculatePyramidOfNPoints(6));
console.log('Pyramid of 10:', calculatePyramidOfNPoints(10));
console.log('Pyramid of 15:', calculatePyramidOfNPoints(15));
console.log('Pyramid of 21:', calculatePyramidOfNPoints(21));
console.log('');

// Test nTriplets
console.log('--- nTuplets ---');
console.log('2 triplets (6):', calculateNTripletsPoints(2));
console.log('2 quadruplets (8):', calculateNQuadrupletsPoints(2));
console.log('3 triplets (9):', calculateNTripletsPoints(3));
console.log('2 quintuplets (10):', calculateNQuintupletsPoints(2));
console.log('4 triplets (12):', calculateNTripletsPoints(4));
console.log('3 quadruplets (12):', calculateNQuadrupletsPoints(3));
console.log('2 sextuplets (12):', calculateNSextupletsPoints(2));
console.log('2 septuplets (14):', calculateNSeptupletsPoints(2));
console.log('5 triplets (15):', calculateNTripletsPoints(5));
console.log('3 quintuplets (15):', calculateNQuintupletsPoints(3));
console.log('4 quadruplets (16):', calculateNQuadrupletsPoints(4));
console.log('2 octuplets (16):', calculateNOctupletsPoints(2));
console.log('6 triplets (18):', calculateNTripletsPoints(6));
console.log('3 sextuplets (18):', calculateNSextupletsPoints(3));
console.log('2 nonuplets (18):', calculateNNonupletsPoints(2));
console.log('5 quadruplets (20):', calculateNQuadrupletsPoints(5));
console.log('4 quintuplets (20):', calculateNQuintupletsPoints(4));
console.log('2 decuplets (20):', calculateNDecupletsPoints(2));
console.log('');

// Test using the main calculateCombinationPoints function
console.log('--- calculateCombinationPoints (main function) ---');
console.log('singleN (1):', calculateCombinationPoints('singleN', { faceValue: 1 }));
console.log('nPairs (2 pairs, face 6):', calculateCombinationPoints('nPairs', { n: 2, faceValue: 6 }));
console.log('nOfAKind (4 of 6s):', calculateCombinationPoints('nOfAKind', { faceValue: 6, count: 4 }));
console.log('straightOfN (5):', calculateCombinationPoints('straightOfN', { length: 5 }));
console.log('');

// Test upgrade progression
console.log('--- Upgrade Progression (singleN, face 1) ---');
console.log('Level | Points | Multiplier | Exponent | Final Score');
console.log('-'.repeat(60));
for (let level = 1; level <= 25; level++) {
  const values = getBaseScoringElementValues('singleN', level, { faceValue: 1 });
  const finalScore = Math.ceil(values.basePoints * Math.pow(values.baseMultiplier, values.baseExponent));
  
  const levelStr = level.toString().padStart(5);
  const pointsStr = values.basePoints.toString().padStart(6);
  const multStr = values.baseMultiplier.toFixed(2).padStart(10);
  const expStr = values.baseExponent.toFixed(2).padStart(9);
  const scoreStr = finalScore.toString().padStart(11);
  
  console.log(`${levelStr} | ${pointsStr} | ${multStr} | ${expStr} | ${scoreStr}`);
}
console.log('');

// Test upgrade progression for a few key levels
console.log('--- Upgrade Progression Examples ---');
const testLevels = [1, 5, 6, 10, 19, 20, 21, 25];
console.log('Level | single1 Points | Mult | Exp | Final | 3ofKind(6s) Points | Mult | Exp | Final');
console.log('-'.repeat(90));
for (const level of testLevels) {
  const single1 = getBaseScoringElementValues('singleN', level, { faceValue: 1 });
  const single1Final = Math.ceil(single1.basePoints * Math.pow(single1.baseMultiplier, single1.baseExponent));
  
  const threeKind = getBaseScoringElementValues('nOfAKind', level, { count: 3, faceValue: 6 });
  const threeKindFinal = Math.ceil(threeKind.basePoints * Math.pow(threeKind.baseMultiplier, threeKind.baseExponent));
  
  console.log(
    `${level.toString().padStart(5)} | ${single1.basePoints.toString().padStart(13)} | ${single1.baseMultiplier.toFixed(1).padStart(4)} | ${single1.baseExponent.toFixed(2).padStart(3)} | ${single1Final.toString().padStart(5)} | ${threeKind.basePoints.toString().padStart(18)} | ${threeKind.baseMultiplier.toFixed(1).padStart(4)} | ${threeKind.baseExponent.toFixed(2).padStart(3)} | ${threeKindFinal.toString().padStart(5)}`
  );
}
console.log('');

console.log('=== Tests Complete ===');

