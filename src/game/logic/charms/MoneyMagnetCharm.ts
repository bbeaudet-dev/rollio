import { BaseCharm, CharmScoringContext } from '../../logic/charmSystem';

export class MoneyMagnetCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): number {
    const money = context.gameState.money || 0;
    return money * 5;
  }
} 