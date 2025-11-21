import React, { useState } from 'react';
import { StandardButton } from '../components/StandardButton';

interface LobbySetupProps {
  onBack?: () => void;
}

export const LobbySetup: React.FC<LobbySetupProps> = ({ onBack }) => {
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const generateRoomCode = (): string => {
    // Generate a 6-character alphanumeric room code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateLobby = async () => {
    setIsCreating(true);
    try {
      // TODO: Implement actual lobby creation via Socket.io
      const roomCode = generateRoomCode();
      console.log('Creating lobby with code:', roomCode);
      // For now, just show the room code
      alert(`Lobby created! Room code: ${roomCode}\n\n(Full lobby functionality coming soon!)`);
    } catch (error) {
      console.error('Error creating lobby:', error);
      alert('Failed to create lobby. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinLobby = async () => {
    if (!roomCode.trim()) {
      alert('Please enter a room code');
      return;
    }
    setIsJoining(true);
    try {
      // TODO: Implement actual lobby joining via Socket.io
      console.log('Joining lobby:', roomCode);
      // For now, just show a message
      alert(`Attempting to join lobby: ${roomCode}\n\n(Full lobby functionality coming soon!)`);
    } catch (error) {
      console.error('Error joining lobby:', error);
      alert('Failed to join lobby. Please check the room code and try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '16px',
        color: '#2c3e50'
      }}>
        Lobbies
      </h2>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px'
      }}>
        {/* Create Lobby Section */}
        <div style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e1e5e9'
        }}>
          <StandardButton
            onClick={handleCreateLobby}
            disabled={isCreating}
            variant="primary"
            size="large"
            style={{ width: '100%' }}
          >
            {isCreating ? 'Creating...' : 'Create Lobby'}
          </StandardButton>
        </div>

        {/* Join Lobby Section */}
        <div style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e1e5e9'
        }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              maxLength={6}
              style={{
                flex: 1,
                padding: '10px 12px',
                fontSize: '16px',
                border: '2px solid #e1e5e9',
                borderRadius: '6px',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                textAlign: 'center'
              }}
            />
          </div>
          <StandardButton
            onClick={handleJoinLobby}
            disabled={isJoining || !roomCode.trim()}
            variant="success"
            size="large"
            style={{ width: '100%' }}
          >
            {isJoining ? 'Joining...' : 'Join Lobby'}
          </StandardButton>
        </div>
      </div>

      {onBack && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={onBack}
            style={{
              backgroundColor: '#6c757d',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '15px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s ease',
              fontFamily: 'Arial, sans-serif',
              minHeight: '44px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5a6268';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6c757d';
            }}
          >
            Back
          </button>
        </div>
      )}
    </>
  );
};

