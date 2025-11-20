import React, { useState, useEffect } from 'react';
import { DiceConfig } from './DiceConfig';

import { CombinationCategory } from '../../../game/logic/probability';

interface CalculatorConfigProps {
  diceFaces: number[][];
  onChange: (diceFaces: number[][]) => void;
  category: CombinationCategory;
  onCategoryChange: (category: CombinationCategory) => void;
}

export const CalculatorConfig: React.FC<CalculatorConfigProps> = ({ diceFaces, onChange, category, onCategoryChange }) => {
  const [isHomogenous, setIsHomogenous] = useState(false);
  const handleNumDiceChange = (newNumDice: number) => {
    if (newNumDice < diceFaces.length) {
      // Remove dice
      onChange(diceFaces.slice(0, newNumDice));
    } else {
      // Add dice with default 6 sides [1,2,3,4,5,6]
      const newDiceFaces = [...diceFaces];
      for (let i = diceFaces.length; i < newNumDice; i++) {
        newDiceFaces.push([1, 2, 3, 4, 5, 6]);
      }
      onChange(newDiceFaces);
    }
  };

  const handleDieChange = (dieIndex: number, faces: number[]) => {
    const newDiceFaces = [...diceFaces];
    newDiceFaces[dieIndex] = faces;
    
    // If homogenous mode, copy first die to all others
    if (isHomogenous && dieIndex === 0) {
      for (let i = 1; i < newDiceFaces.length; i++) {
        newDiceFaces[i] = [...faces];
      }
    }
    
    onChange(newDiceFaces);
  };

  // When homogenous mode is enabled, sync all dice to first die
  useEffect(() => {
    if (isHomogenous && diceFaces.length > 0) {
      const firstDieFaces = diceFaces[0];
      const allMatch = diceFaces.every(die => 
        die.length === firstDieFaces.length && 
        die.every((face, i) => face === firstDieFaces[i])
      );
      
      if (!allMatch) {
        const newDiceFaces = diceFaces.map(() => [...firstDieFaces]);
        onChange(newDiceFaces);
      }
    }
  }, [isHomogenous, diceFaces.length]);

  const handleReset = () => {
    onChange([
      [1, 2, 3, 4, 5, 6],
      [1, 2, 3, 4, 5, 6],
      [1, 2, 3, 4, 5, 6],
      [1, 2, 3, 4, 5, 6],
      [1, 2, 3, 4, 5, 6],
      [1, 2, 3, 4, 5, 6],
    ]);
  };

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '6px',
      marginBottom: '15px',
      border: '1px solid #e1e5e9',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '10px'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#2c3e50',
          margin: 0
        }}>
          Configuration
        </h2>
      </div>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: '15px',
        marginBottom: '10px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            color: '#495057',
            marginBottom: '4px'
          }}>
            Number of Dice: {diceFaces.length}
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={diceFaces.length}
            onChange={(e) => handleNumDiceChange(parseInt(e.target.value))}
            style={{
              width: '100%',
              maxWidth: '400px'
            }}
          />
        </div>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: '#495057',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={isHomogenous}
                onChange={(e) => setIsHomogenous(e.target.checked)}
                style={{
                  cursor: 'pointer'
                }}
              />
              Homogenous Set
            </label>
            <button
              onClick={handleReset}
              style={{
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '3px',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#c82333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc3545';
              }}
            >
              Reset All
            </button>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <label style={{
              fontSize: '12px',
              color: '#495057'
            }}>
              Difficulty:
            </label>
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value as CombinationCategory)}
              style={{
                padding: '4px 8px',
                borderRadius: '3px',
                border: '1px solid #ced4da',
                fontSize: '11px',
                cursor: 'pointer',
                backgroundColor: '#fff'
              }}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {diceFaces
          .filter((_, dieIndex) => !isHomogenous || dieIndex === 0)
          .map((faces, filteredIndex) => {
            const dieIndex = isHomogenous ? 0 : filteredIndex;
            return (
              <DiceConfig
                key={dieIndex}
                dieIndex={dieIndex}
                faces={faces}
                onChange={(newFaces) => handleDieChange(dieIndex, newFaces)}
              />
            );
          })}
      </div>
    </div>
  );
};

