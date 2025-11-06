import { BaseCharm, CharmFlopContext, CharmScoringContext } from '../../logic/charmSystem';

export class FlopShieldCharm extends BaseCharm {
  constructor(charm: any) {
    super(charm);
    this.uses = 3;
  }

  onScoring(context: CharmScoringContext): number {
    // Flop Shield doesn't modify scoring
    return 0;
  }

  onFlop(context: CharmFlopContext): { prevented: boolean, log: string } | boolean {
    if (this.canUse()) {
      this.use();
      return {
        prevented: true,
        log: '\n🛡️ Flop Shield activated! Flop prevented (' + this.uses + ' uses left)'
      };
    }
    return false;
  }
} 