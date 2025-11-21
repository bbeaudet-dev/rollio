import React from 'react';
import { MainMenuReturnButton } from '../components';
import { Leaderboard } from './Leaderboard';
import { LobbySetup } from './LobbySetup';

export const MultiplayerPage: React.FC = () => {
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '40px auto',
      padding: '30px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e1e5e9',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      position: 'relative'
    }}>
      <MainMenuReturnButton />
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '30px'
      }}>
        {/* Lobby Setup Section */}
        <div>
          <LobbySetup />
        </div>

        {/* Leaderboard Section */}
        <div>
          <Leaderboard />
        </div>
      </div>
    </div>
  );
};

