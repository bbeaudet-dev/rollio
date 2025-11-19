/**
 * Utilities for serializing and deserializing GameState
 * Handles stripping functions and rebuilding charm instances
 */

import { GameState, Charm } from '../../game/types';
import { CharmRegistry } from '../../game/logic/charmSystem';

/**
 * Serialize GameState by removing non-serializable properties (functions)
 */
export function serializeGameState(gameState: GameState): string {
  // Create a deep copy and strip functions
  const serializable = JSON.parse(JSON.stringify(gameState, (key, value) => {
    // Remove functions
    if (typeof value === 'function') {
      return undefined;
    }
    return value;
  }));

  // Ensure charms array has no functions
  if (serializable.charms) {
    serializable.charms = serializable.charms.map((charm: any) => {
      const { filterScoringCombinations, ...charmData } = charm;
      return charmData;
    });
  }

  return JSON.stringify(serializable);
}

/**
 * Deserialize GameState and rebuild charm instances
 * Accepts either a JSON string or an already-parsed object (from JSONB)
 */
export function deserializeGameState(
  json: string | object,
  charmRegistry: CharmRegistry
): GameState {
  // Handle different input types
  let data: GameState;
  
  if (typeof json === 'string') {
    // It's a JSON string, parse it
    data = JSON.parse(json) as GameState;
  } else if (json && typeof json === 'object' && !Array.isArray(json)) {
    // It's already an object (from JSONB), use it directly
    data = json as GameState;
  } else {
    // Fallback: try to stringify and parse (shouldn't happen, but just in case)
    throw new Error(`Invalid game state format: expected string or object, got ${typeof json}`);
  }

  // Rebuild charm instances from charm data
  if (data.charms) {
    data.charms = data.charms.map((charmData: any) => {
      // Create a new charm instance using the registry
      const charmInstance = charmRegistry.createCharm(charmData as Charm);
      if (charmInstance) {
        // Return the charm data with the instance's methods
        // The charm instance will have the filterScoringCombinations function
        return charmInstance as any;
      }
      // Fallback: return the data as-is if charm class not found
      return charmData;
    });
  }

  return data;
}

