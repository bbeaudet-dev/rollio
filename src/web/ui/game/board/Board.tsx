import React, { useState, useEffect, useMemo } from 'react';
import { getLevelColor } from '../../../utils/levelColors';
import { DiceDisplay } from './DiceDisplay';
import { RoundInfo } from './RoundInfo';
import { GameAlerts } from './GameAlerts';
import { PointsDisplay } from './PointsDisplay';
import { ScoringBreakdownComponent } from './ScoringBreakdown';
import { ScoringBreakdown } from '../../../../game/types';

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
  gameOver?: boolean;
  onScoreSelectedDice?: () => void;
  lastRollPoints?: number;
  roundPoints?: number;
  gameScore?: number;
  justBanked?: boolean;
  justFlopped?: boolean;
  canBank?: boolean;
  bankingDisplayInfo?: {
    pointsJustBanked: number;
    previousTotal: number;
    newTotal: number;
  } | null;
  scoringBreakdown?: ScoringBreakdown | null;
  breakdownState?: 'hidden' | 'animating' | 'complete';
  onCompleteBreakdown?: () => void;
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
  gameOver = false,
  onScoreSelectedDice = () => {},
  lastRollPoints = 0,
  roundPoints = 0,
  gameScore = 0,
  justBanked = false,
  justFlopped = false,
  canBank = false,
  bankingDisplayInfo,
  scoringBreakdown = null,
  breakdownState = 'hidden',
  onCompleteBreakdown = () => {}
}) => {
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
      minHeight: '300px', 
      height: '400px', 
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      <RoundInfo 
        roundNumber={roundNumber}
        rollNumber={rollNumber}
        consecutiveFlops={consecutiveFlops}
      />

      <PointsDisplay
        roundPoints={roundPoints}
        justBanked={justBanked}
        canSelectDice={canSelect}
        canBank={canBank}
        bankingDisplayInfo={bankingDisplayInfo}
      />

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
      

      {/* Selected Dice Preview - bottom right (hidden when showing breakdown) */}
      {previewScoring && breakdownState === 'hidden' && (
        <div style={{
          position: 'absolute',
          bottom: '15px',
          right: '15px',
          zIndex: 20,
          backgroundColor: previewScoring.isValid ? 'rgba(227, 242, 253, 0.85)' : 'rgba(255, 235, 238, 0.85)',
          border: `1px solid ${previewScoring.isValid ? '#007bff' : '#f44336'}`,
          borderRadius: '8px',
          padding: '12px',
          fontSize: '14px',
          fontWeight: 500,
          maxWidth: '200px',
          minWidth: '150px',
          pointerEvents: 'none',
          userSelect: 'none'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
            Combos:
          </div>
          {previewScoring.isValid ? (
            <div style={{ fontSize: '13px', fontWeight: 'normal' }}>
              <div style={{ marginBottom: '4px' }}>{previewScoring.combinations.join(', ')}</div>
              <div style={{ fontWeight: 'bold', color: '#007bff' }}>
                {previewScoring.points} points
              </div>
            </div>
          ) : (
            <div style={{ color: '#f44336', fontSize: '13px', fontWeight: 'normal' }}>
              no scoring combinations
            </div>
          )}
        </div>
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
        gameOver={gameOver}
        canSelectDice={canSelect}
        selectedDiceCount={selectedIndices.length}
        previewScoring={previewScoring}
        justFlopped={justFlopped}
      />
    </div>
  );
};

