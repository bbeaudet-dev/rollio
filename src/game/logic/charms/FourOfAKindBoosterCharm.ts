import { BaseCharm, CharmScoringContext } from '../../logic/charmSystem';

/**
 * FourOfAKindBoosterCharm
 * 
 * Works with nOfAKind where n >= 4 (CONTAINS four of a kind).
 * If any value appears 4 or more times in the selected dice, doubles the total points.
 * 
 * Note: This uses "CONTAINS" logic - it triggers if the hand contains a four-of-a-kind,
 * even if it's part of a larger combination (e.g., five-of-a-kind or full house).
 */
export class FourOfAKindBoosterCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): number {
    // Find all dice values in the selected dice
    const valueCounts: Record<number, number> = {};
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die && die.rolledValue !== undefined) {
        valueCounts[die.rolledValue] = (valueCounts[die.rolledValue] || 0) + 1;
      }
    }
    // If any value appears 4 or more times (nOfAKind where n >= 4), double the total points for this roll
    const hasFourOrMore = Object.values(valueCounts).some(count => count >= 4);
    if (hasFourOrMore) {
      return context.basePoints; // Add the same amount again (double)
    }
    return 0;
  }
} 