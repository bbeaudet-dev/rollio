import React, { useState, useEffect, useMemo } from 'react';
import { getLevelColor } from '../../../utils/levelColors';
import { DiceDisplay } from './DiceDisplay';
import { RoundInfo } from './RoundInfo';
import { GameAlerts } from './GameAlerts';
import { ScoringBreakdownComponent } from './ScoringBreakdown';
import { PreviewScoring } from './score/PreviewScoring';
import { ScoringBreakdown, Die } from '../../../../game/types';
import { ViewDiceSet } from './ViewDiceSet';
import { DifficultyDiceDisplay } from '../../components/DifficultyDiceDisplay';
import { useDifficulty } from '../../../contexts/DifficultyContext';

interface BoardProps {
  dice: any[];
  selectedIndices: number[];
  onDiceSelect: (index: number) => void;
  canSelect: boolean;
  roundNumber?: number;
  rollNumber?: number;
  consecutiveFlops?: number;
  levelNumber?: number;
  previewScoring?: {
    isValid: boolean;
    points: number;
    combinations: string[];
  } | null;
  canChooseFlopShield?: boolean;
  onFlopShieldChoice?: (useShield: boolean) => void;
  onScoreSelectedDice?: () => void;
  lastRollPoints?: number;
  justBanked?: boolean;
  justFlopped?: boolean;
  scoringBreakdown?: ScoringBreakdown | null;
  breakdownState?: 'hidden' | 'animating' | 'complete';
  onCompleteBreakdown?: () => void;
  diceSet?: Die[];
}

export const Board: React.FC<BoardProps> = ({
  dice,
  selectedIndices,
  onDiceSelect,
  canSelect,
  roundNumber = 0,
  rollNumber = 0,
  consecutiveFlops = 0,
  levelNumber = 1,
  previewScoring = null,
  canChooseFlopShield = false,
  onFlopShieldChoice = () => {},
  lastRollPoints = 0,
  justBanked = false,
  justFlopped = false,
  scoringBreakdown = null,
  breakdownState = 'hidden',
  onCompleteBreakdown = () => {},
  diceSet = []
}) => {
  const difficulty = useDifficulty();
  // Get level color (memoized to avoid recalculating on every render)
  const levelColor = useMemo(() => getLevelColor(levelNumber), [levelNumber]);
  
  // Track which dice should animate (only selected dice on reroll)
  const [animatingDiceIds, setAnimatingDiceIds] = useState<Set<string>>(new Set());
  const [lastRollNumber, setLastRollNumber] = useState<number>(rollNumber);
  const [lastSelectedDiceIds, setLastSelectedDiceIds] = useState<Set<string>>(new Set());
  const [highlightedDiceIndices, setHighlightedDiceIndices] = useState<number[]>([]);
  
  // Clear highlights when breakdown is no longer showing
  useEffect(() => {
    if (breakdownState === 'hidden' && highlightedDiceIndices.length > 0) {
      setHighlightedDiceIndices([]);
    }
  }, [breakdownState, highlightedDiceIndices.length]);
  
  // Filter dice to only show rolled dice (have rolledValue), sorted by dice id
  const rolledDice = useMemo(() => {
    return dice
      .filter(die => die.rolledValue !== undefined && die.rolledValue !== null)
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [dice]);
  
  // Track currently selected dice IDs
  const currentSelectedDiceIds = useMemo(() => {
    return new Set(
      selectedIndices.map(idx => dice[idx]?.id).filter(Boolean)
    );
  }, [selectedIndices, dice]);
  
  // Detect reroll: if roll number increased, animate dice that were selected before the reroll
  useEffect(() => {
    if (rollNumber > lastRollNumber) {
      // Roll number increased - check if we had selected dice before
      if (lastSelectedDiceIds.size > 0) {
        // Reroll happened with selected dice - animate those dice
        setAnimatingDiceIds(new Set(lastSelectedDiceIds));
        
        // Clear animation after a short delay
        setTimeout(() => {
          setAnimatingDiceIds(new Set());
        }, 600);
      } else {
        // New roll without selection - no animation
        setAnimatingDiceIds(new Set());
      }
      setLastRollNumber(rollNumber);
    }
    
    // Update last selected dice IDs for next reroll detection
    setLastSelectedDiceIds(currentSelectedDiceIds);
  }, [rollNumber, lastRollNumber, currentSelectedDiceIds, lastSelectedDiceIds]);

  return (
    <div style={{ 
      backgroundColor: levelColor.backgroundColor,
      border: `3px solid ${levelColor.borderColor}`,
      borderTop: 'none',
      borderTopLeftRadius: '0',
      borderTopRightRadius: '0',
      borderBottomLeftRadius: '0',
      borderBottomRightRadius: '0',
      padding: '10px',
      minHeight: '400px', 
      height: '500px', 
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      <RoundInfo 
        levelNumber={levelNumber || 1}
        roundNumber={roundNumber}
        rollNumber={rollNumber}
        consecutiveFlops={consecutiveFlops}
      />

      {/* Difficulty Dice Display - Top Right */}
      {difficulty && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10
        }}>
          <DifficultyDiceDisplay difficulty={difficulty} size={60} />
        </div>
      )}

      {/* Scoring Breakdown - shows when scoring */}
      {breakdownState !== 'hidden' && scoringBreakdown && (
        <ScoringBreakdownComponent
          breakdown={scoringBreakdown}
          selectedDiceIndices={selectedIndices}
          onComplete={() => {
            setHighlightedDiceIndices([]);
            onCompleteBreakdown();
          }}
          onHighlightDice={(indices) => setHighlightedDiceIndices(indices)}
        />
      )}
      

      {/* Selected Dice Preview - top center (same position as breakdown, hidden when showing breakdown) */}
      {previewScoring && breakdownState === 'hidden' && (
        <PreviewScoring previewScoring={previewScoring} />
      )}

      {!justBanked && (
        <DiceDisplay
          allDice={dice}
          rolledDice={rolledDice}
          selectedIndices={selectedIndices}
          onDiceSelect={onDiceSelect}
          canSelect={canSelect && !justFlopped && breakdownState !== 'animating'}
          animatingDiceIds={animatingDiceIds}
          highlightedDiceIndices={highlightedDiceIndices}
        />
      )}

      <GameAlerts
        canChooseFlopShield={canChooseFlopShield}
        onFlopShieldChoice={onFlopShieldChoice}
        canSelectDice={canSelect}
        selectedDiceCount={selectedIndices.length}
        previewScoring={previewScoring}
        justFlopped={justFlopped}
      />

      {/* View Dice Set - Bottom Right */}
      {diceSet.length > 0 && <ViewDiceSet diceSet={diceSet} />}
    </div>
  );
};

