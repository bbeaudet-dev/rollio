import React from 'react';

interface TooltipProps {
  isVisible: boolean;
  title: string;
  description: string;
  rarity?: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  isVisible, 
  title, 
  description, 
  rarity, 
  children 
}) => {
  return (
    <div style={{ position: 'relative' }}>
      {children}
      
      {isVisible && (
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
          <div><strong>{title}</strong></div>
          <div>{description}</div>
          {rarity && (
            <div style={{ color: '#ccc', marginTop: '4px' }}>
              Rarity: {rarity}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 