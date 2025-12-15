import React, { useState, useEffect, useMemo, useRef } from 'react';
import { calculateAllSpecificProbabilities, SpecificCombinationProbability, CombinationCategory } from '../../../game/logic/probability';
import { CalculatorConfig } from './CalculatorConfig';
import { ProbabilityTable } from './ProbabilityTable';
import { ManualProbabilityTables } from './ManualProbabilityTables';
import { MainMenuReturnButton } from '../components';
import { playBackgroundMusic } from '../../utils/music';

// Timeout for calculations (5 minutes)
const COMPUTE_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export const CalculatorPage: React.FC = () => {
  const [diceFaces, setDiceFaces] = useState<number[][]>([
    [1, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
  ]);
  const [probabilities, setProbabilities] = useState<SpecificCombinationProbability[]>([]);
  const [noneProbability, setNoneProbability] = useState<SpecificCombinationProbability | null>(null);
  const [category, setCategory] = useState<CombinationCategory>('beginner');
  const [isComputing, setIsComputing] = useState(false);
  const [computeError, setComputeError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ currentRoll: number; totalRolls: number } | null>(null);
  const cancelFlagRef = useRef(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // Play main menu music
  useEffect(() => {
    playBackgroundMusic('main-title.mp3');
  }, []);

  // Always calculate total outcomes for the time indicator
  const totalOutcomes = useMemo(() => {
    return diceFaces.reduce((total, dieFaces) => total * dieFaces.length, 1);
  }, [diceFaces]);

  const handleCompute = () => {
    setIsComputing(true);
    setComputeError(null);
    setProgress(null);
    cancelFlagRef.current = false;
    
    // Set timeout
    const timeout = setTimeout(() => {
      cancelFlagRef.current = true;
      setComputeError('Calculation timed out after 5 minutes. Please reduce the number of dice or sides.');
      setIsComputing(false);
      setProgress(null);
    }, COMPUTE_TIMEOUT);
    timeoutIdRef.current = timeout;
    
    // Use async computation with chunked processing
    (async () => {
      try {
        const results = await calculateAllSpecificProbabilities(
          diceFaces,
          category,
          (currentRoll, totalRolls) => {
            setProgress({ currentRoll, totalRolls });
          },
          () => cancelFlagRef.current
        );
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        setProbabilities(results.combinations);
        setNoneProbability(results.noneProbability);
        setIsComputing(false);
        setProgress(null);
      } catch (error) {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        setComputeError(error instanceof Error ? error.message : 'An error occurred during calculation');
        setProbabilities([]);
        setNoneProbability(null);
        setIsComputing(false);
        setProgress(null);
      }
    })();
  };

  const handleCancel = () => {
    cancelFlagRef.current = true;
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    setIsComputing(false);
    setProgress(null);
    setComputeError('Calculation cancelled by user.');
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '40px auto',
      padding: '30px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e1e5e9',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#2c3e50',
          margin: 0
        }}>
          Probability Calculator
        </h1>
        <MainMenuReturnButton style={{ position: 'relative', top: 0, left: 0 }} />
      </div>

      <CalculatorConfig 
        diceFaces={diceFaces} 
        onChange={setDiceFaces}
        category={category}
        onCategoryChange={setCategory}
      />
      <ProbabilityTable 
        probabilities={probabilities}
        noneProbability={noneProbability}
        totalOutcomes={totalOutcomes}
        onCompute={handleCompute}
        onCancel={handleCancel}
        isComputing={isComputing}
        computeError={computeError}
        progress={progress}
      />
      
      <ManualProbabilityTables />
    </div>
  );
};

