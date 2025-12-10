import React, { useState, useRef, useEffect } from 'react';
import { ConsumableInventoryProps } from '../../../types/inventory';
import { ConsumableCard } from '../../components/ConsumableCard';
import { useUnlocks } from '../../../contexts/UnlockContext';
import { WHIMS, WISHES } from '../../../../game/data/consumables';

const CONSUMABLE_PRICES: Record<string, { buy: number; sell: number }> = {
  wish: { buy: 8, sell: 4 },
  whim: { buy: 4, sell: 2 },
};

export const ConsumableInventory: React.FC<ConsumableInventoryProps> = ({ 
  consumables, 
  onConsumableUse,
  onSellConsumable,
  maxSlots
}) => {
  const { unlockedItems } = useUnlocks();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Deselect when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSelectedIndex(null);
      }
    };

    if (selectedIndex !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [selectedIndex]);

  const slotsToShow = maxSlots || consumables.length;
  const emptySlots = Math.max(0, slotsToShow - consumables.length);

  return (
    <div ref={containerRef}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {consumables.map((consumable, index) => {
            const isWish = WISHES.some((w: any) => w.id === consumable.id);
            const isWhim = WHIMS.some((w: any) => w.id === consumable.id);
            const category = isWish ? 'wish' : (isWhim ? 'whim' : 'whim');
            const sellValue = CONSUMABLE_PRICES[category]?.sell || 2;
            const isSelected = selectedIndex === index;
            
            return (
              <div key={index} onClick={() => {
                setSelectedIndex(isSelected ? null : index);
              }} style={{ position: 'relative' }}>
                <ConsumableCard
                  consumable={consumable}
                  showUseButton={isSelected}
                  onUse={() => {
                    onConsumableUse(index);
                    setSelectedIndex(null);
                  }}
                  highlighted={isSelected}
                  isInActiveGame={true}
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
                          if (onSellConsumable) {
                          onSellConsumable(index);
                          }
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
        {emptySlots > 0 && Array.from({ length: emptySlots }).map((_, index) => (
          <div
            key={`empty-${index}`}
            style={{
              width: '96px',
              height: '96px',
              border: '1px dashed #ccc',
              borderRadius: '8px',
              backgroundColor: '#f5f5f5',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontStyle: 'italic',
              boxSizing: 'border-box'
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}; 