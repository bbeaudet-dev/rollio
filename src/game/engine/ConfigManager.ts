import { DEFAULT_GAME_CONFIG } from '../utils/factories';

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
    penaltyEnabledInput?: string;
    flopLimitInput?: string;
    flopPenaltyInput?: string;
  }): {
    penaltyEnabled: boolean;
    consecutiveFlopLimit: number;
    consecutiveFlopPenalty: number;
  } {
    
    // Parse penalty enabled
    const penaltyEnabled = inputs.penaltyEnabledInput?.trim() === '' || !inputs.penaltyEnabledInput
      ? true 
      : inputs.penaltyEnabledInput.trim().toLowerCase() === 'y';
    
    // Parse flop limit
    let consecutiveFlopLimit = DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit;
    if (penaltyEnabled && inputs.flopLimitInput) {
      consecutiveFlopLimit = inputs.flopLimitInput.trim() === ''
        ? DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit
        : parseInt(inputs.flopLimitInput.trim(), 10) || DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit;
    }
    
    // Parse flop penalty
    let consecutiveFlopPenalty = DEFAULT_GAME_CONFIG.penalties.consecutiveFlopPenalty;
    if (penaltyEnabled && inputs.flopPenaltyInput) {
      consecutiveFlopPenalty = inputs.flopPenaltyInput.trim() === ''
        ? DEFAULT_GAME_CONFIG.penalties.consecutiveFlopPenalty
        : parseInt(inputs.flopPenaltyInput.trim(), 10) || DEFAULT_GAME_CONFIG.penalties.consecutiveFlopPenalty;
    }
    
    return {
      penaltyEnabled,
      consecutiveFlopLimit,
      consecutiveFlopPenalty
    };
  }
  
  /**
   * Get default game configuration
   */
  static getDefaultGameRules(): {
    penaltyEnabled: boolean;
    consecutiveFlopLimit: number;
    consecutiveFlopPenalty: number;
  } {
    return {
      penaltyEnabled: true,
      consecutiveFlopLimit: DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit,
      consecutiveFlopPenalty: DEFAULT_GAME_CONFIG.penalties.consecutiveFlopPenalty
    };
  }
  
  /**
   * Validate game rules
   */
  static validateGameRules(rules: {
    penaltyEnabled: boolean;
    consecutiveFlopLimit: number;
    consecutiveFlopPenalty: number;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (rules.penaltyEnabled) {
      if (rules.consecutiveFlopLimit <= 0) {
        errors.push('Consecutive flop limit must be greater than 0');
      }
      
      if (rules.consecutiveFlopPenalty <= 0) {
        errors.push('Consecutive flop penalty must be greater than 0');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
} 