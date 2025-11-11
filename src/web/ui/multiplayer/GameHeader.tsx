import React from 'react';

interface GameHeaderProps {
  roomId: string;
  username: string;
  canPlay: boolean;
  onBackToLobby: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  roomId,
  username,
  canPlay,
  onBackToLobby
}) => {
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <div>
        <h1 style={{ 
          margin: 0,
          fontFamily: 'Arial, sans-serif',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>🎮 Multiplayer Game</h1>
        <div style={{ 
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px', 
          color: '#666' 
        }}>
          Room: {roomId} | You: {username}
          {!canPlay && ' (Spectating)'}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <button
          onClick={onBackToLobby}
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
          ← Back to Lobby
        </button>
      </div>
    </div>
  );
}; 