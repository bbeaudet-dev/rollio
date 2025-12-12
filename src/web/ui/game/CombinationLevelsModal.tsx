import React, { useMemo } from 'react';
import { Modal } from '../components/Modal';
import { CombinationLevels } from '../../../game/types';
import { ALL_SCORING_TYPES } from '../../../game/data/combinations';
import { getCombinationLevelColor } from '../../utils/combinationLevelColors';
import { COMBINATION_HIERARCHY } from '../../../game/logic/partitioning';
import { formatCategoryName } from '../../../game/utils/combinationTracking';

interface CombinationLevelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  combinationLevels?: CombinationLevels | null;
}

export const CombinationLevelsModal: React.FC<CombinationLevelsModalProps> = ({
  isOpen,
  onClose,
  combinationLevels
}) => {
  const levels = combinationLevels || {};

  // Group levels by category
  const categoryLevels = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    // Collect the maximum level for each category
    for (const [key, level] of Object.entries(levels)) {
      const [category] = key.split(':');
      const currentMax = categoryMap.get(category) || 1;
      categoryMap.set(category, Math.max(currentMax, level));
    }
    
    // Categories that should be hidden until played
    const hiddenUntilPlayed = ['nQuadruplets', 'nQuintuplets', 'nSextuplets', 'nSeptuplets', 'nOctuplets', 'nNonuplets', 'nDecuplets'];
    
    // Show all categories (or level 1 if not played, except hidden ones)
    const result: Array<{ category: string; level: number }> = [];
    for (const category of ALL_SCORING_TYPES) {
      // Hide higher tuplet categories if they haven't been played
      if (hiddenUntilPlayed.includes(category) && !categoryMap.has(category)) {
        continue;
      }
      
      const level = categoryMap.get(category) || 1;
      result.push({ category, level });
    }
    
    // Sort by reverse hierarchy (Singles at top, Straights at bottom)
    return result.sort((a, b) => {
      const hierarchyA = COMBINATION_HIERARCHY[a.category] || 0;
      const hierarchyB = COMBINATION_HIERARCHY[b.category] || 0;
      return hierarchyA - hierarchyB; // Lower hierarchy first (Singles = 10, Straights = 90)
    });
  }, [levels]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Combination Levels">
      <div style={{
        minWidth: '300px',
        maxWidth: '500px',
        maxHeight: '500px',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {categoryLevels.map(({ category, level }) => (
            <div
              key={category}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                border: '1px solid #e1e5e9'
              }}
            >
              <span style={{
                color: '#2c3e50',
                fontSize: '14px',
                fontWeight: 500
              }}>
                {formatCategoryName(category)}
              </span>
              <span style={{
                color: getCombinationLevelColor(level),
                fontSize: '14px',
                fontWeight: 'bold',
                minWidth: '40px',
                textAlign: 'right'
              }}>
                Lv.{level}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

