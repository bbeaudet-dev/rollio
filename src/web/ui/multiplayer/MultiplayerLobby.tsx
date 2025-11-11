import React, { useState } from 'react';

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

interface MultiplayerLobbyProps {
  username: string;
  roomCode: string;
  currentRoom: Room | null;
  currentPlayer: Player | null;
  error: string;
  isCreating: boolean;
  isJoining: boolean;
  onUsernameChange: (username: string) => void;
  onRoomCodeChange: (roomCode: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onStartGame: () => void;
  onBackToMenu: () => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  username,
  roomCode,
  currentRoom,
  currentPlayer,
  error,
  isCreating,
  isJoining,
  onUsernameChange,
  onRoomCodeChange,
  onCreateRoom,
  onJoinRoom,
  onStartGame,
  onBackToMenu
}) => {
  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
    }
  };

  const isHost = currentPlayer && currentRoom && currentRoom.hostId === currentPlayer.id;

  // Show room lobby if in a room
  if (currentRoom && currentPlayer) {
    return (
      <div style={{
        fontFamily: 'Arial, sans-serif',
        maxWidth: '800px',
        margin: '50px auto',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h2 style={{ 
          fontFamily: 'Arial, sans-serif',
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>Room: {currentRoom.id}</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <p style={{ 
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            marginBottom: '10px'
          }}>Share this room code with friends:</p>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            marginBottom: '20px'
          }}>
            <input
              type="text"
              value={roomCode}
              readOnly
              style={{
                fontFamily: 'Arial, sans-serif',
                padding: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                textAlign: 'center',
                border: '2px solid #007bff',
                borderRadius: '4px',
                backgroundColor: '#fff'
              }}
            />
            <button
              onClick={copyRoomCode}
              style={{
                fontFamily: 'Arial, sans-serif',
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Copy
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ 
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '10px'
          }}>Players ({currentRoom.players.length}/4):</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentRoom.players.map((player) => (
              <div
                key={player.id}
                style={{
                  fontFamily: 'Arial, sans-serif',
                  padding: '10px',
                  backgroundColor: player.id === currentPlayer.id ? '#e3f2fd' : '#fff',
                  border: player.id === currentPlayer.id ? '2px solid #2196f3' : '1px solid #ddd',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ 
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {player.username} {player.id === currentPlayer.id ? '(You)' : ''}
                  {isHost && player.id === currentPlayer.id && ' (Host)'}
                </span>
                <span style={{
                  fontFamily: 'Arial, sans-serif',
                  padding: '2px 6px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  backgroundColor: 
                    player.status === 'lobby' ? '#28a745' :
                    player.status === 'in_game' ? '#007bff' :
                    '#6c757d',
                  color: '#fff'
                }}>
                  {player.status === 'lobby' ? 'LOBBY' :
                   player.status === 'in_game' ? 'IN GAME' :
                   'SPECTATING'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {isHost && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={onStartGame}
              style={{
                fontFamily: 'Arial, sans-serif',
                padding: '12px 24px',
                backgroundColor: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🎮 Start Game
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={onBackToMenu}
            style={{
              fontFamily: 'Arial, sans-serif',
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // Show room creation/joining interface
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '100px auto',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <h1 style={{ 
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '30px'
      }}>Multiplayer Lobby</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="username" style={{ 
          fontFamily: 'Arial, sans-serif',
          display: 'block', 
          marginBottom: '5px',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          Your Username:
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder="Enter your username"
          style={{
            fontFamily: 'Arial, sans-serif',
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
      </div>

      {error && (
        <div style={{
          fontFamily: 'Arial, sans-serif',
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        marginBottom: '20px'
      }}>
        <button 
          onClick={onCreateRoom} 
          disabled={isCreating}
          style={{
            fontFamily: 'Arial, sans-serif',
            padding: '12px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: isCreating ? 'not-allowed' : 'pointer',
            opacity: isCreating ? 0.6 : 1,
            fontWeight: 'bold'
          }}
        >
          {isCreating ? 'Creating...' : 'Create Room'}
        </button>
        
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => onRoomCodeChange(e.target.value)}
            placeholder="Enter room code"
            style={{
              fontFamily: 'Arial, sans-serif',
              flex: 1,
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <button 
            onClick={onJoinRoom} 
            disabled={isJoining}
            style={{
              fontFamily: 'Arial, sans-serif',
              padding: '10px 16px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: isJoining ? 'not-allowed' : 'pointer',
              opacity: isJoining ? 0.6 : 1,
              fontWeight: 'bold'
            }}
          >
            {isJoining ? 'Joining...' : 'Join'}
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onBackToMenu}
          style={{
            fontFamily: 'Arial, sans-serif',
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Back to Menu
        </button>
      </div>
    </div>
  );
}; 