import React from 'react';
import { GameControlButton } from '../components/GameControlButton';

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
  previewScoring?: {
    isValid: boolean;
    points: number;
    combinations: string[];
  } | null;
  
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
  previewScoring = null
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
  const isRerollEnabled = canReroll;
  
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
  const isRollOrScoreEnabled = canRoll || (isScoringMode && isValidSelection);
  
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

  return (
    <div style={{ marginTop: '15px' }}>
      <div style={{ 
        display: 'flex', 
        gap: 'clamp(8px, 1.5vw, 12px)', 
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'nowrap'
      }}>
        {/* Left Button - Reroll (Blue) */}
        <GameControlButton
          onClick={onReroll}
          disabled={!isRerollEnabled}
          backgroundColor="#007bff"
          text={getRerollButtonText()}
          size="normal"
        />
        
        {/* Roll/Score Button (middle) */}
        <GameControlButton
          onClick={handleMiddleButtonClick}
          disabled={!isRollOrScoreEnabled}
          backgroundColor={getMiddleButtonColor()}
          text={getRollOrScoreButtonText()}
          size="large"
        />
        
        {/* Right Button - Bank (Green) */}
        <GameControlButton
          onClick={onBank}
          disabled={!canBank}
          backgroundColor="#28a745"
          text="Bank Points"
          size="normal"
        />
      </div>
    </div>
  );
};
