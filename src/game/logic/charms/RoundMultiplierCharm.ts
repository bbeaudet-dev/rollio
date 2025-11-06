import { BaseCharm, CharmBankContext } from '../../logic/charmSystem';

export class RoundMultiplierCharm extends BaseCharm {
  onScoring() { return 0; }
  onBank(context: CharmBankContext): number {
    // Multiplies banked points by 1.25
    return Math.floor(context.bankedPoints * 1.25);
  }
} 