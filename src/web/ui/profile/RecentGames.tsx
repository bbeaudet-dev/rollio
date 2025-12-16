import React, { useState } from 'react';
import { DiceFace } from '../game/board/dice/DiceFace';
import { Die } from '../../../game/types';
import { CharmCard } from '../components/CharmCard';
import { ConsumableCard } from '../components/ConsumableCard';
import { BlessingCard } from '../components/BlessingCard';
import { ActionButton } from '../components/ActionButton';

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
  worldNumber?: number;
  diceSet?: Die[];
  charms?: any[];
  consumables?: any[];
  blessings?: any[];
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
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getEndReasonColor = (reason: string) => {
    switch (reason) {
      case 'win': return '#28a745';
      case 'lost': return '#dc3545';
      case 'quit': return '#6c757d';
      case 'in_progress': return '#007bff';
      default: return '#6c757d';
    }
  };
  
  const getEndReasonText = (reason: string, levelLostOn: number) => {
    switch (reason) {
      case 'win': return `🏆 Won (Level ${levelLostOn})`;
      case 'lost': return `💀 Lost (Level ${levelLostOn})`;
      case 'quit': return '🚪 Quit';
      case 'in_progress': return '⏳ In Progress';
      default: return '🚪 Quit';
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
          color: '#2c3e50',
          flex: 1
        }}>
          {new Date(game.completedAt).toLocaleDateString('en-US', { 
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}  •  {formatDifficulty(game.difficulty)}
          {game.worldNumber && (
            <span style={{ marginLeft: '8px', color: '#6c757d', fontWeight: 'normal' }}>
              (World {game.worldNumber}, Level {game.levelLostOn})
            </span>
          )}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: getEndReasonColor(game.endReason)
          }}>
            {getEndReasonText(game.endReason, game.levelLostOn)}
          </div>
          <ActionButton
            onClick={() => setIsExpanded(!isExpanded)}
            variant="secondary"
            size="small"
            style={{
              padding: '4px 8px',
              minWidth: '60px'
            }}
          >
            {isExpanded ? '▲' : '▼'}
          </ActionButton>
        </div>
      </div>
      
      {/* Expanded content - hidden by default */}
      {isExpanded && (
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #dee2e6'
        }}>
          {/* Dice Set Display */}
          {diceSet.length > 0 && (
            <div style={{
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#6c757d',
                marginBottom: '8px'
              }}>
                Dice Set ({diceSet.length})
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                padding: '10px',
                backgroundColor: '#ffffff',
                borderRadius: '6px',
                border: '1px solid #dee2e6'
              }}>
                {diceSet.map((die, idx) => {
                  const firstValue = die.allowedValues?.[0] || 3;
                  const pipEffect = die.pipEffects?.[firstValue];
                  
                  return (
                    <DiceFace
                      key={`${game.id}-${die.id}-${idx}`}
                      value={firstValue}
                      size={35}
                      material={die.material}
                      pipEffect={pipEffect}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Charms, Consumables, and Blessings Display */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {/* Charms */}
            {game.charms && game.charms.length > 0 && (
              <div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#6c757d',
                  marginBottom: '8px'
                }}>
                  Charms ({game.charms.length})
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  {game.charms.map((charm, idx) => (
                    <CharmCard
                      key={`${game.id}-charm-${idx}`}
                      charm={charm}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Consumables */}
            {game.consumables && game.consumables.length > 0 && (
              <div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#6c757d',
                  marginBottom: '8px'
                }}>
                  Consumables ({game.consumables.length})
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  {game.consumables.map((consumable, idx) => (
                    <ConsumableCard
                      key={`${game.id}-consumable-${idx}`}
                      consumable={consumable}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Blessings */}
            {game.blessings && game.blessings.length > 0 && (
              <div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#6c757d',
                  marginBottom: '8px'
                }}>
                  Blessings ({game.blessings.length})
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  {game.blessings.map((blessing, idx) => (
                    <BlessingCard
                      key={`${game.id}-blessing-${idx}`}
                      blessing={blessing}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
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
