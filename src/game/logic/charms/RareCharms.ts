import { BaseCharm, CharmScoringContext, CharmFlopContext, CharmBankContext, ScoringValueModification } from '../charmSystem';
import { getPipEffectForDie } from '../pipEffectSystem';
import { getSizeMultiplier } from '../../utils/dieSizeUtils';
import { getPyramidLayers } from '../../data/combinations';

/**
 * Rare Charms Implementation
 * 
 * NOTE: Some charms are skipped because they require systems not yet implemented:
 * - blankSlate: Needs pip effect modification system
 * - leadTitan: Needs dice removal modification system
 * - bodyDouble: Needs hot dice trigger tracking with ghost dice
 * - inheritance: Needs rainbow effect guarantee system
 * - resonance: Needs crystal bounce effect system
 * - bloom: Needs flower counter system
 * - mustBeThisTallToRide: Needs charm position tracking
 * - queensGambit: Needs dice set size tracking and dice removal tracking
 * - shootingStar: Needs consumable use tracking
 */

// ============================================================================
// SCORING CHARMS
// ============================================================================

export class KingslayerCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // 3x multiplier during miniboss and boss levels
    const isBoss = context.gameState.currentLevel?.isMiniboss || context.gameState.currentLevel?.isMainBoss;
    return {
      multiplierMultiply: isBoss ? 3 : 1
    };
  }
}

export class DoubleDownCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // 2x MLT for each two-faced effect scored
    // Count how many two-faced effects are scored
    let twoFacedCount = 0;
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die) {
        const pipEffect = getPipEffectForDie(die);
        if (pipEffect === 'twoFaced') {
          twoFacedCount++;
        }
      }
    }
    // Multiply by 2 for each two-faced effect (2^count)
    const multiplier = twoFacedCount > 0 ? Math.pow(2, twoFacedCount) : 1;
    return {
      multiplierMultiply: multiplier
    };
  }
}

export class PerfectionistCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +0.25x MLT for each consecutive time all dice are scored
    // Resets if not all dice are scored
    // Track in charmState
    if (!context.gameState.history.charmState) {
      context.gameState.history.charmState = {};
    }
    if (!context.gameState.history.charmState.perfectionist) {
      context.gameState.history.charmState.perfectionist = { consecutiveAllDiceScored: 0 };
    }
    
    // Check if all dice in hand were scored
    const allDiceScored = context.selectedIndices.length === context.roundState.diceHand.length;
    
    if (allDiceScored) {
      context.gameState.history.charmState.perfectionist.consecutiveAllDiceScored = 
        (context.gameState.history.charmState.perfectionist.consecutiveAllDiceScored || 0) + 1;
    } else {
      // Reset if not all dice scored
      context.gameState.history.charmState.perfectionist.consecutiveAllDiceScored = 0;
    }
    
    const consecutiveCount = context.gameState.history.charmState.perfectionist.consecutiveAllDiceScored || 0;
    const multiplierBonus = consecutiveCount * 0.25;
    
    return {
      multiplierAdd: multiplierBonus
    };
  }
}

export class DivineInterventionCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // No scoring effect
    return {};
  }

  onFlop(context: CharmFlopContext): boolean | { prevented: boolean, log?: string } | void {
    // 80% chance to prevent all flops
    if (Math.random() < 0.8) {
      return {
        prevented: true,
        log: '\n🛡️ Divine Intervention prevented flop!'
      };
    }
    return false;
  }
}

export class HolyGrailCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +2x multiplier for each Tier 3 Blessing you own
    const tier3Blessings = (context.gameState.blessings || []).filter(
      (b: any) => b.tier === 3
    );
    const tier3Count = tier3Blessings.length;
    return {
      multiplierAdd: tier3Count * 2
    };
  }
}

export class DivineFavorCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // No scoring effect
    return {};
  }

  onBank(context: CharmBankContext): number {
    // +10 / +100 / +1000 points when banking for each blessing tier 1 / 2 / 3 you own
    const blessings = context.gameState.blessings || [];
    const tier1Count = blessings.filter((b: any) => b.tier === 1).length;
    const tier2Count = blessings.filter((b: any) => b.tier === 2).length;
    const tier3Count = blessings.filter((b: any) => b.tier === 3).length;
    
    const bonus = (tier1Count * 10) + (tier2Count * 100) + (tier3Count * 1000);
    return Math.floor(context.bankedPoints + bonus);
  }
}

export class DukeOfDiceCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +0.75x multiplier for each repeated value on each scored die
    // Check each die's allowedValues (sides) for repeated values
    // A repeated value means the same value appears multiple times in the die's allowedValues array
    let totalRepeatedValues = 0;
    
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (!die || !die.allowedValues) continue;
      
      // Count occurrences of each value in the die's allowedValues
      const valueCounts: Record<number, number> = {};
      for (const value of die.allowedValues) {
        valueCounts[value] = (valueCounts[value] || 0) + 1;
      }
      
      // Count how many values appear more than once (are repeated)
      const repeatedCount = Object.values(valueCounts).filter(count => count > 1).length;
      totalRepeatedValues += repeatedCount;
    }
    
    return {
      multiplierAdd: totalRepeatedValues * 0.75
    };
  }
}

export class EyeOfHorusCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +1.5x multiplier for each layer of a scored Pyramid, 0.25x for all other hands
    const pyramidCombo = context.combinations.find(combo => combo.type === 'pyramidOfN');
    if (pyramidCombo) {
      // Use getPyramidLayers to get the number of layers
      const n = pyramidCombo.dice.length;
      const layers = getPyramidLayers(n);
      
      // Multiply by 1.5 for each layer
      const multiplier = Math.pow(1.5, layers);
      return {
        multiplierMultiply: multiplier
      };
    } else {
      return {
        multiplierMultiply: 0.25
      };
    }
  }
}

export class ArmadilloArmorCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +1x multiplier for each reroll remaining
    const rerollsRemaining = context.gameState.currentLevel?.rerollsRemaining || 0;
    return {
      multiplierAdd: rerollsRemaining
    };
  }
}

export class VesuviusCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +0.25x multiplier per volcano die × hot dice counter
    const volcanoCount = context.selectedIndices.filter(
      idx => context.roundState.diceHand[idx]?.material === 'volcano'
    ).length;
    const hotDiceCounter = context.roundState.hotDiceCounter || 0;
    const multiplierBonus = 0.25 * volcanoCount * hotDiceCounter;
    return {
      multiplierAdd: multiplierBonus
    };
  }
}

export class ShootingStarCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // Using a whim has a 10% chance to create a random wish
    // TODO: Needs consumable use tracking system
    // This would need to hook into the consumable use logic
    return {};
  }
}

export class BlankSlateCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // Blank pip effects give ^1.5 EXP instead of ^1.1
    // This is handled in pipEffectSystem.ts - the charm is checked when applying blank pip effects
    return {};
  }
}

export class LeadTitanCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // Each scored Lead die gives ^1.1 EXP (exponent multiplication)
    const leadCount = context.selectedIndices.filter(
      idx => context.roundState.diceHand[idx]?.material === 'lead'
    ).length;
    
    if (leadCount > 0) {
      // Multiply exponent by 1.1 for each lead die
      // If we have 2 lead dice, that's 1.1 * 1.1 = 1.21x exponent
      const exponentMultiplier = Math.pow(1.1, leadCount);
      return {
        exponentMultiply: exponentMultiplier
      };
    }
    
    return {};
  }
}

export class BodyDoubleCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +1 to Hot Dice counter when getting Hot Dice with an unscored Ghost Die
    // TODO: Needs hot dice trigger tracking with ghost dice
    // This would need to hook into the hot dice detection logic
    return {};
  }
}

export class InheritanceCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // One Rainbow effect guaranteed per Rainbow die scored
    // TODO: Needs rainbow effect guarantee system
    // This would need to modify how rainbow material effects are applied
    return {};
  }
}

export class ResonanceCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // 1 in 3 chance for crystal dice to bounce off of each other, repeating effect until failure
    // TODO: Needs crystal bounce effect system
    // This would need to modify how crystal material effects are applied
    return {};
  }
}

export class BloomCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // Each flower die scored adds 3 to flower dice counter
    // Track in roundState (resets each round, not per level)
    const roundState = context.roundState;
    const currentFlowerCounter = roundState.flowerCounter || 0;
    
    // Count flower dice in this scoring selection
    const flowerDiceScored = context.selectedIndices.filter(idx => {
      const die = roundState.diceHand[idx];
      return die && die.material === 'flower';
    }).length;
    
    // Calculate new counter value (will be persisted by the caller)
    const newFlowerCounter = currentFlowerCounter + (flowerDiceScored * 3);
    
    // Update roundState immutably (this will be handled by the scoring system)
    // For now, we just track it - the actual state update happens in the scoring flow
    // TODO: Apply multiplier based on newFlowerCounter
    // The multiplier should be based on the counter value after this scoring
    // For now, just track the counter - multiplier logic can be added later
    
    return {};
  }
}

export class MustBeThisTallToRideCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +2 EXP if current level is 10 or higher
    const levelNumber = context.gameState.currentWorld?.currentLevel?.levelNumber || 0;
    if (levelNumber >= 10) {
      return {
        exponentAdd: 2
      };
    }
    return {};
  }
}

export class QueensGambitCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +3 MLT for each die below set's starting size in your full set
    const originalDiceSetSize = context.gameState.config.diceSetConfig.dice.length;
    const currentDiceSetSize = context.gameState.diceSet.length;
    const diceRemoved = originalDiceSetSize - currentDiceSetSize;
    
    if (diceRemoved > 0) {
      return {
        multiplierAdd: diceRemoved * 3
      };
    }
    
    return {};
  }
}

export class FlopCollectorCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // Gains +50 points per flop. Each flop increases the bonus by +50 points
    const flopCount = context.gameState.flopCollectorFlops || 0;
    const bonus = flopCount * 50;
    
    if (bonus > 0) {
      // Add a log entry for this charm
      if (!context.gameState.flopCollectorLogs) {
        context.gameState.flopCollectorLogs = [];
      }
      context.gameState.flopCollectorLogs.push(`Flop Collector: +${bonus} points (${flopCount} flops)`);
    }
    
    return {
      basePointsDelta: bonus
    };
  }

  onFlop(context: CharmFlopContext): void {
    // This charm triggers even when Flop Shield prevents the flop
    // We need to increment the flop counter for this charm's effect
    if (!context.gameState.flopCollectorFlops) {
      context.gameState.flopCollectorFlops = 0;
    }
    context.gameState.flopCollectorFlops++;
    
    // Add a log entry for the flop
    if (!context.gameState.flopCollectorLogs) {
      context.gameState.flopCollectorLogs = [];
    }
    context.gameState.flopCollectorLogs.push(`Flop Collector: Flop #${context.gameState.flopCollectorFlops} recorded`);
  }

  canUse(): boolean {
    return true; // Always active
  }
}

export class SizeMattersCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // Multiplier based on die size: 6 faces = 1x, below 6 = -0.5x per size, above 6 = +0.5x per size
    
    let totalMultiplier = 0;
    let diceCount = 0;
    
    for (const selectedIndex of context.selectedIndices) {
      const die = context.roundState.diceHand[selectedIndex];
      if (die) {
        const sizeMultiplier = getSizeMultiplier(die.sides);
        totalMultiplier += sizeMultiplier;
        diceCount++;
      }
    }
    
    if (diceCount === 0) return {};
    
    // Apply the average multiplier
    const averageMultiplier = totalMultiplier / diceCount;
    
    return {
      multiplierMultiply: averageMultiplier
    };
  }
}

export class BrotherhoodCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +1.5 MLT for each consecutive level without rerolling or flopping
    // Track in charmState
    const consecutiveLevels = context.gameState.history.charmState?.brotherhood?.consecutiveLevels || 0;
    
    return {
      multiplierAdd: consecutiveLevels * 1.5
    };
  }
}

export class RefineryCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // No scoring effect - this is a banking effect
    return {};
  }

  onBank(context: CharmBankContext): number {
    // Multiplies round score by 1.25x when using a reroll
    // Check if any reroll was used in this round by checking rollHistory
    const rollHistory = context.roundState.rollHistory || [];
    const usedReroll = rollHistory.some((roll: any) => roll.isReroll === true);
    
    if (usedReroll) {
      return Math.floor(context.bankedPoints * 1.25);
    }
    
    return context.bankedPoints;
  }
}

export class SleeperAgentCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // Copies the effect of the charm to the left after 100 dice have been scored
    // Check if activated (100+ dice scored)
    const totalDiceScored = context.gameState.history.charmState?.sleeperAgent?.totalDiceScored || 0;
    const isActivated = totalDiceScored >= 100;
    
    if (!isActivated) {
      return {};
    }
    
    // Copy effect of charm to the left
    if (context.charmManager) {
      const leftCharm = context.charmManager.getCharmToLeft(this.id);
      if (leftCharm && leftCharm.active) {
        // Apply the left charm's onScoring effect
        const leftCharmResult = leftCharm.onScoring(context);
        return leftCharmResult;
      }
    }
    
    return {};
  }
}

/**
 * Track dice scored for Sleeper Agent charm
 */
export function trackDiceScoredForSleeperAgent(gameState: any, diceCount: number): any {
  if (!gameState.history.charmState) {
    gameState.history.charmState = {};
  }
  if (!gameState.history.charmState.sleeperAgent) {
    gameState.history.charmState.sleeperAgent = { totalDiceScored: 0 };
  }
  gameState.history.charmState.sleeperAgent.totalDiceScored = 
    (gameState.history.charmState.sleeperAgent.totalDiceScored || 0) + diceCount;
  
  return gameState;
}

