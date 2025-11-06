import { DEFAULT_GAME_CONFIG } from '../utils/factories';
import { DieValue } from '../types';

/**
 * Formats dice values for display (no brackets, no indices)
 * TODO: change dice from number[] to Die[], display all aspects of the die
 */
export function formatDiceValues(dice: number[]): string {
  return dice.map((v) => v.toString()).join(' ');
}

/**
 * Formats scoring combinations for display
 */
export function formatCombinations(combinations: any[]): string {
  return combinations.map(c => `${c.type} (${c.dice.join(', ')})`).join(', ');
}

/**
 * Formats flop message with consecutive flop information
 */
export function formatFlopMessage(
  forfeitedPoints: number, 
  consecutiveFlops: number, 
  levelBankedPoints: number,
  consecutiveFlopPenalty: number,
  consecutiveFlopLimit: number
): string {
  let message = `  No valid scoring combinations found, you flopped!`;
  
  if (consecutiveFlops === consecutiveFlopLimit - 1) {
    message += `\n  (${consecutiveFlops} consecutive flops - one more and you lose ${consecutiveFlopPenalty} points!)`;
  } else if (consecutiveFlops >= consecutiveFlopLimit) {
    message += `\n  (${consecutiveFlops} consecutive flops - you lost ${consecutiveFlopPenalty} points! Banked: ${levelBankedPoints})`;
  }
  
  return message;
}

export interface GameStats {
  rounds: number;
  totalScore: number;
  money: number;
}

export function formatGameStats(stats: GameStats): string[] {
  return [
    `Rounds played: ${stats.rounds}`,
    `Current score: ${stats.totalScore}`,
    `Money: $${stats.money}`,
  ];
}

/**
 * Validates user input for dice selection
 * Accepts dice values (e.g., "125" for dice showing 1, 2, 5)
 */
export function validateDiceSelection(input: string, dice: DieValue[]): number[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const selectedIndices: number[] = [];
  
  // Parse each character as a dice value
  for (const char of trimmed) {
    const diceValue = parseInt(char, 10) as DieValue;
    if (isNaN(diceValue) || diceValue < 1 || diceValue > 6) {
      return []; // Invalid dice value
    }
    
    // Find all indices where this dice value appears
    const matchingIndices = dice
      .map((value, index) => value === diceValue ? index : -1)
      .filter(index => index !== -1);
    
    // Add the first occurrence that hasn't been selected yet
    for (const index of matchingIndices) {
      if (!selectedIndices.includes(index)) {
        selectedIndices.push(index);
        break; // Only select one instance of each dice value
      }
    }
  }
  
  return selectedIndices.sort((a, b) => a - b);
} 

/**
 * Returns a random integer between min and max, inclusive.
 */
export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
} 

/**
 * Utility to format a "No effect" log for effect systems (charms, materials, etc.)
 * @param type - The effect type label (e.g., '🎭 CHARM EFFECTS', '🎲 MATERIAL EFFECTS')
 * @param hadEffect - Whether any effect logs were added
 * @param base - The base value before effects
 * @param final - The final value after effects
 * @returns string[] - ['<type>: No effect'] if no effect, otherwise []
 */
export function formatNoEffectLog(type: string, hadEffect: boolean, base: number, final: number): string[] {
  if (!hadEffect && base === final) {
    return [`${type}: No effect`];
  }
  return [];
} 