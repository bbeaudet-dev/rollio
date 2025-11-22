import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ScoringHighlightContextType {
  highlightedDiceIndices: number[];
  highlightedCharmIds: string[];
  setHighlightedDice: (indices: number[]) => void;
  setHighlightedCharms: (ids: string[]) => void;
  clearAll: () => void;
}

const ScoringHighlightContext = createContext<ScoringHighlightContextType | undefined>(undefined);

interface ScoringHighlightProviderProps {
  children: ReactNode;
}

export const ScoringHighlightProvider: React.FC<ScoringHighlightProviderProps> = ({ children }) => {
  const [highlightedDiceIndices, setHighlightedDiceIndices] = useState<number[]>([]);
  const [highlightedCharmIds, setHighlightedCharmIds] = useState<string[]>([]);

  const setHighlightedDice = useCallback((indices: number[]) => {
    setHighlightedDiceIndices(indices);
  }, []);

  const setHighlightedCharms = useCallback((ids: string[]) => {
    setHighlightedCharmIds(ids);
  }, []);

  const clearAll = useCallback(() => {
    setHighlightedDiceIndices([]);
    setHighlightedCharmIds([]);
  }, []);

  return (
    <ScoringHighlightContext.Provider
      value={{
        highlightedDiceIndices,
        highlightedCharmIds,
        setHighlightedDice,
        setHighlightedCharms,
        clearAll,
      }}
    >
      {children}
    </ScoringHighlightContext.Provider>
  );
};

export const useScoringHighlights = (): ScoringHighlightContextType => {
  const context = useContext(ScoringHighlightContext);
  // Return default empty state if used outside provider (e.g., in shop view)
  // This allows components to use the hook anywhere without requiring the provider
  if (context === undefined) {
    return {
      highlightedDiceIndices: [],
      highlightedCharmIds: [],
      setHighlightedDice: () => {},
      setHighlightedCharms: () => {},
      clearAll: () => {},
    };
  }
  return context;
};

