/**
 * Shared utility functions for charms
 */

import { GameState, CombinationCategory } from '../../types';

/**
 * Update Generator charm category after scoring breakdown completes
 * Cycles through: singleN, nPairs, nTuplets, straightOfN, pyramidOfN, nOfAKind
 */
export function updateGeneratorCategory(gameState: GameState): GameState {
  if (!gameState.history.charmState?.generator?.currentCategory) {
    return gameState;
  }

  const categories: CombinationCategory[] = [
    'singleN', 'nPairs', 'nTuplets', 'straightOfN', 'pyramidOfN', 'nOfAKind'
  ];
  const currentIndex = categories.indexOf(gameState.history.charmState.generator.currentCategory);
  const nextIndex = (currentIndex + 1) % categories.length;
  const nextCategory = categories[nextIndex];

  return {
    ...gameState,
    history: {
      ...gameState.history,
      charmState: {
        ...gameState.history.charmState,
        generator: {
          ...gameState.history.charmState.generator,
          currentCategory: nextCategory
        }
      }
    }
  };
}

