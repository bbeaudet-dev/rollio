import React from 'react';

interface ArrowSelectorProps {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled: boolean;
  size?: number;
}

export const ArrowSelector: React.FC<ArrowSelectorProps> = ({
  direction,
  onClick,
  disabled,
  size = 40
}) => {
  const arrow = direction === 'left' ? '‹' : '›';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        border: disabled ? '2px solid #dee2e6' : '2px solid #000',
        borderRadius: '8px',
        backgroundColor: disabled ? '#f8f9fa' : '#fff',
        color: disabled ? '#adb5bd' : '#2c3e50',
        fontSize: `${size * 0.5}px`,
        fontWeight: 'bold',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.6 : 1,
        boxShadow: disabled ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.2), 0 0 6px rgba(255, 255, 255, 0.1)',
        transition: 'all 0.2s ease',
        userSelect: 'none'
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3), 0 0 10px rgba(255, 255, 255, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2), 0 0 6px rgba(255, 255, 255, 0.1)';
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
    >
      {arrow}
    </button>
  );
};

