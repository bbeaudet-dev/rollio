import React from 'react';
import { WorldEffect } from '../../../../game/data/worlds';
import { LevelEffect } from '../../../../game/data/levels';

interface RoundInfoProps {
  levelNumber: number;
  roundNumber: number;
  rollNumber: number;
  worldNumber?: number;
  worldEffects?: WorldEffect[];
  levelEffects?: LevelEffect[];
  consecutiveFlops?: number;
}

export const RoundInfo: React.FC<RoundInfoProps> = ({
  levelNumber,
  roundNumber,
  rollNumber,
  worldNumber,
  worldEffects = [],
  levelEffects = [],
  consecutiveFlops = 0
}) => {
  // Format effects for display
  const formatWorldEffects = () => {
    if (!worldEffects || worldEffects.length === 0) return null;
    return worldEffects.map(effect => effect.name || effect.description).join(', ');
  };

  const formatLevelEffects = () => {
    if (!levelEffects || levelEffects.length === 0) return null;
    return levelEffects.map(effect => effect.name || effect.description).join(', ');
  };

  const worldEffectsText = formatWorldEffects();
  const levelEffectsText = formatLevelEffects();

  return (
    <>
      {/* HUD overlay - styled to match game */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 20,
        backgroundColor: 'rgba(40, 44, 52, 0.9)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 'normal',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        minWidth: '200px',
        maxWidth: '300px'
      }}>
        {/* First row: World, Level, Round, Roll */}
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: worldEffectsText || levelEffectsText ? '6px' : '0',
          flexWrap: 'wrap'
        }}>
          {worldNumber !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontWeight: 'bold' }}>W</span>
              <span>{worldNumber}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontWeight: 'bold' }}>L</span>
            <span>{levelNumber}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontWeight: 'bold' }}>R</span>
            <span>{roundNumber}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>🎲</span>
            <span>{rollNumber}</span>
          </div>
        </div>

        {/* Second row: Effects */}
        {(worldEffectsText || levelEffectsText) && (
          <div style={{
            fontSize: '10px',
            color: '#ccc',
            lineHeight: '1.4',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '6px',
            marginTop: '6px'
          }}>
            {worldEffectsText && (
              <div style={{ marginBottom: levelEffectsText ? '4px' : '0' }}>
                <span style={{ color: '#61dafb', fontWeight: 'bold' }}>World:</span> {worldEffectsText}
              </div>
            )}
            {levelEffectsText && (
              <div>
                <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>Boss:</span> {levelEffectsText}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

