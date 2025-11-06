import { BaseCharm, CharmScoringContext } from '../../logic/charmSystem';

/*
 * =============================
 * Weighted Dice Charm
 * =============================
 * Doubles probability of all chance-based effects (e.g., Rainbow dice, Lucky Token).
 * This is a passive charm that modifies probability calculations in other systems.
 */
export class WeightedDiceCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): number {
    // This charm doesn't provide direct scoring bonuses
    return 0;
  }

  /**
   * Utility method to double the probability of a chance-based effect
   * @param baseProbability - The original probability (0.0 to 1.0)
   * @returns The doubled probability, capped at 1.0
   */
  public doubleProbability(baseProbability: number): number {
    return Math.min(baseProbability * 2, 1.0);
  }

  /**
   * Check if a chance-based effect should trigger with doubled probability
   * @param baseProbability - The original probability (0.0 to 1.0)
   * @returns true if the effect should trigger
   */
  public shouldTrigger(baseProbability: number): boolean {
    const doubledProbability = this.doubleProbability(baseProbability);
    return Math.random() < doubledProbability;
  }
} 