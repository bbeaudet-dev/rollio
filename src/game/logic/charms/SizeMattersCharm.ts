import { BaseCharm, CharmScoringContext } from '../../logic/charmSystem';
import { getSizeMultiplier } from '../../utils/dieSizeUtils';

export class SizeMattersCharm extends BaseCharm {
  onScoring(context: CharmScoringContext): number {
    // Calculate size multiplier for all dice in the scoring selection
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
    
    if (diceCount === 0) return 0;
    
    // Return the average multiplier effect
    const averageMultiplier = totalMultiplier / diceCount;
    const multiplierEffect = (averageMultiplier - 1) * context.basePoints;
    
    return Math.ceil(multiplierEffect);
  }
} 