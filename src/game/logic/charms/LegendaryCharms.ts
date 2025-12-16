import { BaseCharm, CharmScoringContext, ScoringValueModification, ScoringValueModificationWithContext } from '../charmSystem';

/**
 * Legendary Charms Implementation
 * 
 * Legendary charms will be added here as they are implemented.
 */

// ============================================================================
// SCORING CHARMS
// ============================================================================

export class ParanoiaCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // Copies the effect of the charm to the left/right of this charm, alternating each roll
    // Track which side to copy in charmState
    if (!context.gameState.history.charmState) {
      context.gameState.history.charmState = {};
    }
    if (!context.gameState.history.charmState.paranoia) {
      context.gameState.history.charmState.paranoia = { copyFromLeft: true };
    }
    
    const copyFromLeft = context.gameState.history.charmState.paranoia.copyFromLeft;
    
    // Toggle for next time
    context.gameState.history.charmState.paranoia.copyFromLeft = !copyFromLeft;
    
    // Get the charm to copy from
    if (context.charmManager) {
      const charmToCopy = copyFromLeft 
        ? context.charmManager.getCharmToLeft(this.id)
        : context.charmManager.getCharmToRight(this.id);
      
      if (charmToCopy && charmToCopy.active) {
        // Apply the copied charm's onScoring effect
        const copiedResult = charmToCopy.onScoring(context);
        return copiedResult;
      }
    }
    
    return {};
  }
}

export class TrumpCardCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +1.5^n MLT where n is the highest value scored
    const highestValue = Math.max(
      ...context.selectedIndices.map(idx => context.roundState.diceHand[idx]?.rolledValue || 0)
    );
    
    if (highestValue > 0) {
      const multiplierToAdd = Math.pow(1.5, highestValue);
      return {
        multiplierAdd: multiplierToAdd  
      };
    }
    
    return {};
  }
}

export class DrumpfCardCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModificationWithContext[] {
    // 50/50 chance per score: either +1.5x or -1.5x multiplier for each other charm
    // Can become negative and lose points - return one modification per other charm
    const modifications: ScoringValueModificationWithContext[] = [];
    
    if (context.charmManager) {
      const allActiveCharms = context.charmManager.getActiveCharms();
      // Get other charms (excluding this one)
      const otherCharms = allActiveCharms.filter((c: any) => c.id !== this.id);
      
      if (otherCharms.length > 0) {
        // 50/50 chance per scoring event (same for all charms in this scoring event)
        const isGood = Math.random() < 0.5;
        const multiplierPerCharm = isGood ? 1.5 : -1.5;
        
        for (let i = 0; i < otherCharms.length; i++) {
          const charm = otherCharms[i];
          modifications.push({
            multiplierAdd: multiplierPerCharm,
            triggerContext: {
              description: `Drumpf Card (${charm.name}: ${multiplierPerCharm > 0 ? '+' : ''}${multiplierPerCharm}x MLT)`
            }
          });
        }
      }
    }
    
    return modifications;
  }
}

export class MatterhornCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +3 EXP (adds 3 to exponent)
    return {
      exponentAdd: 3
    };
  }
}

export class HedgeFundCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // +1 EXP for every $100 owned
    const money = context.gameState.money || 0;
    const expCount = Math.floor(money / 100);
    
    return {
      exponentAdd: expCount
    };
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

