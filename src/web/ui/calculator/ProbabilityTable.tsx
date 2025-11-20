import React from 'react';
import { SpecificCombinationProbability } from '../../../game/logic/probability';
import { formatCombinationKey } from '../../../game/utils/combinationTracking';
import { ProbabilityTimeIndicator } from './ProbabilityTimeIndicator';

interface ProbabilityTableProps {
  probabilities: SpecificCombinationProbability[];
  totalOutcomes: number;
  onCompute: () => void;
  onCancel: () => void;
  isComputing: boolean;
  computeError: string | null;
  progress: { combinationIndex: number; totalCombinations: number; currentRoll: number; totalRolls: number } | null;
}

export const ProbabilityTable: React.FC<ProbabilityTableProps> = ({ 
  probabilities, 
  totalOutcomes,
  onCompute,
  onCancel,
  isComputing,
  computeError,
  progress
}) => {
  const possibleCombinations = probabilities.filter(p => p.isPossible);
  const impossibleCombinations = probabilities.filter(p => !p.isPossible);

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '10px',
        marginTop: '20px'
      }}>
        <ProbabilityTimeIndicator totalOutcomes={totalOutcomes} />
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

      {isComputing && progress && (
        <div style={{
          marginTop: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '14px',
            color: '#6c757d'
          }}>
            <span>
              Combination {progress.combinationIndex + 1} of {progress.totalCombinations}
            </span>
            <span>
              {progress.currentRoll.toLocaleString()} / {progress.totalRolls.toLocaleString()} rolls
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '24px',
            backgroundColor: '#e9ecef',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              backgroundColor: '#007bff',
              width: `${((progress.combinationIndex / progress.totalCombinations) * 100) + ((progress.currentRoll / progress.totalRolls) * (100 / progress.totalCombinations))}%`,
              transition: 'width 0.1s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {((progress.combinationIndex / progress.totalCombinations) * 100 + (progress.currentRoll / progress.totalRolls) * (100 / progress.totalCombinations)).toFixed(1)}%
            </div>
          </div>
        </div>
      )}

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
                  .map((prob, index) => (
                    <tr
                      key={prob.key}
                      style={{
                        borderBottom: index < possibleCombinations.length - 1 ? '1px solid #e1e5e9' : 'none',
                        backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa'
                      }}
                    >
                      <td style={{
                        padding: '8px 12px',
                        color: '#2c3e50',
                        fontSize: '14px',
                        whiteSpace: 'nowrap'
                      }}>
                        {formatCombinationKey(prob.key)}
                      </td>
                        <td style={{
                          padding: '8px 12px',
                          textAlign: 'right',
                          color: '#495057',
                          fontSize: '14px',
                          fontFamily: 'monospace',
                          whiteSpace: 'nowrap'
                        }}>
                          {prob.favorableOutcomes.toLocaleString()} / {prob.totalOutcomes.toLocaleString()}
                        </td>
                        <td style={{
                          padding: '8px 12px',
                          textAlign: 'right',
                          color: '#2c3e50',
                          fontSize: '14px',
                          fontWeight: '600',
                          fontFamily: 'monospace',
                          whiteSpace: 'nowrap'
                        }}>
                          {prob.percentage.toFixed(2)}%
                        </td>
                    </tr>
                  ))}
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

