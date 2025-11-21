import React from 'react';

interface StandardButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const variantColors = {
  primary: '#007bff',    // Blue
  secondary: '#6c757d',  // Gray
  success: '#28a745',    // Green
  warning: '#ffc107',    // Yellow/Orange
  danger: '#dc3545',     // Red
};

const sizeStyles = {
  small: {
    padding: '6px 12px',
    fontSize: '12px',
    borderRadius: '8px',
    minHeight: '32px',
  },
  medium: {
    padding: '8px 16px',
    fontSize: '14px',
    borderRadius: '10px',
    minHeight: '38px',
  },
  large: {
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '12px',
    minHeight: '44px',
  },
};

export const StandardButton: React.FC<StandardButtonProps> = ({
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  children,
  style = {}
}) => {
  const backgroundColor = variantColors[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...sizeStyle,
        fontWeight: 600,
        border: '2px solid #000',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2), 0 0 6px rgba(255, 255, 255, 0.1)',
        backgroundColor: disabled ? '#6c757d' : backgroundColor,
        color: 'white',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        ...style
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
      {children}
    </button>
  );
};

