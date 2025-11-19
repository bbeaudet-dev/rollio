import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsModal } from './SettingsModal';
import { AuthSection } from '../auth';
import { useAuth } from '../../contexts/AuthContext';
import { gameApi } from '../../services/api';

export const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [isCheckingSave, setIsCheckingSave] = useState(false);

  // Check if user has a saved game
  useEffect(() => {
    const checkSavedGame = async () => {
      if (!isAuthenticated) {
        setHasSavedGame(false);
        return;
      }

      setIsCheckingSave(true);
      try {
        const result = await gameApi.loadGame();
        console.log('Check saved game result:', result);
        console.log('Is authenticated:', isAuthenticated);
        // 404 means no saved game, which is fine - just means hasSavedGame should be false
        // Only set to true if we successfully got a gameState
        const hasGame = result.success && !!(result as any).gameState;
        console.log('Has saved game:', hasGame, 'result.success:', result.success, 'gameState exists:', !!(result as any).gameState);
        setHasSavedGame(hasGame);
      } catch (error) {
        console.error('Error checking for saved game:', error);
        setHasSavedGame(false);
      } finally {
        setIsCheckingSave(false);
      }
    };

    checkSavedGame();
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

      {/* Auth Section */}
      <AuthSection />
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        marginTop: '30px'
      }}>
        {hasSavedGame && (
          <button 
            onClick={() => {
              // Navigate to game and trigger load
              navigate('/game?load=true');
            }}
            style={{
              backgroundColor: '#28a745',
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
              e.currentTarget.style.backgroundColor = '#218838';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#28a745';
            }}
          >
            Continue Game
          </button>
        )}
        
        <button 
          onClick={() => navigate('/game')}
          style={{
            backgroundColor: '#007bff',
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
            e.currentTarget.style.backgroundColor = '#0056b3';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#007bff';
          }}
        >
          {hasSavedGame ? 'New Game' : 'Single Player'}
        </button>
        
        <button 
          onClick={() => navigate('/collection')} 
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
          Collection
        </button>
        
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

        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      </div>
    </div>
  );
}; 