import React from 'react';
import { CharmInventory } from './inventory/CharmInventory';
import { ConsumableInventory } from './inventory/ConsumableInventory';
import { BlessingInventory } from './inventory/BlessingInventory';
import { MoneyDisplay } from './MoneyDisplay';

interface InventoryProps {
  charms: any[];
  consumables: any[];
  blessings: any[];
  money?: number;
  onConsumableUse?: (index: number) => void;
  onSellCharm?: (index: number) => void;
  onSellConsumable?: (index: number) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ 
  charms, 
  consumables, 
  blessings,
  money,
  onConsumableUse,
  onSellCharm,
  onSellConsumable
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
      <div 
        className="responsive-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '8px'
        }}
      >
        <CharmInventory charms={charms} onSellCharm={onSellCharm} />
        <ConsumableInventory 
          consumables={consumables}
          onConsumableUse={onConsumableUse || (() => {})}
          onSellConsumable={onSellConsumable}
        />
        <BlessingInventory blessings={blessings} />
      </div>
      
      {/* Money display */}
      {money !== undefined && (
        <div style={{ marginTop: '8px' }}>
          <MoneyDisplay money={money} />
        </div>
      )}
    </div>
  );
};

