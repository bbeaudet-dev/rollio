import React, { useEffect, useRef, useState } from 'react';
import { GameControlButton } from '../components/GameControlButton';
import { RerollIndicator } from '../components/RerollIndicator';
import { BankIndicator } from '../components/BankIndicator';
import { LevelProgressBar } from '../components/LevelProgressBar';

interface GameControlsProps {
  // Button handlers
  onReroll: () => void; // Left button - only rerolling
  onRollOrScore: () => void; // Middle button - rolling or scoring
  onBank: () => void; // Right button - banking
  
  // State flags
  canReroll: boolean; // Can reroll (after scoring, before scoring)
  canRoll: boolean; // Can start a new roll (at start, after scoring)
  canScore: boolean; // Can score selected dice (dice selected and valid)
  canBank: boolean; // Can bank points
  
  // Display info
  diceToRoll: number; // Number of dice to roll
  selectedDiceCount: number; // Number of dice selected
  rerollsRemaining?: number; // Number of rerolls remaining
  banksRemaining?: number; // Number of banks remaining
  levelPoints?: number; // Current level points (banked)
  levelThreshold?: number; // Level threshold
  roundPoints?: number; // Current pot (unbanked points)
  previewScoring?: {
    isValid: boolean;
    points: number;
    combinations: string[];
  } | null;
  breakdownState?: 'hidden' | 'animating' | 'complete';
}

export const GameControls: React.FC<GameControlsProps> = ({
  onReroll,
  onRollOrScore,
  onBank,
  canReroll,
  canRoll,
  canScore,
  canBank,
  diceToRoll,
  selectedDiceCount,
  rerollsRemaining = 0,
  banksRemaining = 0,
  levelPoints = 0,
  levelThreshold = 0,
  roundPoints = 0,
  previewScoring = null,
  breakdownState = 'hidden'
}) => {
  // Determine if middle button should show "Roll" or "Score"
  // In scoring mode if we can select dice (after rolling, before banking, canRoll is false)
  const isScoringMode = !canRoll;
  const isValidSelection = previewScoring?.isValid || false;
  
  // Reroll Button (left)
  const getRerollButtonText = () => {
    if (canReroll) {
      if (selectedDiceCount === 0) {
        return 'Skip Reroll';
      }
      return `Reroll ${selectedDiceCount} ${selectedDiceCount === 1 ? 'Die' : 'Dice'}`;
    }
    return 'Reroll';
  };
  
  // Allow reroll when canReroll is true, even with 0 dice selected
  // This allows "Skip Reroll" to trigger flop checks
  // Disable during breakdown animation
  const isRerollEnabled = canReroll && breakdownState !== 'animating';
  
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
        display: 'flex', 
        gap: 'clamp(8px, 1.5vw, 12px)', 
        justifyContent: 'center',
        alignItems: 'flex-end',
        flexWrap: 'nowrap'
      }}>
        {/* Left Button - Reroll (Blue) */}
        <GameControlButton
          onClick={onReroll}
          disabled={!isRerollEnabled}
          backgroundColor="#007bff"
          text={getRerollButtonText()}
          size="normal"
        >
          <RerollIndicator count={rerollsRemaining} />
        </GameControlButton>
        
        {/* Roll/Score Button (middle) */}
        <GameControlButton
          onClick={handleMiddleButtonClick}
          disabled={!isRollOrScoreEnabled}
          backgroundColor={getMiddleButtonColor()}
          text={getRollOrScoreButtonText()}
          size="large"
        />
        
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
