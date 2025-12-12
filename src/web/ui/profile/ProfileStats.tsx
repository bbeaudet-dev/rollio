import React from 'react';
import { User } from '../../contexts/AuthContext';
import { ProfilePicture } from '../components/ProfilePicture';

interface UserStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  highScoreSingleRoll: number;
  highScoreBank: number;
}

interface ProfileStatsProps {
  stats: UserStats;
  user: User | null;
  onPictureClick: () => void;
}

const StatCard: React.FC<{ label: string; value: number; color?: string; small?: boolean }> = ({ label, value, color, small }) => (
  <div style={{
    padding: '15px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e1e5e9',
    width: small ? 'auto' : undefined,
    flex: small ? '1' : undefined,
    minWidth: small ? '0' : undefined
  }}>
    <div style={{
      fontSize: '12px',
      color: '#6c757d',
      marginBottom: '5px'
    }}>
      {label}
    </div>
    <div style={{
      fontSize: '24px',
      fontWeight: 'bold',
      color: color || '#2c3e50'
    }}>
      {value.toLocaleString()}
    </div>
  </div>
);

export const ProfileStats: React.FC<ProfileStatsProps> = ({ stats, user, onPictureClick }) => {
  return (
    <div style={{ 
      marginBottom: '30px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e1e5e9'
    }}>
      {/* First Row: Profile Picture + Name above Stats */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '30px',
        marginBottom: '20px'
      }}>
        {/* Profile Picture */}
        <div onClick={onPictureClick} style={{ cursor: 'pointer' }}>
          <ProfilePicture 
            key={user?.profilePicture || 'default'} 
            profilePictureId={user?.profilePicture} 
            size={80} 
            style={{ border: '3px solid #0056b3' }} 
          />
        </div>

        {/* Name and Stats */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Profile Name */}
          <h2 style={{
            fontSize: '24px',
            margin: 0,
            color: '#2c3e50'
          }}>
            {user?.username || 'User'}
          </h2>

          {/* Games Played, Wins */}
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <StatCard label="Games Played" value={stats.gamesPlayed} small />
            <StatCard label="Wins" value={stats.wins} color="#28a745" small />
          </div>
        </div>
      </div>

      {/* Second Row: High Scores */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px'
      }}>
        <StatCard label="High Score (Single Roll)" value={stats.highScoreSingleRoll} color="#ffc107" />
        <StatCard label="High Score (Bank)" value={stats.highScoreBank} color="#17a2b8" />
      </div>
    </div>
  );
};

