import React, { useEffect } from 'react';
import { GameBoard } from '../game';
import { GameHeader, LiveScoreboard } from './';
import { useGameState } from '../../hooks/useGameState';
import io from 'socket.io-client';

interface Player {
  id: string;
  username: string;
  socketId: string;
  gameScore: number;
  currentRound: number;
  hotDiceCounterRound: number;
  roundPoints: number;
  isActive: boolean;
  lastAction: string;
  status: 'lobby' | 'in_game' | 'spectating';
}

interface Room {
  id: string;
  players: Player[];
  gameState: 'waiting' | 'playing' | 'finished';
  activePlayerIds: string[];
  hostId: string;
  createdAt: Date;
}

interface MultiplayerGameProps {
  currentRoom: Room;
  currentPlayer: Player;
  activePlayerIds: string[];
  socket: any;
  onBackToLobby: () => void;
}

export const MultiplayerGame: React.FC<MultiplayerGameProps> = ({
  currentRoom,
  currentPlayer,
  activePlayerIds,
  socket,
  onBackToLobby
}) => {
  const game = useGameState();

  // Auto-start game for multiplayer (no config step needed)
  React.useEffect(() => {
    if (!game.gameState) {
      game.gameActions.startNewGame(0, [], []); // Basic dice set, no charms, no consumables
    }
  }, [game.gameState, game.gameActions.startNewGame]);

  // Sync player state with server when game state changes
  useEffect(() => {
    if (game.gameState && game.roundState && currentRoom && socket) {
      socket.emit('update_player_state', currentRoom.id, {
        totalScore: game.gameState?.history?.totalScore || 0,
        currentRound: game.gameState?.currentLevel?.currentRound?.roundNumber || 0,
        roundPoints: game.roundState?.roundPoints || 0,
        lastAction: game.board.justBanked ? 'banked' : game.board.justFlopped ? 'flopped' : 'playing'
      });
    }
  }, [
    game.gameState?.history?.totalScore, 
    game.gameState?.currentLevel?.currentRound?.roundNumber, 
    game.roundState?.hotDiceCounter,
    game.roundState?.roundPoints,
    game.board.justBanked, 
    game.board.justFlopped, 
    currentRoom, 
    socket
  ]);

  const canPlay = currentPlayer && activePlayerIds.includes(currentPlayer.id);

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: '20px' 
    }}>
      <GameHeader
        roomId={currentRoom.id}
        username={currentPlayer.username}
        canPlay={!!canPlay}
        onBackToLobby={onBackToLobby}
      />

      <GameBoard
        rollActions={game.rollActions}
        gameActions={game.gameActions}
        inventoryActions={game.inventoryActions}
        board={game.board}
        gameState={game.gameState}
        roundState={game.roundState}
        inventory={game.inventory}
        canPlay={canPlay}
        isMultiplayer={true}
      />

      {/* Live Scoreboard */}
      <div style={{ 
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <LiveScoreboard
          players={currentRoom.players}
          currentPlayerId={currentPlayer.id}
          activePlayerIds={activePlayerIds}
        />
      </div>
    </div>
  );
}; 