/**
 * Shared utility functions for charms
 */

import { GameState, CombinationCategory } from '../../types';

/**
 * Update Generator charm category after scoring breakdown completes
 * Cycles through: singleN, nPairs, nTuplets, straightOfN, pyramidOfN, nOfAKind
 */
export function updateGeneratorCategory(gameState: GameState): GameState {
  const roundState = gameState.currentWorld?.currentLevel?.currentRound;
  if (!roundState || roundState.generatorCurrentCategory === undefined) {
    return gameState;
  }

  const categories: CombinationCategory[] = [
    'singleN', 'nPairs', 'nTuplets', 'straightOfN', 'pyramidOfN', 'nOfAKind'
  ];
  const currentIndex = categories.indexOf(roundState.generatorCurrentCategory);
  const nextIndex = (currentIndex + 1) % categories.length;
  const nextCategory = categories[nextIndex];

  return {
    ...gameState,
    currentWorld: {
      ...gameState.currentWorld!,
      currentLevel: {
        ...gameState.currentWorld!.currentLevel,
        currentRound: {
          ...roundState,
          generatorCurrentCategory: nextCategory
        }
      }
    }
  };
}

