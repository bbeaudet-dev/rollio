import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsModal } from './SettingsModal';
import { AuthSection } from '../auth';
import { useAuth } from '../../contexts/AuthContext';
import { gameApi } from '../../services/api';
import { ActionButton } from '../components/ActionButton';
import { playClickSound } from '../../utils/sounds';

export const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [gameInfo, setGameInfo] = useState<{ worldNumber: number; levelNumber: number } | null>(null);

  // Check for saved game in the background (non-blocking)
  useEffect(() => {
    if (!isAuthenticated) {
      setHasSavedGame(false);
      setGameInfo(null);
      return;
    }

    // Check for saved game in background - don't block UI
    gameApi.loadGame().then(result => {
      const hasGame = result.success && !!(result as any).gameState;
      setHasSavedGame(hasGame);
      
      if (hasGame) {
        const gameState = (result as any).gameState;
        const currentWorld = gameState.currentWorld;
        if (currentWorld) {
          const worldNumber = currentWorld.worldNumber;
          const levelNumber = currentWorld.currentLevel?.levelNumber;
          setGameInfo({ worldNumber, levelNumber });
        } else {
          setGameInfo(null);
        }
      } else {
        setGameInfo(null);
      }
    }).catch(() => {
      setHasSavedGame(false);
      setGameInfo(null);
    });
  }, [isAuthenticated]);
  return (
    <>
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
          <ActionButton
            variant="primary"
            onClick={() => navigate('/game')}
            size="large"
            style={{ flex: 1, padding: '20px 32px', minHeight: '60px', fontSize: '17px' }}
          >
            New Game
          </ActionButton>
          
          <ActionButton
            variant="success"
            onClick={() => navigate('/game?load=true')}
            disabled={!isAuthenticated || !hasSavedGame}
            size="large"
            style={{ flex: 1, padding: '20px 32px', minHeight: '60px', fontSize: '17px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >
            <span>Continue Game</span>
            {hasSavedGame && gameInfo && (
              <span style={{
                fontSize: '12px',
                opacity: 0.8,
                fontWeight: 'normal'
              }}>
                World {gameInfo.worldNumber} - Level {gameInfo.levelNumber}
              </span>
            )}
          </ActionButton>
        </div>
        
        {/* Multiplayer button */}
        <ActionButton
          variant="secondary"
          onClick={() => navigate('/multiplayer')}
          size="large"
        >
          Multiplayer
        </ActionButton>
        
        {/* Collection, Calculator, and How to Play buttons on same row */}
        <div style={{
          display: 'flex',
          gap: '12px',
          width: '100%'
        }}>
          <ActionButton
            variant="secondary"
            onClick={() => navigate('/collection')}
            size="large"
            style={{ flex: 1 }}
          >
            Collection
          </ActionButton>
          
          <ActionButton
            variant="secondary"
            onClick={() => navigate('/calculator')}
            size="large"
            style={{ flex: 1 }}
          >
            Calculator
          </ActionButton>
          
          <ActionButton
            variant="secondary"
            onClick={() => navigate('/how-to-play')}
            size="large"
            style={{ flex: 1 }}
          >
            How To Play
          </ActionButton>
        </div>
        
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      </div>
      
      {/* Auth Section - Below buttons */}
      <div style={{ marginTop: '30px' }}>
        <AuthSection onSettingsClick={() => setIsSettingsOpen(true)} />
      </div>
      
    </div>
    
    {/* Self-plug and Report bugs - Outside the white section */}
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
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