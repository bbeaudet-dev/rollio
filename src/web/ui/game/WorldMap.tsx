import React from 'react';
import { GameState } from '../../../game/types';
import { VisualMap } from './VisualMap';

interface WorldMapProps {
  gameState: GameState;
  onSelectWorld: (nodeId: number) => void;
  onReturnToMenu?: () => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({ gameState, onSelectWorld, onReturnToMenu }) => {
  if (!gameState.gameMap) {
    return <div>Map not available</div>;
  }

  const handleNodeClick = (nodeId: number) => {
    onSelectWorld(nodeId);
  };

  return (
    <VisualMap
      gameMap={gameState.gameMap}
      onSelectNode={handleNodeClick}
      onReturnToMenu={onReturnToMenu}
    />
  );
};

