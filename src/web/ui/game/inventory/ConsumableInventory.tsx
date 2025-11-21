import React from 'react';
import { ConsumableInventoryProps } from '../../../types/inventory';
import { ConsumableCard } from '../../components/ConsumableCard';

export const ConsumableInventory: React.FC<ConsumableInventoryProps> = ({ 
  consumables, 
  onConsumableUse 
}) => {
  return (
    <div>
      {consumables.length === 0 ? (
        <p style={{ 
          fontSize: '10px', 
          margin: '0',
          color: '#666'
        }}>No consumables</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {consumables.map((consumable, index) => (
            <ConsumableCard
              key={index}
              consumable={consumable}
              showUseButton={true}
              onUse={() => onConsumableUse(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 