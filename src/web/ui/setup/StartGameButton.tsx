import React from 'react';

interface StartGameButtonProps {
  onClick: () => void;
}

export const StartGameButton: React.FC<StartGameButtonProps> = ({ onClick }) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      marginBottom: '30px' 
    }}>
      <button 
        onClick={onClick}
        style={{
          backgroundColor: '#28a745',
          color: '#fff',
          border: 'none',
          padding: '15px 40px',
          borderRadius: '8px',
          fontSize: '18px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif',
          boxShadow: '0 4px 8px rgba(40, 167, 69, 0.3)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(40, 167, 69, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(40, 167, 69, 0.3)';
        }}
      >
        🚀 Start Adventure!
      </button>
    </div>
  );
};

