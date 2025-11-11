// Convert dice value to pips representation for text display
export const getDicePips = (value: number): string => {
  const pipPatterns = {
    1: '[•]',
    2: '[• •]', 
    3: '[•••]',
    4: '[••••]',
    5: '[•••••]',
    6: '[••••••]'
  };
  return pipPatterns[value as keyof typeof pipPatterns] || '[?]';
};

// Convert array of dice values to pip string
export const formatDiceAsPips = (diceValues: number[]): string => {
  return diceValues.map(value => getDicePips(value)).join(' ');
}; 