import { BaseCharm, CharmScoringContext, CharmFlopContext, CharmBankContext, ScoringValueModification, ScoringValueModificationWithContext } from '../charmSystem';
import { getPipEffectForDie } from '../pipEffectSystem';
import { getSizeMultiplier } from '../../utils/dieSizeUtils';
import { getPyramidLayers } from '../../data/combinations';
import { CHARMS } from '../../data/charms';

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
    // ^3 MLT (multiplier^3) during miniboss and boss levels
    const isBoss = context.gameState.currentLevel?.isMiniboss || context.gameState.currentLevel?.isMainBoss;
    return {
      multiplierExponent: isBoss ? 3 : 1
    };
  }
}

export class DoubleDownCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModificationWithContext[] {
    // 2x MLT for each two-faced effect scored - return one modification per two-faced die
    const modifications: ScoringValueModificationWithContext[] = [];
    
    let twoFacedNumber = 1;
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die) {
        const pipEffect = getPipEffectForDie(die);
        if (pipEffect === 'twoFaced') {
          modifications.push({
            multiplierMultiply: 2,
            triggerContext: {
              dieIndex: idx,
              description: `Double Down (Two-Faced Die #${twoFacedNumber}: ×2 MLT)`
            }
          });
          twoFacedNumber++;
        }
      }
    }
    
    return modifications;
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
    
    // Update description with current value
    const charm = context.gameState.charms.find((c: any) => c.id === this.id);
    if (charm) {
      const originalCharm = CHARMS.find((c: any) => c.id === this.id);
      const baseDescription = originalCharm?.description || charm.description;
      // Remove existing (Current: ...) if present, then add new one
      const descWithoutCurrent = baseDescription.replace(/\s*\(Current:.*?\)/, '');
      charm.description = `${descWithoutCurrent} (Current: +[${multiplierBonus.toFixed(2)}] MLT)`;
      this.description = charm.description;
    }
    
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
  onScoring(context: CharmScoringContext): ScoringValueModificationWithContext[] {
    // +2x multiplier for each Tier 3 Blessing you own - return one modification per blessing
    const modifications: ScoringValueModificationWithContext[] = [];
    const tier3Blessings = (context.gameState.blessings || []).filter(
      (b: any) => b.tier === 3
    );
    
    for (let i = 0; i < tier3Blessings.length; i++) {
      modifications.push({
        multiplierAdd: 2,
        triggerContext: {
          description: `Holy Grail (Tier 3 Blessing #${i + 1}: +2x MLT)`
        }
      });
    }
    
    return modifications;
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
  onScoring(context: CharmScoringContext): ScoringValueModificationWithContext[] {
    // +1x multiplier for each reroll remaining - return one modification per reroll
    const modifications: ScoringValueModificationWithContext[] = [];
    const rerollsRemaining = context.gameState.currentWorld?.currentLevel?.rerollsRemaining || 0;
    
    for (let i = 0; i < rerollsRemaining; i++) {
      modifications.push({
        multiplierAdd: 1,
        triggerContext: {
          description: `Armadillo Armor (Reroll #${i + 1} remaining: +1x MLT)`
        }
      });
    }
    
    return modifications;
  }
}

export class VesuviusCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModificationWithContext[] {
    // +0.25x multiplier per volcano die × hot dice counter - return one modification per volcano die
    const modifications: ScoringValueModificationWithContext[] = [];
    const hotDiceCounter = context.roundState.hotDiceCounter || 0;
    
    let volcanoDieNumber = 1;
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die?.material === 'volcano') {
        const multiplierPerDie = 0.25 * hotDiceCounter;
        modifications.push({
          multiplierAdd: multiplierPerDie,
          triggerContext: {
            dieIndex: idx,
            material: 'volcano',
            description: `Vesuvius (Volcano Die #${volcanoDieNumber}: +${multiplierPerDie.toFixed(2)}x MLT)`
          }
        });
        volcanoDieNumber++;
      }
    }
    
    return modifications;
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
  onScoring(context: CharmScoringContext): ScoringValueModificationWithContext[] {
    // Each scored Lead die gives ^1.1 EXP (exponent multiplication) - return one modification per lead die
    const modifications: ScoringValueModificationWithContext[] = [];
    
    let leadDieNumber = 1;
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die?.material === 'lead') {
        modifications.push({
          exponentMultiply: 1.1,
          triggerContext: {
            dieIndex: idx,
            material: 'lead',
            description: `Lead Titan (Lead Die #${leadDieNumber}: ^1.1 EXP)`
          }
        });
        leadDieNumber++;
      }
    }
    
    return modifications;
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
  onScoring(context: CharmScoringContext): ScoringValueModificationWithContext[] {
    // 1 in 3 chance for crystal dice to bounce off of each other, repeating effect until failure
    // Return one modification per crystal die that successfully bounces
    const modifications: ScoringValueModificationWithContext[] = [];
    
    // Find all crystal dice in the selection
    const crystalDice: number[] = [];
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die && die.material === 'crystal') {
        crystalDice.push(idx);
      }
    }
    
    // For each crystal die, 1 in 3 chance to bounce (repeat crystal effect)
    // Each bounce applies the crystal multiplier (1.5x)
    let bounceNumber = 1;
    for (const idx of crystalDice) {
      const roll = Math.random();
      if (roll < 1/3) {
        // Bounce successful - apply crystal effect again
        modifications.push({
          multiplierMultiply: 1.5,
          triggerContext: {
            dieIndex: idx,
            material: 'crystal',
            description: `Resonance (Crystal Bounce #${bounceNumber})`
          }
        });
        bounceNumber++;
        
        // Keep bouncing until failure (recursive chance)
        let continueBouncing = true;
        let bounceCount = 1;
        while (continueBouncing && bounceCount < 10) { // Limit to prevent infinite loops
          const nextRoll = Math.random();
          if (nextRoll < 1/3) {
            modifications.push({
              multiplierMultiply: 1.5,
              triggerContext: {
                dieIndex: idx,
                material: 'crystal',
                description: `Resonance (Crystal Bounce #${bounceNumber}, Chain ${bounceCount + 1})`
              }
            });
            bounceNumber++;
            bounceCount++;
          } else {
            continueBouncing = false;
          }
        }
      }
    }
    
    return modifications;
  }
}

export class BloomCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModificationWithContext[] {
    // Each flower die scored adds 3 to flower dice counter - return one modification per flower die
    const modifications: ScoringValueModificationWithContext[] = [];
    
    let flowerDieNumber = 1;
    for (const idx of context.selectedIndices) {
      const die = context.roundState.diceHand[idx];
      if (die?.material === 'flower') {
        // Each flower die adds 3 to counter (handled elsewhere)
        // For now, just create a step for visibility
        modifications.push({
          triggerContext: {
            dieIndex: idx,
            material: 'flower',
            description: `Bloom (Flower Die #${flowerDieNumber}: +3 to counter)`
          }
        });
        flowerDieNumber++;
      }
    }
    
    return modifications;
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
      basePointsAdd: bonus
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
    
    // Update description with current value
    const charm = context.gameState.charms.find((c: any) => c.id === this.id);
    if (charm) {
      const originalCharm = CHARMS.find((c: any) => c.id === this.id);
      const baseDescription = originalCharm?.description || charm.description;
      // Remove existing (Current: ...) if present, then add new one
      const descWithoutCurrent = baseDescription.replace(/\s*\(Current:.*?\)/, '');
      charm.description = `${descWithoutCurrent} (Current: +[${(consecutiveLevels * 1.5).toFixed(1)}] MLT)`;
      this.description = charm.description;
    }
    
    return {
      multiplierAdd: consecutiveLevels * 1.5
    };
  }
}

/**
 * Howl at the Moon
 * 
 * Behavior:
 * - Lunar dice retrigger their effects 2 additional times.
 * - The actual extra retriggers are implemented in pipEffectSystem based on this charm’s presence.
 * - This charm itself doesn’t modify scoring directly in onScoring.
 */
export class HowlAtTheMoonCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // All behavior is handled in pipEffectSystem.ts by checking for this charm's ID.
    return {};
  }
}

/**
 * Lunar Tides
 * 
 * Behavior:
 * - Reads how many Lunar trigger passes actually occurred this score
 *   (tracked by pipEffectSystem in gameState.history.charmState.lunar.triggersThisScore).
 * - Applies a 1.25x multiplier per Lunar trigger by multiplying MLT by 1.25^triggers.
 */
export class LunarTidesCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    const triggers =
      context.gameState.history?.charmState?.lunar?.triggersThisScore || 0;

    if (triggers <= 0) {
      return {};
    }

    const multiplier = Math.pow(1.25, triggers);

    return {
      multiplierMultiply: multiplier,
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


