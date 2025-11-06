import { BaseCharm, CharmScoringContext } from '../../logic/charmSystem';

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
    // If any value appears 4 or more times, double the total points for this roll
    const hasFourOrMore = Object.values(valueCounts).some(count => count >= 4);
    if (hasFourOrMore) {
      return context.basePoints; // Add the same amount again (double)
    }
    return 0;
  }
} 