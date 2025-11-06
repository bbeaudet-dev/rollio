import { describe, it, expect } from 'vitest';
import { getScoringCombinations, hasAnyScoringCombination, countDice } from '../logic/scoring';
import { validateDiceSelection } from '../utils/effectUtils';
import { validateDiceSelectionAndScore } from '../logic/gameLogic';
import { Die } from '../types';

// Helper function to create test dice
function createTestDice(values: number[]): Die[] {
  return values.map((value, index) => ({
    id: `d${index + 1}`,
    sides: 6,
    allowedValues: [1, 2, 3, 4, 5, 6],
    material: 'plastic',
    rolledValue: value,
    scored: false,
  }));
}

describe('Scoring Logic', () => {
  describe('getScoringCombinations', () => {
    it('should score two triplets and single 1 correctly', () => {
      // Roll: 3,3,3,4,4,4,1 (7 dice)
      const diceHand = createTestDice([3, 3, 3, 4, 4, 4, 1]);
      const selectedIndices = [0, 1, 2, 3, 4, 5, 6]; // All dice
      
      const combinations = getScoringCombinations(diceHand, selectedIndices, { charms: [] });
      
      // Should have two triplets (3s and 4s) plus single 1
      expect(combinations).toHaveLength(3);
      
      const twoTriplets = combinations.find(c => c.type === 'twoTriplets');
      const singleOne = combinations.find(c => c.type === 'singleOne');
      
      expect(twoTriplets).toBeDefined();
      expect(twoTriplets?.points).toBe(2500);
      expect(singleOne).toBeDefined();
      expect(singleOne?.points).toBe(100);
    });

    it('should score straight correctly (1-6)', () => {
      // Roll: 1,2,3,4,5,6 (6 dice)
      const diceHand = createTestDice([1, 2, 3, 4, 5, 6]);
      const selectedIndices = [0, 1, 2, 3, 4, 5]; // All dice
      
      const combinations = getScoringCombinations(diceHand, selectedIndices, { charms: [] });
      
      // Should have straight
      expect(combinations).toHaveLength(1);
      
      const straight = combinations.find(c => c.type === 'straight');
      
      expect(straight).toBeDefined();
      expect(straight?.points).toBe(2000);
      expect(straight?.dice).toHaveLength(6);
    });

    it('should score straight correctly (3-8)', () => {
      // Roll: 3,4,5,6,7,8 (6 dice)
      const diceHand = createTestDice([3, 4, 5, 6, 7, 8]);
      const selectedIndices = [0, 1, 2, 3, 4, 5]; // All dice
      
      const combinations = getScoringCombinations(diceHand, selectedIndices, { charms: [] });
      
      // Should have straight
      expect(combinations).toHaveLength(1);
      
      const straight = combinations.find(c => c.type === 'straight');
      
      expect(straight).toBeDefined();
      expect(straight?.points).toBe(2000);
      expect(straight?.dice).toHaveLength(6);
    });

    it('should score straight and remaining dice correctly', () => {
      // Roll: 3,4,5,6,7,8,1 (7 dice)
      const diceHand = createTestDice([3, 4, 5, 6, 7, 8, 1]);
      const selectedIndices = [0, 1, 2, 3, 4, 5, 6]; // All dice
      
      const combinations = getScoringCombinations(diceHand, selectedIndices, { charms: [] });
      
      // Should have straight plus single 1
      expect(combinations).toHaveLength(2);
      
      const straight = combinations.find(c => c.type === 'straight');
      const singleOne = combinations.find(c => c.type === 'singleOne');
      
      expect(straight).toBeDefined();
      expect(straight?.points).toBe(2000);
      expect(singleOne).toBeDefined();
      expect(singleOne?.points).toBe(100);
    });

    it('should score God\'s Straight correctly', () => {
      // Roll: 1,2,3,4,5,6,7,8,9,10 (10 dice)
      const diceHand = createTestDice([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const selectedIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // All dice
      
      const combinations = getScoringCombinations(diceHand, selectedIndices, { charms: [] });
      
      expect(combinations).toHaveLength(1);
      expect(combinations[0].type).toBe('godStraight');
      expect(combinations[0].points).toBe(10000);
    });

    it('should score three pairs correctly (556611)', () => {
      // Roll: 5,5,6,6,1,1 (6 dice)
      const diceHand = createTestDice([5, 5, 6, 6, 1, 1]);
      const selectedIndices = [0, 1, 2, 3, 4, 5]; // All dice
      
      const combinations = getScoringCombinations(diceHand, selectedIndices, { charms: [] });
      
      // Should have three pairs (5s, 6s, 1s)
      expect(combinations).toHaveLength(1);
      
      const threePairs = combinations.find(c => c.type === 'threePairs');
      
      expect(threePairs).toBeDefined();
      expect(threePairs?.points).toBe(2250);
      expect(threePairs?.dice).toHaveLength(6);
    });

    it('should score three pairs and single 5 correctly (5556611)', () => {
      // Roll: 5,5,5,6,6,1,1 (7 dice)
      const diceHand = createTestDice([5, 5, 5, 6, 6, 1, 1]);
      const selectedIndices = [0, 1, 2, 3, 4, 5, 6]; // All dice
      
      const combinations = getScoringCombinations(diceHand, selectedIndices, { charms: [] });
      
      // Should have three pairs plus single 5
      expect(combinations).toHaveLength(2);
      
      const threePairs = combinations.find(c => c.type === 'threePairs');
      const singleFive = combinations.find(c => c.type === 'singleFive');
      
      expect(threePairs).toBeDefined();
      expect(threePairs?.points).toBe(2250);
      expect(singleFive).toBeDefined();
      expect(singleFive?.points).toBe(50);
    });

    it('should score three pairs and remaining dice correctly', () => {
      // Roll: 5,5,6,6,1,1,5 (7 dice)
      const diceHand = createTestDice([5, 5, 6, 6, 1, 1, 5]);
      const selectedIndices = [0, 1, 2, 3, 4, 5, 6]; // All dice
      
      const combinations = getScoringCombinations(diceHand, selectedIndices, { charms: [] });
      
      // Should have three pairs plus single 5
      expect(combinations).toHaveLength(2);
      
      const threePairs = combinations.find(c => c.type === 'threePairs');
      const singleFive = combinations.find(c => c.type === 'singleFive');
      
      expect(threePairs).toBeDefined();
      expect(threePairs?.points).toBe(2250);
      expect(singleFive).toBeDefined();
      expect(singleFive?.points).toBe(50);
    });

    it('should score four pairs correctly', () => {
      // Roll: 1,1,2,2,3,3,4,4 (8 dice)
      const diceHand = createTestDice([1, 1, 2, 2, 3, 3, 4, 4]);
      const selectedIndices = [0, 1, 2, 3, 4, 5, 6, 7]; // All dice
      
      const combinations = getScoringCombinations(diceHand, selectedIndices, { charms: [] });
      
      expect(combinations).toHaveLength(1);
      expect(combinations[0].type).toBe('fourPairs');
      expect(combinations[0].points).toBe(3500);
    });

    it('should score triple triplets correctly', () => {
      // Roll: 1,1,1,2,2,2,3,3,3 (9 dice)
      const diceHand = createTestDice([1, 1, 1, 2, 2, 2, 3, 3, 3]);
      const selectedIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // All dice
      
      const combinations = getScoringCombinations(diceHand, selectedIndices, { charms: [] });
      
      expect(combinations).toHaveLength(1);
      expect(combinations[0].type).toBe('tripleTriplets');
      expect(combinations[0].points).toBe(5000);
    });

    it('should score seven of a kind correctly', () => {
      // Roll: 1,1,1,1,1,1,1 (7 dice)
      const diceHand = createTestDice([1, 1, 1, 1, 1, 1, 1]);
      const selectedIndices = [0, 1, 2, 3, 4, 5, 6]; // All dice
      
      const combinations = getScoringCombinations(diceHand, selectedIndices, { charms: [] });
      
      expect(combinations).toHaveLength(1);
      expect(combinations[0].type).toBe('sevenOfAKind');
      expect(combinations[0].points).toBe(2000); // 2000 × 1 face value
    });

    it('should score six of a kind and remaining dice correctly', () => {
      // Roll: 1,1,1,1,1,1,5 (7 dice)
      const diceHand = createTestDice([1, 1, 1, 1, 1, 1, 5]);
      const selectedIndices = [0, 1, 2, 3, 4, 5, 6]; // All dice
      
      const combinations = getScoringCombinations(diceHand, selectedIndices, { charms: [] });
      
      // Should have six of a kind plus single 5
      expect(combinations).toHaveLength(2);
      
      const sixOfAKind = combinations.find(c => c.type === 'sixOfAKind');
      const singleFive = combinations.find(c => c.type === 'singleFive');
      
      expect(sixOfAKind).toBeDefined();
      expect(sixOfAKind?.points).toBe(1000); // 1000 × 1 face value
      expect(singleFive).toBeDefined();
      expect(singleFive?.points).toBe(50);
    });

    it('should score three of a kind with correct face value points', () => {
      // Test three 2s (should be 200 points)
      const diceHand = createTestDice([2, 2, 2]);
      const selectedIndices = [0, 1, 2];
      
      const combinations = getScoringCombinations(diceHand, selectedIndices, { charms: [] });
      
      expect(combinations).toHaveLength(1);
      expect(combinations[0].type).toBe('threeOfAKind');
      expect(combinations[0].points).toBe(200); // 2 × 100
    });

    it('should score three 1s with special 1000 points', () => {
      // Test three 1s (should be 1000 points)
      const diceHand = createTestDice([1, 1, 1]);
      const selectedIndices = [0, 1, 2];
      
      const combinations = getScoringCombinations(diceHand, selectedIndices, { charms: [] });
      
      expect(combinations).toHaveLength(1);
      expect(combinations[0].type).toBe('threeOfAKind');
      expect(combinations[0].points).toBe(1000); // Special case for 1s
    });

    it('should score three 6s with correct face value points', () => {
      // Test three 6s (should be 600 points)
      const diceHand = createTestDice([6, 6, 6]);
      const selectedIndices = [0, 1, 2];
      
      const combinations = getScoringCombinations(diceHand, selectedIndices, { charms: [] });
      
      expect(combinations).toHaveLength(1);
      expect(combinations[0].type).toBe('threeOfAKind');
      expect(combinations[0].points).toBe(600); // 6 × 100
    });

    it('should score four of a kind with correct multiplier', () => {
      // Test four 2s (should be 400 points: 200 base × 2 multiplier)
      const diceHand = createTestDice([2, 2, 2, 2]);
      const selectedIndices = [0, 1, 2, 3];
      
      const combinations = getScoringCombinations(diceHand, selectedIndices, { charms: [] });
      
      expect(combinations).toHaveLength(1);
      expect(combinations[0].type).toBe('fourOfAKind');
      expect(combinations[0].points).toBe(500); // 250 × 2 face value
    });

    it('should score five of a kind with correct multiplier', () => {
      // Test five 3s (should be 900 points: 300 base × 3 multiplier)
      const diceHand = createTestDice([3, 3, 3, 3, 3]);
      const selectedIndices = [0, 1, 2, 3, 4];
      
      const combinations = getScoringCombinations(diceHand, selectedIndices, { charms: [] });
      
      expect(combinations).toHaveLength(1);
      expect(combinations[0].type).toBe('fiveOfAKind');
      expect(combinations[0].points).toBe(1500); // 500 × 3 face value
    });

    it('should score four 1s with correct multiplier', () => {
      // Test four 1s (should be 2000 points: 1000 base × 2 multiplier)
      const diceHand = createTestDice([1, 1, 1, 1]);
      const selectedIndices = [0, 1, 2, 3];
      
      const combinations = getScoringCombinations(diceHand, selectedIndices, { charms: [] });
      
      expect(combinations).toHaveLength(1);
      expect(combinations[0].type).toBe('fourOfAKind');
      expect(combinations[0].points).toBe(250); // 250 × 1 face value
    });

    it('should debug the exact scenario from the image', () => {
      // Roll: 6,2,3,3,6,5,5,4 (8 dice)
      const diceHand = createTestDice([6, 2, 3, 3, 6, 5, 5, 4]);
      // User input: "665533" should select indices [0,4,6,7,2,3] (two 6s, two 5s, two 3s)
      const selectedIndices = [0, 4, 6, 7, 2, 3]; // Manually set the expected indices
      
      const combinations = getScoringCombinations(diceHand, selectedIndices, { charms: [] });
      
      console.log('Debug - Selected values:', selectedIndices.map(i => diceHand[i].rolledValue));
      console.log('Debug - Combinations:', combinations);
      
      // Should have three pairs
      expect(combinations).toHaveLength(1);
      
      const threePairs = combinations.find(c => c.type === 'threePairs');
      
      expect(threePairs).toBeDefined();
      expect(threePairs?.points).toBe(2250);
      expect(threePairs?.dice).toHaveLength(6);
    });
  });

  describe('hasAnyScoringCombination', () => {
    it('should detect God\'s Straight', () => {
      const diceHand = createTestDice([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(hasAnyScoringCombination(diceHand)).toBe(true);
    });

    it('should detect four pairs', () => {
      const diceHand = createTestDice([1, 1, 2, 2, 3, 3, 4, 4]);
      expect(hasAnyScoringCombination(diceHand)).toBe(true);
    });

    it('should detect triple triplets', () => {
      const diceHand = createTestDice([1, 1, 1, 2, 2, 2, 3, 3, 3]);
      expect(hasAnyScoringCombination(diceHand)).toBe(true);
    });

    it('should detect seven of a kind', () => {
      const diceHand = createTestDice([1, 1, 1, 1, 1, 1, 1]);
      expect(hasAnyScoringCombination(diceHand)).toBe(true);
    });

    it('should detect no scoring combinations', () => {
      const diceHand = createTestDice([2, 2, 3, 3, 4, 4]);
      expect(hasAnyScoringCombination(diceHand)).toBe(false);
    });

    it('should detect basic three pairs', () => {
      // Simple case: 1,1,2,2,3,3
      const diceHand = createTestDice([1, 1, 2, 2, 3, 3]);
      const selectedIndices = [0, 1, 2, 3, 4, 5]; // All dice
      
      const combinations = getScoringCombinations(diceHand, selectedIndices, { charms: [] });
      
      console.log('Debug - Basic three pairs test');
      console.log('Debug - Values:', [1, 1, 2, 2, 3, 3]);
      console.log('Debug - Combinations found:', combinations.length);
      combinations.forEach(c => console.log('Debug - Combination:', c.type, c.points, c.dice));
      
      // Should have three pairs
      expect(combinations).toHaveLength(1);
      
      const threePairs = combinations.find(c => c.type === 'threePairs');
      
      expect(threePairs).toBeDefined();
      expect(threePairs?.points).toBe(2250);
      expect(threePairs?.dice).toHaveLength(6);
    });
  });
});

describe('countDice function', () => {
  it('should correctly count dice for three pairs', () => {
    const values = [1, 1, 2, 2, 3, 3];
    const counts = countDice(values);
    
    console.log('Debug - Values:', values);
    console.log('Debug - Counts:', counts);
    console.log('Debug - Pairs found:', counts.filter(c => c === 2).length);
    
    // Should have 3 pairs
    expect(counts.filter(c => c === 2).length).toBe(3);
  });
});

describe('validateDiceSelection', () => {
  it('should correctly parse "665533" from roll [6,2,3,3,6,5,5,4]', () => {
    const dice = [6, 2, 3, 3, 6, 5, 5, 4] as any[];
    const input = "665533";
    
    const selectedIndices = validateDiceSelection(input, dice);
    
    console.log('Debug - Input:', input);
    console.log('Debug - Dice:', dice);
    console.log('Debug - Selected indices:', selectedIndices);
    console.log('Debug - Selected values:', selectedIndices.map(i => dice[i]));
    
    // Should select 6 dice: two 6s, two 5s, two 3s
    expect(selectedIndices).toHaveLength(6);
    
    // Check that we have the right values
    const selectedValues = selectedIndices.map(i => dice[i]).sort();
    expect(selectedValues).toEqual([3, 3, 5, 5, 6, 6]);
  });
});

describe('Full validation pipeline', () => {
  it('should handle the exact scenario from the image', () => {
    // Roll: 6,2,3,3,6,5,5,4 (8 dice)
    const diceHand = createTestDice([6, 2, 3, 3, 6, 5, 5, 4]);
    const input = "665533";
    
    // Test the full pipeline
    const result = validateDiceSelectionAndScore(input, diceHand, { charms: [] });
    
    console.log('Debug - Input:', input);
    console.log('Debug - Roll:', [6, 2, 3, 3, 6, 5, 5, 4]);
    console.log('Debug - Selected indices:', result.selectedIndices);
    console.log('Debug - Selected values:', result.selectedIndices.map(i => diceHand[i].rolledValue));
    console.log('Debug - Valid:', result.scoringResult.valid);
    console.log('Debug - Points:', result.scoringResult.points);
    console.log('Debug - Combinations:', result.scoringResult.combinations);
    
    // Should be valid and score three pairs
    expect(result.scoringResult.valid).toBe(true);
    expect(result.scoringResult.points).toBe(2250);
    expect(result.scoringResult.combinations).toHaveLength(1);
    expect(result.scoringResult.combinations[0].type).toBe('threePairs');
  });
}); 