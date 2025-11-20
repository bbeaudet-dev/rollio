import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateAllSpecificProbabilities, SpecificCombinationProbability } from '../../../game/logic/probability';
import { CalculatorConfig } from './CalculatorConfig';
import { ProbabilityTable } from './ProbabilityTable';

// Timeout for calculations (5 minutes)
const COMPUTE_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export const CalculatorPage: React.FC = () => {
  const navigate = useNavigate();
  const [diceFaces, setDiceFaces] = useState<number[][]>([
    [1, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
  ]);
  const [probabilities, setProbabilities] = useState<SpecificCombinationProbability[]>([]);
  const [isComputing, setIsComputing] = useState(false);
  const [computeError, setComputeError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ combinationIndex: number; totalCombinations: number; currentRoll: number; totalRolls: number } | null>(null);
  const cancelFlagRef = useRef(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

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
          (combinationIndex, totalCombinations, currentRoll, totalRolls) => {
            setProgress({ combinationIndex, totalCombinations, currentRoll, totalRolls });
          },
          () => cancelFlagRef.current
        );
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        setProbabilities(results);
        setIsComputing(false);
        setProgress(null);
      } catch (error) {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        setComputeError(error instanceof Error ? error.message : 'An error occurred during calculation');
        setProbabilities([]);
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
        <button
          onClick={() => navigate('/')}
          style={{
            backgroundColor: '#6c757d',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#5a6268';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6c757d';
          }}
        >
          Back to Menu
        </button>
      </div>

      <p style={{
        fontSize: '15px',
        color: '#6c757d',
        marginBottom: '30px'
      }}>
        Calculate probabilities for scoring combinations. Configure each die individually with custom sides and values.
      </p>

      <CalculatorConfig diceFaces={diceFaces} onChange={setDiceFaces} />
      <ProbabilityTable 
        probabilities={probabilities} 
        totalOutcomes={totalOutcomes}
        onCompute={handleCompute}
        onCancel={handleCancel}
        isComputing={isComputing}
        computeError={computeError}
        progress={progress}
      />
    </div>
  );
};

