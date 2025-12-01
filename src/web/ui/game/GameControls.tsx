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
      {/* Centered button group */}
      <div style={{ 
        position: 'relative',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'flex-end',
        gap: '16px',
        minHeight: '60px',
        paddingLeft: '20px',
        paddingRight: '20px'
      }}>
        {/* Left Button - Reroll (Blue) - Separate Skip Reroll when no dice selected, single when dice selected */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'flex-end', 
          gap: '8px',
          justifySelf: 'end',
          alignSelf: 'flex-end'
        }}>
          {showSplitRerollButton ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              {/* Skip Reroll button - smaller, above (doesn't use a reroll, so no indicator) */}
              <button
                onClick={onReroll}
                disabled={!isRerollEnabled}
                style={{
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  backgroundColor: !isRerollEnabled ? '#6c757d' : '#6c757d',
                  color: 'white',
                  border: '2px solid black',
                  borderRadius: '8px',
                  cursor: isRerollEnabled ? 'pointer' : 'not-allowed',
                  opacity: isRerollEnabled ? 1 : 0.6,
                  whiteSpace: 'nowrap',
                  minWidth: '80px'
                }}
              >
                Skip Reroll
              </button>
              {/* Reroll All button - below (uses a reroll, so show indicator) */}
              <GameControlButton
                onClick={onRerollAll}
                disabled={!isRerollEnabled}
                backgroundColor="#007bff"
                text="Reroll All"
                size="normal"
              >
                <RerollIndicator count={rerollsRemaining} />
              </GameControlButton>
            </div>
          ) : (
            // Single button: Reroll # Dice
            <GameControlButton
              onClick={onReroll}
              disabled={!isRerollEnabled}
              backgroundColor="#007bff"
              text={getRerollLeftText()}
              size="normal"
            >
              <RerollIndicator count={rerollsRemaining} />
            </GameControlButton>
          )}
        </div>
        
        {/* Roll/Score Button (middle) - Always centered in the middle column */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifySelf: 'center'
        }}>
          {/* Hot Dice Counter - above buttons */}
          {hotDiceCounter > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '4px'
            }}>
              <HotDiceCounter count={hotDiceCounter} />
            </div>
          )}

          {/* Select All / Deselect buttons - above Roll/Score button */}
          {canSelectDice && onSelectAll && onDeselect && totalDiceCount > 0 && breakdownState !== 'animating' && (
            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              marginBottom: '4px'
            }}>
              <button
                onClick={onSelectAll}
                disabled={selectedDiceCount === totalDiceCount}
                style={{
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  backgroundColor: selectedDiceCount === totalDiceCount ? '#6c757d' : '#6c757d',
                  color: 'white',
                  border: '2px solid black',
                  borderRadius: '8px',
                  cursor: selectedDiceCount === totalDiceCount ? 'not-allowed' : 'pointer',
                  opacity: selectedDiceCount === totalDiceCount ? 0.6 : 1,
                  whiteSpace: 'nowrap',
                  minWidth: '80px'
                }}
              >
                Select All
              </button>
              <button
                onClick={onDeselect}
                disabled={selectedDiceCount === 0}
                style={{
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  backgroundColor: selectedDiceCount === 0 ? '#6c757d' : '#6c757d',
                  color: 'white',
                  border: '2px solid black',
                  borderRadius: '8px',
                  cursor: selectedDiceCount === 0 ? 'not-allowed' : 'pointer',
                  opacity: selectedDiceCount === 0 ? 0.6 : 1,
                  whiteSpace: 'nowrap',
                  minWidth: '80px'
                }}
              >
                Deselect
              </button>
            </div>
          )}

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
        </div>
        
        {/* Right Button - Bank (Green) */}
        <div ref={bankButtonRef} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'flex-end',
          justifySelf: 'start'
        }}>
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
