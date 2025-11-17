import React from 'react';
import { Button } from '../components/Button';

interface GameControlsProps {
  // Regular controls
  onRoll: () => void;
  onBank: () => void;
  onContinue?: () => void; // For continuing after flop
  canRoll: boolean;
  canBank: boolean;
  canReroll: boolean; // After scoring - can roll remaining dice
  isWaitingForReroll?: boolean; // Before scoring - can reroll any dice
  canRerollSelected?: boolean; // Before scoring - can reroll selected dice
  canContinueFlop?: boolean; // After flop - can continue
  diceToReroll: number;
  selectedDiceCount?: number; // Number of dice selected for reroll
  hasRoundState?: boolean; // Whether a round state exists (to differentiate "Start New Round" vs "Roll")
}

export const GameControls: React.FC<GameControlsProps> = ({
  onRoll,
  onBank,
  onContinue,
  canRoll,
  canBank,
  canReroll,
  isWaitingForReroll = false,
  canRerollSelected = false,
  canContinueFlop = false,
  diceToReroll,
  selectedDiceCount = 0,
  hasRoundState = false
}) => {
  // Determine roll button text based on context
  const getRollButtonText = () => {
    if (canContinueFlop) {
      return '-1 Life';
    } else if (canReroll) {
      // After scoring - rolling remaining dice (or hot dice full set)
      return `Roll (${diceToReroll} dice)`;
    } else if (isWaitingForReroll) {
      // Before scoring - can reroll any dice (including 0 dice)
      if (selectedDiceCount > 0) {
        return `Reroll (${selectedDiceCount} dice)`;
      }
      return 'Reroll (0 dice)';
    } else if (canRoll) {
      // Starting a new round OR first roll of a round
      if (hasRoundState) {
        // Round exists but no dice rolled - show "Roll X dice" where X is the dice set size
        return `Roll (${diceToReroll} dice)`;
      } else {
        // No round state - show "Start New Round"
        return 'Start New Round';
      }
    }
    // Fallback
    return 'Roll Dice';
  };

  // Determine if roll button should be enabled
  const isRollButtonEnabled = canRoll || canReroll || canRerollSelected || canContinueFlop;
  
  // Determine which handler to use
  const handleRollClick = () => {
    if (canContinueFlop && onContinue) {
      onContinue();
    } else {
      onRoll();
    }
  };

  return (
    <div style={{ marginTop: '15px' }}>
      
      {/* Regular Game Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <Button onClick={handleRollClick} disabled={!isRollButtonEnabled} style={{
          minHeight: '44px',
          padding: '10px 16px',
          fontSize: '14px'
        }}>
          {getRollButtonText()}
        </Button>
        
        <Button onClick={onBank} disabled={!canBank} style={{
          minHeight: '44px',
          padding: '10px 16px',
          fontSize: '14px'
        }}>
          Bank Points
        </Button>
      </div>
    </div>
  );
}; 