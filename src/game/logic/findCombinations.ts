/**
 * Combination Detection Logic
 * 
 * This module handles detecting all possible scoring combinations from a set of dice.
 * It only generates algorithm-based combination types (no specific types).
 */

import { Die, ScoringCombination, EffectContext } from '../types';
import { calculateCombinationPoints } from '../data/combinations';
import { shouldAllowSingleThrees } from './charms/charmUtils';
import { expandDiceValuesForCombinations } from './pipEffectSystem';
import { DifficultyLevel, isCombinationAvailable } from './difficulty';
import { markDebuffedCombinations } from './debuffs';

export interface ScoringContext {
  charms?: any[];
  materials?: any[];
  charmManager?: any;
  difficulty?: DifficultyLevel;
  effectContext?: EffectContext; // World and level effect context for filtering
}

/**
 * Count occurrences of each face value in dice array
 */
export function countDice(dice: number[]): number[] {
  const maxFace = Math.max(...dice, 6); // Default to 6 if dice is empty
  const counts = Array(maxFace).fill(0);
  for (const die of dice) {
    counts[die - 1]++;
  }
  return counts;
}

/**
 * Generate all possible subsets of indices
 */
function generateAllSubsets(indices: number[]): number[][] {
  const subsets: number[][] = [];
  const n = indices.length;
  
  // Generate all possible subsets using bit manipulation
  for (let i = 1; i < (1 << n); i++) {
    const subset: number[] = [];
    for (let j = 0; j < n; j++) {
      if (i & (1 << j)) {
        subset.push(indices[j]);
      }
    }
    subsets.push(subset);
  }
  
  return subsets;
}

/**
 * Get the parameters needed to check if a combination is available at a given difficulty.
 * Extracts the relevant values (n, count, length, faceValue) from a combination based on its type.
 */
export function getSpecificCombinationParams(
  combo: ScoringCombination,
  diceHand: Die[]
): { n?: number; count?: number; length?: number; faceValue?: number } {
  const diceValues = combo.dice.map(idx => diceHand[idx].rolledValue!);
  
  switch (combo.type) {
    case 'singleN':
      return { faceValue: diceValues[0] };
    case 'nPairs':
      return { n: combo.dice.length / 2 };
    case 'nOfAKind':
      return { count: combo.dice.length };
    case 'straightOfN':
      return { length: combo.dice.length };
    case 'nTriplets':
      return { n: combo.dice.length / 3 };
    case 'nQuadruplets':
      return { n: combo.dice.length / 4 };
    case 'nQuintuplets':
      return { n: combo.dice.length / 5 };
    case 'nSextuplets':
      return { n: combo.dice.length / 6 };
    case 'nSeptuplets':
      return { n: combo.dice.length / 7 };
    case 'nOctuplets':
      return { n: combo.dice.length / 8 };
    case 'nNonuplets':
      return { n: combo.dice.length / 9 };
    case 'nDecuplets':
      return { n: combo.dice.length / 10 };
    case 'pyramidOfN':
      return { n: combo.dice.length };
    default:
      return {};
  }
}

/**
 * Find all possible individual combinations from subsets of the dice
 * Only generates algorithm-based types (no backwards compatibility)
 */
export function findAllPossibleCombinations(
  values: number[],
  selectedIndices: number[],
  diceHand: Die[],
  context?: ScoringContext
): ScoringCombination[] {
  const combinations: ScoringCombination[] = [];
  const difficulty = context?.difficulty;
  
  // Expand dice values based on pip effects (two-faced, wild)
  // This handles the expansion before combination finding
  const expandedValueArrays = expandDiceValuesForCombinations(diceHand, selectedIndices);
  
  // For each possible expansion (important for wild dice which can have multiple interpretations)
  for (const expandedValues of expandedValueArrays) {
    // Generate combinations for all possible subsets of the dice
    const allSubsets = generateAllSubsets(selectedIndices);
    
    for (const subsetIndices of allSubsets) {
      if (subsetIndices.length === 0) continue;
      
      // Map subset indices to expanded values
      // For two-faced dice, we need to map one die index to potentially two values
      // For wild dice, we use the value from the expanded array
      const subsetExpandedValues: number[] = [];
      let expandedIndex = 0;
      
      for (const idx of selectedIndices) {
        const die = diceHand[idx];
        if (!die || die.rolledValue === undefined) continue;
        
        const pipEffect = die.pipEffects?.[die.rolledValue] || 'none';
        
        if (subsetIndices.includes(idx)) {
          if (pipEffect === 'twoFaced') {
            // Two-faced: add both values from expansion
            subsetExpandedValues.push(expandedValues[expandedIndex]);
            expandedIndex++;
            subsetExpandedValues.push(expandedValues[expandedIndex]);
            expandedIndex++;
          } else if (pipEffect === 'wild') {
            // Wild: add the value from expansion
            subsetExpandedValues.push(expandedValues[expandedIndex]);
            expandedIndex++;
          } else {
            // Normal: add the value once
            subsetExpandedValues.push(expandedValues[expandedIndex]);
            expandedIndex++;
          }
        } else {
          // Skip this die, but advance expandedIndex if needed
          if (pipEffect === 'twoFaced') {
            expandedIndex += 2;
          } else {
            expandedIndex++;
          }
        }
      }
      
      const counts = countDice(subsetExpandedValues);
      const subsetSize = subsetExpandedValues.length;
    
    // Generate N-of-a-kind combinations for each face value (algorithm-based)
    for (let i = 0; i < counts.length; i++) {
      const value = i + 1;
      const count = counts[i];
      // Generate for all N >= 3
      for (let n = 3; n <= count; n++) {
        const valueIndices = subsetIndices.filter(idx => diceHand[idx].rolledValue! === value);
        const diceIndices = valueIndices.slice(0, n);
        
        // Use algorithm-based type for all N-of-a-kind
        combinations.push({
          type: 'nOfAKind',
          dice: diceIndices,
          points: calculateCombinationPoints('nOfAKind', {
            faceValue: value,
            count: n,
          }),
        });
      }
    }
    
    // Generate pair combinations (algorithm-based: detect all N pairs)
    const pairCount = counts.reduce((sum, c) => sum + Math.floor(c / 2), 0);
    
    // Find the highest face value among all pairs
    let highestPairValue = 0;
    for (let i = 0; i < counts.length; i++) {
      const value = i + 1;
      const count = counts[i];
      if (count >= 2) {
        highestPairValue = Math.max(highestPairValue, value);
      }
    }
    
    // Generate N pairs (algorithm-based) for any number of pairs >= 1
    if (pairCount >= 1 && subsetSize === pairCount * 2) {
      combinations.push({
        type: 'nPairs',
        dice: subsetIndices,
        points: calculateCombinationPoints('nPairs', { n: pairCount, faceValue: highestPairValue }),
      });
    }
    
    // Generate straights (algorithm-based: detect all straight lengths)
    // Check for straights of length 4, 5, 6, and longer
    if (subsetSize >= 4) {
      const sorted = [...subsetExpandedValues].sort((a, b) => a - b);
      const unique = [...new Set(sorted)];
      
      // Check for all possible straight lengths
      for (let straightLength = 4; straightLength <= Math.min(unique.length, subsetSize); straightLength++) {
        // Check all possible starting positions
        for (let start = 0; start <= unique.length - straightLength; start++) {
          const straightSequence = unique.slice(start, start + straightLength);
          const isConsecutive = straightSequence[straightLength - 1] - straightSequence[0] === straightLength - 1;
          
          if (isConsecutive) {
            // Find dice indices that match this straight
            const straightDiceIndices: number[] = [];
            const usedIndices = new Set<number>();
            
            for (const value of straightSequence) {
              for (let idx = 0; idx < subsetIndices.length; idx++) {
                if (!usedIndices.has(idx) && diceHand[subsetIndices[idx]].rolledValue === value) {
                  straightDiceIndices.push(subsetIndices[idx]);
                  usedIndices.add(idx);
                  break;
                }
              }
            }
            
            if (straightDiceIndices.length === straightLength) {
              // Use algorithm-based type
              combinations.push({
                type: 'straightOfN',
                dice: straightDiceIndices,
                points: calculateCombinationPoints('straightOfN', { length: straightLength }),
              });
            }
          }
        }
      }
    }
    
    // Generate pyramids (algorithm-based: detect pyramid patterns)
    // Pyramid pattern: N of one value, M of another, K of another, etc. (descending order)
    // Example: 3-2-1, 4-3-2-1, 5-4-3-2-1, etc.
    if (subsetSize >= 6) {
      const sortedCounts = [...counts].filter(c => c > 0).sort((a, b) => b - a);
      // Check if counts form a pyramid pattern (descending sequence starting from highest)
      if (sortedCounts.length >= 3) {
        let isPyramid = true;
        for (let i = 0; i < sortedCounts.length - 1; i++) {
          if (sortedCounts[i] - sortedCounts[i + 1] !== 1) {
            isPyramid = false;
            break;
          }
        }
        if (isPyramid && sortedCounts[0] >= 3) {
          // Use algorithm-based type
          combinations.push({
            type: 'pyramidOfN',
            dice: subsetIndices,
            points: calculateCombinationPoints('pyramidOfN', { n: subsetSize }),
          });
        }
      }
    }
    
    // Generate single combinations (singleN for 1s and 5s, and potentially 3s via charms)
    if (subsetSize === 1) {
      const value = subsetExpandedValues[0];
      const dieIndex = subsetIndices[0];
      
      // Check if this die was already used in a larger combination
      const usedInLargerCombo = combinations.some(combo =>
        combo.dice.includes(dieIndex) && combo.type !== 'singleN'
      );
      
      if (!usedInLargerCombo) {
        // Only 1s and 5s are valid singles by default
        // Charms can enable other values (e.g., Low Hanging Fruit for 3s)
        if (value === 1 || value === 5) {
          combinations.push({
            type: 'singleN',
            dice: subsetIndices,
            points: calculateCombinationPoints('singleN', { faceValue: value }),
          });
        } else if (value === 3) {
          // Single 3s only valid if Low Hanging Fruit charm is active
          // Use the check function from the charm file
          if (shouldAllowSingleThrees(context?.charmManager, context?.charms)) {
            combinations.push({
              type: 'singleN',
              dice: subsetIndices,
              points: calculateCombinationPoints('singleN', { faceValue: value }),
            });
          }
        }
      }
    }
    
    // Generate N triplets (algorithm-based)
    const tripletCount = counts.filter(c => c === 3).length;
    if (tripletCount >= 2 && subsetSize === tripletCount * 3) {
      combinations.push({
        type: 'nTriplets',
        dice: subsetIndices,
        points: calculateCombinationPoints('nTriplets', { n: tripletCount }),
      });
    }
    
    // Generate N quadruplets (algorithm-based)
    const quadrupletCount = counts.filter(c => c === 4).length;
    if (quadrupletCount >= 2 && subsetSize === quadrupletCount * 4) {
      combinations.push({
        type: 'nQuadruplets',
        dice: subsetIndices,
        points: calculateCombinationPoints('nQuadruplets', { n: quadrupletCount }),
      });
    }
    
    // Generate N quintuplets (algorithm-based)
    const quintupletCount = counts.filter(c => c === 5).length;
    if (quintupletCount >= 2 && subsetSize === quintupletCount * 5) {
      combinations.push({
        type: 'nQuintuplets',
        dice: subsetIndices,
        points: calculateCombinationPoints('nQuintuplets', { n: quintupletCount }),
      });
    }
    
    // Generate N sextuplets (algorithm-based)
    const sextupletCount = counts.filter(c => c === 6).length;
    if (sextupletCount >= 2 && subsetSize === sextupletCount * 6) {
      combinations.push({
        type: 'nSextuplets',
        dice: subsetIndices,
        points: calculateCombinationPoints('nSextuplets', { n: sextupletCount }),
      });
    }
    
    // Generate N septuplets (algorithm-based)
    const septupletCount = counts.filter(c => c === 7).length;
    if (septupletCount >= 2 && subsetSize === septupletCount * 7) {
      combinations.push({
        type: 'nSeptuplets',
        dice: subsetIndices,
        points: calculateCombinationPoints('nSeptuplets', { n: septupletCount }),
      });
    }
    
    // Generate N octuplets (algorithm-based)
    const octupletCount = counts.filter(c => c === 8).length;
    if (octupletCount >= 2 && subsetSize === octupletCount * 8) {
      combinations.push({
        type: 'nOctuplets',
        dice: subsetIndices,
        points: calculateCombinationPoints('nOctuplets', { n: octupletCount }),
      });
    }
    
    // Generate N nonuplets (algorithm-based)
    const nonupletCount = counts.filter(c => c === 9).length;
    if (nonupletCount >= 2 && subsetSize === nonupletCount * 9) {
      combinations.push({
        type: 'nNonuplets',
        dice: subsetIndices,
        points: calculateCombinationPoints('nNonuplets', { n: nonupletCount }),
      });
    }
    
    // Generate N decuplets (algorithm-based)
    const decupletCount = counts.filter(c => c === 10).length;
    if (decupletCount >= 2 && subsetSize === decupletCount * 10) {
      combinations.push({
        type: 'nDecuplets',
        dice: subsetIndices,
        points: calculateCombinationPoints('nDecuplets', { n: decupletCount }),
      });
    }
    } // End of subsetIndices loop
  } // End of expandedValues loop
  
  // Deduplicate combinations (same type and dice indices)
  const uniqueCombinations: ScoringCombination[] = [];
  const seenCombinations = new Set<string>();
  
  const beforeCombinationCount = combinations.length;
  
  for (const combo of combinations) {
    const canonical = `${combo.type}:${combo.dice.sort((a, b) => a - b).join(',')}`;
    if (!seenCombinations.has(canonical)) {
      seenCombinations.add(canonical);
      uniqueCombinations.push(combo);
    }
  }
  
  // Filter by difficulty only (restrictions will be handled in scoring as debuffs)
  const effectContext = context?.effectContext;
  const filteredCombinations: ScoringCombination[] = [];
  
  for (const combo of uniqueCombinations) {
    // Extract parameters for difficulty checking
    const params = getSpecificCombinationParams(combo, diceHand);
    
    // Check difficulty availability (still filter these out - they're not available at this difficulty)
    if (difficulty && !isCombinationAvailable(combo.type as any, difficulty, params)) {
      continue;
    }
    
    filteredCombinations.push(combo);
  }
  
  // Mark combinations as debuffed if they're restricted 
  if (effectContext) {
    markDebuffedCombinations(filteredCombinations, diceHand, effectContext);
  }
  
  return filteredCombinations;
}

// Debuff checking functions have been moved to debuffs.ts
// Keeping these for backwards compatibility but they should be removed
/**
 * @deprecated Use debuffs.ts instead
 */
function isCombinationAllowed(combinationType: string, effectContext: EffectContext): boolean {
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
 * Get reason for debuff (for display in scoring breakdown)
 */
function getDebuffReason(
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
  
  // Check dice value restrictions
  for (const idx of diceIndices) {
    const die = diceHand[idx];
    if (!die || die.rolledValue === undefined) continue;
    
    const value = die.rolledValue;
    
    if ((world.noOnes || level.noOnes) && value === 1) {
      reasons.push('Ones are debuffed');
      break;
    }
    if ((world.noTwos || level.noTwos) && value === 2) {
      reasons.push('Twos are debuffed');
      break;
    }
    if ((world.noThrees || level.noThrees) && value === 3) {
      reasons.push('Threes are debuffed');
      break;
    }
    if ((world.noFours || level.noFours) && value === 4) {
      reasons.push('Fours are debuffed');
      break;
    }
    if ((world.noFives || level.noFives) && value === 5) {
      reasons.push('Fives are debuffed');
      break;
    }
    if ((world.noSixes || level.noSixes) && value === 6) {
      reasons.push('Sixes are debuffed');
      break;
    }
    if ((world.noOddValues || level.noOddValues) && value % 2 === 1) {
      reasons.push('Odd values are debuffed');
      break;
    }
    if ((world.noEvenValues || level.noEvenValues) && value % 2 === 0) {
      reasons.push('Even values are debuffed');
      break;
    }
  }
  
  return reasons.join(', ') || 'Debuffed';
}

/**
 * Check if dice values are allowed based on effect context
 */
function areDiceValuesAllowed(
  diceIndices: number[],
  diceHand: Die[],
  effectContext: EffectContext
): boolean {
  const { world, level } = effectContext;
  
  for (const idx of diceIndices) {
    const die = diceHand[idx];
    if (!die || die.rolledValue === undefined) continue;
    
    const value = die.rolledValue;
    
    // Check world restrictions
    if (world.noOnes && value === 1) return false;
    if (world.noTwos && value === 2) return false;
    if (world.noThrees && value === 3) return false;
    if (world.noFours && value === 4) return false;
    if (world.noFives && value === 5) return false;
    if (world.noSixes && value === 6) return false;
    if (world.noOddValues && value % 2 === 1) return false;
    if (world.noEvenValues && value % 2 === 0) return false;
    
    // Check level restrictions
    if (level.noOnes && value === 1) return false;
    if (level.noTwos && value === 2) return false;
    if (level.noThrees && value === 3) return false;
    if (level.noFours && value === 4) return false;
    if (level.noFives && value === 5) return false;
    if (level.noSixes && value === 6) return false;
    if (level.noOddValues && value % 2 === 1) return false;
    if (level.noEvenValues && value % 2 === 0) return false;
  }
  
  return true;
}

/**
 * Check if dice hand has any scoring combination
 * Only checks dice that have rolled values (filters out dice without rolledValue)
 * If difficulty is provided, only checks for combinations valid at that difficulty level
 */
export function hasAnyScoringCombination(diceHand: Die[], difficulty: DifficultyLevel): boolean {
  // Filter to only dice with rolled values (exclude dice that haven't been rolled yet)
  const diceWithValues = diceHand.filter(die => die.rolledValue !== undefined && die.rolledValue !== null);
  
  // If no dice have rolled values, it's not a flop (just haven't rolled yet)
  if (diceWithValues.length === 0) return false;
  
  // Always use difficulty to check for valid combinations
  const values = diceWithValues.map(die => die.rolledValue!);
  const selectedIndices = diceWithValues.map((_, index) => index);
  const context: ScoringContext = { difficulty };
  const combinations = findAllPossibleCombinations(values, selectedIndices, diceWithValues, context);
  return combinations.length > 0;
}

