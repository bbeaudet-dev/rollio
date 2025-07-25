import { ROLLIO_CONFIG } from './config';
import { Die, ScoringCombination } from './core/types';
import { formatDiceValues, formatCombinations, formatFlopMessage, formatGameStats } from './utils/effectUtils';
import { MATERIALS } from './content/materials';

/**
 * Pure display functions that format text for output
 * These can be used by both CLI and web interfaces
 */
export class DisplayFormatter {
  static formatRoll(rollNumber: number, dice: Die[]): string {
    const valuesLine = dice.map(die => String(die.rolledValue!).padEnd(3)).join('');
    // Show material abbreviations with spaces between each
    const materialMap = Object.fromEntries(MATERIALS.map(m => [m.id, m.abbreviation]));
    const abbrevLine = dice.map(die => materialMap[die.material] || '--').join(' ');
    return `\nRoll #${rollNumber}:\n${valuesLine}\n${abbrevLine}`;
  }

  static formatScoringResult(selectedIndices: number[], dice: Die[], combinations: ScoringCombination[], points: number): string {
    const diceValues = dice.map(die => die.rolledValue!);
    const selectedDice = selectedIndices.map(i => diceValues[i]);
    const selectedIndicesDisplay = selectedIndices.map(i => (i + 1)).join(', ');
    const result = [`You selected dice: ${selectedDice.join(', ')} (${selectedIndicesDisplay})`];
    if (combinations.length > 0) {
      // Group by combination type
      const grouped: Record<string, { values: number[]; indices: number[] }> = {};
      combinations.forEach(c => {
        if (!grouped[c.type]) grouped[c.type] = { values: [], indices: [] };
        grouped[c.type].values.push(...c.dice.map(i => diceValues[i]));
        grouped[c.type].indices.push(...c.dice.map(i => i + 1));
      });
      result.push('Combinations: ' + Object.entries(grouped).map(([type, { values, indices }]) => {
        return `${type} ${values.join(', ')} (${indices.join(', ')})`;
      }).join('; '));
    }
    result.push(`Points for this roll: ${Math.ceil(points)}`);
    return result.join('\n');
  }

  static formatRoundPoints(points: number): string {
    return `Round points so far: ${Math.ceil(points)}`;
  }

  static formatGameScore(score: number): string {
    return `  Game score: ${Math.ceil(score)}`;
  }

  static formatFlopMessage(forfeitedPoints: number, consecutiveFlops: number, gameScore: number, consecutiveFlopPenalty: number, consecutiveFlopWarningCount: number): string {
    return formatFlopMessage(forfeitedPoints, consecutiveFlops, gameScore, consecutiveFlopPenalty, consecutiveFlopWarningCount);
  }

  static formatGameEnd(gameState: any, isWin: boolean): string[] {
    const lines: string[] = [];
    
    if (isWin) {
      lines.push(`\n🎉 CONGRATULATIONS! 🎉`);
      lines.push(`You won with ${gameState.gameScore} points!`);
    }
    
    lines.push(`\n=== ${isWin ? 'FINAL GAME STATISTICS' : 'GAME SUMMARY'} ===`);
    
    const stats = formatGameStats({
      roundsPlayed: gameState.roundNumber - 1,
      totalRolls: gameState.rollCount || 0,
      hotDiceCount: gameState.globalHotDiceCounter || 0,
      forfeitedPoints: gameState.forfeitedPointsTotal || 0,
      gameScore: gameState.gameScore,
    });
    
    lines.push(...stats);
    lines.push(`\n${isWin ? 'Thanks for playing Rollio!' : 'Thanks for playing!'}`);
    
    return lines;
  }

  static formatHotDice(count?: number): string {
    if (count && count > 1) {
      return `Hot dice! ${count}x`;
    }
    return `Hot dice!`;
  }

  static formatBankedPoints(points: number): string {
    return `You banked ${Math.ceil(points)} points!`;
  }

  static formatWelcome(): string {
    return 'Welcome to Rollio!';
  }

  static formatRoundStart(roundNumber: number): string {
    return `\n--- Round ${roundNumber} ---\nCommands: (i) Inventory, (c) Combinations, (d) Dice Set, (l) Level`;
  }

  static formatWinCondition(): string {
    return `\n🎉 CONGRATULATIONS! 🎉`;
  }

  static formatGoodbye(): string {
    return 'Goodbye!';
  }

  static formatBankOrRerollPrompt(diceToReroll: number): string {
    return `(b) Bank points or (r) reroll ${diceToReroll} dice: `;
  }

  static formatDiceSelectionPrompt(): string {
    return 'Select dice values to score: ';
  }

  static formatNewGamePrompt(): string {
    return '\nStart New Game? (y/n): ';
  }

  static formatNextRoundPrompt(roundNumber: number): string {
    return `\nStart Round ${roundNumber}? (y/n): `;
  }


} 