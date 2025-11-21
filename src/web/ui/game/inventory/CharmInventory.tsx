import React from 'react';
import { CharmInventoryProps } from '../../../types/inventory';
import { CharmCard } from '../../components/CharmCard';

export const CharmInventory: React.FC<CharmInventoryProps> = ({ charms }) => {
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
            />
          ))}
        </div>
      )}
    </div>
  );
}; 