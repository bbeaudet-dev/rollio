/**
 * Map Generation Logic
 * Generates the game map with world nodes and connections
 * Inspired by Faster Than Light's map system
 */

import { WORLD_POOL, World } from '../data/worlds';

export interface MapNode {
  nodeId: number; // Unique identifier for the node
  worldId: string; // ID of the world this node represents
  worldNumber: number; // World number (1-5)
  column: number; // Position in map progression (0-5, where 0 is start)
  row: number; // Position within column (0-based)
  isRevealed: boolean; // For hidden paths
  unlockCondition?: string; // Charm/blessing requirement for hidden paths
}

export interface GameMap {
  nodes: MapNode[];
  connections: Map<number, number[]>; // Maps nodeId to array of connected nodeIds
  playerPath: number[]; // Node IDs the player has visited
  currentNode: number; // Current node ID
}

/**
 * Generate a complete game map at game start
 * Creates 5 columns (World 0 → World 1 → World 2 → World 3 → World 4 → World 5)
 * World 0: 1 gray dot (starting point)
 * World 1-4: 2-3 choices per column, branching/converging paths
 * World 5: 1-3 final boss options
 */
export function generateGameMap(): GameMap {
  const nodes: MapNode[] = [];
  const connections = new Map<number, number[]>();
  let nodeIdCounter = 0;

  // World 0: Starting point (always 1 node)
  const startNode: MapNode = {
    nodeId: nodeIdCounter++,
    worldId: 'base',
    worldNumber: 0,
    column: 0,
    row: 0,
    isRevealed: true,
  };
  nodes.push(startNode);

  // Generate columns 1-4 (Worlds 1-4)
  const columnSizes = [2, 3, 2, 3]; // Sizes for columns 1-4 (can be 2-3 nodes each)
  const previousColumnNodes: number[] = [startNode.nodeId];

  for (let col = 1; col <= 4; col++) {
    const columnSize = columnSizes[col - 1] || 2;
    const currentColumnNodes: number[] = [];

    // Create nodes for this column
    for (let row = 0; row < columnSize; row++) {
      // Select a random world from the pool (excluding base)
      const availableWorlds = WORLD_POOL.filter(w => w.id !== 'base');
      const selectedWorld = availableWorlds[Math.floor(Math.random() * availableWorlds.length)];

      const node: MapNode = {
        nodeId: nodeIdCounter++,
        worldId: selectedWorld.id,
        worldNumber: col,
        column: col,
        row,
        isRevealed: true,
      };
      nodes.push(node);
      currentColumnNodes.push(node.nodeId);
    }

    // Create connections from previous column to current column
    // Each node in previous column connects to at most 2 nodes in current column
    // Ensure all nodes in current column are reachable
    for (const prevNodeId of previousColumnNodes) {
      const numConnections = Math.min(2, columnSize);
      const connectedNodes: number[] = [];
      
      // Randomly select which nodes to connect to
      const shuffled = [...currentColumnNodes].sort(() => Math.random() - 0.5);
      for (let i = 0; i < numConnections && i < shuffled.length; i++) {
        connectedNodes.push(shuffled[i]);
      }
      
      connections.set(prevNodeId, connectedNodes);
    }

    // Ensure all nodes in current column are reachable
    // If any node isn't connected, connect it to a random previous node
    for (const currentNodeId of currentColumnNodes) {
      let isReachable = false;
      for (const prevNodeId of previousColumnNodes) {
        const prevConnections = connections.get(prevNodeId) || [];
        if (prevConnections.includes(currentNodeId)) {
          isReachable = true;
          break;
        }
      }
      
      if (!isReachable && previousColumnNodes.length > 0) {
        // Connect to a random previous node that has less than 2 connections
        const availablePrevNodes = previousColumnNodes.filter(prevNodeId => {
          const prevConnections = connections.get(prevNodeId) || [];
          return prevConnections.length < 2;
        });
        
        if (availablePrevNodes.length > 0) {
          const randomPrevNode = availablePrevNodes[Math.floor(Math.random() * availablePrevNodes.length)];
          const prevConnections = connections.get(randomPrevNode) || [];
          prevConnections.push(currentNodeId);
          connections.set(randomPrevNode, prevConnections);
        } else {
          // If all previous nodes already have 2 connections, add to one anyway (edge case)
          const randomPrevNode = previousColumnNodes[Math.floor(Math.random() * previousColumnNodes.length)];
          const prevConnections = connections.get(randomPrevNode) || [];
          prevConnections.push(currentNodeId);
          connections.set(randomPrevNode, prevConnections);
        }
      }
    }

    previousColumnNodes.length = 0;
    previousColumnNodes.push(...currentColumnNodes);
  }

  // World 5: Final boss (1-3 options)
  const finalBossCount = Math.floor(Math.random() * 3) + 1; // 1-3 nodes
  const finalBossNodes: number[] = [];

  for (let row = 0; row < finalBossCount; row++) {
    const availableWorlds = WORLD_POOL.filter(w => w.id !== 'base');
    const selectedWorld = availableWorlds[Math.floor(Math.random() * availableWorlds.length)];

    const node: MapNode = {
      nodeId: nodeIdCounter++,
      worldId: selectedWorld.id,
      worldNumber: 5,
      column: 5,
      row,
      isRevealed: true,
    };
    nodes.push(node);
    finalBossNodes.push(node.nodeId);
  }

  // Connect all previous column nodes to all final boss nodes
  for (const prevNodeId of previousColumnNodes) {
    connections.set(prevNodeId, [...finalBossNodes]);
  }

  return {
    nodes,
    connections,
    playerPath: [startNode.nodeId],
    currentNode: startNode.nodeId,
  };
}

/**
 * Get available world choices from current map position
 * Returns array of node IDs that the player can choose from
 */
export function getAvailableWorldChoices(gameMap: GameMap): number[] {
  // If currentNode is not set or invalid, return empty array
  if (gameMap.currentNode === undefined || gameMap.currentNode === null) {
    return [];
  }
  
  const currentNodeConnections = gameMap.connections.get(gameMap.currentNode);
  return currentNodeConnections || [];
}

/**
 * Select a world (update player path when world is selected)
 * Returns updated game map
 */
export function selectWorld(gameMap: GameMap, selectedNodeId: number): GameMap {
  // Validate that the selected node is available
  const availableChoices = getAvailableWorldChoices(gameMap);
  if (!availableChoices.includes(selectedNodeId)) {
    throw new Error(`Node ${selectedNodeId} is not available from current position`);
  }

  // Update player path and current node
  const newPlayerPath = [...gameMap.playerPath, selectedNodeId];
  
  return {
    ...gameMap,
    playerPath: newPlayerPath,
    currentNode: selectedNodeId,
  };
}

/**
 * Check if hidden paths should be revealed based on charms/blessings
 * Returns array of node IDs that should be revealed
 */
export function checkHiddenPaths(
  gameMap: GameMap,
  charms: string[],
  blessings: string[]
): number[] {
  const revealedNodes: number[] = [];
  
  // Check each node for unlock conditions
  for (const node of gameMap.nodes) {
    if (!node.isRevealed && node.unlockCondition) {
      // Check if player has required charm or blessing
      const hasCharm = charms.includes(node.unlockCondition);
      const hasBlessing = blessings.includes(node.unlockCondition);
      
      if (hasCharm || hasBlessing) {
        revealedNodes.push(node.nodeId);
      }
    }
  }
  
  return revealedNodes;
}

/**
 * Get the world ID for a given node ID
 */
export function getWorldIdForNode(gameMap: GameMap, nodeId: number): string | null {
  const node = gameMap.nodes.find(n => n.nodeId === nodeId);
  return node?.worldId || null;
}

/**
 * Get the world number for a given node ID
 */
export function getWorldNumberForNode(gameMap: GameMap, nodeId: number): number | null {
  const node = gameMap.nodes.find(n => n.nodeId === nodeId);
  return node?.worldNumber || null;
}

