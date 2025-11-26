import React, { useEffect, useRef, useState } from 'react';
import { GameControlButton } from '../components/GameControlButton';
import { RerollIndicator } from '../components/RerollIndicator';
import { BankIndicator } from '../components/BankIndicator';
import { LevelProgressBar } from '../components/LevelProgressBar';
import { FireEffect } from '../components/FireEffect';
import { HotDiceCounter } from './board/HotDiceCounter';

interface GameControlsProps {
  // Button handlers
  onReroll: () => void; // Left button - only rerolling
  onRerollAll: () => void; // Reroll all dice
  onRollOrScore: () => void; // Middle button - rolling or scoring
  onBank: () => void; // Right button - banking
  onSelectAll?: () => void; // Select all dice
  onDeselect?: () => void; // Deselect all dice
  
  // State flags
  canReroll: boolean; // Can reroll (after scoring, before scoring)
  canRoll: boolean; // Can start a new roll (at start, after scoring)
  canScore: boolean; // Can score selected dice (dice selected and valid)
  canBank: boolean; // Can bank points
  canSelectDice?: boolean; // Can select dice
  
  // Display info
  diceToRoll: number; // Number of dice to roll
  selectedDiceCount: number; // Number of dice selected
  totalDiceCount?: number; // Total dice available to select
  rerollsRemaining?: number; // Number of rerolls remaining
  banksRemaining?: number; // Number of banks remaining
  levelPoints?: number; // Current level points (banked)
  levelThreshold?: number; // Level threshold
  roundPoints?: number; // Current pot (unbanked points)
  hotDiceCounter?: number; // Hot dice counter for fire effect
  previewScoring?: {
    isValid: boolean;
    points: number;
    combinations: string[];
  } | null;
  breakdownState?: 'hidden' | 'animating' | 'complete';
}

export const GameControls: React.FC<GameControlsProps> = ({
  onReroll,
  onRerollAll,
  onRollOrScore,
  onBank,
  onSelectAll,
  onDeselect,
  canReroll,
  canRoll,
  canScore,
  canBank,
  canSelectDice = false,
  diceToRoll,
  selectedDiceCount,
  totalDiceCount = 0,
  rerollsRemaining = 0,
  banksRemaining = 0,
  levelPoints = 0,
  levelThreshold = 0,
  roundPoints = 0,
  hotDiceCounter = 0,
  previewScoring = null,
  breakdownState = 'hidden'
}) => {
  // Determine if middle button should show "Roll" or "Score"
  // In scoring mode if we can select dice (after rolling, before banking, canRoll is false)
  const isScoringMode = !canRoll;
  const isValidSelection = previewScoring?.isValid || false;
  
  // Reroll Button (left) - split when no dice selected, single when dice selected
  const getRerollLeftText = () => {
    if (canReroll) {
      if (selectedDiceCount === 0) {
        return 'Skip Reroll';
      }
      return `Reroll ${selectedDiceCount} ${selectedDiceCount === 1 ? 'Die' : 'Dice'}`;
    }
    return 'Reroll';
  };
  
  const getRerollRightText = () => {
    return 'Reroll All';
  };
  
  // Allow reroll when canReroll is true, even with 0 dice selected
  // This allows "Skip Reroll" and "Reroll All" to trigger flop checks
  // Disable during breakdown animation
  const isRerollEnabled = canReroll && breakdownState !== 'animating';
  
  // Show split button when no dice selected, single button when dice selected
  const showSplitRerollButton = selectedDiceCount === 0;
  
  // Roll/Score Button (middle)
  const getRollOrScoreButtonText = () => {
    if (isScoringMode) {
      // Show "Score X Dice" or "Score 1 Die"
      if (selectedDiceCount === 1) {
        return 'Score 1 Die';
      }
      return `Score ${selectedDiceCount} Dice`;
    } else {
      // Show "Roll X Dice"
      return `Roll ${diceToRoll} Dice`;
    }
  };
  
  // After scoring, canRoll should be true (to roll remaining dice)
  // In scoring mode, enable if valid selection OR if we're just waiting (Score 0 Dice grayed)
  // Disable during breakdown animation
  const isRollOrScoreEnabled = (canRoll || (isScoringMode && isValidSelection)) && breakdownState !== 'animating';
  
  // Disable bank button during breakdown animation
  const isBankEnabled = canBank && breakdownState !== 'animating';
  
  // Determine button color for Roll/Score button
  const getMiddleButtonColor = () => {
    if (isScoringMode) {
      // Yellow/orange when scoring
      return '#ff9800';
    } else {
      // Red when rolling
      return '#dc3545';
    }
  };
  
  const handleMiddleButtonClick = () => {
    onRollOrScore();
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const bankButtonRef = useRef<HTMLDivElement>(null);
  const [progressBarLeft, setProgressBarLeft] = useState<number | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (bankButtonRef.current && containerRef.current) {
        const bankButtonRect = bankButtonRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        // Position to the right of the Bank button with a small gap
        const left = bankButtonRect.right - containerRect.left + 12; // 12px gap
        setProgressBarLeft(left);
      }
    };

    // Calculate position after render
    updatePosition();

    // Recalculate on window resize
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [diceToRoll, selectedDiceCount, canRoll]); // Recalculate when button text might change

  return (
    <div ref={containerRef} style={{ marginTop: '15px', position: 'relative' }}>
      {/* Select All / Deselect buttons - above Roll/Score button */}
      {canSelectDice && onSelectAll && onDeselect && totalDiceCount > 0 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          marginBottom: '8px'
        }}>
          <button
            onClick={onSelectAll}
            disabled={selectedDiceCount === totalDiceCount}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              backgroundColor: selectedDiceCount === totalDiceCount ? '#ccc' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedDiceCount === totalDiceCount ? 'not-allowed' : 'pointer',
              opacity: selectedDiceCount === totalDiceCount ? 0.6 : 1
            }}
          >
            Select All
          </button>
          <button
            onClick={onDeselect}
            disabled={selectedDiceCount === 0}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              backgroundColor: selectedDiceCount === 0 ? '#ccc' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedDiceCount === 0 ? 'not-allowed' : 'pointer',
              opacity: selectedDiceCount === 0 ? 0.6 : 1
            }}
          >
            Deselect
          </button>
        </div>
      )}
      
      {/* Centered button group */}
      <div style={{ 
        display: 'flex', 
        gap: 'clamp(8px, 1.5vw, 12px)', 
        justifyContent: 'center',
        alignItems: 'flex-end',
        flexWrap: 'nowrap'
      }}>
        {/* Left Button - Reroll (Blue) - Split when no dice selected, single when dice selected */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {showSplitRerollButton ? (
            // Split button: Skip Reroll / Reroll All
            <div style={{
              display: 'flex',
              borderRadius: '8px',
              overflow: 'hidden',
              border: isRerollEnabled ? '2px solid #007bff' : '2px solid #ccc',
              backgroundColor: isRerollEnabled ? '#007bff' : '#ccc',
              cursor: isRerollEnabled ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s ease, border-color 0.2s ease',
            }}>
              <div
                onClick={isRerollEnabled ? onReroll : undefined}
                style={{
                  flex: 1,
                  padding: '10px 15px',
                  fontSize: '14px',
                  color: 'white',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  borderRight: '1px solid rgba(255,255,255,0.3)',
                  whiteSpace: 'nowrap',
                  minWidth: '80px',
                  boxSizing: 'border-box',
                  backgroundColor: isRerollEnabled ? '#007bff' : '#ccc',
                }}
              >
                {getRerollLeftText()}
              </div>
              <div
                onClick={isRerollEnabled ? onRerollAll : undefined}
                style={{
                  flex: 1,
                  padding: '10px 15px',
                  fontSize: '14px',
                  color: 'white',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  minWidth: '80px',
                  boxSizing: 'border-box',
                  backgroundColor: isRerollEnabled ? '#0056b3' : '#b0b0b0', // Slightly darker for "Reroll All"
                }}
              >
                {getRerollRightText()}
              </div>
            </div>
          ) : (
            // Single button: Reroll # Dice
            <button
              onClick={onReroll}
              disabled={!isRerollEnabled}
              style={{
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: 'bold',
                backgroundColor: isRerollEnabled ? '#007bff' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isRerollEnabled ? 'pointer' : 'not-allowed',
                opacity: isRerollEnabled ? 1 : 0.6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '120px',
                whiteSpace: 'nowrap'
              }}
            >
              {getRerollLeftText()}
            </button>
          )}
          {/* Reroll Indicator - below button(s) */}
          <div style={{ marginTop: '4px' }}>
            <RerollIndicator count={rerollsRemaining} />
          </div>
        </div>
        
        {/* Roll/Score Button (middle) */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {/* Glow effect - show whenever hot dice counter is active, regardless of button state */}
          {hotDiceCounter > 0 && (
            <FireEffect intensity={hotDiceCounter} />
          )}
          <GameControlButton
            onClick={handleMiddleButtonClick}
            disabled={!isRollOrScoreEnabled}
            backgroundColor={getMiddleButtonColor()}
            text={getRollOrScoreButtonText()}
            size="large"
          />
          {/* Hot dice counter - positioned above button */}
          {hotDiceCounter > 0 && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '4px'
            }}>
              <HotDiceCounter count={hotDiceCounter} />
            </div>
          )}
        </div>
        
        {/* Right Button - Bank (Green) */}
        <div ref={bankButtonRef}>
          <GameControlButton
            onClick={onBank}
            disabled={!isBankEnabled}
            backgroundColor="#28a745"
            text="Bank Points"
            size="normal"
          >
            <BankIndicator count={banksRemaining} />
          </GameControlButton>
        </div>
      </div>
      
      {/* Level Progress Bar - positioned to the right of Bank button, doesn't affect button centering */}
      {progressBarLeft !== null && (
        <div style={{
          position: 'absolute',
          left: `${progressBarLeft}px`,
          bottom: '0'
        }}>
          <LevelProgressBar 
            current={levelPoints} 
            threshold={levelThreshold}
            pot={roundPoints}
          />
        </div>
      )}
    </div>
  );
};
