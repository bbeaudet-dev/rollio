import { CharmRarity } from '../../types';
import { BaseCharm, CharmScoringContext, CharmFlopContext } from '../../logic/charmSystem';

export class FlopCollectorCharm extends BaseCharm {
  constructor() {
    super({
      id: 'flopCollector',
      name: 'Flop Collector',
      description: 'Gains +50 points per flop. Each flop increases the bonus by +50 points.',
      rarity: 'rare',
      active: true,
      uses: undefined // Infinite uses
    });
  }

  onScoring(context: CharmScoringContext): number {
    // Get the number of flops recorded by this charm
    const flopCount = context.gameState.flopCollectorFlops || 0;
    const bonus = flopCount * 50;
    
    if (bonus > 0) {
      // Add a log entry for this charm
      if (!context.gameState.flopCollectorLogs) {
        context.gameState.flopCollectorLogs = [];
      }
      context.gameState.flopCollectorLogs.push(`Flop Collector: +${bonus} points (${flopCount} flops)`);
    }
    
    return bonus;
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

  getLogs(): string[] {
    return [];
  }
} 