import React from 'react';

interface DiceFaceProps {
  value: number;
  size?: number;
  material?: string;
}

// Color mapping for different materials
const getMaterialColors = (material: string = 'plastic') => {
  switch (material) {
    case 'crystal':
      return { 
        background: '#f3e5f5', 
        border: '#9c27b0', 
        pip: '#6a1b9a' 
      };
    case 'wooden':
      return { 
        background: '#fff8e1', 
        border: '#ff8f00', 
        pip: '#e65100' 
      };
    case 'golden':
      return { 
        background: '#fffde7', 
        border: '#ffc107', 
        pip: '#f57f17' 
      };
    case 'volcano':
      return { 
        background: '#ffebee', 
        border: '#f44336', 
        pip: '#c62828' 
      };
    case 'mirror':
      return { 
        background: '#e3f2fd', 
        border: '#2196f3', 
        pip: '#1565c0' 
      };
    case 'rainbow':
      return { 
        background: 'linear-gradient(45deg, #ff0000, #ff8c00, #ffff00, #00ff00, #0000ff, #4b0082, #8a2be2)', 
        border: '#333', 
        pip: '#fff' 
      };
    case 'plastic':
    default:
      return { 
        background: '#fff', 
        border: '#333', 
        pip: '#333' 
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