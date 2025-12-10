import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { progressApi } from '../services/api';

interface UnlockContextType {
  unlockedItems: Set<string>;
  isLoading: boolean;
  refreshUnlocks: () => Promise<void>;
}

const UnlockContext = createContext<UnlockContextType | undefined>(undefined);

export const useUnlocks = () => {
  const context = useContext(UnlockContext);
  if (!context) {
    throw new Error('useUnlocks must be used within an UnlockProvider');
  }
  return context;
};

interface UnlockProviderProps {
  children: ReactNode;
}

export const UnlockProvider: React.FC<UnlockProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [unlockedItems, setUnlockedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const refreshUnlocks = useCallback(async () => {
    if (!isAuthenticated) {
      setUnlockedItems(new Set());
      return;
    }

    setIsLoading(true);
    try {
      const [charmsRes, consumablesRes, blessingsRes, pipEffectsRes, materialsRes, difficultiesRes] = await Promise.all([
        progressApi.getUnlocks('charm'),
        progressApi.getUnlocks('consumable'),
        progressApi.getUnlocks('blessing'),
        progressApi.getUnlocks('pip_effect'),
        progressApi.getUnlocks('material'),
        progressApi.getUnlocks('difficulty')
      ]);

      const unlocked = new Set<string>();
      if (charmsRes.success && (charmsRes as any).unlocks) {
        ((charmsRes as any).unlocks as Array<{ unlockId: string }>).forEach(u => unlocked.add(`charm:${u.unlockId}`));
      }
      if (consumablesRes.success && (consumablesRes as any).unlocks) {
        ((consumablesRes as any).unlocks as Array<{ unlockId: string }>).forEach(u => unlocked.add(`consumable:${u.unlockId}`));
      }
      if (blessingsRes.success && (blessingsRes as any).unlocks) {
        ((blessingsRes as any).unlocks as Array<{ unlockId: string }>).forEach(u => unlocked.add(`blessing:${u.unlockId}`));
      }
      if (pipEffectsRes.success && (pipEffectsRes as any).unlocks) {
        ((pipEffectsRes as any).unlocks as Array<{ unlockId: string }>).forEach(u => unlocked.add(`pip_effect:${u.unlockId}`));
      }
      if (materialsRes.success && (materialsRes as any).unlocks) {
        ((materialsRes as any).unlocks as Array<{ unlockId: string }>).forEach(u => unlocked.add(`material:${u.unlockId}`));
      }
      if (difficultiesRes.success && (difficultiesRes as any).unlocks) {
        ((difficultiesRes as any).unlocks as Array<{ unlockId: string }>).forEach(u => unlocked.add(`difficulty:${u.unlockId}`));
      }
      setUnlockedItems(unlocked);
    } catch (error) {
      console.debug('Failed to fetch unlock status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshUnlocks();
  }, [refreshUnlocks]);

  // Listen for unlock refresh events (e.g., after purchasing items)
  useEffect(() => {
    const handleRefresh = () => {
      refreshUnlocks();
    };
    window.addEventListener('unlock:refresh', handleRefresh);
    return () => {
      window.removeEventListener('unlock:refresh', handleRefresh);
    };
  }, [refreshUnlocks]);

  return (
    <UnlockContext.Provider value={{ unlockedItems, isLoading, refreshUnlocks }}>
      {children}
    </UnlockContext.Provider>
  );
};

