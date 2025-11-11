import React, { useState, useEffect } from 'react';

interface HealthCheckStatusProps {
  serverUrl: string;
  socket?: any; // Optional socket for connection status
}

export const HealthCheckStatus: React.FC<HealthCheckStatusProps> = ({ serverUrl, socket }) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [error, setError] = useState<string>('');
  const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [backendInfo, setBackendInfo] = useState<any>(null);

  const checkHealth = async () => {
    try {
      setStatus('checking');
      setError('');
      
      const response = await fetch(`${serverUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add a timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        setStatus('connected');
        setLastCheck(new Date());
        setError('');
        setBackendInfo(data);
      } else {
        setStatus('disconnected');
        setError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setStatus('disconnected');
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error occurred');
      }
    }
  };

  // Monitor socket connection status
  useEffect(() => {
    if (!socket) {
      setSocketStatus('disconnected');
      return;
    }

    const updateSocketStatus = () => {
      if (socket.connected) {
        setSocketStatus('connected');
      } else if (socket.connecting) {
        setSocketStatus('connecting');
      } else {
        setSocketStatus('disconnected');
      }
    };

    // Set initial status
    updateSocketStatus();

    // Listen for socket events
    socket.on('connect', () => setSocketStatus('connected'));
    socket.on('disconnect', () => setSocketStatus('disconnected'));
    socket.on('connect_error', () => setSocketStatus('disconnected'));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, [socket]);

  useEffect(() => {
    // Check immediately on mount
    checkHealth();

    // Set up periodic health checks every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, [serverUrl]);

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return '#28a745';
      case 'disconnected':
        return '#dc3545';
      case 'checking':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  const getSocketStatusColor = () => {
    switch (socketStatus) {
      case 'connected':
        return '#28a745';
      case 'disconnected':
        return '#dc3545';
      case 'connecting':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Backend Connected';
      case 'disconnected':
        return 'Backend Disconnected';
      case 'checking':
        return 'Checking Backend...';
      default:
        return 'Unknown Status';
    }
  };

  const getSocketStatusText = () => {
    switch (socketStatus) {
      case 'connected':
        return 'Socket Connected';
      case 'disconnected':
        return 'Socket Disconnected';
      case 'connecting':
        return 'Socket Connecting...';
      default:
        return 'Socket Unknown';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return '🟢';
      case 'disconnected':
        return '🔴';
      case 'checking':
        return '🟡';
      default:
        return '⚪';
    }
  };

  const getSocketStatusIcon = () => {
    switch (socketStatus) {
      case 'connected':
        return '🟢';
      case 'disconnected':
        return '🔴';
      case 'connecting':
        return '🟡';
      default:
        return '⚪';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: '#fff',
      border: `2px solid ${getStatusColor()}`,
      borderRadius: '8px',
      padding: '8px 12px',
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      minWidth: '200px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '4px'
      }}>
        <span style={{ fontSize: '14px' }}>{getStatusIcon()}</span>
        <span style={{ color: getStatusColor() }}>{getStatusText()}</span>
      </div>
      
      {socket && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '4px'
        }}>
          <span style={{ fontSize: '14px' }}>{getSocketStatusIcon()}</span>
          <span style={{ color: getSocketStatusColor() }}>{getSocketStatusText()}</span>
        </div>
      )}
      
      {lastCheck && (
        <div style={{
          fontSize: '10px',
          color: '#6c757d',
          marginBottom: '2px'
        }}>
          Last check: {lastCheck.toLocaleTimeString()}
        </div>
      )}
      
      {backendInfo && (
        <div style={{
          fontSize: '9px',
          color: '#6c757d',
          marginBottom: '2px'
        }}>
          Rooms: {backendInfo.activeRooms || 0} | Players: {backendInfo.totalPlayers || 0}
        </div>
      )}
      
      {error && status === 'disconnected' && (
        <div style={{
          fontSize: '10px',
          color: '#dc3545',
          maxWidth: '180px',
          wordBreak: 'break-word',
          marginBottom: '4px'
        }}>
          Error: {error}
        </div>
      )}
      
      <button
        onClick={checkHealth}
        style={{
          fontSize: '10px',
          padding: '2px 6px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer',
          marginTop: '4px'
        }}
      >
        Retry
      </button>
    </div>
  );
}; 