import React from 'react';
import { formatCombinationKey } from '../../../../../game/utils/combinationTracking';

interface PreviewScoringProps {
  previewScoring: {
    isValid: boolean;
    points: number;
    combinations: string[];
  } | null;
}

export const PreviewScoring: React.FC<PreviewScoringProps> = ({
  previewScoring
}) => {
  if (!previewScoring) {
    return null;
  }

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 20,
      backgroundColor: previewScoring.isValid ? 'rgba(227, 242, 253, 0.95)' : 'rgba(255, 235, 238, 0.95)',
      border: `2px solid ${previewScoring.isValid ? '#007bff' : '#f44336'}`,
      borderRadius: '8px',
      padding: '10px',
      fontSize: '14px',
      fontWeight: 500,
      minWidth: '280px',
      maxWidth: '360px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      pointerEvents: 'none',
      userSelect: 'none'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '12px' }}>
        Selected Dice Preview:
      </div>
      {previewScoring.isValid ? (
        <div style={{ fontSize: '13px', fontWeight: 'normal' }}>
          <div style={{ marginBottom: '4px' }}>
            {previewScoring.combinations.map((key: string) => formatCombinationKey(key)).join(', ')}
          </div>
          <div style={{ fontWeight: 'bold', color: '#007bff' }}>
            {previewScoring.points} points
          </div>
        </div>
      ) : (
        <div style={{ color: '#f44336', fontSize: '13px', fontWeight: 'normal' }}>
          No valid combinations
        </div>
      )}
    </div>
  );
}; 