import React, { useState, useEffect } from 'react';
import { DIFFICULTY_CONFIGS, DifficultyLevel } from '../../../game/logic/difficulty';
import { DifficultyDiceDisplay } from '../components/DifficultyDiceDisplay';
import { useAuth } from '../../contexts/AuthContext';
import { progressApi } from '../../services/api';
import { useUnlocks } from '../../contexts/UnlockContext';
import { LockIcon } from '../components/LockIcon';
import { ArrowSelector } from '../components/ArrowSelector';

interface DifficultySelectorProps {
  difficulty: DifficultyLevel;
  onChange: (difficulty: DifficultyLevel) => void;
}

const DIFFICULTY_ORDER: DifficultyLevel[] = [
  'plastic',
  'copper',
  'silver',
  'gold',
  'roseGold',
  'platinum',
  'sapphire',
  'emerald',
  'ruby',
  'diamond',
  'quantum'
];

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ difficulty, onChange }) => {
  const { isAuthenticated } = useAuth();
  const { unlockedItems } = useUnlocks();
  const [completedDifficulties, setCompletedDifficulties] = useState<Set<string>>(new Set());
  const currentIndex = DIFFICULTY_ORDER.indexOf(difficulty);
  const config = DIFFICULTY_CONFIGS[difficulty];
  const isLocked = difficulty !== 'plastic' && !unlockedItems.has(`difficulty:${difficulty}`);

  // Fetch completion status when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      progressApi.getCompletions().then(response => {
        if (response.success && (response as any).completions) {
          const completions = (response as any).completions as Array<{ difficulty: string }>;
          const completed = new Set<string>(completions.map(c => c.difficulty));
          setCompletedDifficulties(completed);
        }
      }).catch(error => {
        console.debug('Failed to fetch difficulty completions:', error);
      });
    }
  }, [isAuthenticated]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevDiff = DIFFICULTY_ORDER[currentIndex - 1];
      onChange(prevDiff);
    }
  };

  const handleNext = () => {
    if (currentIndex < DIFFICULTY_ORDER.length - 1) {
      const nextDiff = DIFFICULTY_ORDER[currentIndex + 1];
      onChange(nextDiff);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      gap: '15px',
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      border: '2px solid #dee2e6',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      
      {/* Main selector row with description */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: '40px',
        flexWrap: 'nowrap',
      }}>
        {/* Selector (arrows + dice + dots) */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
          width: '200px',
          minWidth: '200px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '25px'
          }}>
            {/* Previous arrow */}
            <ArrowSelector
              direction="left"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              size={40}
            />

            {/* D20 Display */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '8px',
              minWidth: '140px',
              position: 'relative'
            }}>
              <div style={{ 
                position: 'relative',
                width: '70px',
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DifficultyDiceDisplay difficulty={difficulty} size={70} />
              </div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: isLocked ? '#adb5bd' : '#2c3e50',
                textAlign: 'center',
                maxWidth: '180px',
                wordWrap: 'break-word',
                lineHeight: '1.2'
              }}>
                {config.name}
                {isLocked && ' (Locked)'}
              </div>
            </div>

            {/* Next arrow */}
            <ArrowSelector
              direction="right"
              onClick={handleNext}
              disabled={currentIndex === DIFFICULTY_ORDER.length - 1}
              size={40}
            />
          </div>

          {/* Dot indicators with completion status */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            paddingTop: '5px'
          }}>
            {DIFFICULTY_ORDER.map((diff, index) => {
              const isCompleted = completedDifficulties.has(diff);
              const isCurrent = index === currentIndex;
              const isDiffLocked = diff !== 'plastic' && !unlockedItems.has(`difficulty:${diff}`);
              
              // Show lock icon for locked difficulties
              if (isDiffLocked) {
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: isCurrent ? '16px' : '12px',
                      height: isCurrent ? '16px' : '12px',
                      cursor: 'not-allowed',
                      transition: 'all 0.2s ease',
                      opacity: isCurrent ? 1 : 0.6
                    }}
                    title={`Locked: ${DIFFICULTY_CONFIGS[diff].name} - Complete previous difficulty to unlock`}
                  >
                    <LockIcon 
                      size={isCurrent ? 16 : 12} 
                      color={isCurrent ? '#007bff' : '#6c757d'} 
                      strokeWidth={isCurrent ? 2.5 : 2} 
                    />
                  </div>
                );
              }
              
              // Show dot for unlocked/completed difficulties
              return (
                <div
                  key={index}
                  onClick={() => {
                    onChange(diff);
                  }}
                  style={{
                    position: 'relative',
                    width: isCurrent ? '12px' : '8px',
                    height: isCurrent ? '12px' : '8px',
                    borderRadius: '50%',
                    backgroundColor: isCurrent ? '#007bff' : (isCompleted ? '#28a745' : '#dee2e6'),
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isCurrent ? '2px solid #0056b3' : (isCompleted ? '2px solid #1e7e34' : '2px solid transparent')
                  }}
                  onMouseEnter={(e) => {
                    if (index !== currentIndex) {
                      e.currentTarget.style.backgroundColor = isCompleted ? '#218838' : '#adb5bd';
                      e.currentTarget.style.transform = 'scale(1.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (index !== currentIndex) {
                      e.currentTarget.style.backgroundColor = isCompleted ? '#28a745' : '#dee2e6';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                  title={isCompleted ? `Completed: ${DIFFICULTY_CONFIGS[diff].name}` : DIFFICULTY_CONFIGS[diff].name}
                />
              );
            })}
          </div>
        </div>

        {/* Description and Effects of previous difficulties - combined component */}
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          overflow: 'hidden',
          width: '400px',
          marginLeft: '50px',
          flexShrink: 0
        }}>
          <div style={{
            padding: '12px',
            fontSize: '14px',
            color: '#495057',
            textAlign: 'center',
            fontWeight: 'normal',
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
              fontWeight: 'normal',
              lineHeight: '1.5'
            }}>
              + Effects of all previous Difficulties
              <div style={{ marginTop: '2px', fontSize: '9px', opacity: 0.8 }}>
                {DIFFICULTY_ORDER.slice(0, currentIndex).map((d, idx) => 
                  DIFFICULTY_CONFIGS[d].name
                ).join(', ')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

