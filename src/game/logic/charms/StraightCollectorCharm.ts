import { BaseCharm, CharmScoringContext } from '../../logic/charmSystem';

export class StraightCollectorCharm extends BaseCharm {
  private bonus: number = 0;

  onScoring(context: CharmScoringContext): number {
    // If a straight is present, increment the bonus
    const playedStraight = context.combinations.some(combo => combo.type === 'straight');
    if (playedStraight) {
      this.bonus += 20;
      console.log(`🎭 StraightCollector: Played a straight! Bonus increased to ${this.bonus}`);
    }
    // Always add the current bonus
    if (this.bonus > 0) {
      console.log(`🎭 StraightCollector: Adding bonus ${this.bonus} to roll.`);
    }
    return this.bonus;
  }
} 