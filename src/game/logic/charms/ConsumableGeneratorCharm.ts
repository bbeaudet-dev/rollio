import { BaseCharm, CharmRoundStartContext, CharmScoringContext } from '../../logic/charmSystem';
import { CONSUMABLES } from '../../data/consumables';

export class ConsumableGeneratorCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): number {
    return 0;
  }

  onRoundStart(context: CharmRoundStartContext): void {
    const { gameState } = context;
    const maxSlots = gameState.consumableSlots ?? 2;
    if (gameState.consumables.length < maxSlots) {
      // Pick a random consumable
      const idx = Math.floor(Math.random() * CONSUMABLES.length);
      const newConsumable = { ...CONSUMABLES[idx] };
      gameState.consumables.push(newConsumable);
    }
  }
} 