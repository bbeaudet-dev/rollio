import React from 'react';

interface GameLogProps {
  messages: string[];
}

export const GameLog: React.FC<GameLogProps> = ({ messages }) => {
  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '20px auto', 
      padding: '20px',
      backgroundColor: '#f5f5f5',
      border: '1px solid #ddd',
      borderRadius: '4px'
    }}>
      <h3>Game Log</h3>
      <div style={{ 
        maxHeight: '200px', 
        overflowY: 'auto',
        fontSize: '14px',
        display: 'flex',
        flexDirection: 'column-reverse'
      }}>
        {messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
    </div>
  );
}; 