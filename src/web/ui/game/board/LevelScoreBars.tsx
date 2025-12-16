import React from 'react';
import { formatNumber } from '../../../utils/numberFormatting';

interface LevelScoreBarsProps {
  current: number;
  threshold: number;
  pot?: number; // Current pot (unbanked points)
}

export const LevelScoreBars: React.FC<LevelScoreBarsProps> = ({ 
  current, 
  threshold,
  pot = 0
}) => {
  // Clamp to 0–100% by magnitude for both banked and pot
  const bankedRatio = threshold > 0 ? Math.abs(current / threshold) : 0;
  const bankedPercentage = Math.min(bankedRatio * 100, 100);
  const potRatio = threshold > 0 ? Math.abs(pot / threshold) : 0;
  const potPercentage = Math.min(potRatio * 100, 100);

  const isBankNegative = current < 0;
  const isPotNegative = pot < 0;

  const potTextStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    // Lighter versions of bar colors: positive lime (#d4ff3f -> #f5ffd0), negative orange (#ffb74d -> #ffe0b2)
    color: isPotNegative ? '#ffe0b2' : '#f5ffd0',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
    whiteSpace: 'nowrap',
  };

  const levelTextStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    // Lighter versions of bar colors: positive green (#66bb6a -> #c8e6c9), negative red (#ff5252 -> #ffcdd2)
    color: isBankNegative ? '#ffcdd2' : '#c8e6c9',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
    whiteSpace: 'nowrap',
  };
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '8px',
      minWidth: '280px'
    }}>
      {/* Banked bar */}
      <div style={{
        width: '100%',
        height: '32px',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        display: 'flex',
        // Positive bank: grow from left to right (align left)
        // Negative bank: grow from right to left (align right)
        justifyContent: isBankNegative ? 'flex-end' : 'flex-start',
        alignItems: 'stretch',
        position: 'relative',
      }}>
        {bankedPercentage > 0 && (
          <div style={{
            width: `${bankedPercentage}%`,
            height: '100%',
            background: isBankNegative
              ? 'linear-gradient(90deg, #e53935, #ff5252)'
              : 'linear-gradient(90deg, #43a047, #66bb6a)',
            transition: 'width 0.3s ease, background-color 0.3s ease',
            // Square leading edge, rounded trailing edge; fully rounded when 100%
            borderRadius: bankedPercentage >= 99.5
              ? '12px'
              : isBankNegative
                ? '0 12px 12px 0'   // right-anchored (negative bank)
                : '12px 0 0 12px', // left-anchored (positive bank)
          }} />
        )}
        {/* Centered text inside banked bar */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={levelTextStyle}>
            {formatNumber(current)} / {formatNumber(threshold)}
          </span>
        </div>
      </div>

      {/* Round Score (Pot) bar */}
      {pot !== 0 && (
        <div style={{
          width: '100%',
          height: '32px',
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          display: 'flex',
          // Positive pot: grow from right to left (align right)
          // Negative pot: grow from left to right (align left)
          justifyContent: isPotNegative ? 'flex-start' : 'flex-end',
          alignItems: 'stretch',
          position: 'relative',
        }}>
          {potPercentage > 0 && (
            <div style={{
              width: `${potPercentage}%`,
              height: '100%',
              background: isPotNegative
                ? 'linear-gradient(90deg, #ff9800, #ffb74d)'
                : 'linear-gradient(90deg, #b2ff59, #d4ff3f)',
              transition: 'width 0.3s ease',
              // Square leading edge, rounded trailing edge; fully rounded when 100%
              borderRadius: potPercentage >= 99.5
                ? '12px'
                : isPotNegative
                  ? '12px 0 0 12px'   // left-anchored
                  : '0 12px 12px 0',  // right-anchored
            }} />
          )}
          {/* Centered text inside pot bar */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span style={potTextStyle}>
              Pot: {formatNumber(pot)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};


