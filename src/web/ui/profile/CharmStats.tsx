import React, { useState, useEffect } from 'react';
import { statsApi, ApiResponse } from '../../services/api';
import { CHARMS } from '../../../game/data/charms';

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
        border: '1px solid #e1e5e9'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#2c3e50' }}>
          Most Used Charms
        </h3>
        <div style={{ color: '#6c757d', fontSize: '14px' }}>
          No charm usage data yet. Play some games to see your most-used charms!
        </div>
      </div>
    );
  }

  // Get top 10 most used charms
  const topCharms = charms.slice(0, 10);

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {topCharms.map((charm, index) => {
          const charmData = CHARMS.find(c => c.id === charm.charmId);
          const charmName = charmData?.name || charm.charmId;
          
          return (
            <div
              key={charm.charmId}
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
                  {charmName}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#6c757d' }}>
                {charm.timesGenerated > 0 && (
                  <span>Generated: {charm.timesGenerated}</span>
                )}
                {charm.timesCopied > 0 && (
                  <span>Copied: {charm.timesCopied}</span>
                )}
                <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  Total: {charm.totalUsage}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

