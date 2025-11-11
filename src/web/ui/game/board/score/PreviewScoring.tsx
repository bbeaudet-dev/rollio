import React from 'react';

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
      padding: '8px', 
      marginTop: '15px',
      marginBottom: '10px', 
      backgroundColor: previewScoring.isValid ? '#e3f2fd' : '#ffebee',
      border: `1px solid ${previewScoring.isValid ? '#007bff' : '#f44336'}`,
      borderRadius: '4px'
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
        Selected Dice Preview:
      </div>
      {previewScoring.isValid ? (
        <div style={{ fontSize: '14px' }}>
          <div>{previewScoring.combinations.join(', ')}</div>
          <div style={{ fontWeight: 'bold' }}>
            {previewScoring.points} points
          </div>
        </div>
      ) : (
        <div style={{ color: '#f44336', fontSize: '14px' }}>
          Invalid selection
        </div>
      )}
    </div>
  );
}; 