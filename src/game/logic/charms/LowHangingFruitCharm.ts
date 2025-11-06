import { BaseCharm, CharmScoringContext } from '../../logic/charmSystem';

export class LowHangingFruitCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): number {
    // No direct point bonus, just enables single 3s
    return 0;
  }

  /**
   * Add single 3 combinations to the scoring combinations
   */
  filterScoringCombinations(combinations: any[], context: CharmScoringContext): any[] {
    // Find single 3s in the dice and add them as valid combinations
    const singleThrees = context.selectedIndices.filter((idx: number) => {
      const die = context.roundState.diceHand[idx];
      return die && die.rolledValue === 3;
    }).map((idx: number) => ({
      type: 'singleThree',
      dice: [idx],
      points: 25 // Single 3s worth 25 points
    }));

    return [...combinations, ...singleThrees];
  }
} 