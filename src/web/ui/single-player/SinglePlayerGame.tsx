import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Game, GameLog } from '../game';
import { GameConfigSelector } from '../setup';
import { useGameState } from '../../hooks/useGameState';

export const SinglePlayerGame: React.FC = () => {
  const navigate = useNavigate();
  const [showConfigSelector, setShowConfigSelector] = useState(true);
  const [selectedDiceSetIndex, setSelectedDiceSetIndex] = useState(0);
  const [selectedCharms, setSelectedCharms] = useState<number[]>([]);
  const [selectedConsumables, setSelectedConsumables] = useState<number[]>([]);

  const game = useGameState();

  const handleConfigComplete = (config: {
    diceSetIndex: number;
    selectedCharms: number[];
    selectedConsumables: number[];
  }) => {
    setSelectedDiceSetIndex(config.diceSetIndex);
    setSelectedCharms(config.selectedCharms);
    setSelectedConsumables(config.selectedConsumables);
    setShowConfigSelector(false);
    game.gameActions.startNewGame(config.diceSetIndex, config.selectedCharms, config.selectedConsumables);
  };

  const handleBackToConfig = () => {
    setShowConfigSelector(true);
  };

  // Root container with consistent font
  const rootStyle = {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  };

  if (showConfigSelector) {
    return (
      <div style={rootStyle}>
        <GameConfigSelector onConfigComplete={handleConfigComplete} />
      </div>
    );
  }

  return (
    <div style={rootStyle}>
      <Game
        rollActions={game.rollActions}
        gameActions={game.gameActions}
        inventoryActions={game.inventoryActions}
        shopActions={game.shopActions}
        board={game.board}
        gameState={game.gameState}
        roundState={game.roundState}
        inventory={game.inventory}
        isInShop={game.isInShop}
        shopState={game.shopState}
        levelRewards={game.levelRewards}
        showTallyModal={game.showTallyModal}
        pendingRewards={game.pendingRewards}
      />
      
      <GameLog messages={game.messages} />
    </div>
  );
}; 