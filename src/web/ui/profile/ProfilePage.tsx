import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { statsApi, ApiResponse } from '../../services/api';
import { ProfilePictureSelector } from './ProfilePictureSelector';
import { ProfileStats } from './ProfileStats';
import { RecentGames, GameHistory } from './RecentGames';
import { CombinationStats } from './CombinationStats';
import { CharmStats } from './CharmStats';
import { ConsumableStats } from './ConsumableStats';
import { MainMenuReturnButton } from '../components/MenuButton';

interface UserStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  highScoreSingleRoll: number;
  highScoreBank: number;
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPictureSelector, setShowPictureSelector] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      setLoading(true);
      try {
        const [statsResult, historyResult] = await Promise.all([
          statsApi.getStats(),
          statsApi.getHistory(10, 0)
        ]);

        if (statsResult.success && statsResult.stats) {
          setStats(statsResult.stats);
        }

        if (historyResult.success && historyResult.games) {
          setHistory(historyResult.games);
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div style={{
        fontFamily: 'Arial, sans-serif',
        maxWidth: '800px',
        margin: '40px auto',
        padding: '30px',
        textAlign: 'center'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <>
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '40px auto',
      padding: '30px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e1e5e9',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e1e5e9'
      }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          margin: 0,
          color: '#2c3e50'
        }}>
          Profile
        </h2>
        <MainMenuReturnButton style={{ position: 'relative', top: 0, left: 0 }} />
      </div>

      {/* User Info and Statistics */}
      {stats && (
        <ProfileStats 
          stats={stats} 
          user={user}
          onPictureClick={() => setShowPictureSelector(true)} 
        />
      )}

      {/* Combination Usage Statistics */}
      <div style={{ marginBottom: '30px' }}>
        <CombinationStats />
      </div>

      {/* Charm Usage Statistics */}
      <CharmStats />

      {/* Consumable Usage Statistics */}
      <ConsumableStats />

      {/* Game History */}
      <RecentGames games={history} />

      {/* Profile Picture Selector Modal */}
      {showPictureSelector && user && (
        <ProfilePictureSelector
          currentPicture={user.profilePicture || 'default'}
          onSelect={(pictureId: string) => {
            // Picture will be updated via AuthContext refreshUser
            setShowPictureSelector(false);
          }}
          onClose={() => setShowPictureSelector(false)}
        />
      )}
    </div>
    
    {/* Self-plug and Report bugs - Outside the profile border */}
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '20px auto',
      padding: '0 30px',
      textAlign: 'center',
      fontSize: '12px',
      color: '#6c757d'
    }}>
      <div style={{ marginBottom: '8px' }}>
        a game by <a 
          href="https://benbeaudet.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ color: '#007bff', textDecoration: 'none' }}
        >ben</a>
      </div>
      <div>
        <a 
          href="https://github.com/bbeaudet-dev/rollio/issues" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ color: '#007bff', textDecoration: 'none' }}
        >
          Report bugs
        </a>
      </div>
    </div>
    </>
  );
};

