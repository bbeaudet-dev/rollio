import React from 'react';
import { GameState } from '../../../game/types';
import { getWorldIdForNode } from '../../../game/logic/mapGeneration';
import { VisualMap } from './VisualMap';

interface WorldMapProps {
  gameState: GameState;
  onSelectWorld: (worldId: string) => void;
  onReturnToMenu?: () => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({ gameState, onSelectWorld, onReturnToMenu }) => {
  if (!gameState.gameMap) {
    return <div>Map not available</div>;
  }

  const handleNodeClick = (nodeId: number) => {
    const worldId = getWorldIdForNode(gameState.gameMap!, nodeId);
    if (worldId) {
    onSelectWorld(worldId);
    }
  };

  return (
    <VisualMap
      gameMap={gameState.gameMap}
      onSelectNode={handleNodeClick}
      onReturnToMenu={onReturnToMenu}
    />
  );
};

