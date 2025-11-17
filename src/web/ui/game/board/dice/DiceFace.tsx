import React from 'react';
import { MATERIAL_COLORS } from '../../../../utils/colors';
import { PipEffectIcon } from '../../../collection/PipEffectIcon';
import { PipEffectType } from '../../../../../game/data/pipEffects';

interface DiceFaceProps {
  value: number;
  size?: number;
  material?: string;
  pipEffect?: PipEffectType | 'none'; // Pip effect for this specific side
}

// Get material colors from centralized colors.ts
const getMaterialColors = (material: string = 'plastic') => {
  const materialKey = material as keyof typeof MATERIAL_COLORS;
  return MATERIAL_COLORS[materialKey] || MATERIAL_COLORS.plastic;
};

/**
 * Returns an array of {x, y} positions in pixels, all relative to the die's top-left corner
 */
const getPipPositions = (value: number, size: number, borderWidth: number = 2): Array<{ x: number; y: number }> => {
  const paddingBoxSize = size - (borderWidth * 2);
  const center = paddingBoxSize / 2;
  const gap = paddingBoxSize * 0.30;
  
  const positions: Array<{ x: number; y: number }> = [];

  switch (value) {
    case 1:
      // Single pip in center
      positions.push({ x: center, y: center });
      break;
    case 2:
      // Diagonal: top-left, bottom-right
      positions.push({ x: gap, y: gap });
      positions.push({ x: paddingBoxSize - gap, y: paddingBoxSize - gap });
      break;
    case 3:
      // Diagonal: top-left, center, bottom-right
      positions.push({ x: gap, y: gap });
      positions.push({ x: center, y: center });
      positions.push({ x: paddingBoxSize - gap, y: paddingBoxSize - gap });
      break;
    case 4:
      // Four corners
      positions.push({ x: gap, y: gap });
      positions.push({ x: paddingBoxSize - gap, y: gap });
      positions.push({ x: gap, y: paddingBoxSize - gap });
      positions.push({ x: paddingBoxSize - gap, y: paddingBoxSize - gap });
      break;
    case 5:
      // Four corners + center
      positions.push({ x: gap, y: gap });
      positions.push({ x: paddingBoxSize - gap, y: gap });
      positions.push({ x: center, y: center });
      positions.push({ x: gap, y: paddingBoxSize - gap });
      positions.push({ x: paddingBoxSize - gap, y: paddingBoxSize - gap });
      break;
    case 6:
      // Two columns of three
      positions.push({ x: gap, y: gap });
      positions.push({ x: paddingBoxSize - gap, y: gap });
      positions.push({ x: gap, y: center });
      positions.push({ x: paddingBoxSize - gap, y: center });
      positions.push({ x: gap, y: paddingBoxSize - gap });
      positions.push({ x: paddingBoxSize - gap, y: paddingBoxSize - gap });
      break;
  }

  return positions;
};

export const DiceFace: React.FC<DiceFaceProps> = ({ value, size = 40, material = 'plastic', pipEffect }) => {
  const colors = getMaterialColors(material);
  
  // For values > 6, show number instead
  if (value > 6) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative' as const,
        background: colors.background,
        border: `2px solid ${colors.border}`,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          fontSize: `${size * 0.4}px`,
          fontWeight: 'bold',
          color: colors.pip,
          lineHeight: 1
        }}>
          {value}
        </div>
      </div>
    );
  }
  
  const borderWidth = 2;
  const positions = getPipPositions(value, size, borderWidth);
  const pipSize = Math.max(size * 0.14, 3);
  const iconSize = Math.max(size * 0.20, 5);
  const hasPipEffect = pipEffect && pipEffect !== 'none';
  
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      position: 'relative' as const,
      background: colors.background,
      border: `${borderWidth}px solid ${colors.border}`,
      borderRadius: '8px',
      display: 'inline-block',
      boxSizing: 'border-box' as const,
      padding: 0,
      margin: 0
    }}>
      {positions.map((pos, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            transform: 'translate(-50%, -50%)',
            width: hasPipEffect ? `${iconSize}px` : `${pipSize}px`,
            height: hasPipEffect ? `${iconSize}px` : `${pipSize}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {hasPipEffect ? (
            <PipEffectIcon type={pipEffect} size={iconSize} />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: colors.pip,
              borderRadius: '50%'
            }} />
          )}
        </div>
      ))}
    </div>
  );
};
