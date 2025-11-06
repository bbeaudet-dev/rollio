import { BaseCharm, CharmScoringContext } from '../../logic/charmSystem';

export class HighStakesCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): number {
    // Apply 3x multiplier to base points
    return Math.floor(context.basePoints * 2); // This adds 2x to base, making it 3x total
  }

  /**
   * Set points to 0 for single 1 and single 5 combinations to make them invalid
   */
  filterScoringCombinations(combinations: any[], context: CharmScoringContext): any[] {
    return combinations.map(combo => {
      if (combo.type === 'singleOne' || combo.type === 'singleFive') {
        return { ...combo, points: 0 };
      }
      return combo;
    });
  }
} 