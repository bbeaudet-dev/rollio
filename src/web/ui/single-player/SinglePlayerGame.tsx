import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Game } from '../game';
import { GameConfigSelector } from '../setup';
import { useGameState } from '../../hooks/useGameState';

export const SinglePlayerGame: React.FC = () => {
  const navigate = useNavigate();
  const [showConfigSelector, setShowConfigSelector] = useState(true);
  const [selectedDiceSetIndex, setSelectedDiceSetIndex] = useState(0);

  const game = useGameState();

  const handleConfigComplete = (config: {
    diceSetIndex: number;
    selectedCharms: number[];
    selectedConsumables: number[];
    difficulty: string;
  }) => {
    setSelectedDiceSetIndex(config.diceSetIndex);
    setShowConfigSelector(false);
    game.gameActions.startNewGame(config.diceSetIndex, config.difficulty);
  };

  const handleBackToConfig = () => {
    setShowConfigSelector(true);
  };

  // Root container with consistent font
  const rootStyle = {
    fontFamily: 'Arial, sans-serif',
    width: '100%',
    margin: '0',
    padding: '0'
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
    </div>
  );
}; 