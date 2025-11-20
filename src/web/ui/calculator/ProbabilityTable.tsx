import React from 'react';
import { SpecificCombinationProbability } from '../../../game/logic/probability';
import { formatCombinationKey } from '../../../game/utils/combinationTracking';
import { ProbabilityTimeIndicator } from './ProbabilityTimeIndicator';

interface ProbabilityTableProps {
  probabilities: SpecificCombinationProbability[];
  noneProbability: SpecificCombinationProbability | null;
  totalOutcomes: number;
  onCompute: () => void;
  onCancel: () => void;
  isComputing: boolean;
  computeError: string | null;
  progress: { currentRoll: number; totalRolls: number } | null;
}

export const ProbabilityTable: React.FC<ProbabilityTableProps> = ({ 
  probabilities,
  noneProbability,
  totalOutcomes,
  onCompute,
  onCancel,
  isComputing,
  computeError,
  progress
}) => {
  // Always include flop and hotDice in possible combinations, even if 0%
  const possibleCombinations = probabilities.filter(p => p.isPossible || p.key === 'flop' || p.key === 'hotDice');
  const impossibleCombinations = probabilities.filter(p => !p.isPossible && p.key !== 'flop' && p.key !== 'hotDice');

  return (
    <div>
      <div style={{
        marginTop: '20px',
        marginBottom: '20px'
      }}>
        <ProbabilityTimeIndicator totalOutcomes={totalOutcomes} />
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {isComputing && progress && (
          <span style={{
            fontSize: '14px',
            color: '#6c757d'
          }}>
            {progress.currentRoll.toLocaleString()} / {progress.totalRolls.toLocaleString()} rolls
          </span>
        )}
        <button
          onClick={onCompute}
          disabled={isComputing}
          style={{
            backgroundColor: isComputing ? '#6c757d' : '#007bff',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: isComputing ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            transition: 'background-color 0.2s ease',
            opacity: isComputing ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!isComputing) {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }
          }}
          onMouseLeave={(e) => {
            if (!isComputing) {
              e.currentTarget.style.backgroundColor = '#007bff';
            }
          }}
        >
          {isComputing ? 'Computing...' : 'Compute Probabilities'}
        </button>
        {isComputing && (
          <button
            onClick={onCancel}
            style={{
              backgroundColor: '#dc3545',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#c82333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#dc3545';
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {computeError && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          <strong>Error:</strong> {computeError}
        </div>
      )}
      
      {possibleCombinations.length > 0 && (
        <div style={{
          marginTop: '40px',
          marginBottom: '30px'
        }}>
          <div style={{
            overflowX: 'auto',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <table style={{
              width: '50%',
              minWidth: '50%',
              borderCollapse: 'collapse',
              backgroundColor: '#fff',
              border: '2px solid #dee2e6',
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <thead>
                <tr style={{
                  backgroundColor: '#f8f9fa',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  <th style={{
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#2c3e50',
                    fontSize: '14px',
                    whiteSpace: 'nowrap'
                  }}>
                    Combination
                  </th>
                  <th style={{
                    padding: '8px 12px',
                    textAlign: 'right',
                    fontWeight: '600',
                    color: '#2c3e50',
                    fontSize: '14px',
                    whiteSpace: 'nowrap'
                  }}>
                    Favorable Outcomes
                  </th>
                  <th style={{
                    padding: '8px 12px',
                    textAlign: 'right',
                    fontWeight: '600',
                    color: '#2c3e50',
                    fontSize: '14px',
                    whiteSpace: 'nowrap'
                  }}>
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody>
                {possibleCombinations
                  .sort((a, b) => b.percentage - a.percentage)
                  .map((prob, index) => {
                    const isFlop = prob.key === 'flop';
                    const isHotDice = prob.key === 'hotDice';
                    const isSpecial = isFlop || isHotDice;
                    return (
                      <tr
                        key={prob.key}
                        style={{
                          borderBottom: index < possibleCombinations.length - 1 ? '1px solid #e1e5e9' : 'none',
                        backgroundColor: isFlop 
                          ? (prob.isPossible ? '#fff3cd' : '#f8f9fa')
                          : isHotDice
                          ? (prob.isPossible ? '#ffeaa7' : '#f8f9fa')
                          : (index % 2 === 0 ? '#fff' : '#f8f9fa')
                        }}
                      >
                        <td style={{
                          padding: '8px 12px',
                          color: isFlop 
                            ? (prob.isPossible ? '#856404' : '#6c757d')
                          : isHotDice
                          ? (prob.isPossible ? '#d68910' : '#6c757d')
                            : '#2c3e50',
                          fontSize: '14px',
                          fontWeight: isSpecial ? '600' : 'normal',
                          whiteSpace: 'nowrap',
                          fontStyle: isSpecial && !prob.isPossible ? 'italic' : 'normal'
                        }}>
                          {formatCombinationKey(prob.key)}
                        </td>
                        <td style={{
                          padding: '8px 12px',
                          textAlign: 'right',
                          color: isFlop 
                            ? (prob.isPossible ? '#856404' : '#6c757d')
                            : isHotDice
                            ? (prob.isPossible ? '#d68910' : '#6c757d')
                            : '#495057',
                          fontSize: '14px',
                          fontFamily: 'monospace',
                          whiteSpace: 'nowrap'
                        }}>
                          {prob.favorableOutcomes.toLocaleString()} / {prob.totalOutcomes.toLocaleString()}
                        </td>
                        <td style={{
                          padding: '8px 12px',
                          textAlign: 'right',
                          color: isFlop 
                            ? (prob.isPossible ? '#856404' : '#6c757d')
                          : isHotDice
                          ? (prob.isPossible ? '#d68910' : '#6c757d')
                            : '#2c3e50',
                          fontSize: '14px',
                          fontWeight: '600',
                          fontFamily: 'monospace',
                          whiteSpace: 'nowrap'
                        }}>
                          {prob.percentage.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {impossibleCombinations.length > 0 && (
        <div>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#6c757d',
            marginBottom: '10px'
          }}>
            Impossible Combinations ({impossibleCombinations.length})
          </h3>
          <div style={{
            fontSize: '14px',
            color: '#6c757d',
            fontStyle: 'italic',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #e1e5e9'
          }}>
            These combinations are not possible with the current dice configuration:
            {' '}
            {impossibleCombinations.map(p => formatCombinationKey(p.key)).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

