import { BaseCharm, CharmScoringContext } from '../../logic/charmSystem';

/*
 * =============================
 * Rabbit's Foot Charm
 * =============================
 * Score multiplier based on number of successful Rainbow die effect triggers in the current game.
 * Multiplier: 1.1x per trigger (configurable).
 */
export class RabbitsFootCharm extends BaseCharm {
  // Track triggers in the game (persists across rounds)
  private rainbowTriggers: number = 0;

  // Call this from the material system when a Rainbow die triggers
  public incrementRainbowTrigger() {
    this.rainbowTriggers++;
  }

  onScoring(context: CharmScoringContext): number {
    // Apply a multiplier based on rainbowTriggers
    if (this.rainbowTriggers > 0) {
      const multiplier = 1 + 0.1 * this.rainbowTriggers;
      const bonus = Math.ceil(context.basePoints * (multiplier - 1));
      return bonus;
    }
    return 0;
  }
} 