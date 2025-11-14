import React from 'react';

interface DiceFaceProps {
  value: number;
  size?: number;
  material?: string;
}

// Color mapping for different materials
const getMaterialColors = (material: string = 'plastic') => {
  switch (material) {
    case 'plastic':
    default:
      return { 
        background: '#fff', 
        border: '#333', 
        pip: '#333' 
      };
    case 'crystal':
      return { 
        background: 'radial-gradient(ellipse at top left, #f3e5f5, #ce93d8, #9c27b0, #6a1b9a)', 
        border: '#6a1b9a', 
        pip: '#f3e5f5' 
      };
    case 'flower':
      return { 
        background: 'radial-gradient(circle at 30% 30%, #ffb3d9, #ffd700, #87ceeb, #98fb98)', 
        border: '#4caf50', 
        pip: '#ff1493' 
      };
    case 'golden':
      return { 
        background: 'linear-gradient(135deg, #ffd700, #ffed4e, #ffc107, #daa520)', 
        border: '#b8860b', 
        pip: '#b87333' 
      };
    case 'volcano':
      return { 
        background: 'radial-gradient(circle at 50% 50%, #ff4500, #ff6600, #ff8c00, #800000, #4a0000)', 
        border: '#000000', 
        pip: '#8b0000' 
      };
    case 'mirror':
      return { 
        background: 'linear-gradient(135deg, #c0c0c0, #e8e8e8, #f0f0f0, #d3d3d3)', 
        border: '#808080', 
        pip: '#404040' 
      };
    case 'rainbow':
      return { 
        background: 'linear-gradient(45deg, #ff0000, #ffff00, #32cd32, #4169e1, #4b0082, #875fff, #ff69b4)', 
        border: '#333', 
        pip: '#fff' 
      };
    case 'ghost':
      return { 
        background: '#1a1a2e', 
        border: '#0a0a0f', 
        pip: '#7fffd4' 
      };
    case 'lead':
      return { 
        background: '#4a4a4a', 
        border: '#5a5a6a', 
        pip: '#2a2a2a' 
      };
  }
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