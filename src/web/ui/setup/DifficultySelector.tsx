import React from 'react';
import { DIFFICULTY_CONFIGS, DifficultyLevel } from '../../../game/logic/difficulty';
import { DifficultyDiceDisplay } from '../components/DifficultyDiceDisplay';

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
      flexDirection: 'column',
      gap: '15px',
      padding: '15px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      border: '2px solid #dee2e6',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Main selector row */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '15px'
      }}>
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
          <DifficultyDiceDisplay difficulty={difficulty} size={70} />
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

      {/* Dot indicators */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        paddingTop: '5px'
      }}>
        {DIFFICULTY_ORDER.map((_, index) => (
          <div
            key={index}
            onClick={() => onChange(DIFFICULTY_ORDER[index])}
            style={{
              width: index === currentIndex ? '12px' : '8px',
              height: index === currentIndex ? '12px' : '8px',
              borderRadius: '50%',
              backgroundColor: index === currentIndex ? '#007bff' : '#dee2e6',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: index === currentIndex ? '2px solid #0056b3' : '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              if (index !== currentIndex) {
                e.currentTarget.style.backgroundColor = '#adb5bd';
                e.currentTarget.style.transform = 'scale(1.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (index !== currentIndex) {
                e.currentTarget.style.backgroundColor = '#dee2e6';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          />
        ))}
      </div>

      {/* Description and Effects of previous difficulties - combined component */}
      <div style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '10px',
          fontSize: '13px',
          color: '#495057',
          textAlign: 'center',
          fontWeight: 'bold',
          lineHeight: '1.5',
          ...(difficulty !== 'plastic' && {
            borderBottom: '1px solid #e9ecef'
          })
        }}>
          {config.description}
        </div>
        {difficulty !== 'plastic' && (
          <div style={{
            padding: '10px',
            backgroundColor: '#e7f3ff',
            fontSize: '13px',
            color: '#0066cc',
            textAlign: 'center',
            fontWeight: 'bold',
            lineHeight: '1.5'
          }}>
            Effects of all previous Difficulties
          </div>
        )}
      </div>
    </div>
  );
};

