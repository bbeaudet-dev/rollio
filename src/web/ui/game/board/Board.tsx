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

interface DicePosition {
  x: number;
  y: number;
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
  const [dicePositions, setDicePositions] = useState<Map<string, DicePosition>>(new Map());
  const [lastRollNumber, setLastRollNumber] = useState<number>(0);
  const [lastRoundNumber, setLastRoundNumber] = useState<number>(0);

  // Generate random positions for dice, ensuring no overlap
  const generateRandomPositions = (diceCount: number): DicePosition[] => {
    const positions: DicePosition[] = [];
    const diceSize = 70;
    const padding = 30;
    const minDistance = diceSize + 10;
    
    for (let i = 0; i < diceCount; i++) {
      let attempts = 0;
      let position: DicePosition;
      
      do {
        position = {
          x: Math.random() * (100 - 2 * (diceSize / 2 + padding) / 3.6) + (diceSize / 2 + padding) / 3.6,
          y: Math.random() * (100 - 2 * (diceSize / 2 + padding) / 3.6) + (diceSize / 2 + padding) / 3.6
        };
        attempts++;
      } while (
        attempts < 100 && 
        positions.some(existing => {
          const distance = Math.sqrt(
            Math.pow(position.x - existing.x, 2) + 
            Math.pow(position.y - existing.y, 2)
          );
          return distance < minDistance / 3.6;
        })
      );
      
      positions.push(position);
    }
    
    return positions;
  };

  // Filter dice to only show rolled dice (have rolledValue)
  const rolledDice = dice.filter(die => die.rolledValue !== undefined && die.rolledValue !== null);
  
  // Track previous rolled dice to detect scoring
  const [lastRolledDiceIds, setLastRolledDiceIds] = useState<Set<string>>(new Set());
  
  // Track dice IDs as a string for comparison
  const currentDiceIdsString = useMemo(() => {
    return Array.from(new Set(rolledDice.map(die => die.id))).sort().join(',');
  }, [rolledDice]);
  
  const lastDiceIdsString = useMemo(() => {
    return Array.from(lastRolledDiceIds).sort().join(',');
  }, [lastRolledDiceIds]);
  
  // Regenerate positions when roll number increases or round changes
  useEffect(() => {
    const currentDiceIds = new Set(rolledDice.map(die => die.id));
    
    // If round number changed, reset everything (new round after banking)
    if (roundNumber !== lastRoundNumber) {
      if (rolledDice.length > 0) {
        // Generate fresh positions for all dice in new round
        const newPositions = generateRandomPositions(rolledDice.length);
        const newPositionMap = new Map<string, DicePosition>();
        rolledDice.forEach((die, idx) => {
          newPositionMap.set(die.id, newPositions[idx]);
        });
        setDicePositions(newPositionMap);
      } else {
        // No dice yet, clear positions
        setDicePositions(new Map());
      }
      setLastRoundNumber(roundNumber);
      setLastRollNumber(rollNumber);
      setLastRolledDiceIds(currentDiceIds);
      return;
    }
    
    // If roll number increased, generate fresh positions for all rolled dice
    if (rollNumber > lastRollNumber) {
      const newPositions = generateRandomPositions(rolledDice.length);
      const newPositionMap = new Map<string, DicePosition>();
      rolledDice.forEach((die, idx) => {
        newPositionMap.set(die.id, newPositions[idx]);
      });
      setDicePositions(newPositionMap);
      setLastRollNumber(rollNumber);
      setLastRolledDiceIds(currentDiceIds);
    } else if (currentDiceIdsString !== lastDiceIdsString && rollNumber === lastRollNumber && currentDiceIds.size < lastRolledDiceIds.size) {
      // Dice IDs changed and count decreased (scoring happened) - preserve positions for remaining dice
      const newPositionMap = new Map<string, DicePosition>();
      rolledDice.forEach((die) => {
        const existingPosition = dicePositions.get(die.id);
        if (existingPosition) {
          newPositionMap.set(die.id, existingPosition);
        }
      });
      setDicePositions(newPositionMap);
      setLastRolledDiceIds(currentDiceIds);
    } else if (currentDiceIdsString !== lastDiceIdsString) {
      // Dice IDs changed for some other reason - update tracking
      setLastRolledDiceIds(currentDiceIds);
    }
  }, [rollNumber, lastRollNumber, roundNumber, lastRoundNumber, rolledDice.length, currentDiceIdsString, lastDiceIdsString, dicePositions, lastRolledDiceIds, rolledDice]);

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
          dice={dice}
          selectedIndices={selectedIndices}
          onDiceSelect={onDiceSelect}
          canSelect={canSelect}
          dicePositions={dicePositions}
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

