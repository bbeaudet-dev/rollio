import React from 'react';

interface RerollIndicatorProps {
  count: number;
  maxVisible?: number; // Maximum number of indicators to show before showing "+X"
}

export const RerollIndicator: React.FC<RerollIndicatorProps> = ({ 
  count, 
  maxVisible = 5 
}) => {
  if (count === 0) return null;
  
  const indicators = [];
  for (let i = 0; i < count && i < maxVisible; i++) {
    indicators.push(
      <div
        key={i}
        style={{
          width: '12px',
          height: '12px',
          backgroundColor: 'white',
          border: '1px solid rgba(0, 0, 0, 0.3)',
          borderRadius: '50%'
        }}
      />
    );
  }
  if (count > maxVisible) {
    indicators.push(
      <span key="more" style={{ fontSize: '10px', lineHeight: '1', color: 'white' }}>
        +{count - maxVisible}
      </span>
    );
  }
  
  return (
    <div style={{ 
      display: 'flex', 
      gap: '4px', 
      alignItems: 'center', 
      justifyContent: 'center',
      marginTop: '1px'
    }}>
      {indicators}
    </div>
  );
};

