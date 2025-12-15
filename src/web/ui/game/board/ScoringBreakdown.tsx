import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ScoringBreakdown } from '../../../../game/logic/scoringBreakdown';
import { ScoringBreakdownStep } from '../../../../game/logic/scoringBreakdown';
import { ScoringElements, calculateFinalScore } from '../../../../game/logic/scoringElements';
import { getAnimationSpeed } from '../../../utils/uiSettings';
import { formatCombinationKey } from '../../../../game/utils/combinationTracking';
import { useScoringHighlights } from '../../../contexts/ScoringHighlightContext';
import { playCrystalSound, playMirrorSound, playGeneralScoreSound, playSellMoneySound, playGenericMaterialSound, playHotDiceSound, playGoldenSound, playFlowerSound, playLeadSound, playGhostSound, playRainbowSound, playVolcanoSound } from '../../../utils/sounds';

interface ScoringBreakdownProps {
  breakdown: ScoringBreakdown & { selectedIndices?: number[] };
  selectedDiceIndices: number[];
  onComplete: () => void;
}

function formatScoreFormula(elements: ScoringElements): string {
  const total = calculateFinalScore(elements);
  return `${formatNumber(elements.basePoints, 'points')} pts × ${formatNumber(elements.multiplier, 'multiplier')}x ^ ${formatNumber(elements.exponent, 'exponent')} = ${formatNumber(total, 'points')}`;
}

function formatStepDescription(step: ScoringBreakdownStep): string {
  return step.description;
}

/**
 * Format a number based on context
 * - Points: Always whole numbers
 * - Multiplier/Exponent: Decimals allowed, but stop showing decimals after 10x
 */
function formatNumber(value: number, type: 'points' | 'multiplier' | 'exponent' = 'points'): string {
  if (type === 'points') {
    // Points: Always show as whole number
    return Math.round(value).toString();
  }
  
  // Multiplier/Exponent: Show decimals, but stop after 10x
  if (value >= 10) {
    return Math.round(value).toString();
  }
  
  // Below 10x: Show decimals (up to 2 decimal places, remove trailing zeros)
  const rounded = Math.round(value * 100) / 100;
  if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
    return Math.round(rounded).toString();
  }
  // Remove trailing zeros from decimal representation
  return rounded.toString().replace(/\.?0+$/, '');
}

function getStepIcon(step: ScoringBreakdownStep): string {
  const stepId = step.step;
  
  if (stepId.startsWith('baseCombinations')) {
    return '🎯';
  } else if (stepId.startsWith('pipEffect_')) {
    if (stepId.includes('money')) return '💰';
    if (stepId.includes('blank')) return '⚪';
    if (stepId.includes('wild')) return '⭐';
    if (stepId.includes('twoFaced')) return '👁️';
    if (stepId.includes('upgradeCombo')) return '⬆️';
    if (stepId.includes('createConsumable')) return '🎒';
    return '✨';
  } else if (stepId.startsWith('material_')) {
    if (stepId.includes('crystal')) return '💎';
    if (stepId.includes('golden')) return '🪙';
    if (stepId.includes('volcano')) return '🌋';
    if (stepId.includes('flower')) return '🌸';
    if (stepId.includes('mirror')) return '🪞';
    if (stepId.includes('rainbow')) return '🌈';
    if (stepId.includes('ghost')) return '👻';
    if (stepId.includes('lead')) return '⚫';
    return '🎲';
  } else if (stepId.startsWith('charm_')) {
    return '🔮';
  }
  
  return '⚡';
}

function parseDiceIndicesFromStep(step: ScoringBreakdownStep, selectedIndices: number[]): number[] {
  const stepId = step.step;
  
  // baseCombinations - highlight all selected dice
  if (stepId === 'baseCombinations') {
    return selectedIndices;
  }
  
  // Extract die index from step ID
  const dieMatch = stepId.match(/die(\d+)/);
  if (dieMatch) {
    const dieNumber = parseInt(dieMatch[1], 10);
    
    if (stepId.startsWith('charm_')) {
      // For charm steps, dieNumber is the actual die index in diceHand
      // Check if this index is in selectedIndices (for scored dice) or valid (for unscored dice like Ghost Whisperer)
      if (selectedIndices.includes(dieNumber)) {
        // This is a scored die
        return [dieNumber];
      } else {
        // This might be an unscored die (like unscored ghost dice)
        // Still return it so it can be highlighted if needed
        return [dieNumber];
      }
    } else {
      // For material/pipEffect steps, dieNumber is 1-indexed position in selectedIndices array
      // e.g., die1 = first selected die = selectedIndices[0]
      if (dieNumber > 0 && dieNumber <= selectedIndices.length) {
        const actualIndex = selectedIndices[dieNumber - 1];
        return [actualIndex];
      }
    }
  }
  
  // charm_* without die number - no specific dice to highlight
  if (stepId.startsWith('charm_')) {
    return [];
  }
  
  return [];
}

function parseCharmIdFromStep(step: ScoringBreakdownStep): string | null {
  const stepId = step.step;
  
  // charm_${charmId} or charm_perDie_${charmId}_die${number}
  if (stepId.startsWith('charm_')) {
    // Handle charm_perDie_${charmId}_die${number} format
    const perDieMatch = stepId.match(/^charm_perDie_(.+?)_die\d+$/);
    if (perDieMatch) {
      return perDieMatch[1];
    }
    
    // Handle charm_${charmId} format
    const charmMatch = stepId.match(/^charm_(.+)$/);
    if (charmMatch) {
      return charmMatch[1];
    }
  }
  
  return null;
}


export const ScoringBreakdownComponent: React.FC<ScoringBreakdownProps> = ({
  breakdown,
  selectedDiceIndices,
  onComplete
}) => {
  const { setHighlightedDice, setHighlightedCharms } = useScoringHighlights();
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [currentElements, setCurrentElements] = useState<ScoringElements | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showFinalScore, setShowFinalScore] = useState(false); // Track when to show final score after squish
  const [animatingValues, setAnimatingValues] = useState<{ basePoints: boolean; multiplier: boolean; exponent: boolean }>({
    basePoints: false,
    multiplier: false,
    exponent: false
  });
  const previousElementsRef = useRef<ScoringElements | null>(null);
  const hasStartedRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const breakdownIdRef = useRef<string | null>(null);
  const breakdownDataRef = useRef<{ stepsLength: number; finalScore: number } | null>(null);
  const selectedIndicesRef = useRef<number[]>(selectedDiceIndices);
  const stepTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const onCompleteRef = useRef(onComplete);

  // Keep selected indices ref up to date
  useEffect(() => {
    selectedIndicesRef.current = selectedDiceIndices;
  }, [selectedDiceIndices]);

  // Keep refs up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Create a stable ID for this breakdown
    const breakdownId = `${breakdown.steps.length}-${calculateFinalScore(breakdown.final)}`;
    const isNewBreakdown = breakdownIdRef.current !== breakdownId;

      // If this is a different breakdown, reset everything
    if (isNewBreakdown) {
      // Clear any existing timeouts from previous breakdown
      if (stepTimeoutsRef.current.length > 0) {
        stepTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        stepTimeoutsRef.current = [];
      }
      hasStartedRef.current = false;
      hasCompletedRef.current = false;
      breakdownIdRef.current = breakdownId;
      breakdownDataRef.current = {
        stepsLength: breakdown.steps.length,
        finalScore: calculateFinalScore(breakdown.final)
      };
      setIsComplete(false);
      setShowFinalScore(false);
      setCurrentStepIndex(-1);
      setCurrentElements(null);
      previousElementsRef.current = null;
    }

    // Prevent re-running if already started or completed for this breakdown
    if (hasStartedRef.current || hasCompletedRef.current) {
      // If already completed, ensure we're showing the final state
      if (hasCompletedRef.current && !isComplete) {
        setCurrentElements(breakdown.final);
        setIsComplete(true);
      }
      return;
    }

    if (breakdown.steps.length === 0) {
      setIsComplete(true);
      hasStartedRef.current = true;
      hasCompletedRef.current = true;
      return;
    }

    hasStartedRef.current = true;

    // Reset state
    setCurrentStepIndex(-1);
    setCurrentElements(null);
    setIsComplete(false);
    
    // Clear any existing highlights
    setHighlightedDice([]);
    setHighlightedCharms([]);

    // Start with step 0 (base combinations)
    const baseStep = breakdown.steps[0];
    if (!baseStep || !baseStep.input) {
      setIsComplete(true);
      hasStartedRef.current = true;
      hasCompletedRef.current = true;
      return;
    }
    setCurrentElements(baseStep.input);
    previousElementsRef.current = baseStep.input;
    setCurrentStepIndex(0);
    
    // Highlight all dice for base combinations
    setHighlightedDice(selectedIndicesRef.current);

    // Animate through each step
    const stepTimeouts: NodeJS.Timeout[] = [];
    stepTimeoutsRef.current = stepTimeouts;
    
    // Get animation speed from settings (convert to milliseconds)
    const animationSpeedMs = getAnimationSpeed() * 1000;
    
    breakdown.steps.forEach((step, index) => {
      const stepDelay = index * animationSpeedMs;
      
      // Set step
      stepTimeouts.push(setTimeout(() => {
        setCurrentStepIndex(index);
        setCurrentElements(step.input);
        previousElementsRef.current = step.input;
        
        // Play sounds based on step type
        const stepId = step.step;
        if (stepId.startsWith('baseCombinations')) {
          playGeneralScoreSound();
        } else if (stepId.startsWith('material_crystal')) {
          playCrystalSound();
        } else if (stepId.startsWith('material_mirror')) {
          playMirrorSound();
        } else if (stepId.startsWith('material_golden')) {
          playGoldenSound();
        } else if (stepId.startsWith('material_flower')) {
          playFlowerSound();
        } else if (stepId.startsWith('material_lead')) {
          playLeadSound();
        } else if (stepId.startsWith('material_ghost')) {
          playGhostSound();
        } else if (stepId.startsWith('material_rainbow')) {
          playRainbowSound();
        } else if (stepId.startsWith('material_volcano')) {
          playVolcanoSound();
        } else if (stepId.startsWith('material_')) {
          // Play material.wav for other materials
          playGenericMaterialSound();
        } else if (stepId.startsWith('hotDiceMultiplier')) {
          playHotDiceSound();
        } else if (stepId.startsWith('charm_')) {
          playGeneralScoreSound();
        } else if (stepId.includes('money') || (stepId.includes('rainbow') && step.description.includes('$'))) {
          playSellMoneySound();
        }
        
        // Highlight dice for this step (use ref to get current value)
        const diceToHighlight = parseDiceIndicesFromStep(step, selectedIndicesRef.current);
        setHighlightedDice(diceToHighlight);
        
        // Highlight charms for this step
        const charmId = parseCharmIdFromStep(step);
        if (charmId) {
          setHighlightedCharms([charmId]);
        } else {
          setHighlightedCharms([]);
        }
        
        // Show output after a brief delay
        setTimeout(() => {
          const prev = previousElementsRef.current || step.input;
          const next = step.output;
          
          // Check which values changed and trigger animations
          const changed = {
            basePoints: prev.basePoints !== next.basePoints,
            multiplier: prev.multiplier !== next.multiplier,
            exponent: prev.exponent !== next.exponent
          };
          
          if (changed.basePoints || changed.multiplier || changed.exponent) {
            setAnimatingValues(changed);
            // Clear animation after it completes
            setTimeout(() => {
              setAnimatingValues({ basePoints: false, multiplier: false, exponent: false });
            }, 600);
          }
          
          setCurrentElements(step.output);
          previousElementsRef.current = step.output;
        }, 250);
      }, stepDelay));
    });

    // Show final score and complete - treat it like the next step in the sequence
    const lastStepIndex = breakdown.steps.length - 1;
    const lastStepStartTime = lastStepIndex * animationSpeedMs;
    const lastStepOutputTime = lastStepStartTime + 250; // When last step shows output
    const finalStepDelay = lastStepOutputTime + animationSpeedMs; // Next step timing
    
    const finalTimeout = setTimeout(() => {
      // Mark as completed first
      hasCompletedRef.current = true;
      setCurrentElements(breakdown.final);
      setIsComplete(true);
      
      // Clear highlights
      setHighlightedDice([]);
      setHighlightedCharms([]);
      
      // Combine scoring elements into final score
      setShowFinalScore(true);
      
      // Call onComplete to transition to proper state (dice removed, bankOrRoll state)
      // But keep breakdown visible - onComplete will update the state properly
      // Use requestAnimationFrame to ensure this happens after React has processed state updates
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          onCompleteRef.current();
        });
      });
    }, finalStepDelay);
    stepTimeouts.push(finalTimeout);

    return () => {
      // Don't clear timeouts in cleanup - they're already managed in the effect
      // The cleanup only runs when the effect is about to re-run or component unmounts
      // If breakdown changed, we already cleared timeouts in the effect body
      // If it's just a re-render, we don't want to clear the timeouts
    };
  }, [breakdown]); // Only depend on breakdown - detect changes inside effect

  if (breakdown.steps.length === 0) {
    return null;
  }

  const currentStep = currentStepIndex >= 0 ? breakdown.steps[currentStepIndex] : null;
  const displayElements = currentElements || breakdown.steps[0]?.input || breakdown.final;
  const baseStep = breakdown.steps[0];

  return (
    <div style={{
      position: 'absolute',
      top: '90px', 
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 30,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: '2px solid #007bff',
      borderRadius: '8px',
      padding: '10px',
      minWidth: '280px',
      maxWidth: '360px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      pointerEvents: 'none',
      userSelect: 'none'
    }}>

      {/* Current Step */}
      {currentStep && currentStepIndex >= 0 && !isComplete && (
        <div style={{
          marginBottom: '8px',
          padding: '6px',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          border: '1px solid #2196f3'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ fontSize: '14px' }}>{getStepIcon(currentStep)}</span>
            <div style={{ fontSize: '10px', color: '#1976d2', fontWeight: '600' }}>
              Step {currentStepIndex + 1} of {breakdown.steps.length}
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#424242' }}>
            {formatStepDescription(currentStep)}
          </div>
        </div>
      )}

      {/* Three Component Boxes - Show until squished into final score */}
      {!showFinalScore && (
        <div style={{
          display: 'flex',
          gap: isComplete ? '0px' : '6px',
          marginBottom: '8px',
          transition: 'gap 0.5s ease-in-out',
          overflow: 'hidden'
        }}>
          {/* Base Points - Green */}
          <div style={{
            flex: isComplete ? '0 0 0' : 1,
            padding: '6px',
            backgroundColor: '#c8e6c9',
            borderRadius: isComplete ? '4px 0 0 4px' : '4px',
            border: '1px solid #4caf50',
            textAlign: 'center',
            animation: animatingValues.basePoints ? 'valueChange 0.6s ease-out' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isComplete ? 0 : 1,
            transform: isComplete ? 'scale(0)' : 'scale(1)',
            transition: 'all 0.5s ease-in-out',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>
              {formatNumber(displayElements.basePoints, 'points')}
            </div>
          </div>

          {/* Multiplier - Magenta */}
          <div style={{
            flex: isComplete ? '0 0 0' : 1,
            padding: '6px',
            backgroundColor: '#f8bbd0',
            borderRadius: '4px',
            border: '1px solid #e91e63',
            textAlign: 'center',
            animation: animatingValues.multiplier ? 'valueChange 0.6s ease-out' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isComplete ? 0 : 1,
            transform: isComplete ? 'scale(0)' : 'scale(1)',
            transition: 'all 0.5s ease-in-out',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}>
            <div style={{ fontSize: '16px', color: '#c2185b' }}>
              <span style={{ fontWeight: 'normal' }}>x</span>
              <span style={{ fontWeight: 'bold' }}>{formatNumber(displayElements.multiplier, 'multiplier')}</span>
            </div>
          </div>

          {/* Exponent - Dark Purple */}
          <div style={{
            flex: isComplete ? '0 0 0' : 1,
            padding: '6px',
            backgroundColor: '#ce93d8',
            borderRadius: isComplete ? '0 4px 4px 0' : '4px',
            border: '1px solid #9c27b0',
            textAlign: 'center',
            animation: animatingValues.exponent ? 'valueChange 0.6s ease-out' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isComplete ? 0 : 1,
            transform: isComplete ? 'scale(0)' : 'scale(1)',
            transition: 'all 0.5s ease-in-out',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}>
            <div style={{ fontSize: '16px', color: '#7b1fa2' }}>
              <span style={{ fontWeight: 'normal' }}>^</span>
              <span style={{ fontWeight: 'bold' }}>{formatNumber(displayElements.exponent, 'exponent')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Final Score Calculation - Show after squish animation */}
      {showFinalScore && (
        <div style={{
          padding: '8px',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          border: '1px solid #2196f3',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeInScale 0.3s ease-out'
        }}>
          <div style={{
            fontSize: '18px',
            color: '#1976d2'
          }}>
            <span style={{ fontWeight: 'normal' }}>+</span>
            <span style={{ fontWeight: 'bold' }}>{formatNumber(calculateFinalScore(breakdown.final), 'points')}</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes valueChange {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 0 15px 5px rgba(0, 123, 255, 0.4);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
          }
        }
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

