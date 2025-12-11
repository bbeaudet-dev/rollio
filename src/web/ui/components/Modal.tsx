import React from 'react';
import { ModalProps } from '../../types/ui';

export const Modal: React.FC<ModalProps & { showCloseButton?: boolean }> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  showCloseButton = true
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      style={{
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
      }}
      onClick={handleBackdropClick}
    >
      <div 
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          minWidth: '300px',
          maxWidth: '500px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            {title && <h3>{title}</h3>}
            {showCloseButton && (
              <button onClick={onClose} style={{
                border: 'none',
                background: 'none',
                fontSize: '20px',
                cursor: 'pointer'
              }}>
                ×
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}; 