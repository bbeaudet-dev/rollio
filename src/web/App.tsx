import React, { useState } from 'react';
import { SinglePlayerGame } from './ui/single-player';
import { MultiplayerRoom } from './ui/multiplayer';
import { MainMenu } from './ui/menu';

type GameMode = 'menu' | 'single-player' | 'multiplayer';

function App() {
  const [gameMode, setGameMode] = useState<GameMode>('menu');

  const handleStartSinglePlayer = () => {
    setGameMode('single-player');
  };

  const handleStartMultiplayer = () => {
    setGameMode('multiplayer');
  };

  const handleBackToMenu = () => {
    setGameMode('menu');
  };

  // Root container with consistent font
  const rootStyle = {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  };

  // Show main menu
  if (gameMode === 'menu') {
    return (
      <MainMenu
        onStartSinglePlayer={handleStartSinglePlayer}
        isLoading={false}
      />
    );
  }

  // Show single player game
  if (gameMode === 'single-player') {
    return (
      <SinglePlayerGame onBackToMenu={handleBackToMenu} />
    );
  }

  // Show multiplayer room (handles both lobby and game)
  if (gameMode === 'multiplayer') {
    return (
      <MultiplayerRoom onBackToMenu={handleBackToMenu} />
    );
  }

  // This should never happen, but just in case
  return (
    <div style={rootStyle}>
      <h1>Error: Invalid game mode</h1>
      <button onClick={handleBackToMenu}>Back to Menu</button>
    </div>
  );
}

export default App; 