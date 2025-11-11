import React from 'react';
import { InputProps } from '../../types/ui';

export const Input: React.FC<InputProps> = ({ 
  value, 
  onChange, 
  placeholder = '', 
  disabled = false, 
  type = 'text' 
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '14px',
        width: '200px'
      }}
    />
  );
}; 