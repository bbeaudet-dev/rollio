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
        {/* New Game and Continue Game buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          width: '100%'
        }}>
          <MainMenuButton
            variant="primary"
            onClick={() => navigate('/game')}
            style={{ flex: 1, padding: '20px 32px', minHeight: '60px', fontSize: '17px' }}
          >
            New Game
          </MainMenuButton>
          
          <MainMenuButton
            variant="success"
            onClick={() => navigate('/game?load=true')}
            disabled={!isAuthenticated || !hasSavedGame}
            style={{ flex: 1, padding: '20px 32px', minHeight: '60px', fontSize: '17px' }}
          >
            Continue Game
          </MainMenuButton>
        </div>
        
        {/* Multiplayer button */}
        <MainMenuButton
          variant="secondary"
          onClick={() => navigate('/multiplayer')}
        >
          Multiplayer
        </MainMenuButton>
        
        {/* Collection, Calculator, and How to Play buttons on same row */}
        <div style={{
          display: 'flex',
          gap: '12px',
          width: '100%'
        }}>
          <MainMenuButton
            variant="secondary"
            onClick={() => navigate('/collection')}
            style={{ flex: 1 }}
          >
            Collection
          </MainMenuButton>
          
          <MainMenuButton
            variant="secondary"
            onClick={() => navigate('/calculator')}
            style={{ flex: 1 }}
          >
            Calculator
          </MainMenuButton>
          
          <MainMenuButton
            variant="secondary"
            onClick={() => navigate('/how-to-play')}
            style={{ flex: 1 }}
          >
            How To Play
          </MainMenuButton>
        </div>
        
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
      
      {/* Self-plug */}
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#6c757d' }}>
        a game by <a href="https://benbeaudet.com" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>ben</a>
      </div>
      
    </div>
  );
}; 