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
    // TODO: Needs charm position tracking
    // This would need to know the position of charms in the charm array and track which side to copy
    return {};
  }
}

