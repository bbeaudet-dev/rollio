import React from 'react';
import { DiceFace } from '../game/board/dice/DiceFace';
import { Die } from '../../../game/types';

export interface GameHistory {
  id: string;
  diceSetName: string;
  difficulty: string;
  endReason: string;
  finalScore: number;
  levelsCompleted: number;
  totalRounds: number;
  highSingleRoll: number;
  highBank: number;
  levelLostOn: number;
  diceSet?: Die[];
  completedAt: string;
}

interface RecentGamesProps {
  games: GameHistory[];
}

// Format difficulty name for display
const formatDifficulty = (difficulty: string): string => {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1) + ' Difficulty';
};

const GameHistoryCard: React.FC<{ game: GameHistory }> = ({ game }) => {
  const getEndReasonColor = (reason: string) => {
    switch (reason) {
      case 'win': return '#28a745';
      case 'lost': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Use dice set from game history (extracted on server)
  const diceSet = game.diceSet || [];

  return (
    <div style={{
      padding: '15px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e1e5e9'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#2c3e50'
        }}>
          {new Date(game.completedAt).toLocaleDateString('en-US', { 
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}  •  {game.diceSetName}  •  {formatDifficulty(game.difficulty)}
        </div>
        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: getEndReasonColor(game.endReason)
        }}>
          {game.endReason === 'win' ? `🏆 Won (Level ${game.levelLostOn})` : game.endReason === 'lost' ? `💀 Lost (Level ${game.levelLostOn})` : '🚪 Quit'}
        </div>
      </div>
      
      {/* Dice Set Display */}
      {diceSet.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '12px',
          padding: '10px',
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          border: '1px solid #dee2e6'
        }}>
          {diceSet.map((die, idx) => (
            <DiceFace
              key={`${game.id}-${die.id}-${idx}`}
              value={die.allowedValues?.[0] || 3}
              size={35}
              material={die.material}
            />
          ))}
        </div>
      )}
      
    </div>
  );
};

export const RecentGames: React.FC<RecentGamesProps> = ({ games }) => {
  return (
    <div>
      <h2 style={{
        fontSize: '20px',
        marginBottom: '15px',
        color: '#2c3e50'
      }}>
        Recent Games
      </h2>
      {games.length === 0 ? (
        <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
          No games played yet
        </p>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {games.map((game) => (
            <GameHistoryCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
};

