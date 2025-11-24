import React, { useState } from 'react';
import { ConsumableInventoryProps } from '../../../types/inventory';
import { ConsumableCard } from '../../components/ConsumableCard';
import { WHIMS, WISHES } from '../../../../game/data/consumables';

const CONSUMABLE_PRICES: Record<string, { buy: number; sell: number }> = {
  wish: { buy: 8, sell: 4 },
  whim: { buy: 4, sell: 2 },
};

export const ConsumableInventory: React.FC<ConsumableInventoryProps> = ({ 
  consumables, 
  onConsumableUse,
  onSellConsumable
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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
          {consumables.map((consumable, index) => {
            const isWish = WISHES.some((w: any) => w.id === consumable.id);
            const isWhim = WHIMS.some((w: any) => w.id === consumable.id);
            const category = isWish ? 'wish' : (isWhim ? 'whim' : 'whim');
            const sellValue = CONSUMABLE_PRICES[category]?.sell || 2;
            const isSelected = selectedIndex === index;
            
            return (
              <div key={index} onClick={() => setSelectedIndex(isSelected ? null : index)} style={{ position: 'relative' }}>
                <ConsumableCard
                  consumable={consumable}
                  showUseButton={isSelected}
                  onUse={() => {
                    onConsumableUse(index);
                    setSelectedIndex(null);
                  }}
                  highlighted={isSelected}
                />
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: '8px',
                    borderRadius: '0 0 5px 5px',
                    zIndex: 10,
                    display: 'flex',
                    gap: '4px',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onConsumableUse(index);
                        setSelectedIndex(null);
                      }}
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      Use
                    </button>
                    {onSellConsumable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSellConsumable(index);
                          setSelectedIndex(null);
                        }}
                        style={{
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        Sell ${sellValue}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}; 