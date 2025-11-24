import React, { useState } from 'react';
import { CharmInventoryProps } from '../../../types/inventory';
import { CharmCard } from '../../components/CharmCard';
import { useScoringHighlights } from '../../../contexts/ScoringHighlightContext';
import { CHARM_PRICES } from '../../../../game/data/charms';

export const CharmInventory: React.FC<CharmInventoryProps> = ({ charms, onSellCharm }) => {
  const { highlightedCharmIds } = useScoringHighlights();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <div>
      {charms.length === 0 ? (
        <p style={{ 
          fontSize: '10px', 
          margin: '0',
          color: '#666'
        }}>No charms</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '0 8px' }}>
          {charms.map((charm, index) => {
            const rarity = charm.rarity || 'common';
            const sellValue = CHARM_PRICES[rarity]?.sell || 2;
            const isSelected = selectedIndex === index;
            
            return (
              <div key={charm.id} onClick={() => setSelectedIndex(isSelected ? null : index)} style={{ position: 'relative' }}>
                <CharmCard
                  charm={charm}
                  highlighted={highlightedCharmIds.includes(charm.id) || isSelected}
                  isInShop={false}
                  showSellButton={isSelected}
                  onSell={() => {
                    if (onSellCharm) {
                      onSellCharm(index);
                      setSelectedIndex(null);
                    }
                  }}
                />
                {isSelected && onSellCharm && (
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
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSellCharm(index);
                        setSelectedIndex(null);
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