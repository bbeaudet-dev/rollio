import { Die } from '../game/types';
import { CLIDisplayFormatter } from './display/cliDisplay';

/**
 * CommandHandler
 * 
 * Handles game commands from the user.
 */
export class CommandHandler {
  
  /**
   * Process a command input and return response lines or null if not a command
   */
  static async processCommand(
    input: string, 
    gameState: any, 
    dice: Die[]
  ): Promise<{ handled: boolean; responseLines: string[] }> {
    const trimmedInput = input.trim().toLowerCase();
    
    switch (trimmedInput) {
      case 'i':
        if (gameState) {
          return {
            handled: true,
            responseLines: CLIDisplayFormatter.formatInventory(gameState)
          };
        }
        break;
        
      case 'c':
        if (gameState && dice) {
          return {
            handled: true,
            responseLines: CLIDisplayFormatter.formatCombinationsDisplay(dice, gameState)
          };
        }
        break;
        
      case 'd':
        if (gameState) {
          return {
            handled: true,
            responseLines: CLIDisplayFormatter.formatDiceSetDisplay(gameState)
          };
        }
        break;
        
      case 'l':
        if (gameState) {
          return {
            handled: true,
            responseLines: CLIDisplayFormatter.formatLevelDisplay(gameState)
          };
        }
        break;
        
      default:
        return { handled: false, responseLines: [] };
    }
    
    return { handled: false, responseLines: [] };
  }
  
  /**
   * Get list of available commands for help
   */
  static getAvailableCommands(): string[] {
    return [
      'i - Show inventory (charms and consumables)',
      'c - Show scoring combinations',
      'd - Show dice set information', 
      'l - Show level information'
    ];
  }
} 