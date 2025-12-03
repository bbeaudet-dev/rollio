import React from 'react';

interface ModeButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export const ModeButton: React.FC<ModeButtonProps> = ({
  onClick,
  children,
  selected = false,
  disabled = false,
  style = {}
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: selected ? 'bold' : 'normal',
        backgroundColor: selected ? '#007bff' : '#fff',
        color: selected ? '#fff' : '#2c3e50',
        border: `2px solid ${selected ? '#007bff' : '#dee2e6'}`,
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.5 : (selected ? 1 : 0.7),
        fontFamily: 'Arial, sans-serif',
        ...style
      }}
      onMouseEnter={(e) => {
        if (!disabled && !selected) {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.backgroundColor = '#e9ecef';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !selected) {
          e.currentTarget.style.opacity = '0.7';
          e.currentTarget.style.backgroundColor = '#fff';
        }
      }}
    >
      {children}
    </button>
  );
};

