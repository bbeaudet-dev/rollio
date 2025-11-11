import React from 'react';
import { ModalProps } from '../../types/ui';

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        minWidth: '300px',
        maxWidth: '500px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3>{title}</h3>
          <button onClick={onClose} style={{
            border: 'none',
            background: 'none',
            fontSize: '20px',
            cursor: 'pointer'
          }}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}; 