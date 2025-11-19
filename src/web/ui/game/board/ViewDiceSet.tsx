import React, { useState, useEffect } from 'react';
import { DiceFace } from './dice/DiceFace';
import { Die } from '../../../../game/types';

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
    // Show single die icon
    return (
      <button
        onClick={handleToggle}
        style={{
          position: 'absolute',
          bottom: '15px',
          right: '15px',
          width: '50px',
          height: '50px',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
          transition: 'all 0.2s ease',
          padding: '4px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {diceSet.length > 0 && (
          <DiceFace
            value={diceSet[0].allowedValues[0] || 1}
            size={40}
            material={diceSet[0].material}
            pipEffect={diceSet[0].pipEffects?.[diceSet[0].allowedValues[0] || 1]}
          />
        )}
      </button>
    );
  }

  // Calculate width needed for expanded sides
  const maxSides = Math.max(...diceSet.map(die => die.allowedValues.length), 0);
  const expandedWidth = maxSides * (45 + 6) + 16; // 45px die + 6px gap + 16px padding
  const containerWidth = expandedDieId ? expandedWidth + 60 + 24 : 'auto'; // 60px die + 24px padding

  // Show column of all dice
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '15px',
        right: '15px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px',
        maxHeight: 'calc(100% - 30px)',
        overflowY: 'auto',
        overflowX: 'visible',
        zIndex: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '12px',
        paddingTop: '40px',
        borderRadius: '12px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        width: typeof containerWidth === 'number' ? `${containerWidth}px` : containerWidth,
        transition: 'width 0.2s ease'
      }}
    >
      {/* Close button */}
      <button
        onClick={handleToggle}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '28px',
          height: '28px',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          lineHeight: 1,
          padding: 0
        }}
      >
        ×
      </button>

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
                width: '60px',
                height: '60px',
                border: isAnyExpanded ? '2px solid #ffc107' : '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                backgroundColor: isAnyExpanded ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <DiceFace
                value={currentValue}
                size={50}
                material={die.material}
                pipEffect={die.pipEffects?.[currentValue]}
              />
            </button>

            {/* Expanded sides row - show for all dice when any die is expanded */}
            {isAnyExpanded && (
              <div
                style={{
                  position: 'absolute',
                  right: 'calc(100% + 8px)',
                  top: '0',
                  display: 'flex',
                  gap: '6px',
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  padding: '8px',
                  borderRadius: '8px',
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
                      gap: '4px'
                    }}
                  >
                    <DiceFace
                      value={value}
                      size={45}
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
    </div>
  );
};

