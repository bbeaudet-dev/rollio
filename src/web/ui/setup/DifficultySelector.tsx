import React from 'react';
import { DIFFICULTY_CONFIGS, DifficultyLevel } from '../../../game/logic/difficulty';
import { D20Display } from '../components/D20Display';

interface DifficultySelectorProps {
  difficulty: DifficultyLevel;
  onChange: (difficulty: DifficultyLevel) => void;
}

const DIFFICULTY_ORDER: DifficultyLevel[] = [
  'plastic',
  'copper',
  'silver',
  'gold',
  'platinum',
  'sapphire',
  'emerald',
  'ruby',
  'diamond'
];

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ difficulty, onChange }) => {
  const currentIndex = DIFFICULTY_ORDER.indexOf(difficulty);
  const config = DIFFICULTY_CONFIGS[difficulty];

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onChange(DIFFICULTY_ORDER[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < DIFFICULTY_ORDER.length - 1) {
      onChange(DIFFICULTY_ORDER[currentIndex + 1]);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '15px',
      padding: '10px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      border: '2px solid #dee2e6',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <label style={{ fontSize: '16px', fontWeight: 'bold', color: '#2c3e50' }}>Difficulty:</label>
      
      {/* Previous arrow */}
      <button
        onClick={handlePrevious}
        disabled={currentIndex === 0}
        style={{
          width: '40px',
          height: '40px',
          border: '2px solid #dee2e6',
          borderRadius: '8px',
          backgroundColor: currentIndex === 0 ? '#f8f9fa' : '#fff',
          color: currentIndex === 0 ? '#adb5bd' : '#2c3e50',
          fontSize: '20px',
          cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          opacity: currentIndex === 0 ? 0.5 : 1
        }}
        onMouseEnter={(e) => {
          if (currentIndex > 0) {
            e.currentTarget.style.backgroundColor = '#e9ecef';
            e.currentTarget.style.borderColor = '#adb5bd';
            e.currentTarget.style.transform = 'scale(1.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (currentIndex > 0) {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.borderColor = '#dee2e6';
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      >
        ‹
      </button>

      {/* D20 Display */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '8px',
        minWidth: '120px'
      }}>
        <D20Display difficulty={difficulty} size={70} />
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#2c3e50',
          textAlign: 'center'
        }}>
          {config.name}
        </div>
      </div>

      {/* Next arrow */}
      <button
        onClick={handleNext}
        disabled={currentIndex === DIFFICULTY_ORDER.length - 1}
        style={{
          width: '40px',
          height: '40px',
          border: '2px solid #dee2e6',
          borderRadius: '8px',
          backgroundColor: currentIndex === DIFFICULTY_ORDER.length - 1 ? '#f8f9fa' : '#fff',
          color: currentIndex === DIFFICULTY_ORDER.length - 1 ? '#adb5bd' : '#2c3e50',
          fontSize: '20px',
          cursor: currentIndex === DIFFICULTY_ORDER.length - 1 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          opacity: currentIndex === DIFFICULTY_ORDER.length - 1 ? 0.5 : 1
        }}
        onMouseEnter={(e) => {
          if (currentIndex < DIFFICULTY_ORDER.length - 1) {
            e.currentTarget.style.backgroundColor = '#e9ecef';
            e.currentTarget.style.borderColor = '#adb5bd';
            e.currentTarget.style.transform = 'scale(1.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (currentIndex < DIFFICULTY_ORDER.length - 1) {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.borderColor = '#dee2e6';
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      >
        ›
      </button>
    </div>
  );
};

