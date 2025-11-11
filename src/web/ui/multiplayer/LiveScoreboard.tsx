import React from 'react';

interface Player {
  id: string;
  username: string;
  gameScore: number;
  currentRound: number;
  hotDiceCounterRound: number;
  roundPoints: number;
}

interface LiveScoreboardProps {
  players: Player[];
  currentPlayerId: string;
  activePlayerIds: string[];
}

export const LiveScoreboard: React.FC<LiveScoreboardProps> = ({
  players,
  currentPlayerId,
  activePlayerIds
}) => {
  // Calculate performance score and sort players
  const sortedPlayers = [...players].sort((a, b) => {
    // Calculate performance score: (GameScore + RoundPoints) / RoundNumber
    // Use max(1, roundNumber) to avoid division by zero
    const aScore = (a.gameScore + a.roundPoints) / Math.max(1, a.currentRound);
    const bScore = (b.gameScore + b.roundPoints) / Math.max(1, b.currentRound);
    return bScore - aScore; // Sort descending (highest first)
  });

  // Get badge color based on rank
  const getBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#6c757d'; // Basic gray
    }
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#fff',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      maxWidth: '600px'
    }}>
      <h3 style={{ 
        margin: '0 0 15px 0',
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        fontWeight: 'bold'
      }}>🏆 Live Scoreboard</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sortedPlayers.map((player, index) => {
          const isActivePlayer = activePlayerIds.includes(player.id);
          const isCurrentPlayer = player.id === currentPlayerId;
          const rank = index + 1;
          const badgeColor = getBadgeColor(rank);
          
          return (
            <div
              key={player.id}
              style={{
                fontFamily: 'Arial, sans-serif',
                padding: '12px',
                backgroundColor: isCurrentPlayer ? '#e3f2fd' : '#fff',
                border: isCurrentPlayer ? '2px solid #2196f3' : '1px solid #ddd',
                borderRadius: '6px',
                opacity: isActivePlayer ? 1 : 0.6
              }}
            >
              {/* Single row layout with responsive design */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {/* Rank badge and player name */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '140px',
                  maxWidth: '200px'
                }}>
                  <span style={{
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    color: '#fff',
                    backgroundColor: badgeColor,
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {rank}
                  </span>
                  <span style={{ 
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: isCurrentPlayer ? 'bold' : 'normal',
                    fontSize: '16px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {player.username} {isCurrentPlayer ? '(You)' : ''}
                    {!isActivePlayer && ' (Spectating)'}
                  </span>
                </div>
                
                {/* Stats section */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '14px',
                  color: '#666',
                  flexWrap: 'wrap',
                  flex: 1,
                  justifyContent: 'center'
                }}>
                  <span style={{ fontFamily: 'Arial, sans-serif' }}>
                    <span style={{ fontWeight: 'bold' }}>Round:</span> {player.currentRound}
                  </span>
                  <span style={{ fontFamily: 'Arial, sans-serif' }}>
                    <span style={{ fontWeight: 'bold' }}>🔥:</span> {player.hotDiceCounterRound}
                  </span>
                  <span style={{ fontFamily: 'Arial, sans-serif' }}>
                    <span style={{ fontWeight: 'bold' }}>Points:</span> {player.roundPoints}
                  </span>
                </div>
                
                {/* Game score */}
                <span style={{ 
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  color: '#2196f3',
                  minWidth: '60px',
                  textAlign: 'right'
                }}>
                  {player.gameScore}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 