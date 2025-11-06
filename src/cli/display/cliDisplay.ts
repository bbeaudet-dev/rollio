import { Die, ScoringCombination } from '../../game/types';
import { MATERIALS } from '../../game/data/materials';

/**
 * CLI-specific display formatting utilities
 * Contains all CLI-specific formatting logic separated from general display functions
 */
export class CLIDisplayFormatter {
  /**
   * CLI-specific: Format material effect logs with base/final points
   */
  static formatMaterialEffectLogs(base: number, final: number, logs: string[]): string[] {
    const result: string[] = [];
    result.push(`🎨 MATERIAL SUMMARY`);
    if (logs.length > 0) result.push(...logs.map(log => `  ${log}`));
    result.push(`  Starting ${base} → Final ${final} points`);
    return result;
  }

  /**
   * CLI-specific: Format charm effect logs from charm results array
   */
  static formatCharmEffectLogsFromResults(basePoints: number, charmResults: Array<{ name: string, effect: number, uses: number | undefined, logs?: string[] }>, finalPoints: number): string[] {
    const logs: string[] = [];
    logs.push(`🎭 CHARM SUMMARY`);
    for (const { name, effect, uses, logs: charmLogs } of charmResults) {
      let usesStr = uses === 0 ? '0 uses left' : (uses == null ? '∞ uses left' : `${uses} uses left`);
      logs.push(`  ${name}: +${effect} points (${usesStr})`);
      if (charmLogs && charmLogs.length > 0) {
        logs.push(...charmLogs.map(l => `    ${l}`));
      }
    }
    logs.push(`  Starting ${basePoints} → Final ${finalPoints} points`);
    return logs;
  }

  /**
   * CLI-specific: Format combination summary
   */
  static formatCombinationSummary(selectedIndices: number[], dice: Die[], combinations: ScoringCombination[], partitioningInfo?: string, partitioningInfoLines?: string[]): string {
    const diceValues = dice.map(die => die.rolledValue!);
    const result = [`🎯 COMBINATIONS: Highest points: ${combinations.reduce((max, c) => Math.max(max, c.points), 0)}`];
    
    if (combinations.length > 0) {
      // Group by combination type
      const grouped: Record<string, { values: number[]; indices: number[] }> = {};
      combinations.forEach(c => {
        if (!grouped[c.type]) grouped[c.type] = { values: [], indices: [] };
        grouped[c.type].values.push(...c.dice.map(i => diceValues[i]));
        grouped[c.type].indices.push(...c.dice.map(i => i + 1));
      });
      
      // Format grouped combinations
      for (const [type, { values, indices }] of Object.entries(grouped)) {
        const points = combinations.find(c => c.type === type)?.points || 0;
        result.push(`  ${type}: [${values.join(', ')}] (dice ${indices.join(', ')}) - ${points} points`);
      }
    }
    
    if (partitioningInfoLines && partitioningInfoLines.length > 0) {
      result.push(...partitioningInfoLines.map(line => `  ${line}`));
    }
    
    return result.join('\n');
  }

  /**
   * Format roll summary for CLI
   */
  static formatRollSummary(
    rollNumber: number,
    pointsAdded: number,
    roundPoints: number,
    hotDiceCounter: number,
  ): string {
    const hotDiceText = hotDiceCounter > 0 ? ` (Hot Dice: ${hotDiceCounter})` : '';
    return `Roll ${rollNumber}: +${pointsAdded} points | Round Points: ${roundPoints}${hotDiceText}`;
  }

  /**
   * Format end of round summary
   */
  static formatEndOfRoundSummary(
    roundPoints: number,
    roundNumber: number,
    isFlop: boolean,
    consecutiveFlops: number,
    livesRemaining: number
  ): string[] {
    const pointsLabel = isFlop ? 'Points Forfeited' : 'Points Scored';
    const lines = [
      `=== Round ${roundNumber} Complete ===`,
      `${pointsLabel}: ${roundPoints}`,
      `Consecutive Flops: ${consecutiveFlops}`,
      `Lives Remaining: ${livesRemaining}`,
      `---`
    ];
    return lines;
  }
  
  /**
   * Format tallying screen
   */
  static formatTallyingScreen(
    levelNumber: number,
    baseReward: number,
    livesBonus: number,
    livesRemaining: number,
    charmBonuses: number,
    blessingBonuses: number,
    total: number
  ): string[] {
    const lines: string[] = [];
    lines.push(`=== LEVEL ${levelNumber} COMPLETE! ===`);
    lines.push('');
    lines.push(`Money Earned:`);
    lines.push(`  - Level completion: $${baseReward}`);
    if (livesRemaining > 0) {
      lines.push(`  - Unused lives (${livesRemaining}): +$${livesBonus}`);
    }
    if (charmBonuses > 0) {
      lines.push(`  - Charm bonuses: +$${charmBonuses}`);
    }
    if (blessingBonuses > 0) {
      lines.push(`  - Blessing bonuses: +$${blessingBonuses}`);
    }
    lines.push(`  - Total: $${total}`);
    return lines;
  }

  /**
   * Format hot dice message (delegate to DisplayFormatter)
   */
  static formatHotDice(count?: number): string {
    const { DisplayFormatter } = require('../../app/utils/display');
    return DisplayFormatter.formatHotDice(count);
  }

  /**
   * Format bank or reroll prompt
   */
  static formatBankOrRerollPrompt(diceToReroll: number): string {
    return `Bank points (b) or reroll ${diceToReroll} dice (r): `;
  }

  /**
   * Format inventory display
   */
  static formatInventory(gameState: any): string[] {
    const lines: string[] = [];
    lines.push(`📦 INVENTORY`);
    lines.push('');
    
    // Charms
    lines.push(`Charms:`);
    if (gameState.charms && gameState.charms.length > 0) {
      gameState.charms.forEach((charm: any, idx: number) => {
        const usesStr = charm.uses !== undefined ? ` (${charm.uses} uses)` : '';
        lines.push(`  ${idx + 1}. ${charm.name}${usesStr}`);
      });
    } else {
      lines.push(`  (None)`);
    }
    lines.push('');
    
    // Consumables
    lines.push(`Consumables:`);
    if (gameState.consumables && gameState.consumables.length > 0) {
      gameState.consumables.forEach((consumable: any, idx: number) => {
        const usesStr = consumable.uses !== undefined ? ` (${consumable.uses} uses)` : '';
        lines.push(`  ${idx + 1}. ${consumable.name}${usesStr}`);
      });
    } else {
      lines.push(`  (None)`);
    }
    lines.push('');
    
    // Money
    lines.push(`Money: $${gameState.money || 0}`);
    
    return lines;
  }

  /**
   * Format combinations display
   */
  static formatCombinationsDisplay(dice: Die[], gameState: any): string[] {
    const lines: string[] = [];
    lines.push(`🎯 COMBINATIONS`);
    lines.push('');
    
    // Get dice values
    const diceValues = dice.map(die => die.rolledValue).filter(v => v !== undefined);
    lines.push(`Dice values: [${diceValues.join(', ')}]`);
    lines.push('');
    
    // This would need actual scoring logic - for now just show dice values
    lines.push(`(Use scoring logic to show available combinations)`);
    
    return lines;
  }

  /**
   * Format dice set display
   */
  static formatDiceSetDisplay(gameState: any): string[] {
    const lines: string[] = [];
    lines.push(`🎲 DICE SET`);
    lines.push('');
    
    if (gameState.diceSet && gameState.diceSet.length > 0) {
      gameState.diceSet.forEach((die: any, idx: number) => {
        const material = die.material || 'plastic';
        const materialName = MATERIALS[material]?.name || material;
        lines.push(`  Die ${idx + 1}: ${die.sides} sides (${materialName})`);
      });
    } else {
      lines.push(`  (No dice)`);
    }
    
    return lines;
  }

  /**
   * Format level display
   */
  static formatLevelDisplay(gameState: any): string[] {
    const lines: string[] = [];
    lines.push(`📈 LEVEL INFO`);
    lines.push('');
    
    if (gameState.currentLevel) {
      lines.push(`Current Level: ${gameState.currentLevel.levelNumber}`);
      lines.push(`Points Banked: ${gameState.currentLevel.pointsBanked || 0} / ${gameState.currentLevel.levelThreshold || 0}`);
      lines.push(`Rerolls Remaining: ${gameState.currentLevel.rerollsRemaining || 0}`);
      lines.push(`Lives Remaining: ${gameState.currentLevel.livesRemaining || 0}`);
      lines.push(`Consecutive Flops: ${gameState.currentLevel.consecutiveFlops || 0}`);
    } else {
      lines.push(`  (No level data)`);
    }
    
    return lines;
  }

  /**
   * Format game setup summary
   */
  static formatGameSetupSummary(gameState: any): string {
    const lines: string[] = [];
    lines.push(`\n=== Game Setup Complete ===`);
    lines.push(`Dice Set: ${gameState.diceSet?.length || 0} dice`);
    lines.push(`Charms: ${gameState.charms?.length || 0}`);
    lines.push(`Consumables: ${gameState.consumables?.length || 0}`);
    lines.push(`Money: $${gameState.money || 0}`);
    lines.push(`\n`);
    return lines.join('\n');
  }

  /**
   * Format shop display
   */
  static formatShopDisplay(
    money: number,
    availableCharms: any[],
    availableConsumables: any[],
    availableBlessings: any[],
    charmPrices: number[],
    consumablePrices: number[],
    blessingPrices: number[]
  ): string[] {
    const lines: string[] = [];
    lines.push('');
    lines.push(`=== SHOP ===`);
    lines.push(`Money: $${money}`);
    lines.push('');
    
    // Blessings section
    if (availableBlessings.length > 0) {
      lines.push(`BLESSINGS:`);
      availableBlessings.forEach((blessing, idx) => {
        const price = blessingPrices[idx];
        const name = blessing.name || `${blessing.effect.type} Blessing`;
        const description = blessing.description || `${blessing.effect.type}`;
        lines.push(`  ${idx + 1}. ${name} - $${price} - ${description}`);
      });
      lines.push('');
    }
    
    // Charms section
    lines.push(`CHARMS:`);
    if (availableCharms.length === 0) {
      lines.push(`  (No charms available)`);
    } else {
      availableCharms.forEach((charm, idx) => {
        const price = charmPrices[idx];
        lines.push(`  ${idx + 1}. ${charm.name} (${charm.rarity}) - $${price} - ${charm.description}`);
      });
    }
    lines.push('');
    
    // Consumables section
    lines.push(`CONSUMABLES:`);
    if (availableConsumables.length === 0) {
      lines.push(`  (No consumables available)`);
    } else {
      availableConsumables.forEach((consumable, idx) => {
        const price = consumablePrices[idx];
        lines.push(`  ${idx + 1}. ${consumable.name} (${consumable.rarity}) - $${price} - ${consumable.description}`);
      });
    }
    lines.push('');
    
    return lines;
  }
}
