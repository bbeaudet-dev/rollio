import { BaseCharm, CharmScoringContext, ScoringValueModification } from '../charmSystem';

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
    // +2^n MLT where n is the highest value scored
    const highestValue = Math.max(
      ...context.selectedIndices.map(idx => context.roundState.diceHand[idx]?.rolledValue || 0)
    );
    
    if (highestValue > 0) {
      const multiplierToAdd = Math.pow(2, highestValue);
      return {
        multiplierAdd: multiplierToAdd  
      };
    }
    
    return {};
  }
}

export class DrumpfCardCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): ScoringValueModification {
    // 50/50 chance per score: either +1.5x or -1.5x multiplier for each other charm
    // Can become negative and lose points
    if (context.charmManager) {
        const allActiveCharms = context.charmManager.getActiveCharms();
        // Count other charms (excluding this one)
        const otherCharmsCount = allActiveCharms.filter((c: any) => c.id !== this.id).length;
      
      if (otherCharmsCount > 0) {
        // 50/50 chance per scoring event
        const isGood = Math.random() < 0.5;
        const multiplierPerCharm = isGood ? 1.5 : -1.5;
        const totalMultiplier = otherCharmsCount * multiplierPerCharm;
        
        return {
          multiplierAdd: totalMultiplier
        };
      }
    }
    
    return {};
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

