import { BaseCharm, CharmScoringContext, CharmFlopContext, CharmBankContext, ScoringValueModification } from '../charmSystem';
import { Die } from '../../types';
import { getPipEffectForDie } from '../pipEffectSystem';
import { calculateFinalScore } from '../scoringElements';

/**
 * Uncommon Charms Implementation
 * 
 * NOTE: Some charms are skipped because they require systems not yet implemented:
 * - whimWhisperer: Needs consumable use tracking
 */

// ============================================================================
// SCORING CHARMS
// ============================================================================

export class QuadBoostersCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // Multiplies score by 3x if scored dice include 4 of the same value
    const valueCounts: Record<number, number> = {};
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die && die.rolledValue !== undefined) {
        valueCounts[die.rolledValue] = (valueCounts[die.rolledValue] || 0) + 1;
      }
    }
    const hasFourOfAKind = Object.values(valueCounts).some(count => count >= 4);
    return {
      multiplierMultiply: hasFourOfAKind ? 3 : 1
    };
  }
}

export class LuckySevensCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +77 points if at least one 7 is rolled
    const hasSeven = context.selectedIndices.some(
      idx => context.roundState.diceHand[idx]?.rolledValue === 7
    );
    return {
      basePointsDelta: hasSeven ? 77 : 0
    };
  }
}

export class SavingGraceCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // No scoring effect
    return {};
  }

  onFlop(context: CharmFlopContext): boolean | { prevented: boolean, log?: string } | void {
    // 50% chance to prevent all flops
    if (Math.random() < 0.5) {
      return {
        prevented: true,
        log: '\n🛡️ Saving Grace prevented flop!'
      };
    }
    return false;
  }
}

export class TasteTheRainbowCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +300 points if all rolled dice have unique materials
    const materials = context.roundState.diceHand.map((die: Die) => die.material);
    const uniqueMaterials = new Set(materials);
    const allUnique = materials.length === uniqueMaterials.size;
    return {
      basePointsDelta: allUnique ? 300 : 0
    };
  }
}

export class PrimeTimeCharm extends BaseCharm {
  private isPrime(n: number): boolean {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (let i = 3; i * i <= n; i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  }

  onScoring(context: CharmScoringContext): ScoringValueModification {
    // 2x multiplier when scoring only prime numbers (2, 3, 5, 7, etc.)
    const values = context.selectedIndices.map(
      idx => context.roundState.diceHand[idx]?.rolledValue
    ).filter(v => v !== undefined) as number[];
    
    const allPrime = values.length > 0 && values.every(v => this.isPrime(v));
    return {
      multiplierMultiply: allPrime ? 2 : 1
    };
  }
}

export class LuckyLeprechaunCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +$2 when scoring a combination worth 1000+ points
    const finalScore = calculateFinalScore(context.scoringElements);
    if (finalScore >= 1000 && context.gameState) {
      context.gameState.money = (context.gameState.money || 0) + 2;
    }
    return {};
  }
}

export class IrrationalCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // 3.1415x multiplier if scored hand contains 1,1,3,4,5
    const values = context.selectedIndices.map(
      idx => context.roundState.diceHand[idx]?.rolledValue
    ).filter(v => v !== undefined).sort() as number[];
    
    // Check if values contain 1,1,3,4,5 (in any order, but need two 1s)
    const counts: Record<number, number> = {};
    for (const v of values) {
      counts[v] = (counts[v] || 0) + 1;
    }
    
    const hasPattern = counts[1] >= 2 && counts[3] >= 1 && counts[4] >= 1 && counts[5] >= 1;
    return {
      multiplierMultiply: hasPattern ? 3.1415 : 1
    };
  }
}

export class FerrisEulerCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // 2.71x multiplier if scored hand contains 1,2,7
    const values = new Set(context.selectedIndices.map(
      idx => context.roundState.diceHand[idx]?.rolledValue
    ).filter(v => v !== undefined));
    
    const hasPattern = values.has(1) && values.has(2) && values.has(7);
    return {
      multiplierMultiply: hasPattern ? 2.71 : 1
    };
  }
}

export class FourForYourFavorCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +40 points when scoring four-of-a-kind
    const valueCounts: Record<number, number> = {};
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die && die.rolledValue !== undefined) {
        valueCounts[die.rolledValue] = (valueCounts[die.rolledValue] || 0) + 1;
      }
    }
    const hasFourOfAKind = Object.values(valueCounts).some(count => count >= 4);
    return {
      basePointsDelta: hasFourOfAKind ? 40 : 0
    };
  }
}

export class FiveAliveCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +50 points when scoring five-of-a-kind
    const valueCounts: Record<number, number> = {};
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die && die.rolledValue !== undefined) {
        valueCounts[die.rolledValue] = (valueCounts[die.rolledValue] || 0) + 1;
      }
    }
    const hasFiveOfAKind = Object.values(valueCounts).some(count => count >= 5);
    return {
      basePointsDelta: hasFiveOfAKind ? 50 : 0
    };
  }
}

export class SixShooterCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +60 points when scoring six-of-a-kind
    const valueCounts: Record<number, number> = {};
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die && die.rolledValue !== undefined) {
        valueCounts[die.rolledValue] = (valueCounts[die.rolledValue] || 0) + 1;
      }
    }
    const hasSixOfAKind = Object.values(valueCounts).some(count => count >= 6);
    return {
      basePointsDelta: hasSixOfAKind ? 60 : 0
    };
  }
}

export class HedgeFundCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +1x multiplier for every $100 owned
    const money = context.gameState.money || 0;
    const multiplierBonus = Math.floor(money / 100);
    return {
      multiplierAdd: multiplierBonus
    };
  }
}

export class LuckyLotusCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +$4 when scoring a combination worth 3000+ points
    const finalScore = calculateFinalScore(context.scoringElements);
    if (finalScore >= 3000 && context.gameState) {
      context.gameState.money = (context.gameState.money || 0) + 4;
    }
    return {};
  }
}

export class HotPocketCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // 2x multiplier when hot dice counter is 2 or higher
    const hotDiceCounter = context.roundState.hotDiceCounter || 0;
    return {
      multiplierMultiply: hotDiceCounter >= 2 ? 2 : 1
    };
  }
}

export class WildCardCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +25 points for each wild pip effect in the scoring selection
    let wildCount = 0;
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die) {
        const pipEffect = getPipEffectForDie(die);
        if (pipEffect === 'wild') {
          wildCount++;
        }
      }
    }
    return {
      basePointsDelta: wildCount * 25
    };
  }
}

export class SwordInTheStoneCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // Hot Dice triggers if all dice (including Lead) are scored
    // This is handled in materialSystem.shouldTriggerHotDice() which checks for this charm
    // No scoring modification needed
    return {};
  }
}

export class WhimWhispererCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // Whims have a 25% chance to not be consumed when used
    // TODO: Needs consumable use tracking system
    // This would need to hook into the consumable use logic
    return {};
  }
}

export class DoubleAgentCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // Doubles rerolls - handled in calculateRerollsForLevel
    return {};
  }
}

export class PuristCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // Doubles banks, sets rerolls to 0 - handled in calculateBanksForLevel and calculateRerollsForLevel
    return {};
  }
}

export class RoundMultiplierCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    return {};
  }
  
  onBank(context: CharmBankContext): number {
    // Multiplies level score by 1.15x when banking points
    return Math.floor(context.bankedPoints * 1.15);
  }
}

export class RabbitsFootCharm extends BaseCharm {
  // Track triggers in the game (persists across rounds)
  private rainbowTriggers: number = 0;

  // Call this from the material system when a Rainbow die triggers
  public incrementRainbowTrigger() {
    this.rainbowTriggers++;
  }

  onScoring(context: CharmScoringContext): ScoringValueModification {
    // Score multiplier based on number of successful Rainbow die effect triggers
    // Multiplier: 1.1x per trigger
    if (this.rainbowTriggers > 0) {
      const multiplier = 1 + 0.1 * this.rainbowTriggers;
      return {
        multiplierMultiply: multiplier
      };
    }
    return {};
  }
}

export class WeightedDiceCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // This charm doesn't provide direct scoring bonuses
    // It doubles probability of chance-based effects (handled in other systems)
    return {};
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

