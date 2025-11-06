import { BaseCharm, CharmScoringContext } from '../../logic/charmSystem';

export class ScoreMultiplierCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): number {
    // Adds 25% to base points
    return Math.floor(context.basePoints * 0.25);
  }
} 