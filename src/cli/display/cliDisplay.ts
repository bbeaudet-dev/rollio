import { Die, ScoringCombination } from '../../game/core/types';
import { MATERIALS } from '../../game/content/materials';

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
      result.push(`  Combinations: ` + Object.entries(grouped).map(([type, { values, indices }]) => {
        return `${type} ${values.join(', ')} (${indices.join(', ')})`;
      }).join('; '));
      
      // Add partitioning info lines if provided
      if (partitioningInfoLines && partitioningInfoLines.length > 0) {
        result.push(...partitioningInfoLines.map(line => `  ${line}`));
      } else if (partitioningInfo) {
        result.push(`  ${partitioningInfo}`);
      } else if (combinations.length > 1) {
        result.push(`  Selected partitioning: ${combinations.map(c => c.type).join(', ')}`);
      }
    }
    
    return result.join('\n');
  }

  /**
   * CLI-specific: Format roll summary with points, hot dice, and bank/reroll prompt
   */
  static formatRollSummary(rollPoints: number, roundPoints: number, hotDiceCounterRound: number, diceToReroll: number): string[] {
    const lines: string[] = [];
    lines.push(`🎲 ROLL SUMMARY`);
    lines.push(`  Roll points: +${rollPoints}`);
    lines.push(`  Round points: ${roundPoints}`);
    return lines;
  }

  /**
   * CLI-specific: Format round summary at end of round (after flop/bank)
   */
  static formatEndOfRoundSummary(forfeitedPoints: number, pointsAdded: number, consecutiveFlops: number, roundNumber?: number, flopPenalty?: number): string[] {
    const lines: string[] = [];
    lines.push(`\n📊 ROUND ${roundNumber} SUMMARY`);
    if (forfeitedPoints > 0) {
      lines.push(`  Points forfeited: -${forfeitedPoints}`);
    }
    if (flopPenalty && flopPenalty > 0) {
      lines.push(`  Flop penalty: -${flopPenalty}`);
    }
    if (pointsAdded > 0) {
      lines.push(`  Points banked: +${pointsAdded}`);
    }
    if (consecutiveFlops > 0) {
      lines.push(`  Consecutive flops: ${consecutiveFlops}`);
    }
    return lines;
  }

  /**
   * CLI-specific: Format game setup summary
   */
  static formatGameSetupSummary(gameState: any): string {
    const lines: string[] = [];
    lines.push('\n=== GAME SETUP COMPLETE ===');
    lines.push(`Money: $${gameState.core.money}`);
    lines.push(`Charms: ${(gameState.core.charms || []).length > 0 ? (gameState.core.charms || []).map((c: any) => c.name).join(', ') : 'None'}`);
    lines.push(`Consumables: ${(gameState.core.consumables || []).length > 0 ? (gameState.core.consumables || []).map((c: any) => c.name).join(', ') : 'None'}`);
    lines.push(`Dice Set: ${gameState.config.diceSetConfig?.name || (gameState.core.diceSet.length + ' dice')}`);
    lines.push('===========================\n');
    return lines.join('\n');
  }

  /**
   * CLI-specific: Format hot dice message with fire emojis
   */
  static formatHotDice(count?: number): string {
    const fireEmojis = '🔥'.repeat(count || 1);
    return `  ${fireEmojis} HOT DICE! ${fireEmojis}`;
  }

  /**
   * CLI-specific: Format bank or reroll prompt
   */
  static formatBankOrRerollPrompt(diceToReroll: number): string {
    return `(b) Bank points or (r) reroll ${diceToReroll} dice: `;
  }

  /**
   * CLI-specific: Format command legend
   */
  static formatCommandLegend(): string {
    return `\nCommands: (i) Inventory, (c) Combinations, (d) Dice Set, (l) Level`;
  }

  /**
   * CLI-specific: Format inventory display
   */
  static formatInventory(gameState: any): string[] {
    const lines: string[] = [];
    lines.push(`🎒 INVENTORY`);
    lines.push(`  Money: $${gameState.core.money}`);
    lines.push(`  Charms: ${(gameState.core.charms || []).length > 0 ? (gameState.core.charms || []).map((c: any) => `${c.name}${c.uses !== undefined ? ` (${c.uses} uses)` : ''}`).join(', ') : 'None'}`);
    lines.push(`  Consumables: ${(gameState.core.consumables || []).length > 0 ? (gameState.core.consumables || []).map((c: any) => `${c.name} (${c.uses} uses)`).join(', ') : 'None'}`);
    return lines;
  }

  /**
   * CLI-specific: Format combinations display
   */
  static formatCombinationsDisplay(dice: Die[], gameState: any): string[] {
    const lines: string[] = [];
    lines.push(`🎯 COMBINATIONS ANALYSIS`);
    
    // Get all possible combinations for current dice
    const diceValues = dice.map(die => die.rolledValue!);
    const combinations = this.getAllPossibleCombinations(diceValues);
    
    if (combinations.length > 0) {
      // Group by combination type
      const grouped: Record<string, { values: number[]; indices: number[]; points: number }> = {};
      combinations.forEach(c => {
        if (!grouped[c.type]) grouped[c.type] = { values: [], indices: [], points: 0 };
        grouped[c.type].values.push(...c.dice.map(i => diceValues[i]));
        grouped[c.type].indices.push(...c.dice.map(i => i + 1));
        grouped[c.type].points = Math.max(grouped[c.type].points, c.points);
      });
      
      Object.entries(grouped).forEach(([type, { values, indices, points }]) => {
        lines.push(`  ${type}: ${values.join(', ')} (${indices.join(', ')}) = ${points} points`);
      });
    } else {
      lines.push(`  No valid combinations found`);
    }
    
    // Show combination counters from game state
    if (gameState.history.combinationCounters) {
      lines.push(`  Combination History:`);
      Object.entries(gameState.history.combinationCounters).forEach(([type, count]) => {
        if ((count as number) > 0) {
          lines.push(`    ${type}: ${count} scored`);
        }
      });
    }
    
    return lines;
  }

  /**
   * CLI-specific: Format dice set display
   */
  static formatDiceSetDisplay(gameState: any): string[] {
    const lines: string[] = [];
    lines.push(`🎲 DICE SET`);
    lines.push(`  Set: ${gameState.config.diceSetConfig?.name || (gameState.core.diceSet.length + ' dice')}`);
    lines.push(`  Dice:`);
    const materialMap = Object.fromEntries(MATERIALS.map(m => [m.id, m.abbreviation]));
    gameState.core.diceSet.forEach((die: any, i: number) => {
      const abbrev = materialMap[die.material] || '--';
      lines.push(`    Die ${i + 1}: ${abbrev} (${die.sides} sides)`);
    });
    lines.push('');
    return lines;
  }

  /**
   * CLI-specific: Format level display (placeholder)
   */
  static formatLevelDisplay(gameState: any): string[] {
    const lines: string[] = [];
    lines.push(`📈 LEVEL INFO`);
    lines.push(`  Current Level: 1 (placeholder)`);
    lines.push(`  Points Needed: 1000 (placeholder)`);
    lines.push(`  Rounds Left: 10 (placeholder)`);
    lines.push(`  Boss: None (placeholder)`);
    return lines;
  }

  /**
   * Helper: Get all possible combinations for given dice values
   */
  private static getAllPossibleCombinations(diceValues: number[]): ScoringCombination[] {
    // This is a simplified version - in practice, you'd want to use the actual scoring logic
    const combinations: ScoringCombination[] = [];
    
    // Check for straights
    const sorted = [...diceValues].sort((a, b) => a - b);
    if (sorted.length >= 3) {
      // Check for 3+ consecutive numbers
      for (let i = 0; i <= sorted.length - 3; i++) {
        if (sorted[i + 1] === sorted[i] + 1 && sorted[i + 2] === sorted[i] + 2) {
          const indices = [i, i + 1, i + 2];
          combinations.push({
            type: 'Straight',
            dice: indices,
            points: 100
          });
        }
      }
    }
    
    // Check for of-a-kinds
    const counts: Record<number, number[]> = {};
    diceValues.forEach((value, index) => {
      if (!counts[value]) counts[value] = [];
      counts[value].push(index);
    });
    
    Object.entries(counts).forEach(([value, indices]) => {
      if (indices.length >= 3) {
        combinations.push({
          type: `${indices.length} of a Kind`,
          dice: indices,
          points: indices.length * 50
        });
      }
    });
    
    return combinations;
  }


} 