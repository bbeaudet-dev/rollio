import { BaseCharm, CharmScoringContext, CharmBankContext, CharmFlopContext, CharmRoundStartContext, ScoringValueModification } from '../charmSystem';
import { Die, GameState } from '../../types';
import { getPipEffectForDie } from '../pipEffectSystem';
import { CHARMS } from '../../data/charms';
import { CONSUMABLES } from '../../data/consumables';

/**
 * Common Charms Implementation
 * 
 * NOTE: Some charms are skipped because they require systems not yet implemented:
 * - secondChance: Needs reroll granting system
 * - roundRobin: Needs "repeated hands" tracking in round
 * - oneSongGlory: Needs level completion tracking with bank count
 * - digitalNomad: Needs world completion tracking (every 5 levels)
 */

// ============================================================================
// SCORING CHARMS
// ============================================================================

export class FlopShieldCharm extends BaseCharm {
  constructor(charm: any) {
    super(charm);
    this.uses = 3;
  }

  onScoring(context: CharmScoringContext): ScoringValueModification {
    // Flop Shield doesn't modify scoring
    return {};
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

/**
 * Check if flop shield is available (without using it)
 * Standalone function that finds FlopShieldCharm from gameState and checks availability
 */
export function checkFlopShieldAvailable(gameState: GameState): { available: boolean, log: string | null } {
  const flopShieldCharm = gameState.charms?.find((charm: any) => 
    charm.id === 'flopShield' || charm.name === 'Flop Shield'
  ) as any;
  
  if (flopShieldCharm) {
    // Create a temporary instance to check if it can be used
    // We need to check if it has uses remaining without actually using it
    const uses = flopShieldCharm.uses;
    const hasUses = uses === undefined || uses === '∞' || (typeof uses === 'number' && uses > 0);
    
    if (hasUses) {
      const usesLeft = uses ?? '∞';
      return {
        available: true,
        log: `🛡️ Flop Shield available (${usesLeft} uses left)`
      };
    }
  }
  
  return { available: false, log: null };
}

export class MoneyMagnetCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +1 point for every $1 you have
    const money = context.gameState.money || 0;
    return {
      basePointsDelta: money
    };
  }
}

export class HighStakesCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // 2x scoring multiplier (but removes single 1 and single 5 as valid scoring combinations)
    return {
      multiplierMultiply: 2
    };
  }

  /**
   * Set points to 0 for single 1 and single 5 combinations to make them invalid
   */
  filterScoringCombinations(combinations: any[], context: CharmScoringContext): any[] {
    return combinations.map(combo => {
      if (combo.type === 'singleN') {
        // Check if it's a single 1 or single 5
        const dieIndex = combo.dice[0];
        const die = context.roundState.diceHand[dieIndex];
        if (die && (die.rolledValue === 1 || die.rolledValue === 5)) {
          return { ...combo, points: 0 };
        }
      }
      return combo;
    });
  }
}

export class LowHangingFruitCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // No direct point bonus, just enables single 3s
    return {};
  }

  /**
   * Add single 3 combinations to the scoring combinations
   * This is called during charm filtering, but the main logic is in charmUtils.shouldAllowSingleThrees()
   * which is called directly from findCombinations
   */
  filterScoringCombinations(combinations: any[], context: CharmScoringContext): any[] {
    // This is a fallback - the main logic is in findCombinations.ts using shouldAllowSingleThrees()
    // But we keep this for consistency
    return combinations;
  }
}

export class OddsAndEndsCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +25 points for each odd value scored
    let bonus = 0;
    for (const idx of context.selectedIndices) {
      const value = context.roundState.diceHand[idx]?.rolledValue;
      if (value && value % 2 === 1) {
        bonus += 25;
      }
    }
    return {
      basePointsDelta: bonus
    };
  }
}

export class NowWereEvenCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // If all selected dice are even, gain +150 points
    const allEven = context.selectedIndices.every(idx => {
      const value = context.roundState.diceHand[idx]?.rolledValue;
      return value && value % 2 === 0;
    });
    return {
      basePointsDelta: allEven && context.selectedIndices.length > 0 ? 150 : 0
    };
  }
}

export class NinetyEightPercentAPlusCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +10 points if scored dice includes a pair
    const valueCounts: Record<number, number> = {};
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die && die.rolledValue !== undefined) {
        valueCounts[die.rolledValue] = (valueCounts[die.rolledValue] || 0) + 1;
      }
    }
    const hasPair = Object.values(valueCounts).some(count => count >= 2);
    return {
      basePointsDelta: hasPair ? 10 : 0
    };
  }
}

export class OddOdysseyCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +0.25 points when scoring. Add +0.25 for each odd value scored (cumulative)
    // Find this charm in gameState to update its state
    const charm = context.gameState.charms.find((c: any) => c.id === this.id);
    if (!charm) return {};
    
    // Initialize state if needed
    if (charm.oddOdysseyBonus === undefined) {
      charm.oddOdysseyBonus = 0.25; // Starts at 0.25
    }
    
    // Count odd values in current selection
    let oddCount = 0;
    for (const idx of context.selectedIndices) {
      const value = context.roundState.diceHand[idx]?.rolledValue;
      if (value && value % 2 === 1) {
        oddCount++;
      }
    }
    
    // Apply current bonus
    const bonus = charm.oddOdysseyBonus;
    
    // Increase bonus for next time: +0.25 per odd value scored
    charm.oddOdysseyBonus += 0.25 * oddCount;
    
    // Update description
    const originalCharm = CHARMS.find((c: any) => c.id === this.id);
    const baseDescription = originalCharm?.description || charm.description;
    charm.description = baseDescription.replace(/^\+?\d+\.?\d*/, `+${charm.oddOdysseyBonus.toFixed(2)}`);
    this.description = charm.description; // Update instance description too
    
    return {
      basePointsDelta: Math.floor(bonus)
    };
  }
}

export class PairUpCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +20 points for each pair rolled
    const valueCounts: Record<number, number> = {};
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die && die.rolledValue !== undefined) {
        valueCounts[die.rolledValue] = (valueCounts[die.rolledValue] || 0) + 1;
      }
    }
    const pairCount = Object.values(valueCounts).reduce((sum, count) => sum + Math.floor(count / 2), 0);
    return {
      basePointsDelta: pairCount * 20
    };
  }
}

export class TripleThreatCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +50 points for each triplet rolled
    const valueCounts: Record<number, number> = {};
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die && die.rolledValue !== undefined) {
        valueCounts[die.rolledValue] = (valueCounts[die.rolledValue] || 0) + 1;
      }
    }
    const tripletCount = Object.values(valueCounts).reduce((sum, count) => sum + Math.floor(count / 3), 0);
    return {
      basePointsDelta: tripletCount * 50
    };
  }
}

export class DimeADozenCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +$3 if scored dice includes 6 of one value
    const valueCounts: Record<number, number> = {};
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die && die.rolledValue !== undefined) {
        valueCounts[die.rolledValue] = (valueCounts[die.rolledValue] || 0) + 1;
      }
    }
    const hasSixOfAKind = Object.values(valueCounts).some(count => count >= 6);
    if (hasSixOfAKind && context.gameState) {
      context.gameState.money = (context.gameState.money || 0) + 3;
    }
    return {};
  }
}

export class SandbaggerCharm extends BaseCharm {
  onFlop(context: CharmFlopContext): void {
    // +100 points when flopping (includes prevented flops)
    // Track bonus for scoring - flops happen before scoring, so we store it
    if (!context.gameState.sandbaggerBonus) {
      context.gameState.sandbaggerBonus = 0;
    }
    context.gameState.sandbaggerBonus += 100;
  }

  onScoring(context: CharmScoringContext): ScoringValueModification {
    // Apply any accumulated flop bonuses
    const bonus = context.gameState.sandbaggerBonus || 0;
    if (bonus > 0) {
      context.gameState.sandbaggerBonus = 0; // Reset after applying
      return {
        basePointsDelta: bonus
      };
    }
    return {};
  }
}

export class FlowerPowerCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +10 points for each flower die scored in current round
    // Count flowers scored in this round from rollHistory
    let flowerCount = 0;
    if (context.roundState && context.roundState.rollHistory) {
      for (const roll of context.roundState.rollHistory) {
        if (roll.scoringSelection && roll.scoringSelection.length > 0) {
          const scoredDice = roll.scoringSelection.map((idx: number) => roll.diceHand[idx]).filter(Boolean);
          flowerCount += scoredDice.filter((die: any) => die.material === 'flower').length;
        }
      }
    }
    // Also count flowers in current selection
    const currentFlowerCount = context.selectedIndices.filter(
      idx => context.roundState.diceHand[idx]?.material === 'flower'
    ).length;
    flowerCount += currentFlowerCount;
    
    return {
      basePointsDelta: flowerCount * 10
    };
  }
}

export class CrystalClearCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +75 points for each crystal die scored
    const crystalCount = context.selectedIndices.filter(
      idx => context.roundState.diceHand[idx]?.material === 'crystal'
    ).length;
    return {
      basePointsDelta: crystalCount * 75
    };
  }
}

export class GoldenTouchCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +$1 for each golden die scored
    const goldenCount = context.selectedIndices.filter(
      idx => context.roundState.diceHand[idx]?.material === 'golden'
    ).length;
    if (context.gameState && goldenCount > 0) {
      context.gameState.money = (context.gameState.money || 0) + goldenCount;
    }
    return {};
  }
}

export class StraightShooterCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +100 points when scoring a straight
    const hasStraight = context.combinations.some(
      combo => combo.type === 'straight' || combo.type === 'straightOfN'
    );
    return {
      basePointsDelta: hasStraight ? 100 : 0
    };
  }
}

export class LongshotCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +250 points when scoring a straight of 6 or longer
    const hasLongStraight = context.combinations.some(combo => {
      if (combo.type === 'straightOfN') {
        // Check if straight length is 6 or more
        const dice = combo.dice || [];
        return dice.length >= 6;
      }
      return false;
    });
    return {
      basePointsDelta: hasLongStraight ? 250 : 0
    };
  }
}

export class GhostWhispererCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +50 points for each unscored Ghost die; +10 points for each scored Ghost die
    const allGhostDice = context.roundState.diceHand.filter((die: Die) => die.material === 'ghost');
    const scoredGhostCount = context.selectedIndices.filter(
      idx => context.roundState.diceHand[idx]?.material === 'ghost'
    ).length;
    const unscoredGhostCount = allGhostDice.length - scoredGhostCount;
    
    return {
      basePointsDelta: (unscoredGhostCount * 50) + (scoredGhostCount * 10)
    };
  }
}

export class IronFortressCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // Each Lead die gives +15 points when scored
    const leadCount = context.selectedIndices.filter(
      idx => context.roundState.diceHand[idx]?.material === 'lead'
    ).length;
    return {
      basePointsDelta: leadCount * 15
    };
  }

  onFlop(context: CharmFlopContext): boolean | { prevented: boolean, log?: string } | void {
    // 5% chance to prevent flop
    const leadCount = context.roundState.diceHand.filter((die: Die) => die.material === 'lead').length;
    if (leadCount > 0 && Math.random() < 0.05) {
      return {
        prevented: true,
        log: '\n🛡️ Iron Fortress prevented flop!'
      };
    }
    return false;
  }
}

export class SolitaryCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // 2x multiplier if no repeated values scored
    const values = context.selectedIndices.map(
      idx => context.roundState.diceHand[idx]?.rolledValue
    ).filter(v => v !== undefined);
    const uniqueValues = new Set(values);
    const hasRepeats = values.length !== uniqueValues.size;
    
    if (!hasRepeats && values.length > 0) {
      return {
        multiplierMultiply: 2
      };
    }
    return {};
  }
}

export class MagicEightBallCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +200 points when scoring an 8+ sided die
    const hasLargeDie = context.selectedIndices.some(
      idx => (context.roundState.diceHand[idx]?.sides || 0) >= 8
    );
    return {
      basePointsDelta: hasLargeDie ? 200 : 0
    };
  }
}

export class HotDiceHeroCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +100 points for each Hot Dice trigger
    // Track hot dice count from roundState
    const hotDiceCount = context.roundState.hotDiceCounter || 0;
    return {
      basePointsDelta: hotDiceCount * 100
    };
  }
}

export class PipCollectorCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +10 points for each die with a pip effect in the scoring selection
    let pipEffectCount = 0;
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die) {
        const pipEffect = getPipEffectForDie(die);
        if (pipEffect !== 'none') {
          pipEffectCount++;
        }
      }
    }
    return {
      basePointsDelta: pipEffectCount * 10
    };
  }
}

// ============================================================================
// BANKING CHARMS
// ============================================================================

export class StairstepperCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +20 points when scoring. Add +20 per straight played (cumulative)
    // Find this charm in gameState to update its state
    const charm = context.gameState.charms.find((c: any) => c.id === this.id);
    if (!charm) return {};
    
    // Initialize state if needed
    if (charm.stairstepperCount === undefined) {
      charm.stairstepperCount = 0; // Number of straights played
      charm.stairstepperBonus = 20; // Current bonus (starts at 20)
    }
    
    // Check if this scoring includes a straight
    const hasStraight = context.combinations.some(
      combo => combo.type === 'straight' || combo.type === 'straightOfN'
    );
    
    // Apply current bonus
    const bonus = charm.stairstepperBonus;
    
    // If straight was played, increase count and bonus for next time
    if (hasStraight) {
      charm.stairstepperCount++;
      charm.stairstepperBonus += 20; // Increase by 20 for next time
    }
    
    // Update description
    const originalCharm = CHARMS.find((c: any) => c.id === this.id);
    const baseDescription = originalCharm?.description || charm.description;
    charm.description = baseDescription.replace(/^\+?\d+/, `+${charm.stairstepperBonus}`);
    this.description = charm.description; // Update instance description too
    
    return {
      basePointsDelta: bonus
    };
  }
}

export class RerollRangerCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +5 points when scoring. Add +5 for each reroll used (cumulative)
    // Find this charm in gameState to update its state
    const charm = context.gameState.charms.find((c: any) => c.id === this.id);
    if (!charm) return {};
    
    // Initialize state if needed
    if (charm.rerollRangerBonus === undefined) {
      charm.rerollRangerBonus = 5; // Starts at 5
    }
    
    // Count rerolls used in this round (before this scoring)
    const rerollsUsed = context.roundState.rollHistory?.filter((roll: any) => roll.isReroll).length || 0;
    
    // Apply current bonus
    const bonus = charm.rerollRangerBonus;
    
    // Increase bonus for next time: +5 per reroll used
    charm.rerollRangerBonus += 5 * rerollsUsed;
    
    // Update description
    const originalCharm = CHARMS.find((c: any) => c.id === this.id);
    const baseDescription = originalCharm?.description || charm.description;
    charm.description = baseDescription.replace(/^\+?\d+/, `+${charm.rerollRangerBonus}`);
    this.description = charm.description; // Update instance description too
    
    return {
      basePointsDelta: bonus
    };
  }
}

export class BankBaronCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +5 points when scoring. Add +5 for each bank (cumulative)
    // Find this charm in gameState to update its state
    const charm = context.gameState.charms.find((c: any) => c.id === this.id);
    if (!charm) return {};
    
    // Initialize state if needed
    if (charm.bankBaronBonus === undefined) {
      charm.bankBaronBonus = 5; // Starts at 5
    }
    
    // Apply current bonus
    const bonus = charm.bankBaronBonus;
    
    // Note: Bank count is incremented in processBankPoints, so we'll update bonus there
    // For now, just apply the current bonus
    
    // Update description
    const originalCharm = CHARMS.find((c: any) => c.id === this.id);
    const baseDescription = originalCharm?.description || charm.description;
    charm.description = baseDescription.replace(/^\+?\d+/, `+${charm.bankBaronBonus}`);
    this.description = charm.description; // Update instance description too
    
    return {
      basePointsDelta: bonus
    };
  }
  
  onBank(context: CharmBankContext): number {
    // Increment bonus for next scoring after banking
    const charm = context.gameState.charms.find((c: any) => c.id === this.id);
    if (charm) {
      if (charm.bankBaronBonus === undefined) {
        charm.bankBaronBonus = 5;
      }
      charm.bankBaronBonus += 5; // Increase by 5 for next time
      
      // Update description
      const originalCharm = CHARMS.find((c: any) => c.id === this.id);
      const baseDescription = originalCharm?.description || charm.description;
      charm.description = baseDescription.replace(/^\+?\d+/, `+${charm.bankBaronBonus}`);
    }
    return context.bankedPoints; // Don't modify banked points, bonus is applied on scoring
  }
}

export class PointPirateCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // No scoring effect
    return {};
  }

  onBank(context: CharmBankContext): number {
    // Track first bank in gameState
    if (!context.gameState.pointPirateFirstBank) {
      // +500 points on first bank
      context.gameState.pointPirateFirstBank = true;
      return Math.floor(context.bankedPoints + 500);
    } else {
      // -10 points per subsequent roll
      // Count rolls from round history
      const rollCount = context.roundState.rollHistory?.length || 0;
      const penalty = rollCount * 10;
      return Math.max(0, Math.floor(context.bankedPoints - penalty));
    }
  }
}

export class BlessedCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // No scoring effect
    return {};
  }

  onBank(context: CharmBankContext): number {
    // +25 points when banking if you have at least one blessing
    const hasBlessing = context.gameState.blessings && context.gameState.blessings.length > 0;
    return hasBlessing ? Math.floor(context.bankedPoints + 25) : context.bankedPoints;
  }
}

export class BlessYouCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // No scoring effect
    return {};
  }

  onFlop(context: CharmFlopContext): void {
    // 25% of forfeited points recovered when flopping
    const forfeitedPoints = context.roundState.forfeitedPoints || 0;
    const recovered = Math.floor(forfeitedPoints * 0.25);
    if (recovered > 0 && context.gameState) {
      // Add recovered points back to round points
      context.roundState.roundPoints = (context.roundState.roundPoints || 0) + recovered;
    }
  }
}

// ============================================================================
// FLOP CHARMS
// ============================================================================

export class AngelInvestorCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // No scoring effect
    return {};
  }

  onFlop(context: CharmFlopContext): void {
    // +$1 for each flop
    if (context.gameState) {
      context.gameState.money = (context.gameState.money || 0) + 1;
    }
  }
}

export class SureShotCharm extends BaseCharm {
  onFlop(context: CharmFlopContext): boolean | { prevented: boolean, log?: string } | void {
    // +1 reroll and +100 points when rolling no scoring combinations
    // This triggers on flop, so we grant reroll and points
    if (context.gameState?.currentWorld?.currentLevel) {
      context.gameState.currentWorld.currentLevel.rerollsRemaining = 
        (context.gameState.currentWorld.currentLevel.rerollsRemaining || 0) + 1;
    }
    // Track bonus for scoring
    if (!context.gameState.sureShotBonus) {
      context.gameState.sureShotBonus = 0;
    }
    context.gameState.sureShotBonus += 100;
    return false; // Don't prevent flop, just grant bonus
  }

  onScoring(context: CharmScoringContext): ScoringValueModification {
    // Apply any accumulated bonuses
    const bonus = context.gameState.sureShotBonus || 0;
    if (bonus > 0) {
      context.gameState.sureShotBonus = 0; // Reset after applying
      return {
        basePointsDelta: bonus
      };
    }
    return {};
  }
}

export class FlopStrategistCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // Apply any accumulated bonuses
    const bonus = context.gameState.flopStrategistBonus || 0;
    if (bonus > 0) {
      context.gameState.flopStrategistBonus = 0; // Reset after applying
      return {
        basePointsDelta: bonus
      };
    }
    return {};
  }

  onFlop(context: CharmFlopContext): boolean | { prevented: boolean, log?: string } | void {
    // +100 points for flopping with remaining reroll(s)
    const hasRerolls = (context.gameState.currentWorld?.currentLevel?.rerollsRemaining || 0) > 0;
    if (hasRerolls) {
      // Track bonus for scoring
      if (!context.gameState.flopStrategistBonus) {
        context.gameState.flopStrategistBonus = 0;
      }
      context.gameState.flopStrategistBonus += 100;
    }
    return false; // Don't prevent flop
  }
}

// ============================================================================
// CONSUMABLE GENERATION CHARMS
// ============================================================================

export class GeneratorCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // Creates a random consumable when scoring 3 or more pairs
    const valueCounts: Record<number, number> = {};
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die && die.rolledValue !== undefined) {
        valueCounts[die.rolledValue] = (valueCounts[die.rolledValue] || 0) + 1;
      }
    }
    const pairCount = Object.values(valueCounts).reduce((sum, count) => sum + Math.floor(count / 2), 0);
    
    if (pairCount >= 3 && context.gameState) {
      const maxSlots = context.gameState.consumableSlots ?? 2;
      if (context.gameState.consumables.length < maxSlots) {
        const idx = Math.floor(Math.random() * CONSUMABLES.length);
        const newConsumable = { ...CONSUMABLES[idx] };
        context.gameState.consumables.push(newConsumable);
      }
    }
    return {};
  }
}

export class SecondChanceCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // No scoring effect - reroll bonus is handled in getRerollBonus
    return {};
  }
  
  getRerollBonus(gameState: any): { add?: number; multiply?: number; override?: number } {
    // +1 reroll per level
    return { add: 1 };
  }
}

export class RoundRobinCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +150 points when banking if no repeated hands scored in round
    // This is checked in onBank, not onScoring
    return {};
  }

  onBank(context: CharmBankContext): number {
    // +150 points when banking if no repeated hands scored in round
    // Check rollHistory for repeated combinations
    const rollHistory = context.roundState.rollHistory || [];
    const combinationTypesSeen = new Set<string>();
    let hasRepeats = false;
    
    for (const roll of rollHistory) {
      if (roll.combinations && roll.combinations.length > 0) {
        // Create a signature for this combination set (sorted combination types)
        const comboSignature = roll.combinations
          .map((c: any) => c.type || c)
          .sort()
          .join(',');
        
        if (combinationTypesSeen.has(comboSignature)) {
          hasRepeats = true;
          break;
        }
        combinationTypesSeen.add(comboSignature);
      }
    }
    
    if (!hasRepeats && combinationTypesSeen.size > 0) {
      return Math.floor(context.bankedPoints + 150);
    }
    
    return context.bankedPoints;
  }
}

export class OneSongGloryCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // No scoring effect - money is added on level completion
    return {};
  }
  
  /**
   * Calculate level completion bonus for this charm
   * Called from tallying system when calculating level rewards
   */
  calculateLevelCompletionBonus(levelNumber: number, levelState: any, gameState: any): number {
    // +$5 for completing a level with a single bank
    if (levelState.banksUsed === 1) {
      return 5;
    }
    return 0;
  }
}

export class DigitalNomadCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // No scoring effect - money is added on world completion
    return {};
  }
  
  /**
   * Calculate world completion bonus for this charm
   * Called from advanceToNextWorld when completing a world (every 5 levels: 5, 10, 15, etc.)
   */
  calculateWorldCompletionBonus(completedLevelNumber: number, levelState: any, gameState: any): number {
    // +$10 when completing a world (every 5 levels: 5, 10, 15, etc.)
    return 10;
  }
}

export class HoarderCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // No scoring effect - bank bonus is handled in getBankBonus
    return {};
  }
  
  getBankBonus(gameState: any): { add?: number; multiply?: number } {
    // +2 banks
    return { add: 2 };
  }
}

export class ComebackKidCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // No scoring effect - reroll bonus is handled in getRerollBonus
    return {};
  }
  
  getRerollBonus(gameState: any): { add?: number; multiply?: number; override?: number } {
    // +3 rerolls
    return { add: 3 };
  }
}

