import { BaseCharm, CharmScoringContext } from '../../logic/charmSystem';

export class EvenPerfectionCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): number {
    // If all selected dice are even, gain +100 points
    const allEven = context.selectedIndices.every(idx => {
      const value = context.roundState.diceHand[idx]?.rolledValue;
      return value && value % 2 === 0;
    });
    return allEven && context.selectedIndices.length > 0 ? 100 : 0;
  }
} 