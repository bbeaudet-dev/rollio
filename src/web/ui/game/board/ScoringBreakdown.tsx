import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ScoringBreakdown, ScoringBreakdownStep } from '../../../../game/types';
import { ScoringElements, calculateFinalScore } from '../../../../game/logic/scoringElements';
import { getAnimationSpeed } from '../../../utils/uiSettings';

interface ScoringBreakdownProps {
  breakdown: ScoringBreakdown & { selectedIndices?: number[] };
  selectedDiceIndices: number[];
  onComplete: () => void;
  onHighlightDice?: (indices: number[]) => void;
}

function formatScoreFormula(elements: ScoringElements): string {
  const total = calculateFinalScore(elements);
  return `${elements.basePoints} pts × ${elements.multiplier}x ^ ${elements.exponent} = ${total}`;
}

function formatStepDescription(step: ScoringBreakdownStep): string {
  return step.description;
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
  
  // material_*_die* or pipEffect_*_die* - extract die index
  // The die number in the step ID is 1-indexed position in the selectedIndices array
  const dieMatch = stepId.match(/die(\d+)/);
  if (dieMatch) {
    const dieNumber = parseInt(dieMatch[1], 10);
    // dieNumber is 1-indexed position in selectedIndices array
    // e.g., die1 = first selected die = selectedIndices[0]
    if (dieNumber > 0 && dieNumber <= selectedIndices.length) {
      const actualIndex = selectedIndices[dieNumber - 1];
      return [actualIndex];
    }
  }
  
  // material_crystal_global - highlight all crystal dice
  if (stepId === 'material_crystal_global') {
    return selectedIndices;
  }
  
  // charm_* - no specific dice to highlight
  if (stepId.startsWith('charm_')) {
    return [];
  }
  
  return [];
}


export const ScoringBreakdownComponent: React.FC<ScoringBreakdownProps> = ({
  breakdown,
  selectedDiceIndices,
  onComplete,
  onHighlightDice
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [currentElements, setCurrentElements] = useState<ScoringElements | null>(null);
  const [isComplete, setIsComplete] = useState(false);
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
  const onHighlightDiceRef = useRef(onHighlightDice);

  // Keep selected indices ref up to date
  useEffect(() => {
    selectedIndicesRef.current = selectedDiceIndices;
  }, [selectedDiceIndices]);

  // Keep refs up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onHighlightDiceRef.current = onHighlightDice;
  }, [onComplete, onHighlightDice]);

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
    if (onHighlightDiceRef.current) {
      onHighlightDiceRef.current([]);
    }

    // Start with step 0 (base combinations)
    const baseStep = breakdown.steps[0];
    setCurrentElements(baseStep.input);
    previousElementsRef.current = baseStep.input;
    setCurrentStepIndex(0);
    
    // Highlight all dice for base combinations
    if (onHighlightDiceRef.current) {
      onHighlightDiceRef.current(selectedIndicesRef.current);
    }

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
        
        // Highlight dice for this step (use ref to get current value)
        if (onHighlightDiceRef.current) {
          const diceToHighlight = parseDiceIndicesFromStep(step, selectedIndicesRef.current);
          onHighlightDiceRef.current(diceToHighlight);
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

    // Show final score and complete (but don't auto-hide - wait for player to click Roll)
    const finalDelay = breakdown.steps.length * animationSpeedMs;
    const finalTimeout = setTimeout(() => {
      // Mark as completed first
      hasCompletedRef.current = true;
      setCurrentElements(breakdown.final);
      setIsComplete(true);
      
      // Clear highlights
      if (onHighlightDiceRef.current) {
        onHighlightDiceRef.current([]);
      }
      
      // Call onComplete to transition to proper state (dice removed, bankOrRoll state)
      // But keep breakdown visible - onComplete will update the state properly
      // Use requestAnimationFrame to ensure this happens after React has processed state updates
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          onCompleteRef.current();
        });
      });
    }, finalDelay + 500);
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
      bottom: '15px',
      right: '15px',
      zIndex: 30,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: '2px solid #007bff',
      borderRadius: '12px',
      padding: '16px',
      minWidth: '320px',
      maxWidth: '400px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      pointerEvents: 'none',
      userSelect: 'none'
    }}>
      <div style={{
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '12px',
        color: '#2c3e50',
        borderBottom: '2px solid #e1e5e9',
        paddingBottom: '8px'
      }}>
        Scoring Breakdown
      </div>

      {/* Base Combinations */}
      <div style={{
        marginBottom: '12px',
        padding: '8px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px'
      }}>
        <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>
          Base Combinations
        </div>
        <div style={{ fontSize: '13px', fontWeight: '500' }}>
          {baseStep.description.split('=')[0].trim()}
        </div>
      </div>

      {/* Current Step */}
      {currentStep && currentStepIndex >= 0 && !isComplete && (
        <div style={{
          marginBottom: '12px',
          padding: '10px',
          backgroundColor: '#e3f2fd',
          borderRadius: '6px',
          border: '2px solid #2196f3'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '18px' }}>{getStepIcon(currentStep)}</span>
            <div style={{ fontSize: '12px', color: '#1976d2', fontWeight: '600' }}>
              Step {currentStepIndex + 1} of {breakdown.steps.length}
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#424242' }}>
            {formatStepDescription(currentStep)}
          </div>
        </div>
      )}

      {/* Three Component Boxes */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '12px'
      }}>
        {/* Base Points - Green */}
        <div style={{
          flex: 1,
          padding: '10px',
          backgroundColor: '#c8e6c9',
          borderRadius: '6px',
          border: '2px solid #4caf50',
          textAlign: 'center',
          animation: animatingValues.basePoints ? 'valueChange 0.6s ease-out' : 'none'
        }}>
          <div style={{ fontSize: '11px', color: '#2e7d32', marginBottom: '4px', fontWeight: '600' }}>
            Score
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2e7d32' }}>
            {displayElements.basePoints}
          </div>
        </div>

        {/* Multiplier - Magenta */}
        <div style={{
          flex: 1,
          padding: '10px',
          backgroundColor: '#f8bbd0',
          borderRadius: '6px',
          border: '2px solid #e91e63',
          textAlign: 'center',
          animation: animatingValues.multiplier ? 'valueChange 0.6s ease-out' : 'none'
        }}>
          <div style={{ fontSize: '11px', color: '#c2185b', marginBottom: '4px', fontWeight: '600' }}>
            Multiplier
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#c2185b' }}>
            {displayElements.multiplier.toFixed(2)}x
          </div>
        </div>

        {/* Exponent - Dark Purple */}
        <div style={{
          flex: 1,
          padding: '10px',
          backgroundColor: '#ce93d8',
          borderRadius: '6px',
          border: '2px solid #9c27b0',
          textAlign: 'center',
          animation: animatingValues.exponent ? 'valueChange 0.6s ease-out' : 'none'
        }}>
          <div style={{ fontSize: '11px', color: '#7b1fa2', marginBottom: '4px', fontWeight: '600' }}>
            Exponent
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#7b1fa2' }}>
            {displayElements.exponent.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Final Score Calculation - Only show when complete */}
      {isComplete && (
        <div style={{
          padding: '12px',
          backgroundColor: '#e8f5e9',
          borderRadius: '6px',
          border: '2px solid #4caf50',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#2e7d32', marginBottom: '6px', fontWeight: '600' }}>
            Final Score
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#2e7d32'
          }}>
            {calculateFinalScore(breakdown.final)}
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
      `}</style>
    </div>
  );
};

