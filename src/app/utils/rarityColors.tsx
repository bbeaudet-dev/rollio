/**
 * Rarity color utilities
 */

import React from 'react';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export function getRarityColor(rarity: Rarity | string): string {
  switch (rarity.toLowerCase()) {
    case 'common':
      return '#ffffff'; // White
    case 'uncommon':
      return '#4CAF50'; // Green
    case 'rare':
      return '#2196F3'; // Blue
    case 'epic':
      return '#9C27B0'; // Purple
    case 'legendary':
      return '#FF9800'; // Orange
    default:
      return '#ffffff'; // White (default)
  }
}

export function RarityDot({ rarity }: { rarity: Rarity | string }): React.ReactElement {
  const color = getRarityColor(rarity);
  return (
    <span
      style={{
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: color,
        border: '1px solid #ccc',
        marginRight: '4px',
        verticalAlign: 'middle'
      }}
      title={rarity}
    />
  );
}

