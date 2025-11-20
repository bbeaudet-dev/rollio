import React from 'react';

export type ButtonVariant = 'primary' | 'success' | 'secondary';

interface MainMenuButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
}

const getVariantStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case 'success':
      return {
        backgroundColor: '#28a745',
        hoverColor: '#218838'
      };
    case 'primary':
      return {
        backgroundColor: '#007bff',
        hoverColor: '#0056b3'
      };
    case 'secondary':
    default:
      return {
        backgroundColor: '#6c757d',
        hoverColor: '#5a6268'
      };
  }
};

export const MainMenuButton: React.FC<MainMenuButtonProps> = ({
  onClick,
  children,
  variant = 'secondary',
  disabled = false
}) => {
  const variantStyles = getVariantStyles(variant);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: variantStyles.backgroundColor,
        color: '#fff',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        fontSize: '15px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: '500',
        transition: 'background-color 0.2s ease',
        fontFamily: 'Arial, sans-serif',
        minHeight: '44px',
        opacity: disabled ? 0.6 : 1
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = variantStyles.hoverColor;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = variantStyles.backgroundColor;
        }
      }}
    >
      {children}
    </button>
  );
};

