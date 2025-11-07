import React from 'react';
import { ButtonProps } from '../../types/ui';

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  disabled = false, 
  children, 
  variant = 'primary',
  style
}) => {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      style={{ 
        padding: '8px 16px',
        border: '1px solid #ccc',
        backgroundColor: disabled ? '#f0f0f0' : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        margin: '4px',
        ...style
      }}
    >
      {children}
    </button>
  );
}; 