import React, { createContext, useContext, ReactNode } from 'react';

// Frontend-only type - matches DifficultyLevel but doesn't import from game
export type DifficultyLevelString = 
  | 'plastic' 
  | 'copper' 
  | 'silver' 
  | 'gold' 
  | 'platinum' 
  | 'sapphire' 
  | 'emerald' 
  | 'ruby' 
  | 'diamond' 
  | 'quantum';

interface DifficultyContextType {
  difficulty: DifficultyLevelString | null;
}

const DifficultyContext = createContext<DifficultyContextType>({
  difficulty: null,
});

interface DifficultyProviderProps {
  difficulty: DifficultyLevelString | null;
  children: ReactNode;
}

export const DifficultyProvider: React.FC<DifficultyProviderProps> = ({ 
  difficulty, 
  children 
}) => {
  return (
    <DifficultyContext.Provider value={{ difficulty }}>
      {children}
    </DifficultyContext.Provider>
  );
};

export const useDifficulty = (): DifficultyLevelString | null => {
  const context = useContext(DifficultyContext);
  return context.difficulty;
};

