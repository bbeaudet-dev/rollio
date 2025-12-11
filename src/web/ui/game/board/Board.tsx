import React, { useState, useEffect, useMemo } from 'react';
import { getLevelColor } from '../../../utils/levelColors';
import { DiceDisplay } from './DiceDisplay';
import { RoundInfo } from './RoundInfo';
import { GameAlerts } from './GameAlerts';
import { ScoringBreakdownComponent } from './ScoringBreakdown';
import { PreviewScoring } from './score/PreviewScoring';
import { Die } from '../../../../game/types';
import { ScoringBreakdown } from '../../../../game/logic/scoringBreakdown';
import { DifficultyDiceDisplay } from '../../components/DifficultyDiceDisplay';
import { useDifficulty } from '../../../contexts/DifficultyContext';
import { useScoringHighlights } from '../../../contexts/ScoringHighlightContext';
import { HotDiceCounter } from './HotDiceCounter';

interface BoardProps {
  dice: any[];
  selectedIndices: number[];
  onDiceSelect: (index: number) => void;
  canSelect: boolean;
  roundNumber?: number;
  rollNumber?: number;
  consecutiveFlops?: number;
  levelNumber?: number;
  worldNumber?: number;
  worldEffects?: any[];
  levelEffects?: any[];
  previewScoring?: {
    isValid: boolean;
    points: number;
    combinations: string[];
    baseScoringElements?: {
      basePoints: number;
      baseMultiplier: number;
      baseExponent: number;
    };
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
  hotDiceCounter?: number;
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
  worldNumber,
  worldEffects = [],
  levelEffects = [],
  previewScoring = null,
  canChooseFlopShield = false,
  onFlopShieldChoice = () => {},
  lastRollPoints = 0,
  justBanked = false,
  justFlopped = false,
  scoringBreakdown = null,
  breakdownState = 'hidden',
  onCompleteBreakdown = () => {},
      diceSet = [],
      hotDiceCounter = 0
    }) => {
  const difficulty = useDifficulty();
  const { highlightedDiceIndices, setHighlightedDice, clearAll } = useScoringHighlights();
  
  // Get level color (memoized to avoid recalculating on every render)
  const levelColor = useMemo(() => getLevelColor(levelNumber), [levelNumber]);
  
  // Track which dice should animate (only selected dice on reroll, all dice on initial roll)
  const [animatingDiceIds, setAnimatingDiceIds] = useState<Set<string>>(new Set());
  const [allDiceWiggling, setAllDiceWiggling] = useState<boolean>(false);
  const [lastRollNumber, setLastRollNumber] = useState<number>(rollNumber);
  const [lastSelectedDiceIds, setLastSelectedDiceIds] = useState<Set<string>>(new Set());
  
  // Clear highlights when breakdown is no longer showing
  useEffect(() => {
    if (breakdownState === 'hidden') {
      clearAll();
    }
  }, [breakdownState, clearAll]);
  
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
  
  // Detect roll/reroll: if roll number increased, animate dice appropriately
  useEffect(() => {
    if (rollNumber > lastRollNumber) {
      // Roll number increased - check if we have selected dice now (for reroll)
      // OR if we had selected dice before the roll
      if (currentSelectedDiceIds.size > 0 || lastSelectedDiceIds.size > 0) {
        // Reroll happened - animate the dice that are currently selected
        // (or were selected before, in case selection was cleared)
        const diceToAnimate = currentSelectedDiceIds.size > 0 
          ? currentSelectedDiceIds 
          : lastSelectedDiceIds;
        setAnimatingDiceIds(new Set(diceToAnimate));
        setAllDiceWiggling(false);
        
        // Clear animation after a short delay
        setTimeout(() => {
          setAnimatingDiceIds(new Set());
        }, 600);
      } else {
        // Initial roll - wiggle all dice
        setAllDiceWiggling(true);
        setAnimatingDiceIds(new Set());
        
        // Clear wiggle after animation completes
        setTimeout(() => {
          setAllDiceWiggling(false);
        }, 500);
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
        worldNumber={worldNumber}
        worldEffects={worldEffects}
        levelEffects={levelEffects}
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
            clearAll();
            onCompleteBreakdown();
          }}
        />
      )}
      

      {/* Selected Dice Preview - top center (stays visible during breakdown) */}
      {(() => {
        const shouldShow = previewScoring || (breakdownState !== 'hidden' && scoringBreakdown);
        const previewData = previewScoring || (scoringBreakdown ? {
          isValid: true,
          points: 0,
          combinations: (scoringBreakdown as any).combinationKeys || [],
          baseScoringElements: scoringBreakdown.steps[0]?.input ? {
            basePoints: scoringBreakdown.steps[0].input.basePoints,
            baseMultiplier: scoringBreakdown.steps[0].input.multiplier,
            baseExponent: scoringBreakdown.steps[0].input.exponent
          } : undefined
        } : null);
        
        if (breakdownState !== 'hidden') {
          console.log('Board: Rendering PreviewScoring during breakdown', {
            hasPreviewScoring: !!previewScoring,
            hasScoringBreakdown: !!scoringBreakdown,
            shouldShow,
            previewData,
            breakdownState
          });
        }
        
        return shouldShow && previewData ? (
          <PreviewScoring 
            previewScoring={previewData} 
            isScoring={breakdownState !== 'hidden'}
          />
        ) : null;
      })()}

      {!justBanked && (
        <DiceDisplay
          allDice={dice}
          rolledDice={rolledDice}
          selectedIndices={selectedIndices}
          onDiceSelect={onDiceSelect}
          canSelect={canSelect && !justFlopped && breakdownState !== 'animating'}
          animatingDiceIds={animatingDiceIds}
          allDiceWiggling={allDiceWiggling}
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

    </div>
  );
};

