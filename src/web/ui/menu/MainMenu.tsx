import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsModal } from './SettingsModal';
import { AuthSection } from '../auth';
import { useAuth } from '../../contexts/AuthContext';
import { gameApi } from '../../services/api';
import { MainMenuButton } from '../components/MainMenuButton';

export const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [isCheckingSave, setIsCheckingSave] = useState(false);

  // Check if user has a saved game (only after auth is loaded)
  useEffect(() => {
    const checkSavedGame = async () => {
      if (authLoading) {
        return;
      }

      // Only check for saved game if user is authenticated 
      if (!isAuthenticated) {
        setHasSavedGame(false);
        setIsCheckingSave(false);
        return;
      }

      // User is authenticated - check for saved game
      setIsCheckingSave(true);
      try {
        const result = await gameApi.loadGame();
        // 404 means no saved game, which is fine - just means hasSavedGame should be false
        // Only set to true if we successfully got a gameState
        const hasGame = result.success && !!(result as any).gameState;
        setHasSavedGame(hasGame);
      } catch (error) {
        setHasSavedGame(false);
      } finally {
        setIsCheckingSave(false);
      }
    };

    checkSavedGame();
  }, [isAuthenticated, authLoading]);
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
        {/* Don't show buttons until auth check is complete */}
        {authLoading || isCheckingSave ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
            Loading...
          </div>
        ) : (
          <>
            {isAuthenticated && hasSavedGame && (
          <MainMenuButton
            variant="success"
            onClick={() => navigate('/game?load=true')}
          >
            Continue Game
          </MainMenuButton>
        )}
        
        <MainMenuButton
          variant="primary"
          onClick={() => navigate('/game')}
        >
          New Game
        </MainMenuButton>
        
        <MainMenuButton
          variant="secondary"
          onClick={() => navigate('/collection')}
        >
          Collection
        </MainMenuButton>
        
        {isAuthenticated && (
          <MainMenuButton
            variant="secondary"
            onClick={() => navigate('/profile')}
          >
            Profile
          </MainMenuButton>
        )}
        
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
            minHeight: '44px' // Touch target size
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
          </>
        )}

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