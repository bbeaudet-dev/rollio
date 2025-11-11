import React from 'react';
import { ConsumableInventoryProps } from '../../../types/inventory';
import { InventoryItem } from '../../components/InventoryItem';
import { RarityDot } from '../../../utils/rarityColors';

export const ConsumableInventory: React.FC<ConsumableInventoryProps> = ({ 
  consumables, 
  onConsumableUse 
}) => {
  return (
    <div>
      <h3 style={{ 
        fontSize: '16px', 
        margin: '0 0 4px 0',
        fontWeight: 'bold'
      }}>Consumables:</h3>
      {consumables.length === 0 ? (
        <p style={{ 
          fontSize: '10px', 
          margin: '0',
          color: '#666'
        }}>No consumables</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {consumables.map((consumable, index) => (
            <li key={index} style={{ marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RarityDot rarity={(consumable as any).rarity || 'common'} />
              <InventoryItem
                title={consumable.name}
                description={consumable.description}
                rarity={(consumable as any).rarity || 'Common'}
                uses={consumable.uses}
                showUseButton={true}
                onUse={() => onConsumableUse(index)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}; 