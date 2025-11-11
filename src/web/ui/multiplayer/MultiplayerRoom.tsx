import React, { useState, useEffect } from 'react';
import { MultiplayerLobby, MultiplayerGame, HealthCheckStatus } from './';
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

interface MultiplayerRoomProps {
  onBackToMenu: () => void;
}

export const MultiplayerRoom: React.FC<MultiplayerRoomProps> = ({
  onBackToMenu
}) => {
  const [socket, setSocket] = useState<any>(null);
  const [username, setUsername] = useState(`Player${Math.floor(Math.random() * 100000)}`);
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [error, setError] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [activePlayerIds, setActivePlayerIds] = useState<string[]>([]);

  // Server URL for both socket connection and health checks
  // For development, connect to deployed backend unless we're running local backend
  const serverUrl = process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_BACKEND_URL || 'https://rollio-backend.onrender.com'
    : process.env.REACT_APP_BACKEND_URL || 'https://rollio-backend.onrender.com';
  
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL);
  console.log('Using server URL:', serverUrl);

  useEffect(() => {
    // Connect to WebSocket server
    const connectToServer = () => {
      console.log('Connecting to server:', serverUrl);
      const newSocket = io(serverUrl);
      setSocket(newSocket);

      // Connection event listeners
      newSocket.on('connect', () => {
        console.log('Socket connected successfully');
        console.log('Socket ID:', newSocket.id);
      });

      newSocket.on('connect_error', (error: any) => {
        console.error('Socket connection error:', error);
      });

      newSocket.on('disconnect', (reason: any) => {
        console.log('Socket disconnected:', reason);
      });

      // Socket event listeners
      newSocket.on('player_joined', (player: Player) => {
        console.log('Player joined:', player);
        setCurrentRoom(prev => {
          if (prev) {
            const playerExists = prev.players.some(p => p.id === player.id);
            if (!playerExists) {
              return {
                ...prev,
                players: [...prev.players, player]
              };
            }
          }
          return prev;
        });
      });

      newSocket.on('player_left', (player: Player) => {
        console.log('Player left:', player);
        setCurrentRoom(prev => {
          if (prev) {
            return {
              ...prev,
              players: prev.players.filter(p => p.id !== player.id)
            };
          }
          return prev;
        });
      });

      newSocket.on('player_state_updated', (player: Player) => {
        console.log('Player state updated:', player);
        setCurrentRoom(prev => {
          if (prev) {
            return {
              ...prev,
              players: prev.players.map(p => p.id === player.id ? player : p)
            };
          }
          return prev;
        });
      });

      newSocket.on('game_started', (data: { roomCode: string; activePlayerIds: string[]; gameState: string }) => {
        console.log('Game started:', data);
        setGameStarted(true);
        setActivePlayerIds(data.activePlayerIds);
      });

      return () => {
        newSocket.close();
      };
    };

    connectToServer();
  }, []);

  const handleCreateRoom = () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (!socket) {
      setError('Socket connection not available');
      return;
    }

    console.log('Creating room with username:', username);
    console.log('Socket connected:', socket.connected);
    console.log('Socket ID:', socket.id);

    setIsCreating(true);
    setError('');

    socket.emit('create_room', username, (response: any) => {
      console.log('Create room response:', response);
      setIsCreating(false);
      
      if (response && response.success) {
        console.log('Room created successfully:', response.roomCode);
        setCurrentRoom({
          id: response.roomCode,
          players: [response.player],
          gameState: 'waiting',
          activePlayerIds: [],
          hostId: response.player.id,
          createdAt: new Date()
        });
        setCurrentPlayer(response.player);
        setRoomCode(response.roomCode);
      } else {
        const errorMsg = response?.error || 'Failed to create room';
        console.error('Failed to create room:', errorMsg);
        setError(errorMsg);
      }
    });

    // Add timeout in case callback never fires
    setTimeout(() => {
      if (isCreating) {
        console.error('Create room timeout - no response received');
        setIsCreating(false);
        setError('Timeout: No response from server');
      }
    }, 10000);
  };

  const handleJoinRoom = () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setIsJoining(true);
    setError('');

    socket?.emit('join_room', roomCode.toUpperCase(), username, (response: any) => {
      setIsJoining(false);
      if (response.success) {
        setCurrentRoom(response.room);
        setCurrentPlayer(response.player);
      } else {
        setError(response.error || 'Failed to join room');
      }
    });
  };

  const handleStartGame = () => {
    if (currentRoom && currentPlayer) {
      socket?.emit('start_game', currentRoom.id, (response: any) => {
        if (response.success) {
          console.log('Game started successfully');
        } else {
          setError(response.error || 'Failed to start game');
        }
      });
    }
  };
  const canPlay = currentPlayer && activePlayerIds.includes(currentPlayer.id);

  // Show game if started
  if (gameStarted && currentRoom && currentPlayer) {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif' }}>
        <HealthCheckStatus serverUrl={serverUrl} socket={socket} />
        <MultiplayerGame
          currentRoom={currentRoom}
          currentPlayer={currentPlayer}
          activePlayerIds={activePlayerIds}
          socket={socket}
          onBackToLobby={() => setGameStarted(false)}
        />
      </div>
    );
  }

    // Show lobby
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <HealthCheckStatus serverUrl={serverUrl} socket={socket} />
      <MultiplayerLobby
        username={username}
        roomCode={roomCode}
        currentRoom={currentRoom}
        currentPlayer={currentPlayer}
        error={error}
        isCreating={isCreating}
        isJoining={isJoining}
        onUsernameChange={setUsername}
        onRoomCodeChange={setRoomCode}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onStartGame={handleStartGame}
        onBackToMenu={onBackToMenu}
      />
    </div>
  );
}; 