import React from 'react';

interface CheatModeToggleProps {
  cheatMode: boolean;
  onToggle: () => void;
}

export const CheatModeToggle: React.FC<CheatModeToggleProps> = ({ cheatMode, onToggle }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        <input
          type="checkbox"
          checked={cheatMode}
          onChange={onToggle}
          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
        />
        Cheat Mode
      </label>
    </div>
  );
};

