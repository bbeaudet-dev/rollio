import React, { useMemo } from 'react';
import { Blessing } from '../../../../game/types';
import { BlessingCard } from '../../components/BlessingCard';

interface BlessingInventoryProps {
  blessings: Blessing[];
}

export const BlessingInventory: React.FC<BlessingInventoryProps> = ({ blessings }) => {
  // Group blessings by base ID (everything before "Tier")
  const groupedBlessings = useMemo(() => {
    const groups: Record<string, Blessing[]> = {};
    const standalone: Blessing[] = [];
    
    for (const blessing of blessings) {
      // Extract base ID (e.g., "reroll" from "rerollTier1")
      const match = blessing.id.match(/^(.+?)Tier\d+$/);
      if (match) {
        const baseId = match[1];
        if (!groups[baseId]) {
          groups[baseId] = [];
        }
        groups[baseId].push(blessing);
      } else {
        // Blessing doesn't follow tier pattern, treat as standalone
        standalone.push(blessing);
      }
    }
    
    // Sort each group by tier (ascending)
    for (const baseId in groups) {
      groups[baseId].sort((a, b) => a.tier - b.tier);
    }
    
    return { groups, standalone };
  }, [blessings]);

  const cardSize = 84; // Blessing card size
  const overlapOffset = Math.round(cardSize * 0.5); // 50% offset = 50% visible (more stacked)

  return (
    <div>
      {blessings.length === 0 ? (
        <p style={{ 
          fontSize: '10px', 
          margin: '0',
          color: '#666'
        }}>No blessings</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'flex-start' }}>
          {/* Render grouped blessings (stacked horizontally) */}
          {Object.entries(groupedBlessings.groups).map(([baseId, group]) => (
            <div
              key={baseId}
              style={{
                position: 'relative',
                width: `${cardSize + (group.length - 1) * overlapOffset}px`,
                height: `${cardSize}px`
              }}
            >
              {group.map((blessing, index) => (
                <div
                  key={blessing.id}
                  style={{
                    position: 'absolute',
                    left: `${index * overlapOffset}px`,
                    top: 0,
                    zIndex: index
                  }}
                >
                  <BlessingCard blessing={blessing} />
                </div>
              ))}
            </div>
          ))}
          
          {/* Render standalone blessings (not stacked) */}
          {groupedBlessings.standalone.map((blessing, index) => (
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

