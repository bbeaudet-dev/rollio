import React from 'react';

interface GameControlButtonProps {
  onClick: () => void;
  disabled: boolean;
  backgroundColor: string;
  text: string;
  size?: 'normal' | 'large'; // normal for side buttons, large for middle button
  style?: React.CSSProperties;
}

export const GameControlButton: React.FC<GameControlButtonProps> = ({
  onClick,
  disabled,
  backgroundColor,
  text,
  size = 'normal',
  style = {}
}) => {
  const baseSize = size === 'large' 
    ? { width: 'clamp(105px, 15vw, 150px)', minHeight: 'clamp(55px, 6.9vh, 64px)' }
    : { width: 'clamp(90px, 13vw, 130px)', minHeight: 'clamp(37px, 4.7vh, 45px)' }; 

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseSize,
        padding: '10px 16px',
        fontSize: size === 'large' 
          ? 'clamp(13px, 1.6vw, 17px)'
          : 'clamp(10px, 1.3vw, 14px)',
        fontWeight: 600, // Semi-bold instead of bold
        border: '2px solid black',
        borderRadius: '12px', // Rounded corners
        boxShadow: '0 2px 4px rgba(255, 255, 255, 0.5), 0 0 8px rgba(255, 255, 255, 0.3)',
        backgroundColor: disabled ? '#6c757d' : backgroundColor,
        color: 'white',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        flexShrink: 0, // Prevent buttons from shrinking
        flexGrow: 0, // Prevent buttons from growing
        // Make it look more clickable
        transform: disabled ? 'none' : 'translateY(0)',
        ...style
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(255, 255, 255, 0.6), 0 0 12px rgba(255, 255, 255, 0.4)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(255, 255, 255, 0.5), 0 0 8px rgba(255, 255, 255, 0.3)';
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
      {text}
    </button>
  );
};

