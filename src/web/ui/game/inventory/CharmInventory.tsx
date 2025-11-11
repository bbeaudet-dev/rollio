import React from 'react';
import { CharmInventoryProps } from '../../../types/inventory';
import { InventoryItem } from '../../components/InventoryItem';
import { RarityDot } from '../../../utils/rarityColors';

export const CharmInventory: React.FC<CharmInventoryProps> = ({ charms }) => {
  return (
    <div>
      <h3 style={{ 
        fontSize: '16px', 
        margin: '0 0 4px 0',
        fontWeight: 'bold'
      }}>Charms:</h3>
      {charms.length === 0 ? (
        <p style={{ 
          fontSize: '10px', 
          margin: '0',
          color: '#666'
        }}>No charms</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {charms.map(charm => (
            <li key={charm.id} style={{ marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RarityDot rarity={(charm as any).rarity || 'common'} />
              <InventoryItem
                title={charm.name}
                description={charm.description}
                rarity={(charm as any).rarity || 'Common'}
                uses={charm.uses}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}; 