import React, { useState } from 'react';
import { GameState } from '../../../../game/types';
import { formatCombinationKey } from '../../../../game/utils/combinationTracking';
import { ActionButton } from '../../components/ActionButton';

interface ViewCombinationLevelsProps {
  gameState: GameState | null;
}

export const ViewCombinationLevels: React.FC<ViewCombinationLevelsProps> = ({ gameState }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const combinationLevels = gameState?.history?.combinationLevels || {};
  const hasLevels = Object.keys(combinationLevels).length > 0;

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isExpanded) {
    // Show hand icon button
    return (
      <ActionButton
        onClick={handleToggle}
        variant="secondary"
        size="small"
        style={{
          position: 'absolute',
          bottom: '15px',
          right: '65px', // Positioned to the left of ViewDiceSet (which is at right: 15px, width: 40px, so 15 + 40 + 10 = 65px)
          width: '40px',
          minWidth: '40px',
          height: '40px',
          minHeight: '40px',
          padding: '0',
          zIndex: 20,
          fontSize: '24px',
          lineHeight: '1',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2), 0 0 6px rgba(255, 255, 255, 0.1)'
        }}
        title="View Combination Levels"
      >
        ✋
      </ActionButton>
    );
  }

  // Show expanded view with combination levels
  const sortedLevels = Object.entries(combinationLevels)
    .sort(([keyA], [keyB]) => {
      // Sort by combination type first, then by parameter
      const [typeA, paramA] = keyA.split(':');
      const [typeB, paramB] = keyB.split(':');
      if (typeA !== typeB) {
        return typeA.localeCompare(typeB);
      }
      return Number(paramA || 0) - Number(paramB || 0);
    });

  return (
    <div
      style={{
        position: 'absolute',
        top: '50px',
        right: '0px',
        width: '300px',
        maxHeight: '400px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        border: '2px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '8px',
        padding: '12px',
        zIndex: 30,
        overflowY: 'auto',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        paddingBottom: '8px'
      }}>
        <h3 style={{
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold',
          margin: 0
        }}>
          Combination Levels
        </h3>
        <ActionButton
          onClick={handleToggle}
          variant="secondary"
          size="small"
          style={{
            padding: '2px 6px',
            minWidth: '24px',
            minHeight: '24px',
            fontSize: '16px',
            lineHeight: '1',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white'
          }}
        >
          ×
        </ActionButton>
      </div>

      {!hasLevels ? (
        <div style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '14px',
          textAlign: 'center',
          padding: '20px'
        }}>
          No combinations have been upgraded yet.
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {sortedLevels.map(([key, level]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 8px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px'
              }}
            >
              <span style={{
                color: '#fff',
                fontSize: '13px',
                fontWeight: 500
              }}>
                {formatCombinationKey(key)}
              </span>
              <span style={{
                color: '#4caf50',
                fontSize: '14px',
                fontWeight: 'bold',
                minWidth: '30px',
                textAlign: 'right'
              }}>
                Lv.{level}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

