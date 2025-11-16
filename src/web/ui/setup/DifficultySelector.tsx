import React from 'react';
import { DIFFICULTY_CONFIGS, DifficultyLevel } from '../../../game/logic/difficulty';

interface DifficultySelectorProps {
  difficulty: DifficultyLevel;
  onChange: (difficulty: DifficultyLevel) => void;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ difficulty, onChange }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <label style={{ fontSize: '16px', fontWeight: 'bold' }}>Difficulty:</label>
      <select
        value={difficulty}
        onChange={(e) => onChange(e.target.value as DifficultyLevel)}
        style={{
          padding: '8px 12px',
          fontSize: '14px',
          borderRadius: '4px',
          border: '1px solid #ddd',
          cursor: 'pointer'
        }}
      >
        {Object.values(DIFFICULTY_CONFIGS).map(diff => (
          <option key={diff.id} value={diff.id}>{diff.name}</option>
        ))}
      </select>
    </div>
  );
};

