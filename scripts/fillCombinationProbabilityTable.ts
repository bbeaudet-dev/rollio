/**
 * Script to calculate and fill in the Combination Probability Table
 * Runs the calculator for each dice count (6, 7, 8, 9, 10) and extracts probabilities
 */

import { calculateAllSpecificProbabilities, CombinationCategory } from '../src/game/logic/probability';

// Map table row labels to combination keys
const combinationMap: { [key: string]: string } = {
  'Single 1': 'singleN:1',
  'Single 5': 'singleN:5',
  '1 Pair': 'nPairs:1',
  '2 Pair': 'nPairs:2',
  '3 Pair': 'nPairs:3',
  '4 Pair': 'nPairs:4',
  '5 Pair': 'nPairs:5',
  '3 of a Kind': 'nOfAKind:3',
  '4 of a Kind': 'nOfAKind:4',
  '5 of a Kind': 'nOfAKind:5',
  '6 of a Kind': 'nOfAKind:6',
  '7 of a Kind': 'nOfAKind:7',
  '8 of a Kind': 'nOfAKind:8',
  '9 of a Kind': 'nOfAKind:9',
  '10 of a Kind': 'nOfAKind:10',
  'Straight of 4': 'straightOfN:4',
  'Straight of 5': 'straightOfN:5',
  'Straight of 6': 'straightOfN:6',
  'Straight of 7': 'straightOfN:7',
  'Straight of 8': 'straightOfN:8',
  'Straight of 9': 'straightOfN:9',
  'Straight of 10': 'straightOfN:10',
  '2 Triplets': 'nTriplets:2',
  '3 Triplets': 'nTriplets:3',
  '2 Quadruplets': 'nQuadruplets:2',
  '2 Quintuplets': 'nQuintuplets:2',
  '2 Sextuplets': 'nSextuplets:2',
  '2 Septuplets': 'nSeptuplets:2',
  '2 Octuplets': 'nOctuplets:2',
  '2 Nonuplets': 'nNonuplets:2',
  '2 Decuplets': 'nDecuplets:2',
  'Pyramid of 6': 'pyramidOfN:6',
  'Pyramid of 10': 'pyramidOfN:10',
  'Pyramid of 15': 'pyramidOfN:15',
};

// Table row order
const tableRows = [
  'Single 1',
  'Single 5',
  '1 Pair',
  '2 Pair',
  '3 Pair',
  '3 of a Kind',
  '4 of a Kind',
  '5 of a Kind',
  '6 of a Kind',
  'Straight of 4',
  'Straight of 5',
  'Straight of 6',
  '2 Triplets',
  'Pyramid of 6',
  '7 of a Kind',
  'Straight of 7',
  '4 Pair',
  '8 of a Kind',
  'Straight of 8',
  '2 Quadruplets',
  '9 of a Kind',
  '3 Triplets',
  'Straight of 9',
  '5 Pair',
  '10 of a Kind',
  'Straight of 10',
  '2 Quintuplets',
  'Pyramid of 10',
  '2 Sextuplets',
  '2 Septuplets',
  '2 Octuplets',
  '2 Nonuplets',
  '2 Decuplets',
  'Pyramid of 15',
];

const diceCounts = [6, 7, 8, 9, 10];

async function calculateProbabilities() {
  const results: { [diceCount: number]: { [key: string]: number } } = {};
  
  for (const numDice of diceCounts) {
    console.log(`\nCalculating for ${numDice} dice...`);
    const startTime = Date.now();
    
    // Create diceFaces array with standard 6-sided dice
    const diceFaces: number[][] = Array(numDice).fill([1, 2, 3, 4, 5, 6]);
    
    try {
      const calculationResults = await calculateAllSpecificProbabilities(
        diceFaces,
        'beginner', // Use beginner category
        (current, total) => {
          if (current % 50000 === 0 || current === total) {
            const elapsed = (Date.now() - startTime) / 1000;
            const rate = current / elapsed;
            const remaining = (total - current) / rate;
            process.stdout.write(`\r  Progress: ${current.toLocaleString()} / ${total.toLocaleString()} (${((current / total) * 100).toFixed(1)}%) - ETA: ${remaining.toFixed(1)}s`);
          }
        },
        () => false // Never cancel
      );

      // Build a map of key -> percentage
      const keyMap: { [key: string]: number } = {};
      for (const prob of calculationResults.combinations) {
        keyMap[prob.key] = prob.percentage;
      }

      results[numDice] = keyMap;
      console.log(`\n  ✓ Completed ${numDice} dice`);
    } catch (error) {
      console.error(`\n  ✗ Error calculating for ${numDice} dice:`, error);
      results[numDice] = {};
    }
  }

  // Generate the table data
  console.log('\n\n=== TABLE DATA ===\n');
  console.log('const tableData: (string | number)[][] = [');
  console.log("  ['Combination | # of Dice ->', '6', '7', '8', '9', '10'],");

  for (const rowLabel of tableRows) {
    const combinationKey = combinationMap[rowLabel];
    const row: string[] = [`'${rowLabel}'`];

    for (const numDice of diceCounts) {
      const keyMap = results[numDice];
      if (keyMap && combinationKey && keyMap[combinationKey] !== undefined) {
        const percentage = keyMap[combinationKey];
        if (percentage === 0) {
          row.push("'0.00%'");
        } else {
          row.push(`'${percentage.toFixed(2)}%'`);
        }
      } else {
        row.push("'-'");
      }
    }

    console.log(`  [${row.join(', ')}],`);
  }

  console.log('];\n');
}

// Run the script
calculateProbabilities().catch(console.error);

