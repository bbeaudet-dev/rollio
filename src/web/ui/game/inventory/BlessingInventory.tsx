import React from 'react';
import { Blessing } from '../../../../game/types';
import { BlessingCard } from '../../components/BlessingCard';

interface BlessingInventoryProps {
  blessings: Blessing[];
}

export const BlessingInventory: React.FC<BlessingInventoryProps> = ({ blessings }) => {
  return (
    <div>
      {blessings.length === 0 ? (
        <p style={{ 
          fontSize: '10px', 
          margin: '0',
          color: '#666'
        }}>No blessings</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {blessings.map((blessing, index) => (
            <BlessingCard
              key={`${blessing.id}-${index}`}
              blessing={blessing}
            />
          ))}
        </div>
      )}
    </div>
  );
};

