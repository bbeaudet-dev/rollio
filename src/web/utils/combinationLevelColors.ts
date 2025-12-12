/**
 * Color scheme for combination levels
 * - Level 1: Gray
 * - Levels 2-20: Progressive color scheme
 * - Level 21+: Deep red
 * 
 * Color progression:
 * - Levels 2-5: Blues (light to medium)
 * - Levels 6-9: Greens (light to medium)
 * - Levels 10-13: Yellows/Oranges (light to medium)
 * - Levels 14-17: Purples/Pinks (light to medium)
 * - Levels 18-20: Reds (light to medium, transitioning to deep red)
 */

export function getCombinationLevelColor(level: number): string {
  if (level <= 1) {
    return '#b0b0b0'; // Lighter gray for level 1
  }
  
  if (level >= 21) {
    return '#8B0000'; // Deep red for level 21+
  }
  
  // Levels 2-20: Progressive color scheme
  const colors = [
    // Levels 2-5: Blues (light to medium)
    '#87CEEB', // Sky blue (level 2)
    '#5B9BD5', // Soft blue (level 3)
    '#4A90E2', // Medium blue (level 4)
    '#2E5C8A', // Steel blue (level 5)
    
    // Levels 6-9: Greens (light to medium)
    '#90EE90', // Light green (level 6)
    '#50C878', // Medium green (level 7)
    '#32CD32', // Lime green (level 8)
    '#228B22', // Forest green (level 9)
    
    // Levels 10-13: Yellows/Oranges (light to medium)
    '#FFE4B5', // Moccasin (level 10)
    '#FFD700', // Gold (level 11)
    '#FF8C42', // Dark orange (level 12)
    '#FF6347', // Tomato (level 13)
    
    // Levels 14-17: Purples/Pinks (light to medium)
    '#DDA0DD', // Plum (level 14)
    '#BA55D3', // Medium orchid (level 15)
    '#9370DB', // Medium purple (level 16)
    '#8B008B', // Dark magenta (level 17)
    
    // Levels 18-20: Reds (light to medium, transitioning to deep red)
    '#FFB6C1', // Light pink (level 18)
    '#DC143C', // Crimson (level 19)
    '#B22222', // Fire brick (level 20)
  ];
  
  // Map level 2-20 to colors (level 2 = index 0, level 20 = index 19)
  const colorIndex = level - 2;
  return colors[colorIndex] || '#808080'; // Fallback to gray
}

