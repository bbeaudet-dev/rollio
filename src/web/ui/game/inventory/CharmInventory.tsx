import React from 'react';
import { CharmInventoryProps } from '../../../types/inventory';
import { CharmCard } from '../../components/CharmCard';
import { useScoringHighlights } from '../../../contexts/ScoringHighlightContext';

export const CharmInventory: React.FC<CharmInventoryProps> = ({ charms }) => {
  const { highlightedCharmIds } = useScoringHighlights();
  return (
    <div>
      {charms.length === 0 ? (
        <p style={{ 
          fontSize: '10px', 
          margin: '0',
          color: '#666'
        }}>No charms</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {charms.map(charm => (
            <CharmCard
              key={charm.id}
              charm={charm}
              highlighted={highlightedCharmIds.includes(charm.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 