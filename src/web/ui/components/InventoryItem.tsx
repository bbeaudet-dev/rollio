import React, { useState } from 'react';
import { StandardButton } from './StandardButton';

interface InventoryItemProps {
  title: string;
  description: string;
  rarity?: string;
  uses?: number;
  showUseButton?: boolean;
  onUse?: () => void;
  children?: React.ReactNode;
  backgroundColor?: string;
}

export const InventoryItem: React.FC<InventoryItemProps> = ({ 
  title, 
  description, 
  rarity, 
  uses, 
  showUseButton = false,
  onUse,
  children,
  backgroundColor
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{ 
          padding: '8px', 
          border: '1px solid #ddd', 
          margin: '4px 0',
          borderRadius: '4px',
          cursor: showUseButton ? 'default' : 'help',
          backgroundColor: backgroundColor || 'white'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{ fontSize: '12px' }}>
          <strong style={{ fontSize: '12px', fontWeight: 'bold' }}>{title}</strong>
          {uses !== undefined && (
            <span style={{ fontSize: '12px' }}> ({uses} uses)</span>
          )}
        </div>
        
        {showUseButton && onUse && (
          <div style={{ marginTop: '6px' }}>
            <StandardButton
              onClick={onUse}
              variant="primary"
              size="small"
            >
              Use
            </StandardButton>
          </div>
        )}
        
        {children}
      </div>
      
      {isHovered && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          right: '0',
          backgroundColor: '#333',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 1000,
          marginTop: '4px'
        }}>
          <div style={{ fontSize: '12px' }}><strong style={{ fontSize: '12px' }}>{title}</strong></div>
          <div style={{ fontSize: '11px' }}>{description}</div>
          {rarity && (
            <div style={{ color: '#ccc', marginTop: '4px', fontSize: '11px' }}>
              Rarity: {rarity}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 