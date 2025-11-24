import React from 'react';
import { getLevelConfig } from '../../../../game/data/levels';
import { getWorldForLevel, isMinibossLevel, isMainBossLevel } from '../../../../game/data/worlds';
import { DifficultyLevel } from '../../../../game/logic/difficulty';
import { GameState } from '../../../../game/types';

interface NextLevelPreviewProps {
  currentLevelNumber: number;
  difficulty: DifficultyLevel;
  gameState?: GameState; // Optional - for accessing pre-generated level configs
}

export const NextLevelPreview: React.FC<NextLevelPreviewProps> = ({
  currentLevelNumber,
  difficulty,
  gameState // Add gameState prop to access pre-generated configs
}) => {
  const nextLevelNumber = currentLevelNumber + 1;
  
  // Check if we're at a world boundary (need to select new world)
  const isAtWorldBoundary = currentLevelNumber % 5 === 0 && currentLevelNumber < 25;
  
  if (isAtWorldBoundary) {
    // At world boundary - show message that world selection is needed
    return (
      <div style={{
        padding: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '6px',
        border: '2px solid #4CAF50',
        marginBottom: '12px'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '8px',
          color: '#2c3e50'
        }}>
          Next Level Preview
        </div>
        <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#555' }}>
          <div style={{ marginBottom: '6px' }}>
            <strong>Choose New World</strong>
          </div>
          <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic' }}>
            Select a world to see upcoming levels
          </div>
        </div>
      </div>
    );
  }
  
  // Not at world boundary - use pre-generated config if available
  const worldLevelIndex = (nextLevelNumber - 1) % 5; // 0-4 index within world
  const preGeneratedConfig = gameState?.currentWorldLevelConfigs?.[worldLevelIndex];
  
  // Calculate next level info (use pre-generated config if available)
  const levelConfig = preGeneratedConfig || getLevelConfig(nextLevelNumber, difficulty);
  const world = getWorldForLevel(nextLevelNumber);
  const isMiniboss = isMinibossLevel(nextLevelNumber);
  const isBoss = isMainBossLevel(nextLevelNumber);
  
  // Format effects for display
  const worldEffects = world?.effects || [];
  const levelEffects = levelConfig.boss?.effects || levelConfig.effects || [];
  
  return (
    <div style={{
      padding: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '6px',
      border: '2px solid #4CAF50',
      marginBottom: '12px'
    }}>
      <div style={{
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#2c3e50'
      }}>
        Next Level Preview
      </div>
      
      <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#555' }}>
        <div style={{ marginBottom: '6px' }}>
          <strong>Level {nextLevelNumber}:</strong> {levelConfig.pointThreshold} points required
        </div>
        
        {worldEffects.length > 0 && (
          <div style={{ marginBottom: '6px' }}>
            <strong style={{ color: '#61dafb' }}>World Effects:</strong>
            <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
              {worldEffects.map((effect, idx) => (
                <li key={idx} style={{ fontSize: '11px' }}>
                  {effect.name || effect.description}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {levelEffects.length > 0 && (
          <div>
            <strong style={{ color: '#ff6b6b' }}>
              {isBoss ? 'Boss Effects:' : isMiniboss ? 'Miniboss Effects:' : 'Level Effects:'}
            </strong>
            <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
              {/* Deduplicate effects by name/description */}
              {Array.from(new Map(levelEffects.map(e => [e.name || e.description, e])).values()).map((effect, idx) => (
                <li key={idx} style={{ fontSize: '11px' }}>
                  {effect.name || effect.description}
                </li>
              ))}
            </ul>
            {(isBoss || isMiniboss) && (
              <div style={{ fontSize: '10px', color: '#888', fontStyle: 'italic', marginTop: '4px' }}>
                Note: Boss/miniboss is randomly selected
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

