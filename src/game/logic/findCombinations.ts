/**
 * Combination Detection Logic
 * 
 * This module handles detecting all possible scoring combinations from a set of dice.
 * It only generates algorithm-based combination types (no specific types).
 */

import { Die, ScoringCombination } from '../types';
import { ScoringCombinationType } from '../data/combinations';
import { calculateCombinationPoints } from '../data/combinations';
import { debugLog, getDebugMode } from '../utils/debug';

interface ScoringContext {
  charms?: any[];
  materials?: any[];
  charmManager?: any;
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
  
  // Generate combinations for all possible subsets of the dice
  const allSubsets = generateAllSubsets(selectedIndices);
  
  for (const subsetIndices of allSubsets) {
    if (subsetIndices.length === 0) continue;
    
    const subsetValues = subsetIndices.map(idx => diceHand[idx].rolledValue!);
    const counts = countDice(subsetValues);
    const subsetSize = subsetValues.length;
    
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
    
    // Generate N pairs (algorithm-based) for any number of pairs >= 1
    if (pairCount >= 1 && subsetSize === pairCount * 2) {
      combinations.push({
        type: 'nPairs',
        dice: subsetIndices,
        points: calculateCombinationPoints('nPairs', { n: pairCount }),
      });
    }
    
    // Generate straights (algorithm-based: detect all straight lengths)
    // Check for straights of length 4, 5, 6, and longer
    if (subsetSize >= 4) {
      const sorted = [...subsetValues].sort((a, b) => a - b);
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
      const value = subsetValues[0];
      const dieIndex = subsetIndices[0];
      
      // Check if this die was already used in a larger combination
      const usedInLargerCombo = combinations.some(combo =>
        combo.dice.includes(dieIndex) && combo.type !== 'singleN'
      );
      
      if (!usedInLargerCombo) {
        // Only 1s and 5s are valid singles by default
        // Charms can enable other values (e.g., Low Hanging Fruit for 3s)
        if (value === 1 || value === 5 || value === 3) {
          combinations.push({
            type: 'singleN',
            dice: subsetIndices,
            points: calculateCombinationPoints('singleN', { faceValue: value }),
          });
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
  }
  
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
  
  if (getDebugMode()) {
    debugLog(`Combination deduplication: ${beforeCombinationCount} → ${uniqueCombinations.length} unique combinations`);
  }
  
  return uniqueCombinations;
}

/**
 * Check if dice hand has any scoring combination
 * Only checks dice that have rolled values (filters out dice without rolledValue)
 */
export function hasAnyScoringCombination(diceHand: Die[]): boolean {
  // Filter to only dice with rolled values (exclude dice that haven't been rolled yet)
  const diceWithValues = diceHand.filter(die => die.rolledValue !== undefined && die.rolledValue !== null);
  
  // If no dice have rolled values, it's not a flop (just haven't rolled yet)
  if (diceWithValues.length === 0) return false;
  
  const values = diceWithValues.map(die => die.rolledValue!);
  const counts = countDice(values);
  
  // Singles (1s or 5s)
  if (counts[0] > 0 || counts[4] > 0) return true;
  
  // Pairs (at least one pair) - algorithm-based
  if (counts.some(c => c >= 2)) return true;
  
  // N-of-a-kind (algorithm-based: check for any N >= 3)
  if (counts.some(c => c >= 3)) return true;
  
  // Straights (algorithm-based: check for any straight length >= 4)
  if (values.length >= 4) {
    const sorted = [...values].sort((a, b) => a - b);
    const unique = [...new Set(sorted)];
    // Check for straights of length 4, 5, 6, or longer
    for (let straightLength = 4; straightLength <= Math.min(unique.length, values.length); straightLength++) {
      for (let start = 0; start <= unique.length - straightLength; start++) {
        const straightSequence = unique.slice(start, start + straightLength);
        if (straightSequence[straightLength - 1] - straightSequence[0] === straightLength - 1) {
          return true;
        }
      }
    }
  }
  
  // N pairs (algorithm-based: check if we can form at least 1 pair)
  const pairCount = counts.reduce((sum, c) => sum + Math.floor(c / 2), 0);
  if (pairCount >= 1) return true;
  
  // N triplets (algorithm-based: check if we have at least 2 triplets)
  const tripletCount = counts.filter(c => c === 3).length;
  if (tripletCount >= 2) return true;
  
  // N quadruplets (algorithm-based: check if we have at least 2 quadruplets)
  const quadrupletCount = counts.filter(c => c === 4).length;
  if (quadrupletCount >= 2) return true;
  
  // Pyramid (algorithm-based: check for pyramid pattern)
  if (values.length >= 6) {
    const sortedCounts = [...counts].filter(c => c > 0).sort((a, b) => b - a);
    if (sortedCounts.length >= 3) {
      let isPyramid = true;
      for (let i = 0; i < sortedCounts.length - 1; i++) {
        if (sortedCounts[i] - sortedCounts[i + 1] !== 1) {
          isPyramid = false;
          break;
        }
      }
      if (isPyramid && sortedCounts[0] >= 3) return true;
    }
  }
  
  return false;
}

