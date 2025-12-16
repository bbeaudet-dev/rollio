import React, { useState, useEffect, useMemo } from 'react';
import { statsApi, ApiResponse } from '../../services/api';
import { CONSUMABLES, WHIMS, WISHES, COMBINATION_UPGRADES } from '../../../game/data/consumables';
import { ConsumableCard } from '../components/ConsumableCard';
import { ActionButton } from '../components/ActionButton';

interface ConsumableUsage {
  consumableId: string;
  timesUsed: number;
  firstUsedAt: string | null;
  lastUsedAt: string | null;
}

type FilterType = 'all' | 'wishes' | 'whims' | 'upgrades';

export const ConsumableStats: React.FC = () => {
  const [consumables, setConsumables] = useState<ConsumableUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

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

  // Filter consumables based on selected filter
  const filteredConsumables = useMemo(() => {
    if (filter === 'all') {
      return consumables;
    }
    
    return consumables.filter(usage => {
      const consumableData = CONSUMABLES.find(c => c.id === usage.consumableId);
      if (!consumableData) return false;
      
      if (filter === 'wishes') {
        return WISHES.some(w => w.id === usage.consumableId);
      } else if (filter === 'whims') {
        return WHIMS.some(w => w.id === usage.consumableId);
      } else if (filter === 'upgrades') {
        return COMBINATION_UPGRADES.some(cu => cu.id === usage.consumableId);
      }
      
      return true;
    });
  }, [consumables, filter]);

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
        border: '1px solid #e1e5e9',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#2c3e50' }}>
          Consumables Used
        </h3>
        <div style={{ color: '#6c757d', fontSize: '14px' }}>
          No consumable usage data yet. Use some consumables to see your stats!
        </div>
      </div>
    );
  }

  // Sort by timesUsed descending
  const sortedConsumables = [...filteredConsumables].sort((a, b) => b.timesUsed - a.timesUsed);

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e1e5e9',
      marginBottom: '30px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{ margin: 0, color: '#2c3e50' }}>
          Consumables Used
        </h3>
        {/* Filter buttons */}
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          {(['all', 'wishes', 'whims', 'upgrades'] as FilterType[]).map((filterType) => (
            <ActionButton
              key={filterType}
              onClick={() => setFilter(filterType)}
              variant={filter === filterType ? 'primary' : 'secondary'}
              size="small"
              style={{
                textTransform: 'capitalize',
                opacity: filter === filterType ? 1 : 0.7
              }}
            >
              {filterType}
            </ActionButton>
          ))}
        </div>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '12px'
      }}>
        {sortedConsumables.map((consumableUsage) => {
          const consumableData = CONSUMABLES.find(c => c.id === consumableUsage.consumableId);
          if (!consumableData) return null;
          
          return (
            <div
              key={consumableUsage.consumableId}
              style={{
                position: 'relative'
              }}
            >
              <ConsumableCard
                consumable={consumableData}
                isInActiveGame={false}
              />
              {/* Used count overlay in bottom right */}
              {consumableUsage.timesUsed > 0 && (
                <div style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  zIndex: 10
                }}>
                  Used: {consumableUsage.timesUsed}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
