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

  // Rebuild gameMap connections Map if it exists and is a plain object
  if (data.gameMap) {
    // Ensure nodes array exists and is valid
    if (!data.gameMap.nodes || !Array.isArray(data.gameMap.nodes)) {
      console.warn('gameMap.nodes is missing or invalid, cannot restore map');
      data.gameMap = undefined;
    } else {
      // Convert connections from plain object to Map if needed
      if (data.gameMap.connections && !(data.gameMap.connections instanceof Map)) {
        const connectionsMap = new Map<number, number[]>();
        Object.entries(data.gameMap.connections as any).forEach(([fromNodeIdStr, connectedNodeIds]) => {
          const fromNodeId = Number(fromNodeIdStr);
          if (!isNaN(fromNodeId) && Array.isArray(connectedNodeIds)) {
            connectionsMap.set(fromNodeId, connectedNodeIds as number[]);
          }
        });
        data.gameMap.connections = connectionsMap;
      }
      
      // Validate and fix currentNode
      if (data.gameMap.currentNode === undefined || data.gameMap.currentNode === null) {
        // If currentNode is missing, try to infer it from playerPath
        if (data.gameMap.playerPath && Array.isArray(data.gameMap.playerPath) && data.gameMap.playerPath.length > 0) {
          // Use the last node in the player path as the current node
          data.gameMap.currentNode = data.gameMap.playerPath[data.gameMap.playerPath.length - 1];
        } else {
          // No player path either - find the start node (column 0, worldNumber 0)
          const startNode = data.gameMap.nodes.find((n: any) => n.column === 0 && n.worldNumber === 0);
          if (startNode) {
            data.gameMap.currentNode = startNode.nodeId;
            data.gameMap.playerPath = [startNode.nodeId];
          } else {
            // Fallback: use first node
            if (data.gameMap.nodes.length > 0) {
              data.gameMap.currentNode = data.gameMap.nodes[0].nodeId;
              data.gameMap.playerPath = [data.gameMap.nodes[0].nodeId];
            }
          }
        }
      }
      
      // Validate playerPath
      if (!data.gameMap.playerPath || !Array.isArray(data.gameMap.playerPath)) {
        // If playerPath is missing, initialize it with currentNode
        if (data.gameMap.currentNode !== undefined && data.gameMap.currentNode !== null) {
          data.gameMap.playerPath = [data.gameMap.currentNode];
        } else {
          // Find start node
          const startNode = data.gameMap.nodes.find((n: any) => n.column === 0 && n.worldNumber === 0);
          if (startNode) {
            data.gameMap.playerPath = [startNode.nodeId];
            data.gameMap.currentNode = startNode.nodeId;
          } else if (data.gameMap.nodes.length > 0) {
            data.gameMap.playerPath = [data.gameMap.nodes[0].nodeId];
            data.gameMap.currentNode = data.gameMap.nodes[0].nodeId;
          }
        }
      }
      
      // Validate that currentNode exists in nodes array
      const gameMap = data.gameMap; // Store reference to avoid TypeScript issues
      if (gameMap.currentNode !== undefined && gameMap.currentNode !== null) {
        const currentNodeExists = gameMap.nodes.some((n: any) => n.nodeId === gameMap.currentNode);
        if (!currentNodeExists) {
          console.warn(`currentNode ${gameMap.currentNode} not found in nodes array, resetting to start node`);
          const startNode = gameMap.nodes.find((n: any) => n.column === 0 && n.worldNumber === 0);
          if (startNode) {
            gameMap.currentNode = startNode.nodeId;
            gameMap.playerPath = [startNode.nodeId];
          } else if (gameMap.nodes.length > 0) {
            gameMap.currentNode = gameMap.nodes[0].nodeId;
            gameMap.playerPath = [gameMap.nodes[0].nodeId];
          }
        }
      }
    }
  }

  return data;
}

