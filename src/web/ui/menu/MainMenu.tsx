import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsModal } from './SettingsModal';
import { AuthSection } from '../auth';
import { useAuth } from '../../contexts/AuthContext';
import { gameApi } from '../../services/api';
import { MainMenuButton } from '../components/MainMenuButton';

export const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  // Check for saved game in the background (non-blocking)
  useEffect(() => {
    if (!isAuthenticated) {
      setHasSavedGame(false);
      return;
    }

    // Check for saved game in background - don't block UI
    gameApi.loadGame().then(result => {
      const hasGame = result.success && !!(result as any).gameState;
      setHasSavedGame(hasGame);
    }).catch(() => {
      setHasSavedGame(false);
    });
  }, [isAuthenticated]);
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '40px auto',
      padding: '30px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e1e5e9',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
    }}>
      <h1 style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#2c3e50'
      }}>
        Rollio
      </h1>
      
      <p style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        color: '#6c757d',
        marginBottom: '30px'
      }}>
        The dice-rolling roguelike
      </p>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        marginTop: '30px'
      }}>
        {/* Continue and New Game buttons on same row */}
        <div style={{
          display: 'flex',
          gap: '12px',
          width: '100%'
        }}>
          <MainMenuButton
            variant="success"
            onClick={() => navigate('/game?load=true')}
            disabled={!isAuthenticated || !hasSavedGame}
            style={{ flex: 1 }}
          >
            Continue Game
          </MainMenuButton>
          
          <MainMenuButton
            variant="primary"
            onClick={() => navigate('/game')}
            style={{ flex: 1 }}
          >
            New Game
          </MainMenuButton>
        </div>
        
        {/* Multiplayer button */}
        <MainMenuButton
          variant="secondary"
          onClick={() => navigate('/multiplayer')}
        >
          Multiplayer
        </MainMenuButton>
        
        <MainMenuButton
          variant="secondary"
          onClick={() => navigate('/collection')}
        >
          Collection
        </MainMenuButton>
        
        <MainMenuButton
          variant="secondary"
          onClick={() => navigate('/calculator')}
        >
          Calculator
        </MainMenuButton>
        
        <button 
          onClick={() => setIsSettingsOpen(true)}
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
          Settings
        </button>

        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      </div>
      
      {/* Auth Section - Below buttons */}
      <div style={{ marginTop: '30px' }}>
        <AuthSection />
      </div>
      
    </div>
  );
}; 