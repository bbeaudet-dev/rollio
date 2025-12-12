import React, { useState, useEffect } from 'react';
import { statsApi, ApiResponse } from '../../services/api';
import { CONSUMABLES } from '../../../game/data/consumables';

interface ConsumableUsage {
  consumableId: string;
  timesUsed: number;
  firstUsedAt: string | null;
  lastUsedAt: string | null;
}

export const ConsumableStats: React.FC = () => {
  const [consumables, setConsumables] = useState<ConsumableUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConsumables = async () => {
      try {
        const result: ApiResponse = await statsApi.getConsumables();
        if (result.success && result.consumables) {
          setConsumables(result.consumables);
        }
      } catch (error) {
        console.error('Failed to load consumable stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConsumables();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
        Loading consumable statistics...
      </div>
    );
  }

  if (consumables.length === 0) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e1e5e9'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#2c3e50' }}>
          Most Used Consumables
        </h3>
        <div style={{ color: '#6c757d', fontSize: '14px' }}>
          No consumable usage data yet. Use some consumables to see your most-used items!
        </div>
      </div>
    );
  }

  // Get top 10 most used consumables
  const topConsumables = consumables.slice(0, 10);

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e1e5e9',
      marginBottom: '30px'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#2c3e50' }}>
        Most Used Consumables
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {topConsumables.map((consumable, index) => {
          const consumableData = CONSUMABLES.find(c => c.id === consumable.consumableId);
          const consumableName = consumableData?.name || consumable.consumableId;
          
          return (
            <div
              key={consumable.consumableId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px',
                backgroundColor: '#ffffff',
                borderRadius: '6px',
                border: '1px solid #e1e5e9'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#6c757d',
                  minWidth: '30px'
                }}>
                  #{index + 1}
                </span>
                <span style={{ fontSize: '14px', color: '#2c3e50', flex: 1 }}>
                  {consumableName}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#6c757d' }}>
                <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  Used: {consumable.timesUsed}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

