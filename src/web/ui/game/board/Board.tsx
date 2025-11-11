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
  hotDiceCount?: number;
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
  hotDiceCount = 0,
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
  const [dicePositions, setDicePositions] = useState<DicePosition[]>([]);
  const [lastRollNumber, setLastRollNumber] = useState<number>(0);
  const [lastDiceCount, setLastDiceCount] = useState<number>(0);

  // Generate random positions for dice, ensuring no overlap
  const generateRandomPositions = (diceCount: number) => {
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

  // Regenerate positions when roll number increases OR dice count changes significantly
  useEffect(() => {
    const shouldRegenerate = 
      rollNumber > lastRollNumber ||
      (dice.length > 0 && dicePositions.length === 0);
    
    if (shouldRegenerate) {
      setDicePositions(generateRandomPositions(dice.length));
      setLastRollNumber(rollNumber);
      setLastDiceCount(dice.length);
    } else if (dice.length < lastDiceCount) {
      setDicePositions(prev => prev.slice(0, dice.length));
      setLastDiceCount(dice.length);
    }
  }, [rollNumber, lastRollNumber, dice.length, lastDiceCount]);

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
        hotDiceCount={hotDiceCount}
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

      <DiceDisplay
        dice={dice}
        selectedIndices={selectedIndices}
        onDiceSelect={onDiceSelect}
        canSelect={canSelect}
        dicePositions={dicePositions}
      />

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

