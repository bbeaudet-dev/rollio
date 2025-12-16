import React, { useState, useEffect } from 'react';
import { DiceFace } from './dice/DiceFace';
import { Die } from '../../../../game/types';
import { ActionButton } from '../../components/ActionButton';

interface ViewDiceSetProps {
  diceSet: Die[];
}

export const ViewDiceSet: React.FC<ViewDiceSetProps> = ({ diceSet }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedDieId, setExpandedDieId] = useState<string | null>(null);
  const [rotatingValues, setRotatingValues] = useState<Record<string, number>>({});

  // Initialize rotating values for each die
  useEffect(() => {
    const initialValues: Record<string, number> = {};
    diceSet.forEach((die, index) => {
      initialValues[die.id] = die.allowedValues[0] || 1;
    });
    setRotatingValues(initialValues);
  }, [diceSet]);

  // Rotate dice sides randomly every 0.25 seconds when expanded (but not when showing all sides)
  useEffect(() => {
    if (!isExpanded || expandedDieId) return; // Don't rotate when showing all sides

    const interval = setInterval(() => {
      setRotatingValues(prev => {
        const newValues: Record<string, number> = {};
        diceSet.forEach(die => {
          // Pick a random value from allowed values
          const randomIndex = Math.floor(Math.random() * die.allowedValues.length);
          newValues[die.id] = die.allowedValues[randomIndex];
        });
        return newValues;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isExpanded, diceSet, expandedDieId]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (isExpanded) {
      setExpandedDieId(null);
    }
  };

  const handleDieClick = (dieId: string) => {
    if (expandedDieId) {
      setExpandedDieId(null);
    } else {
      // Show all sides for all dice when any die is clicked
      setExpandedDieId(dieId);
    }
  };

  if (!isExpanded) {
    // Show single die icon with arrow indicator
    return (
      <div style={{ position: 'relative', display: 'inline-block', paddingRight: '16px' }}>
        <ActionButton
          onClick={handleToggle}
          variant="secondary"
          size="small"
          style={{
            position: 'relative',
            width: '40px',
            minWidth: '40px',
            height: '40px',
            minHeight: '40px',
            padding: '3px',
            zIndex: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '2px solid rgba(0, 0, 0, 0.3)'
          }}
        >
          {diceSet.length > 0 && (
            <DiceFace
              value={diceSet[0].allowedValues[0] || 1}
              size={32}
              material={diceSet[0].material}
              pipEffect={diceSet[0].pipEffects?.[diceSet[0].allowedValues[0] || 1]}
            />
          )}
        </ActionButton>
        {/* Arrow indicator pointing right - bigger and more visible */}
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            right: '-12px',
            width: '0',
            height: '0',
            borderLeft: '12px solid rgba(0, 0, 0, 0.8)',
            borderTop: '10px solid transparent',
            borderBottom: '10px solid transparent',
            zIndex: 21,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
          }}
        />
      </div>
    );
  }

  // Calculate width needed for expanded sides
  const maxSides = Math.max(...diceSet.map(die => die.allowedValues.length), 0);
  const expandedWidth = maxSides * (32 + 4) + 12; // 32px die + 4px gap + 12px padding
  const containerWidth = expandedDieId ? expandedWidth + 44 + 16 : 'auto'; // 44px die + 16px padding

  // Show column of all dice
  return (
    <div style={{ position: 'relative' }}>
      {/* Expanded view positioned absolutely relative to inventory */}
      <div
        style={{
          position: 'absolute',
          top: '50px',
          right: '0px',
          width: typeof containerWidth === 'number' ? `${containerWidth}px` : containerWidth,
          maxHeight: '400px',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '8px',
          padding: '12px',
          zIndex: 30,
          overflowY: 'auto',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '4px',
          transition: 'width 0.2s ease'
        }}
      >
      {/* Dice column */}
      {diceSet.map((die) => {
        const isAnyExpanded = !!expandedDieId;
        const currentValue = rotatingValues[die.id] || die.allowedValues[0] || 1;

        return (
          <div key={die.id} style={{ position: 'relative' }}>
            {/* Die button */}
            <button
              onClick={() => handleDieClick(die.id)}
              style={{
                width: '44px',
                height: '44px',
                border: isAnyExpanded ? '2px solid #ffc107' : '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                backgroundColor: isAnyExpanded ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3px',
                transition: 'all 0.2s ease'
              }}
            >
              <DiceFace
                value={currentValue}
                size={36}
                material={die.material}
                pipEffect={die.pipEffects?.[currentValue]}
              />
            </button>

            {/* Expanded sides row - show for all dice when any die is expanded */}
            {isAnyExpanded && (
              <div
                style={{
                  position: 'absolute',
                  right: 'calc(100% + 6px)',
                  top: '0',
                  display: 'flex',
                  gap: '4px',
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  padding: '6px',
                  borderRadius: '6px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                  zIndex: 30
                }}
              >
                {die.allowedValues.map((value, index) => (
                  <div
                    key={`${die.id}-${value}-${index}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                  >
                    <DiceFace
                      value={value}
                      size={32}
                      material={die.material}
                      pipEffect={die.pipEffects?.[value]}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Close button at bottom */}
      <ActionButton
        onClick={handleToggle}
        variant="secondary"
        size="small"
        style={{
          marginTop: '12px',
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          color: 'white'
        }}
      >
        Close
      </ActionButton>
      </div>
    </div>
  );
};

