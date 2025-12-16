import React, { useState, useRef, useEffect } from 'react';
import { CharmInventoryProps } from '../../../types/inventory';
import { CharmCard } from '../../components/CharmCard';
import { useScoringHighlights } from '../../../contexts/ScoringHighlightContext';
import { useUnlocks } from '../../../contexts/UnlockContext';
import { CHARM_PRICES } from '../../../../game/data/charms';
import { CHARM_CARD_SIZE } from '../../components/cardSizes';

export const CharmInventory: React.FC<CharmInventoryProps> = ({ charms, onSellCharm, onMoveCharm, maxSlots, charmState }) => {
  const { highlightedCharmIds } = useScoringHighlights();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedCharmId, setSelectedCharmId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update selected index when charms array changes (e.g., after moving)
  useEffect(() => {
    if (selectedCharmId !== null) {
      const newIndex = charms.findIndex(c => c.id === selectedCharmId);
      if (newIndex !== -1) {
        setSelectedIndex(newIndex);
      } else {
        // Charm was removed (sold), clear selection
        setSelectedIndex(null);
        setSelectedCharmId(null);
      }
    }
  }, [charms, selectedCharmId]);

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

  const slotsToShow = maxSlots || charms.length;
  const emptySlots = Math.max(0, slotsToShow - charms.length);

  return (
    <div ref={containerRef} style={{ paddingLeft: '12px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {charms.map((charm, index) => {
            const rarity = charm.rarity || 'common';
            const sellValue = CHARM_PRICES[rarity]?.sell || 2;
            const isSelected = selectedIndex === index;
            
            return (
              <div key={charm.id} onClick={() => {
                if (isSelected) {
                  setSelectedIndex(null);
                  setSelectedCharmId(null);
                } else {
                  setSelectedIndex(index);
                  setSelectedCharmId(charm.id);
                }
              }} style={{ position: 'relative' }}>
                <CharmCard
                  charm={charm}
                  highlighted={highlightedCharmIds.includes(charm.id) || isSelected}
                  showSellButton={isSelected}
                  onSell={() => {
                    if (onSellCharm) {
                      onSellCharm(index);
                      setSelectedIndex(null);
                      setSelectedCharmId(null);
                    }
                  }}
                  isInActiveGame={true}
                  charmState={charmState}
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
                    zIndex: 1001,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    pointerEvents: 'auto'
                  }}>
                    {/* Move Left Button */}
                    {onMoveCharm && index > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveCharm(index, 'left');
                        }}
                        style={{
                          backgroundColor: '#2196F3',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                        title="Move left"
                      >
                        ←
                      </button>
                    )}
                    
                    {/* Sell Button */}
                    {onSellCharm && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSellCharm(index);
                          setSelectedIndex(null);
                          setSelectedCharmId(null);
                        }}
                        style={{
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          padding: '6px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        Sell ${sellValue}
                      </button>
                    )}
                    
                    {/* Move Right Button */}
                    {onMoveCharm && index < charms.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveCharm(index, 'right');
                        }}
                        style={{
                          backgroundColor: '#2196F3',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                        title="Move right"
                      >
                        →
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
              width: `${CHARM_CARD_SIZE}px`,
              height: `${CHARM_CARD_SIZE}px`,
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