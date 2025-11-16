import { DEFAULT_GAME_CONFIG } from '../game/utils/factories';

/**
 * ConfigManager
 * 
 * Handles game configuration and rules setup.
 * Separates configuration logic from interface concerns.
 */
export class ConfigManager {
  
  /**
   * Parse and validate game rules from user input
   */
  static parseGameRules(inputs: {
    flopLimitInput?: string;
  }): {
    consecutiveFlopLimit: number;
  } {
    
    // Parse flop limit
    let consecutiveFlopLimit = DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit;
    if (inputs.flopLimitInput) {
      consecutiveFlopLimit = inputs.flopLimitInput.trim() === ''
        ? DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit
        : parseInt(inputs.flopLimitInput.trim(), 10) || DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit;
    }
    
    return {
      consecutiveFlopLimit
    };
  }
  
  /**
   * Get default game configuration
   */
  static getDefaultGameRules(): {
    consecutiveFlopLimit: number;
  } {
    return {
      consecutiveFlopLimit: DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit
    };
  }
  
  /**
   * Validate game rules
   */
  static validateGameRules(rules: {
    consecutiveFlopLimit: number;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (rules.consecutiveFlopLimit <= 0) {
      errors.push('Consecutive flop limit must be greater than 0');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
} 