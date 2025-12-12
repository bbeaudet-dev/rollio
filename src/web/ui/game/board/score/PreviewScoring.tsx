import React from 'react';
import { formatCombinationKey, getCategoryFromKey } from '../../../../../game/utils/combinationTracking';
import { getCombinationLevelColor } from '../../../../utils/combinationLevelColors';

interface PreviewScoringProps {
  previewScoring: {
    isValid: boolean;
    points: number;
    combinations: string[];
    combinationLevels?: { [key: string]: number };
    baseScoringElements?: {
      basePoints: number;
      baseMultiplier: number;
      baseExponent: number;
    };
  } | null;
  isScoring?: boolean; // true when showing scoring breakdown
}

/**
 * Format a number based on context
 * - Points: Always whole numbers
 * - Multiplier/Exponent: Decimals allowed, but stop showing decimals after 10x
 */
function formatNumber(value: number, type: 'points' | 'multiplier' | 'exponent' = 'points'): string {
  if (type === 'points') {
    // Points: Always show as whole number
    return Math.round(value).toString();
  }
  
  // Multiplier/Exponent: Show decimals, but stop after 10x
  if (value >= 10) {
    return Math.round(value).toString();
  }
  
  // Below 10x: Show decimals (up to 2 decimal places, remove trailing zeros)
  const rounded = Math.round(value * 100) / 100;
  if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
    return Math.round(rounded).toString();
  }
  // Remove trailing zeros from decimal representation
  return rounded.toString().replace(/\.?0+$/, '');
}

export const PreviewScoring: React.FC<PreviewScoringProps> = ({
  previewScoring,
  isScoring = false
}) => {
  if (!previewScoring) {
    return null;
  }
  
  const label = isScoring ? 'Scored:' : 'Will Score:';

  return (
    <div style={{
      position: 'absolute',
      top: '0',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100, 
      backgroundColor: previewScoring.isValid 
        ? 'rgba(76, 175, 80, 0.95)' 
        : 'rgba(244, 67, 54, 0.95)',
      border: `2px solid ${previewScoring.isValid ? '#4caf50' : '#f44336'}`,
      borderTop: 'none',
      borderRadius: '0 0 12px 12px',
      padding: '12px 20px',
      fontSize: '18px',
      fontWeight: 600,
      minWidth: '280px',
      maxWidth: '600px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
      pointerEvents: 'none',
      userSelect: 'none',
      textAlign: 'center',
      color: 'white',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      letterSpacing: '0.3px'
    }}>
      {previewScoring.isValid ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{ 
            fontSize: '11px', 
            fontWeight: 500, 
            opacity: 0.9,
            textTransform: 'uppercase',
            letterSpacing: '0.8px'
          }}>
            {label}
          </div>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: 700,
            lineHeight: '1.3',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px'
          }}>
            {previewScoring.combinations.map((key: string, index: number) => {
              const level = previewScoring.combinationLevels?.[key] || 1;
              const levelColor = getCombinationLevelColor(level);
              
              return (
                <React.Fragment key={key}>
                  <span 
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(4px)',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{formatCombinationKey(key)}</span>
                    <span 
                      style={{
                        color: levelColor,
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
                    >
                      Lv.{level}
                    </span>
                  </span>
                  {index < previewScoring.combinations.length - 1 && (
                    <span style={{ fontSize: '18px', opacity: 0.8, fontWeight: 400 }}>+</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {/* Show scoring elements ONLY before scoring (when isScoring is false) */}
          {previewScoring.baseScoringElements && !isScoring && (
            <div style={{
              display: 'flex',
              gap: '6px',
              marginTop: '8px',
              overflow: 'hidden'
            }}>
              {/* Base Points - Green */}
              <div style={{
                flex: 1,
                padding: '6px',
                backgroundColor: '#c8e6c9',
                borderRadius: '4px',
                border: '1px solid #4caf50',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>
                  {formatNumber(previewScoring.baseScoringElements.basePoints, 'points')}
                </div>
              </div>

              {/* Multiplier - Magenta */}
              <div style={{
                flex: 1,
                padding: '6px',
                backgroundColor: '#f8bbd0',
                borderRadius: '4px',
                border: '1px solid #e91e63',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}>
                <div style={{ fontSize: '16px', color: '#c2185b' }}>
                  <span style={{ fontWeight: 'normal' }}>x</span>
                  <span style={{ fontWeight: 'bold' }}>{formatNumber(previewScoring.baseScoringElements.baseMultiplier, 'multiplier')}</span>
                </div>
              </div>

              {/* Exponent - Dark Purple */}
              <div style={{
                flex: 1,
                padding: '6px',
                backgroundColor: '#ce93d8',
                borderRadius: '4px',
                border: '1px solid #9c27b0',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}>
                <div style={{ fontSize: '16px', color: '#7b1fa2' }}>
                  <span style={{ fontWeight: 'normal' }}>^</span>
                  <span style={{ fontWeight: 'bold' }}>{formatNumber(previewScoring.baseScoringElements.baseExponent, 'exponent')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ 
          fontSize: '16px', 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <span>⚠️</span>
          <span>Invalid Selection</span>
        </div>
      )}
    </div>
  );
}; 