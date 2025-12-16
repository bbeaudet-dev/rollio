import { BaseCharm, CharmScoringContext, CharmFlopContext, CharmBankContext, CharmRoundStartContext, ScoringValueModification, ScoringValueModificationWithContext } from '../charmSystem';
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
    // +777 points if at least one 7 is scored
    const hasSeven = context.selectedIndices.some(
      idx => context.roundState.diceHand[idx]?.rolledValue === 7
    );
    return {
      basePointsAdd: hasSeven ? 777 : 0
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
    // +500 PTS, +5 MLT, +0.5 EXP if all rolled dice have unique materials
    const materials = context.roundState.diceHand.map((die: Die) => die.material);
    const uniqueMaterials = new Set(materials);
    const allUnique = materials.length === uniqueMaterials.size;
    return {
      basePointsAdd: allUnique ? 500 : 0,
      multiplierAdd: allUnique ? 5 : 0,
      exponentAdd: allUnique ? 0.5 : 0
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
    // 3.1415x multiplier if scored hand contains 1,3,4,5
    const values = new Set(context.selectedIndices.map(
      idx => context.roundState.diceHand[idx]?.rolledValue
    ).filter(v => v !== undefined));
    
    // Check if values contain 1,3,4,5
    const hasPattern = values.has(1) && values.has(3) && values.has(4) && values.has(5);
    return {
      multiplierMultiply: hasPattern ? 3.1415 : 1
    };
  }
}

export class FerrisEulerCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // ^2.71 EXP if scored hand contains 1,2,7
    const values = new Set(context.selectedIndices.map(
      idx => context.roundState.diceHand[idx]?.rolledValue
    ).filter(v => v !== undefined));
    
    const hasPattern = values.has(1) && values.has(2) && values.has(7);
    return {
      exponentMultiply: hasPattern ? 2.71 : 1
    };
  }
}

export class FourForYourFavorCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +600 points when scoring four-of-a-kind
    const valueCounts: Record<number, number> = {};
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die && die.rolledValue !== undefined) {
        valueCounts[die.rolledValue] = (valueCounts[die.rolledValue] || 0) + 1;
      }
    }
    const hasFourOfAKind = Object.values(valueCounts).some(count => count >= 4);
    return {
      basePointsAdd: hasFourOfAKind ? 600 : 0
    };
  }
}

export class FiveAliveCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +800 points when scoring five-of-a-kind
    const valueCounts: Record<number, number> = {};
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die && die.rolledValue !== undefined) {
        valueCounts[die.rolledValue] = (valueCounts[die.rolledValue] || 0) + 1;
      }
    }
    const hasFiveOfAKind = Object.values(valueCounts).some(count => count >= 5);
    return {
      basePointsAdd: hasFiveOfAKind ? 800 : 0
    };
  }
}

export class SixShooterCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +1000 points when scoring six-of-a-kind
    const valueCounts: Record<number, number> = {};
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die && die.rolledValue !== undefined) {
        valueCounts[die.rolledValue] = (valueCounts[die.rolledValue] || 0) + 1;
      }
    }
    const hasSixOfAKind = Object.values(valueCounts).some(count => count >= 6);
    return {
      basePointsAdd: hasSixOfAKind ? 1000 : 0
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
    // +0.5 EXP when hot dice counter is 2 or higher
    const hotDiceCounter = context.roundState.hotDiceCounter || 0;
    return {
      exponentAdd: hotDiceCounter >= 2 ? 0.5 : 0
    };
  }
}

export class WildCardCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModificationWithContext[] {
    // +250 points for each wild pip effect in the scoring selection - return one modification per wild die
    const modifications: ScoringValueModificationWithContext[] = [];
    
    let wildDieNumber = 1;
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die) {
        const pipEffect = getPipEffectForDie(die);
        if (pipEffect === 'wild') {
          modifications.push({
            multiplierAdd: 1,
            triggerContext: {
              dieIndex: idx,
              description: `Wild Card (Wild Die #${wildDieNumber})`
            }
          });
          wildDieNumber++;
        }
      }
    }
    
    return modifications;
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
    // Consumables have a 15% chance to not be consumed when used
    // This is handled in trackConsumableUsage in consumableEffects.ts
    return {};
  }
}

export class DoubleAgentCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // No scoring effect - reroll multiplier is handled in getRerollBonus
    return {};
  }
  
  getRerollBonus(gameState: any): { add?: number; multiply?: number; override?: number } {
    // Doubles rerolls
    return { multiply: 2 };
  }
}

export class PuristCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // No scoring effect - bank/reroll modifiers are handled in getBankBonus and getRerollBonus
    return {};
  }
  
  getRerollBonus(gameState: any): { add?: number; multiply?: number; override?: number } {
    // Sets rerolls to 0 (overrides everything)
    return { override: 0 };
  }
  
  getBankBonus(gameState: any): { add?: number; multiply?: number } {
    // Doubles banks
    return { multiply: 2 };
  }
}

export class SnowballCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    return {};
  }
  
  onBank(context: CharmBankContext): number {
    // Multiplies level score by 1.15x when banking points
    return Math.floor(context.bankedPoints * 1.15);
  }
}

export class RabbitsFootCharm extends BaseCharm {
  // Call this from the material system when a Rainbow die triggers
  public incrementRainbowTrigger(gameState: any) {
    if (!gameState.history.charmState) {
      gameState.history.charmState = {};
    }
    if (!gameState.history.charmState.rabbitsFoot) {
      gameState.history.charmState.rabbitsFoot = { rainbowTriggers: 0 };
    }
    gameState.history.charmState.rabbitsFoot.rainbowTriggers++;
  }

  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +0.1x MLT per successful Rainbow die effect triggered (cumulative)
    const rainbowTriggers = context.gameState.history.charmState?.rabbitsFoot?.rainbowTriggers || 0;
    if (rainbowTriggers > 0) {
      const multiplierAdd = 0.1 * rainbowTriggers;
      return {
        multiplierAdd
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

export class RussianRouletteCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // ^EXP (exponent exponent - raises exponent to the power of exponent)
    // 1 in 6 chance of automatically flopping (roll 1-6, if 1 then flop)
    const roll = Math.floor(Math.random() * 6) + 1; // 1-6
    if (roll === 1) {
      // Trigger auto-flop by setting a flag in round state
      // This will be checked after scoring to force a flop
      (context.roundState as any).russianRouletteFlop = true;
    }
    
    return {
      exponentExponent: 1 // This means exponent^exponent
    };
  }
}

export class AssassinCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +1 MLT for each die destroyed (cumulative)
    // Track destroyed dice count in charmState
    const destroyedDice = context.gameState.history.charmState?.assassin?.destroyedDice || 0;
    
    return {
      multiplierAdd: destroyedDice
    };
  }
}

// Static function to track destroyed dice (called from consumableEffects)
export function incrementAssassinDestroyedDice(gameState: any) {
  if (!gameState.history.charmState) {
    gameState.history.charmState = {};
  }
  if (!gameState.history.charmState.assassin) {
    gameState.history.charmState.assassin = { destroyedDice: 0 };
  }
  gameState.history.charmState.assassin.destroyedDice = (gameState.history.charmState.assassin.destroyedDice || 0) + 1;
}

export class AceInTheHoleCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModificationWithContext[] {
    // +1 MLT for each scored 1 - return one modification per 1
    const modifications: ScoringValueModificationWithContext[] = [];
    
    let oneNumber = 1;
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die && die.rolledValue === 1) {
        modifications.push({
          multiplierAdd: 1,
          triggerContext: {
            dieIndex: idx,
            value: 1,
            description: `Ace in the Hole (Die #${oneNumber}: Value 1)`
          }
        });
        oneNumber++;
      }
    }
    
    return modifications;
  }
}

export class RuleOfThreeCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModificationWithContext[] {
    // +300 PTS for each scored 3 - return one modification per 3
    const modifications: ScoringValueModificationWithContext[] = [];
    
    let threeNumber = 1;
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die && die.rolledValue === 3) {
        modifications.push({
          basePointsAdd: 300,
          triggerContext: {
            dieIndex: idx,
            value: 3,
            description: `Rule of Three (Die #${threeNumber}: Value 3)`
          }
        });
        threeNumber++;
      }
    }
    
    return modifications;
  }
}

export class QuarterbackCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModificationWithContext[] {
    // +0.25 EXP for each scored 4 - return one modification per 4
    const modifications: ScoringValueModificationWithContext[] = [];
    
    let fourNumber = 1;
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die && die.rolledValue === 4) {
        modifications.push({
          exponentAdd: 0.25,
          triggerContext: {
            dieIndex: idx,
            value: 4,
            description: `Quarterback (Die #${fourNumber}: Value 4)`
          }
        });
        fourNumber++;
      }
    }
    
    return modifications;
  }
}

export class CincoDeRollioCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModificationWithContext[] {
    // +55 PTS, +0.5 MLT, and +0.05 EXP for each scored 5 - return one modification per 5
    const modifications: ScoringValueModificationWithContext[] = [];
    
    let fiveNumber = 1;
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die && die.rolledValue === 5) {
        modifications.push({
          basePointsAdd: 55,
          multiplierAdd: 0.5,
          exponentAdd: 0.05,
          triggerContext: {
            dieIndex: idx,
            value: 5,
            description: `Cinco de Rollio (Die #${fiveNumber}: Value 5)`
          }
        });
        fiveNumber++;
      }
    }
    
    return modifications;
  }
}

export class HexCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModificationWithContext[] {
    // +666 PTS for each scored 6, but 50% chance each is -666 PTS instead
    const modifications: ScoringValueModificationWithContext[] = [];
    
    let sixNumber = 1;
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die && die.rolledValue === 6) {
        // 50% chance for positive, 50% for negative
        const isPositive = Math.random() < 0.5;
        const points = isPositive ? 666 : -666;
        
        modifications.push({
          basePointsAdd: points,
          triggerContext: {
            dieIndex: idx,
            value: 6,
            description: `Hex (Die #${sixNumber}: Value 6, ${isPositive ? '+' : '-'}666 PTS)`
          }
        });
        sixNumber++;
      }
    }
    
    return modifications;
  }
}

export class BotoxCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +2 MLT when scoring only Plastic dice
    const allPlastic = context.selectedIndices.every(idx => {
      const die = context.roundState.diceHand[idx];
      return die && die.material === 'plastic';
    });
    return {
      multiplierAdd: allPlastic && context.selectedIndices.length > 0 ? 2 : 0
    };
  }
}

export class BattingTheCycleCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +4 MLT when scoring, once a 1, 2, 3, and 4 have been scored in the Round
    // Track scored values in round state
    if (!context.roundState.scoredValuesInRound) {
      context.roundState.scoredValuesInRound = [];
    }
    
    // Collect unique values from this scoring
    const valuesScoredThisTime = new Set<number>();
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die && die.rolledValue !== undefined) {
        valuesScoredThisTime.add(die.rolledValue);
      }
    }
    
    // Add new values to the tracked list (before checking if cycle is complete)
    for (const value of valuesScoredThisTime) {
      if (!context.roundState.scoredValuesInRound.includes(value)) {
        context.roundState.scoredValuesInRound.push(value);
      }
    }
    
    // Check if we have 1, 2, 3, and 4 all scored
    const hasOne = context.roundState.scoredValuesInRound.includes(1);
    const hasTwo = context.roundState.scoredValuesInRound.includes(2);
    const hasThree = context.roundState.scoredValuesInRound.includes(3);
    const hasFour = context.roundState.scoredValuesInRound.includes(4);
    
    // Check if cycle is complete (all four are present)
    const cycleComplete = hasOne && hasTwo && hasThree && hasFour;
    
    // Give bonus every time you score once the cycle is complete
    if (cycleComplete) {
      return {
        multiplierAdd: 4
      };
    }
    
    return {};
  }
  
  onRoundStart(context: CharmRoundStartContext): void {
    // Reset tracking at the start of each round
    if (context.roundState) {
      context.roundState.scoredValuesInRound = [];
    }
  }
}

export class AgainstTheGrainCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +750 PTS when scoring a Straight, Pyramid, or n=3+ Pairs with a mirror die
    const hasMirror = context.selectedIndices.some(idx => {
      const die = context.roundState.diceHand[idx];
      return die && die.material === 'mirror';
    });
    
    if (!hasMirror) return {};
    
    // Check for Straight
    const hasStraight = context.combinations.some(
      combo => combo.type === 'straight' || combo.type === 'straightOfN'
    );
    
    // Check for Pyramid
    const hasPyramid = context.combinations.some(
      combo => combo.type === 'pyramid'
    );
    
    // Check for n=3+ Pairs
    const hasThreePlusPairs = context.combinations.some(
      combo => combo.type === 'nPairs' && (combo.n || 0) >= 3
    );
    
    const qualifies = hasStraight || hasPyramid || hasThreePlusPairs;
    return {
      basePointsAdd: qualifies ? 750 : 0
    };
  }
}

