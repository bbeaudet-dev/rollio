import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { progressApi } from '../services/api';
import { CHARMS } from '../../game/data/charms';
import { CONSUMABLES } from '../../game/data/consumables';
import { ALL_BLESSINGS } from '../../game/data/blessings';
import { MATERIALS } from '../../game/data/materials';
import { PIP_EFFECTS } from '../../game/data/pipEffects';
import { DifficultyLevel, DIFFICULTY_CONFIGS } from '../../game/logic/difficulty';

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

/**
 * Generate a Set of all possible unlock keys when no user is logged in
 */
function getAllUnlockKeys(): Set<string> {
  const allKeys = new Set<string>();
  
  // Add all charms
  CHARMS.forEach(charm => {
    allKeys.add(`charm:${charm.id}`);
  });
  
  // Add all consumables
  CONSUMABLES.forEach(consumable => {
    allKeys.add(`consumable:${consumable.id}`);
  });
  
  // Add all blessings
  ALL_BLESSINGS.forEach(blessing => {
    allKeys.add(`blessing:${blessing.id}`);
  });
  
  // Add all materials
  MATERIALS.forEach(material => {
    allKeys.add(`material:${material.id}`);
  });
  
  // Add all pip effects
  PIP_EFFECTS.forEach(effect => {
    allKeys.add(`pip_effect:${effect.id}`);
  });
  
  // Add all difficulties
  (Object.keys(DIFFICULTY_CONFIGS) as DifficultyLevel[]).forEach(difficulty => {
    allKeys.add(`difficulty:${difficulty}`);
  });
  
  return allKeys;
}

export const UnlockProvider: React.FC<UnlockProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [unlockedItems, setUnlockedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const refreshUnlocks = useCallback(async () => {
    if (!isAuthenticated) {
      // When not authenticated, unlock everything
      setUnlockedItems(getAllUnlockKeys());
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

