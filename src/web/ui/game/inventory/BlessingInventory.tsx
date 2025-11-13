import React from 'react';
import { Blessing } from '../../../../game/types';
import { getBlessingName, getBlessingDescription } from '../../../../game/data/blessings';
import { InventoryItem } from '../../components/InventoryItem';

interface BlessingInventoryProps {
  blessings: Blessing[];
}

export const BlessingInventory: React.FC<BlessingInventoryProps> = ({ blessings }) => {
  // Group blessings by their effect type (e.g., "baseLevelRerolls", "baseLevelBanks", "moneyPerBank")
  const groupedBlessings = React.useMemo(() => {
    const groups = new Map<string, Blessing[]>();
    
    blessings.forEach(blessing => {
      // Group by effect type
      const effectType = blessing.effect.type;
      if (!groups.has(effectType)) {
        groups.set(effectType, []);
      }
      groups.get(effectType)!.push(blessing);
    });
    
    // Convert to array and sort by tier
    return Array.from(groups.entries()).map(([effectType, blessingList]) => {
      const sorted = blessingList.sort((a, b) => a.tier - b.tier);
      const tiers = sorted.map(b => b.tier);
      const firstBlessing = sorted[0];
      const name = getBlessingName(firstBlessing);
      // Remove the roman numeral from the name to get base name
      const baseName = name.replace(/\s+[IVX]+$/, '');
      const description = getBlessingDescription(firstBlessing);
      
      return {
        effectType,
        baseName,
        description,
        tiers,
        firstBlessing
      };
    });
  }, [blessings]);

  return (
    <div>
      <h3 style={{ 
        fontSize: '16px', 
        margin: '0 0 4px 0',
        fontWeight: 'bold'
      }}>Blessings:</h3>
      {blessings.length === 0 ? (
        <p style={{ 
          fontSize: '10px', 
          margin: '0',
          color: '#666'
        }}>No blessings</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {groupedBlessings.map((group, index) => {
            const tierRomanNumerals = group.tiers.map(tier => {
              if (tier === 1) return 'I';
              if (tier === 2) return 'II';
              if (tier === 3) return 'III';
              return '';
            }).join(' ');
            
            return (
              <li key={group.effectType} style={{ marginBottom: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <InventoryItem
                    title={group.baseName}
                    description={group.description}
                  />
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#666',
                    fontStyle: 'italic',
                    marginLeft: '8px',
                    padding: '2px 6px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '3px',
                    border: '1px solid #ddd',
                    whiteSpace: 'nowrap'
                  }}>
                    {tierRomanNumerals}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

