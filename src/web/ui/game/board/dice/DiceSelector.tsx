import React, { useState } from 'react';
import { Input } from '../../../components/Input';

interface DiceSelectorProps {
  dice: any[];
  onSelection: (selectedIndices: number[]) => void;
  disabled?: boolean;
}

export const DiceSelector: React.FC<DiceSelectorProps> = ({ 
  dice, 
  onSelection, 
  disabled = false 
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    // Parse dice selection (e.g., "123" selects dice 1, 2, 3)
    const selectedIndices: number[] = [];
    for (const char of value) {
      const index = parseInt(char) - 1;
      if (index >= 0 && index < dice.length && !selectedIndices.includes(index)) {
        selectedIndices.push(index);
      }
    }
    
    onSelection(selectedIndices);
  };

  return (
    <div>
      <h3>Select Dice:</h3>
      <div style={{ marginBottom: '8px' }}>
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter dice numbers (e.g., 123)"
          disabled={disabled}
        />
      </div>
      <div style={{ fontSize: '12px', color: '#666' }}>
        Enter the numbers of dice you want to select (1-{dice.length})
      </div>
    </div>
  );
}; 