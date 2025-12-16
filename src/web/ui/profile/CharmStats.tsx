import React, { useState, useEffect } from 'react';
import { statsApi, ApiResponse } from '../../services/api';
import { CHARMS } from '../../../game/data/charms';
import { CharmCard } from '../components/CharmCard';

interface CharmUsage {
  charmId: string;
  timesPurchased: number;
  timesGenerated: number;
  timesCopied: number;
  totalUsage: number;
  firstPurchasedAt: string | null;
  lastPurchasedAt: string | null;
}

export const CharmStats: React.FC = () => {
  const [charms, setCharms] = useState<CharmUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCharms = async () => {
      try {
        const result: ApiResponse = await statsApi.getCharms();
        if (result.success && result.charms) {
          setCharms(result.charms);
        }
      } catch (error) {
        console.error('Failed to load charm stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCharms();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
        Loading charm statistics...
      </div>
    );
  }

  if (charms.length === 0) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e1e5e9',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#2c3e50' }}>
          Most Used Charms
        </h3>
        <div style={{ color: '#6c757d', fontSize: '14px' }}>
          No charm usage data yet. Play some games to see your stats!
        </div>
      </div>
    );
  }

  // Get all charms with their owned count (totalUsage = timesPurchased + timesGenerated + timesCopied)
  // Sort by totalUsage descending
  const sortedCharms = [...charms].sort((a, b) => b.totalUsage - a.totalUsage);

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e1e5e9',
      marginBottom: '30px'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#2c3e50' }}>
        Most Used Charms
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '12px'
      }}>
        {sortedCharms.map((charmUsage) => {
          const charmData = CHARMS.find(c => c.id === charmUsage.charmId);
          if (!charmData) return null;
          
          // totalUsage represents total times owned (purchased + generated + copied)
          const ownedCount = charmUsage.totalUsage;
          
          return (
            <div
              key={charmUsage.charmId}
              style={{
                position: 'relative'
              }}
            >
              <CharmCard
                charm={charmData}
                isInActiveGame={false}
              />
              {/* Owned count overlay in bottom right */}
              {ownedCount > 0 && (
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
                  Owned: {ownedCount}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
