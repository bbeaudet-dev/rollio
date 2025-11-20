import React from 'react';

interface DiceConfigProps {
  dieIndex: number;
  faces: number[];
  onChange: (faces: number[]) => void;
}

export const DiceConfig: React.FC<DiceConfigProps> = ({ dieIndex, faces, onChange }) => {
  const handleNumSidesChange = (newNumSides: number) => {
    if (newNumSides < faces.length) {
      // Remove sides
      onChange(faces.slice(0, newNumSides));
    } else {
      // Add sides with default values (continuing from last value + 1, or 1 if empty)
      const lastValue = faces.length > 0 ? faces[faces.length - 1] : 0;
      const newFaces = [...faces];
      for (let i = faces.length; i < newNumSides; i++) {
        newFaces.push(lastValue + (i - faces.length + 1));
      }
      onChange(newFaces);
    }
  };

  const handleSideValueChange = (sideIndex: number, value: number) => {
    const newFaces = [...faces];
    newFaces[sideIndex] = value;
    onChange(newFaces);
  };

  const isFirstDie = dieIndex === 0;
  const colsPerRow = Math.ceil(faces.length / 2);

  return (
    <div style={{
      backgroundColor: '#fff',
      padding: '6px',
      borderRadius: '4px',
      border: '1px solid #dee2e6',
      marginBottom: '4px',
      width: 'auto',
      minWidth: isFirstDie ? '300px' : '120px',
      maxWidth: isFirstDie ? '500px' : 'none',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }}>
      {/* Die label and number of sides */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: '600',
          color: '#2c3e50',
          minWidth: '35px',
          flexShrink: 0
        }}>
          D{dieIndex + 1}:
        </div>
        <span style={{ 
          fontSize: '10px', 
          color: '#6c757d'
        }}>
          {faces.length}s
        </span>
      </div>
      
      {/* Sides slider on its own row */}
      <div style={{
        width: '100%',
        maxWidth: '200px'
      }}>
        <input
          type="range"
          min="1"
          max="20"
          value={faces.length}
          onChange={(e) => handleNumSidesChange(parseInt(e.target.value))}
          style={{
            width: '100%'
          }}
        />
      </div>

      {/* Side value inputs in 2-row grid */}
      <style>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
      <div style={{
        display: 'grid',
        gridTemplateRows: 'repeat(2, 1fr)',
        gridTemplateColumns: `repeat(${colsPerRow}, 24px)`,
        gap: '2px',
        width: 'fit-content'
      }}>
        {faces.map((value, sideIndex) => {
          const row = Math.floor(sideIndex / colsPerRow);
          const col = sideIndex % colsPerRow;
          const isFirstCol = col === 0;
          const isLastCol = col === colsPerRow - 1 || sideIndex === faces.length - 1;
          const isFirstRow = row === 0;
          const isLastRow = row === 1;
          const isLastItem = sideIndex === faces.length - 1;
          
          // Calculate border radius - handle edge cases
          let borderRadius = '0';
          if (faces.length === 1) {
            borderRadius = '3px'; // Single item gets all rounded corners
          } else if (isFirstRow && isFirstCol) {
            borderRadius = '3px 0 0 0';
          } else if (isFirstRow && isLastCol && isLastItem && faces.length <= colsPerRow) {
            borderRadius = '0 3px 0 0';
          } else if (isLastRow && isFirstCol && (isLastItem || faces.length <= colsPerRow)) {
            borderRadius = '0 0 0 3px';
          } else if (isLastRow && isLastCol && isLastItem) {
            borderRadius = '0 0 3px 0';
          }
          
          return (
            <input
              key={sideIndex}
              type="number"
              value={value}
              onChange={(e) => {
                const num = parseInt(e.target.value) || 0;
                handleSideValueChange(sideIndex, num);
              }}
              title={`Side ${sideIndex + 1}`}
              style={{
                width: '24px',
                height: '20px',
                padding: '2px',
                border: '1px solid #ced4da',
                borderRadius: borderRadius,
                fontSize: '10px',
                textAlign: 'center',
                boxSizing: 'border-box',
                margin: 0,
                outline: 'none'
              }}
              onFocus={(e) => e.target.select()}
            />
          );
        })}
      </div>
    </div>
  );
};
