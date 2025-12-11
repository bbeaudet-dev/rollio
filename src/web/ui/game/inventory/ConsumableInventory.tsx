import React, { useState, useRef, useEffect } from 'react';
import { ConsumableInventoryProps } from '../../../types/inventory';
import { ConsumableCard } from '../../components/ConsumableCard';
import { useUnlocks } from '../../../contexts/UnlockContext';
import { WHIMS, WISHES, COMBINATION_UPGRADES } from '../../../../game/data/consumables';
import { CONSUMABLE_PRICES } from '../../../../game/logic/shop';
import { getDiceSelectionRequirement } from '../../../../game/logic/consumableEffects';
import { CONSUMABLE_CARD_SIZE } from '../../components/cardSizes';

export const ConsumableInventory: React.FC<ConsumableInventoryProps> = ({ 
  consumables, 
  onConsumableUse,
  onSellConsumable,
  maxSlots,
  selectedDiceCount = 0
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
            const isCombinationUpgrade = COMBINATION_UPGRADES.some((cu: any) => cu.id === consumable.id);
            const category = isWish ? 'wish' : (isWhim ? 'whim' : (isCombinationUpgrade ? 'combinationUpgrade' : 'whim'));
            const sellValue = CONSUMABLE_PRICES[category]?.sell || 2;
            const isSelected = selectedIndex === index;
            const diceRequirement = getDiceSelectionRequirement(consumable.id);
            const isUseButtonDisabled = diceRequirement.requires && 
              (selectedDiceCount < diceRequirement.min || selectedDiceCount > diceRequirement.max);
            
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
                        if (!isUseButtonDisabled) {
                          onConsumableUse(index);
                          setSelectedIndex(null);
                        }
                      }}
                      disabled={isUseButtonDisabled}
                      style={{
                        backgroundColor: isUseButtonDisabled ? '#6c757d' : '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: isUseButtonDisabled ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        opacity: isUseButtonDisabled ? 0.6 : 1
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
              width: `${CONSUMABLE_CARD_SIZE}px`,
              height: `${CONSUMABLE_CARD_SIZE}px`,
              border: '3px dashed #ccc', // Match card border width (3px) for accurate sizing
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