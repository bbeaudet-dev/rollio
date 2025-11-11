import React from 'react';
import { CharmInventory } from './inventory/CharmInventory';
import { ConsumableInventory } from './inventory/ConsumableInventory';
import { BlessingInventory } from './inventory/BlessingInventory';

interface InventoryProps {
  charms: any[];
  consumables: any[];
  blessings: any[];
  onConsumableUse?: (index: number) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ 
  charms, 
  consumables, 
  blessings,
  onConsumableUse 
}) => {
  return (
    <div style={{ 
      backgroundColor: '#e9ecef',
      border: '1px solid #dee2e6',
      borderTop: 'none',
      borderTopLeftRadius: '0',
      borderTopRightRadius: '0',
      borderBottomLeftRadius: '8px',
      borderBottomRightRadius: '8px',
      padding: '8px',
      marginTop: '0'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '10px'
      }}>
        <CharmInventory charms={charms} />
        <ConsumableInventory 
          consumables={consumables}
          onConsumableUse={onConsumableUse}
        />
        <BlessingInventory blessings={blessings} />
      </div>
    </div>
  );
};

