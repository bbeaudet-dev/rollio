import { BaseCharm, CharmScoringContext } from '../../logic/charmSystem';

export class OddCollectorCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): number {
    // +10 points for each odd number in the selected dice
    let bonus = 0;
    for (const idx of context.selectedIndices) {
      const value = context.roundState.diceHand[idx]?.rolledValue;
      if (value && value % 2 === 1) {
        bonus += 10;
      }
    }
    return bonus;
  }
} 