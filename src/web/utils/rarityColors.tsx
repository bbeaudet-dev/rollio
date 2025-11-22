/**
 * Rarity color utilities
 */

import React from 'react';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export function getRarityColor(rarity: Rarity | string): string {
  switch (rarity.toLowerCase()) {
    case 'common':
      return '#95a5a6'; // Gray
    case 'uncommon':
      return '#3498db'; // Blue
    case 'rare':
      return '#9b59b6'; // Purple
    case 'epic':
      return '#9C27B0'; // Purple
    case 'legendary':
      return '#ff6b35'; // Orange/Red
    default:
      return '#95a5a6'; // Gray (default)
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

