import React, { useState, useEffect, useMemo } from 'react';
import { getLevelColor } from '../../../utils/levelColors';
import { DiceDisplay } from './DiceDisplay';
import { RoundInfo } from './RoundInfo';
import { GameAlerts } from './GameAlerts';
import { PointsDisplay } from './PointsDisplay';

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
  canContinueFlop?: boolean;
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
  canContinueFlop = false
}) => {
  // Get level color (memoized to avoid recalculating on every render)
  const levelColor = useMemo(() => getLevelColor(levelNumber), [levelNumber]);
  
  // Track which dice should animate (only selected dice on reroll)
  const [animatingDiceIds, setAnimatingDiceIds] = useState<Set<string>>(new Set());
  const [lastRollNumber, setLastRollNumber] = useState<number>(rollNumber);
  const [lastSelectedDiceIds, setLastSelectedDiceIds] = useState<Set<string>>(new Set());
  
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
      padding: '20px',
      minHeight: '400px', 
      height: '500px', 
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
        lastRollPoints={lastRollPoints}
        roundPoints={roundPoints}
        gameScore={gameScore}
        canReroll={canSelect && selectedIndices.length === 0}
        justBanked={justBanked}
      />

      {/* Selected Dice Preview - bottom right */}
      {previewScoring && (
        <div style={{
          position: 'absolute',
          bottom: '15px',
          right: '15px',
          zIndex: 20,
          backgroundColor: previewScoring.isValid ? 'rgba(227, 242, 253, 0.9)' : 'rgba(255, 235, 238, 0.9)',
          border: `2px solid ${previewScoring.isValid ? '#007bff' : '#f44336'}`,
          borderRadius: '8px',
          padding: '12px',
          fontSize: '14px',
          fontWeight: 'bold',
          maxWidth: '200px',
          minWidth: '150px'
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
          canSelect={canSelect}
          animatingDiceIds={animatingDiceIds}
        />
      )}

      <GameAlerts
        canChooseFlopShield={canChooseFlopShield}
        onFlopShieldChoice={onFlopShieldChoice}
        gameOver={gameOver}
        canSelectDice={canSelect}
        selectedDiceCount={selectedIndices.length}
        previewScoring={previewScoring}
        onScoreSelectedDice={onScoreSelectedDice}
        canContinueFlop={canContinueFlop}
      />
    </div>
  );
};

