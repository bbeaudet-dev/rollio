import React, { useState, useEffect } from 'react';
import { statsApi, ApiResponse } from '../../services/api';

interface CombinationStat {
  combinationType: string;
  timesUsed: number;
  firstUsedAt: string | null;
  lastUsedAt: string | null;
}

import { formatCombinationKey } from '../../../game/utils/combinationTracking';

export const CombinationStats: React.FC = () => {
  const [combinations, setCombinations] = useState<CombinationStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCombinations = async () => {
      try {
        const result = await statsApi.getCombinations();
        if (result.success && result.combinations) {
          // Sort by times used (descending)
          const sorted = [...result.combinations].sort((a, b) => b.timesUsed - a.timesUsed);
          setCombinations(sorted);
        }
      } catch (error) {
        console.error('Failed to load combination stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCombinations();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
        Loading combination stats...
      </div>
    );
  }

  if (combinations.length === 0) {
    return (
      <div>
        <h2 style={{
          fontSize: '20px',
          marginBottom: '15px',
          color: '#2c3e50'
        }}>
          Combination Usage
        </h2>
        <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
          No combinations used yet
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{
        fontSize: '20px',
        marginBottom: '10px',
        color: '#2c3e50'
      }}>
        Combination Usage
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '8px'
      }}>
        {combinations.map((combo) => (
          <div
            key={combo.combinationType}
            style={{
              padding: '8px',
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              border: '1px solid #e1e5e9'
            }}
          >
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '4px'
            }}>
              {formatCombinationKey(combo.combinationType)}
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#007bff'
            }}>
              {combo.timesUsed.toLocaleString()}
            </div>
            <div style={{
              fontSize: '10px',
              color: '#6c757d',
              marginTop: '2px'
            }}>
              times used
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

