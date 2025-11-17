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

export const DiceFace: React.FC<DiceFaceProps> = ({ value, size = 40, material = 'plastic', pipEffect }) => {
  const pipSize = Math.max(size * 0.12, 3); // Slightly smaller pips
  const gap = size * 0.3; // Increased gap for more spacing
  const colors = getMaterialColors(material);
  
  const pipStyle = {
    width: `${pipSize}px`,
    height: `${pipSize}px`,
    backgroundColor: colors.pip,
    borderRadius: '50%',
    position: 'absolute' as const
  };

  // If there's a pip effect, render icons instead of pips
  const renderPipEffectIcons = () => {
    if (!pipEffect || pipEffect === 'none') {
      return null;
    }

    const iconSize = Math.max(size * 0.15, 4);
    const iconGap = size * 0.25;
    const icons = [];

    // Render the same number of icons as the value
    const positions = getPipPositions(value, iconGap, size);
    
    return positions.map((pos, index) => (
      <div
        key={index}
        style={{
          position: 'absolute',
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          transform: 'translate(-50%, -50%)',
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          color: colors.pip,
        }}
      >
        <PipEffectIcon type={pipEffect} size={iconSize} />
      </div>
    ));
  };

  const getPipPositions = (val: number, gap: number, size: number): Array<{ x: number; y: number }> => {
    const center = size / 2;
    const positions: Array<{ x: number; y: number }> = [];

    switch (val) {
      case 1:
        positions.push({ x: center, y: center });
        break;
      case 2:
        positions.push({ x: gap, y: gap });
        positions.push({ x: size - gap, y: size - gap });
        break;
      case 3:
        positions.push({ x: gap, y: gap });
        positions.push({ x: center, y: center });
        positions.push({ x: size - gap, y: size - gap });
        break;
      case 4:
        positions.push({ x: gap, y: gap });
        positions.push({ x: size - gap, y: gap });
        positions.push({ x: gap, y: size - gap });
        positions.push({ x: size - gap, y: size - gap });
        break;
      case 5:
        positions.push({ x: gap, y: gap });
        positions.push({ x: size - gap, y: gap });
        positions.push({ x: center, y: center });
        positions.push({ x: gap, y: size - gap });
        positions.push({ x: size - gap, y: size - gap });
        break;
      case 6:
        positions.push({ x: gap, y: gap });
        positions.push({ x: size - gap, y: gap });
        positions.push({ x: gap, y: center });
        positions.push({ x: size - gap, y: center });
        positions.push({ x: gap, y: size - gap });
        positions.push({ x: size - gap, y: size - gap });
        break;
    }

    return positions;
  };

  const renderPips = () => {
    const pips = [];
    
    switch (value) {
      case 1:
        // Center
        pips.push(
          <div key="center" style={{
            ...pipStyle,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }} />
        );
        break;
        
      case 2:
        // Top-left and bottom-right diagonal
        pips.push(
          <div key="tl" style={{
            ...pipStyle,
            left: `${gap}px`,
            top: `${gap}px`
          }} />,
          <div key="br" style={{
            ...pipStyle,
            right: `${gap}px`,
            bottom: `${gap}px`
          }} />
        );
        break;
        
      case 3:
        // Top-left, center, bottom-right diagonal
        pips.push(
          <div key="tl" style={{
            ...pipStyle,
            left: `${gap}px`,
            top: `${gap}px`
          }} />,
          <div key="center" style={{
            ...pipStyle,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }} />,
          <div key="br" style={{
            ...pipStyle,
            right: `${gap}px`,
            bottom: `${gap}px`
          }} />
        );
        break;
        
      case 4:
        // Four corners
        pips.push(
          <div key="tl" style={{
            ...pipStyle,
            left: `${gap}px`,
            top: `${gap}px`
          }} />,
          <div key="tr" style={{
            ...pipStyle,
            right: `${gap}px`,
            top: `${gap}px`
          }} />,
          <div key="bl" style={{
            ...pipStyle,
            left: `${gap}px`,
            bottom: `${gap}px`
          }} />,
          <div key="br" style={{
            ...pipStyle,
            right: `${gap}px`,
            bottom: `${gap}px`
          }} />
        );
        break;
        
      case 5:
        // Four corners + center
        pips.push(
          <div key="tl" style={{
            ...pipStyle,
            left: `${gap}px`,
            top: `${gap}px`
          }} />,
          <div key="tr" style={{
            ...pipStyle,
            right: `${gap}px`,
            top: `${gap}px`
          }} />,
          <div key="center" style={{
            ...pipStyle,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }} />,
          <div key="bl" style={{
            ...pipStyle,
            left: `${gap}px`,
            bottom: `${gap}px`
          }} />,
          <div key="br" style={{
            ...pipStyle,
            right: `${gap}px`,
            bottom: `${gap}px`
          }} />
        );
        break;
        
      case 6:
        // Two columns of three
        pips.push(
          <div key="tl" style={{
            ...pipStyle,
            left: `${gap}px`,
            top: `${gap}px`
          }} />,
          <div key="tr" style={{
            ...pipStyle,
            right: `${gap}px`,
            top: `${gap}px`
          }} />,
          <div key="ml" style={{
            ...pipStyle,
            left: `${gap}px`,
            top: '50%',
            transform: 'translateY(-50%)'
          }} />,
          <div key="mr" style={{
            ...pipStyle,
            right: `${gap}px`,
            top: '50%',
            transform: 'translateY(-50%)'
          }} />,
          <div key="bl" style={{
            ...pipStyle,
            left: `${gap}px`,
            bottom: `${gap}px`
          }} />,
          <div key="br" style={{
            ...pipStyle,
            right: `${gap}px`,
            bottom: `${gap}px`
          }} />
        );
        break;
        
      default:
        // Show number for values > 6
        return (
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: `${size * 0.4}px`,
            fontWeight: 'bold',
            color: colors.pip
          }}>
            {value}
          </div>
        );
    }
    
    return pips;
  };

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      position: 'relative' as const,
      background: colors.background,
      border: `2px solid ${colors.border}`,
      borderRadius: '8px',
      display: 'inline-block'
    }}>
      {pipEffect && pipEffect !== 'none' ? renderPipEffectIcons() : renderPips()}
    </div>
  );
}; 