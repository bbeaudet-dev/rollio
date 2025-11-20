import React from 'react';

interface DiceConfigProps {
  dieIndex: number;
  faces: number[];
  onChange: (faces: number[]) => void;
  disabled?: boolean;
}

export const DiceConfig: React.FC<DiceConfigProps> = ({ dieIndex, faces, onChange, disabled = false }) => {
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
  const showFullConfig = !disabled; // Show full config for all non-disabled dice
  const isWideDie = !disabled && isFirstDie; // First die gets wider width

  return (
    <div style={{
      backgroundColor: disabled ? '#f8f9fa' : '#fff',
      padding: '3px 6px',
      borderRadius: '3px',
      border: '1px solid #dee2e6',
      marginBottom: '4px',
      opacity: disabled ? 0.6 : 1,
      width: 'auto',
      minWidth: isWideDie ? '300px' : '120px',
      maxWidth: isWideDie ? '500px' : 'none',
      height: '52px', // Fixed height for all dice boxes
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: showFullConfig ? '2px' : '0'
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
        {showFullConfig && (
          <div style={{ flex: '1', display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
            <span style={{ fontSize: '10px', color: '#6c757d', minWidth: '35px', flexShrink: 0 }}>
              {faces.length}s
            </span>
            <input
              type="range"
              min="1"
              max="20"
              value={faces.length}
              onChange={(e) => handleNumSidesChange(parseInt(e.target.value))}
              style={{
                flex: '1',
                minWidth: 0
              }}
            />
          </div>
        )}
        {!showFullConfig && (
          <div style={{ fontSize: '10px', color: '#6c757d' }}>
            {faces.length}s
          </div>
        )}
      </div>

      {showFullConfig && (
        <>
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
            display: 'flex',
            flexWrap: 'nowrap',
            gap: '0',
            alignItems: 'center',
            marginTop: '0'
          }}>
            {faces.map((value, sideIndex) => (
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
                  width: '20px',
                  padding: '1px 2px',
                  border: '1px solid #ced4da',
                  borderRadius: sideIndex === 0 ? '2px 0 0 2px' : sideIndex === faces.length - 1 ? '0 2px 2px 0' : '0',
                  borderRight: sideIndex < faces.length - 1 ? 'none' : '1px solid #ced4da',
                  fontSize: '10px',
                  textAlign: 'center'
                }}
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

