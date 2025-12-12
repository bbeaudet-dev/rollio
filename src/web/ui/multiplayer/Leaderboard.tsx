import React, { useState, useEffect } from 'react';
import { statsApi } from '../../services/api';
import { ProfilePicture } from '../components/ProfilePicture';

interface LeaderboardEntry {
  userId: string;
  username: string;
  profilePictureId: string | null;
  highBank: number;
  highRoll: number;
}

interface LeaderboardProps {
  onBack?: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await statsApi.getLeaderboard();
      if (result.success) {
        // The API returns leaderboard in result.data or result.leaderboard
        const leaderboardData = (result as any).leaderboard || (result as any).data?.leaderboard || result.data;
        if (Array.isArray(leaderboardData)) {
          setLeaderboard(leaderboardData);
        } else {
          setError('Invalid leaderboard data format');
        }
      } else {
        setError(result.error || 'Failed to load leaderboard');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load leaderboard';
      setError(errorMessage);
      console.error('Leaderboard error:', err);
    } finally {
      setIsLoading(false);
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
        Leaderboard
      </h2>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
          Loading leaderboard...
        </div>
      ) : error ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          color: '#dc3545', 
          fontSize: '14px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '6px',
          marginBottom: '16px'
        }}>
          {error.includes('Connection refused') || error.includes('Failed to fetch') || error.includes('404') || error.includes('Not Found') ? (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                Backend server not available
              </div>
              <div style={{ fontSize: '12px', color: '#856404' }}>
                Make sure the backend server is running on port 5173. Start it with: <code>npm run dev:server</code> or <code>npm start</code>
              </div>
            </div>
          ) : (
            error
          )}
        </div>
      ) : (
        <div>
          {/* Bank Scores Leaderboard */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: '#2c3e50',
              borderBottom: '2px solid #28a745',
              paddingBottom: '6px'
            }}>
              Highest Bank Scores
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {leaderboard
                .sort((a, b) => b.highBank - a.highBank)
                .slice(0, 10)
                .map((entry, index) => (
                  <div
                    key={`bank-${entry.userId}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: index === 0 ? '#e8f5e9' : index < 3 ? '#f1f8f4' : '#f8f9fa',
                      borderRadius: '6px',
                      border: index === 0 ? '2px solid #28a745' : '1px solid #e1e5e9'
                    }}
                  >
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: index === 0 ? '#28a745' : '#6c757d',
                      minWidth: '30px',
                      textAlign: 'center'
                    }}>
                      {index + 1}
                    </div>
                    <div style={{
                      flex: 1,
                      marginLeft: '12px',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#2c3e50',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <ProfilePicture profilePictureId={entry.profilePictureId} size={32} />
                      <span>{entry.username}</span>
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#28a745'
                    }}>
                      {entry.highBank.toLocaleString()}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Roll Scores Leaderboard */}
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: '#2c3e50',
              borderBottom: '2px solid #007bff',
              paddingBottom: '6px'
            }}>
              Highest Roll Scores
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {leaderboard
                .sort((a, b) => b.highRoll - a.highRoll)
                .slice(0, 10)
                .map((entry, index) => (
                  <div
                    key={`roll-${entry.userId}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: index === 0 ? '#e3f2fd' : index < 3 ? '#f0f7ff' : '#f8f9fa',
                      borderRadius: '6px',
                      border: index === 0 ? '2px solid #007bff' : '1px solid #e1e5e9'
                    }}
                  >
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: index === 0 ? '#007bff' : '#6c757d',
                      minWidth: '30px',
                      textAlign: 'center'
                    }}>
                      {index + 1}
                    </div>
                    <div style={{
                      flex: 1,
                      marginLeft: '12px',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#2c3e50',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <ProfilePicture profilePictureId={entry.profilePictureId} size={32} />
                      <span>{entry.username}</span>
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#007bff'
                    }}>
                      {entry.highRoll.toLocaleString()}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

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

