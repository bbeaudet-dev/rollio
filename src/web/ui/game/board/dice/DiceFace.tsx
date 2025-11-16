import React from 'react';
import { MATERIAL_COLORS } from '../../../../utils/colors';

interface DiceFaceProps {
  value: number;
  size?: number;
  material?: string;
}

// Get material colors from centralized colors.ts
const getMaterialColors = (material: string = 'plastic') => {
  const materialKey = material as keyof typeof MATERIAL_COLORS;
  return MATERIAL_COLORS[materialKey] || MATERIAL_COLORS.plastic;
};

export const DiceFace: React.FC<DiceFaceProps> = ({ value, size = 40, material = 'plastic' }) => {
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
      {renderPips()}
    </div>
  );
}; 