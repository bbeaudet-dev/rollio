import React from 'react';
import { DifficultyLevelString } from '../../contexts/DifficultyContext';
import { DIFFICULTY_COLORS } from '../../utils/colors';

interface DiceDisplayProps {
  difficulty: DifficultyLevelString | null;
  size?: number;
  diceTypeOverride?: keyof typeof DICE_DATA;
  edgeStyle?: 'solid' | 'dashed';
}

// Vertex and edge data - using pixel coordinates directly
interface Vertex {
  id: number;
  x: number;
  y: number;
}

interface Edge {
  from: number;
  to: number;
  type: "thick" | "thin";
}

interface Facet {
  points: number[]; // Array of vertex IDs that form a closed polygon
}

interface DiceData {
  vertices: Vertex[];
  edges: Edge[];
  rotation?: number; // Optional rotation in degrees (clockwise)
  facets?: Facet[]; // Optional facets for multi-colored rendering
}

const DICE_DATA: Record<string, DiceData> = {
  D4: {
    vertices: [
      { id: 4, x: 1276.00, y: 568.00 },
      { id: 5, x: 183.00, y: 1984.00 },
      { id: 6, x: 1280.00, y: 2755.00 },
      { id: 7, x: 2370.00, y: 1981.00 }
    ],
    edges: [
      { from: 7, to: 4, type: "thick" },
      { from: 6, to: 7, type: "thick" },
      { from: 5, to: 6, type: "thick" },
      { from: 4, to: 5, type: "thick" },
      { from: 4, to: 6, type: "thin" }
    ],
    facets: [
      { points: [4, 5, 6, 4] }, // Left half
      { points: [4, 7, 6, 4] }  // Right half
    ]
  },
  D6: {
    vertices: [
      { id: 0, x: 134.33, y: 994.00 },
      { id: 1, x: 1270.00, y: 1647.00 },
      { id: 2, x: 1270.33, y: 2957.00 },
      { id: 3, x: 127.50, y: 2305.50 },
      { id: 4, x: 2405.00, y: 994.00 },
      { id: 5, x: 2411.50, y: 2306.50 },
      { id: 6, x: 1269.00, y: 328.50 },
    ],
    edges: [
      // Thick edges (outer cube frame)
      { from: 3, to: 0, type: "thick" },
      { from: 3, to: 2, type: "thick" },
      { from: 5, to: 2, type: "thick" },
      { from: 5, to: 4, type: "thick" },
      { from: 6, to: 4, type: "thick" },
      { from: 6, to: 0, type: "thick" },
      // Thin edges (top face connections)
      { from: 1, to: 0, type: "thin" },
      { from: 1, to: 2, type: "thin" },
      { from: 1, to: 4, type: "thin" },
    ],
    facets: [
      { points: [0, 1, 4, 6, 0] }, // Top face
      { points: [0, 1, 2, 3, 0] }, // Left face
      { points: [1, 2, 5, 4, 1] }, // Right face
    ],
  },
  D8: {
    vertices: [
      { id: 12, x: 1267.00, y: 431.00 },
      { id: 13, x: 272.00, y: 1319.00 },
      { id: 14, x: 271.00, y: 1974.00 },
      { id: 15, x: 1269.00, y: 2863.00 },
      { id: 16, x: 2264.00, y: 1976.00 },
      { id: 17, x: 2265.00, y: 1317.00 } // Inferred from pattern (top right corner)
    ],
    edges: [
      { from: 12, to: 13, type: "thick" },
      { from: 13, to: 14, type: "thick" },
      { from: 14, to: 15, type: "thick" },
      { from: 15, to: 16, type: "thick" },
      { from: 16, to: 17, type: "thick" },
      { from: 17, to: 12, type: "thick" },
      { from: 12, to: 14, type: "thin" },
      { from: 12, to: 16, type: "thin" },
      { from: 14, to: 16, type: "thin" }
    ],
    facets: [
      { points: [12, 14, 16, 12] }, // Top front area
      { points: [15, 14, 16, 15] }, // Bottom front area
      { points: [12, 13, 14, 12] }, // Top left face
      { points: [12, 17, 16, 12] }  // Top right face
    ]
  },
  D10: {
    vertices: [
      { id: 1, x: 1466.67, y: 2246.33 },
      { id: 6, x: 1759.00, y: 1644.00 },
      { id: 8, x: 1467.67, y: 1040.00 },
      { id: 13, x: 1030.00, y: 494.00 },
      { id: 14, x: 140.00, y: 1644.00 },
      { id: 15, x: 1039.00, y: 2792.00 },
      { id: 16, x: 1480.00, y: 2793.00 },
      { id: 17, x: 2383.00, y: 1643.00 },
      { id: 18, x: 1484.00, y: 495.00 }
    ],
    edges: [
      { from: 13, to: 14, type: "thick" },
      { from: 14, to: 15, type: "thick" },
      { from: 15, to: 16, type: "thick" },
      { from: 16, to: 17, type: "thick" },
      { from: 17, to: 18, type: "thick" },
      { from: 18, to: 13, type: "thick" },
      { from: 18, to: 8, type: "thin" },
      { from: 8, to: 14, type: "thin" },
      { from: 8, to: 6, type: "thin" },
      { from: 6, to: 1, type: "thin" },
      { from: 6, to: 17, type: "thin" },
      { from: 1, to: 14, type: "thin" },
      { from: 1, to: 16, type: "thin" }
    ],
    facets: [
      { points: [6, 8, 14, 1, 6] },      // Top front area
      { points: [8, 18, 13, 14, 8] },    // Top right face
      { points: [14, 15, 16, 1, 14] },   // Top left face
      { points: [16, 1, 6, 17, 16] },    // Bottom left face
      { points: [18, 8, 6, 17, 18] }     // Bottom right face
    ],
    rotation: 90 // 90 degrees clockwise
  },
  D12: {
    vertices: [
      { id: 3, x: 1044.00, y: 2329.50 },
      { id: 4, x: 1829.33, y: 2072.67 },
      { id: 6, x: 544.67, y: 1653.33 },
      { id: 11, x: 1833.33, y: 1235.67 },
      { id: 12, x: 1040.00, y: 976.00 },
      { id: 17, x: 913.00, y: 603.00 },
      { id: 18, x: 360.00, y: 1010.00 },
      { id: 19, x: 153.00, y: 1647.00 },
      { id: 20, x: 360.00, y: 2300.00 },
      { id: 21, x: 913.00, y: 2704.00 },
      { id: 22, x: 1600.00, y: 2704.00 },
      { id: 23, x: 2153.00, y: 2297.00 },
      { id: 24, x: 2361.00, y: 1657.00 },
      { id: 25, x: 2140.00, y: 1015.00 },
      { id: 26, x: 1602.00, y: 603.00 }
    ],
    edges: [
      { from: 17, to: 18, type: "thick" },
      { from: 18, to: 19, type: "thick" },
      { from: 19, to: 20, type: "thick" },
      { from: 20, to: 21, type: "thick" },
      { from: 21, to: 22, type: "thick" },
      { from: 22, to: 23, type: "thick" },
      { from: 23, to: 24, type: "thick" },
      { from: 24, to: 25, type: "thick" },
      { from: 25, to: 26, type: "thick" },
      { from: 26, to: 17, type: "thick" },
      { from: 17, to: 12, type: "thin" },
      { from: 12, to: 11, type: "thin" },
      { from: 11, to: 25, type: "thin" },
      { from: 11, to: 4, type: "thin" },
      { from: 4, to: 23, type: "thin" },
      { from: 4, to: 3, type: "thin" },
      { from: 3, to: 21, type: "thin" },
      { from: 3, to: 6, type: "thin" },
      { from: 6, to: 19, type: "thin" },
      { from: 6, to: 12, type: "thin" }
    ],
    facets: [
      { points: [3, 4, 11, 12, 6, 3] },      // Main front pentagonal area
      { points: [12, 17, 18, 19, 6, 12] },   // Top right face
      { points: [6, 3, 21, 20, 19, 6] },     // Top left face
      { points: [3, 21, 22, 23, 4, 3] },     // Bottom left face
      { points: [4, 23, 24, 25, 11, 4] },    // Bottom face
      { points: [11, 25, 26, 17, 12, 11] }   // Bottom right face
    ],
    rotation: 90 // 90 degrees clockwise
  },
  D20: {
    vertices: [
      { id: 2, x: 1931.00, y: 2190.00 }, // Aligned y with 21, 3, 23
      { id: 3, x: 622.50, y: 2190.00 }, // Aligned y with 21, 2, 23
      { id: 13, x: 1271.80, y: 1055.00 }, // Aligned y with 20, 24
      { id: 19, x: 1270.00, y: 478.00 },
      { id: 20, x: 282.50, y: 1055.00 }, // Aligned x with 21, y with 13, 24
      { id: 21, x: 282.50, y: 2190.00 }, // Aligned x with 20, y with 3, 2, 23
      { id: 22, x: 1274.00, y: 2762.00 },
      { id: 23, x: 2261.50, y: 2190.00 }, // Aligned x with 24, y with 21, 3, 2
      { id: 24, x: 2261.50, y: 1055.00 } // Aligned x with 23, y with 20, 13
    ],
    edges: [
      { from: 19, to: 20, type: "thick" },
      { from: 20, to: 21, type: "thick" },
      { from: 21, to: 22, type: "thick" },
      { from: 22, to: 23, type: "thick" },
      { from: 23, to: 24, type: "thick" },
      { from: 24, to: 19, type: "thick" },
      { from: 19, to: 13, type: "thin" },
      { from: 13, to: 20, type: "thin" },
      { from: 13, to: 3, type: "thin" },
      { from: 13, to: 2, type: "thin" },
      { from: 13, to: 24, type: "thin" },
      { from: 20, to: 3, type: "thin" },
      { from: 3, to: 21, type: "thin" },
      { from: 3, to: 22, type: "thin" },
      { from: 3, to: 2, type: "thin" },
      { from: 2, to: 22, type: "thin" },
      { from: 2, to: 23, type: "thin" },
      { from: 2, to: 24, type: "thin" }
    ],
    facets: [
      // TOP AREAS
      { points: [19, 20, 13, 19] },  // Top left triangle
      { points: [19, 24, 13, 19] },  // Top right triangle
      // BOTTOM AREAS
      { points: [21, 3, 22, 21] },   // Bottom left sliver
      { points: [23, 2, 22, 23] },   // Bottom right sliver
      { points: [3, 2, 22, 3] },     // Large center triangle on bottom
      // MIDDLE AREAS
      { points: [20, 21, 3, 20] },   // Left side sliver
      { points: [23, 24, 2, 23] },   // Right side sliver
      { points: [20, 3, 13, 20] },   // Large triangle left of middle
      { points: [24, 2, 13, 24] },   // Large triangle right of middle
      { points: [13, 3, 2, 13] }     // Most prominent center triangle
    ]
  }
};

/**
 * Determines which dice shape to display based on difficulty level
 * Plastic now uses the D6 cube; D4 is reserved for the unselected placeholder.
 */
const getDiceType = (difficulty: DifficultyLevelString): keyof typeof DICE_DATA => {
  if (difficulty === 'plastic') return 'D6';
  if (difficulty === 'copper' || difficulty === 'silver') return 'D8';
  if (difficulty === 'gold' || difficulty === 'roseGold' || difficulty === 'platinum') return 'D10';
  if (difficulty === 'sapphire' || difficulty === 'emerald' || difficulty === 'ruby') return 'D12';
  if (difficulty === 'diamond' || difficulty === 'quantum') return 'D20';
  return 'D6'; // Default to D6
};

/**
 * Renders a wireframe dice display based on 2D coordinates
 */
export const DifficultyDiceDisplay: React.FC<DiceDisplayProps> = ({
  difficulty,
  size = 60,
  diceTypeOverride,
  edgeStyle = 'solid',
}) => {
  if (!difficulty) return null;
  
  const diceType = diceTypeOverride || getDiceType(difficulty);
  const diceData = DICE_DATA[diceType];
  
  const thickWidth = 3; // Thick edges
  const thinWidth = 1; // Thin edges

  // Find bounding box of vertices (using pixel coordinates directly)
  const minX = Math.min(...diceData.vertices.map(v => v.x));
  const maxX = Math.max(...diceData.vertices.map(v => v.x));
  const minY = Math.min(...diceData.vertices.map(v => v.y));
  const maxY = Math.max(...diceData.vertices.map(v => v.y));
  
  const coordWidth = maxX - minX;
  const coordHeight = maxY - minY;
  
  // Scale to fit square viewport while maintaining aspect ratio
  // Use the larger dimension to ensure the shape fits
  const scale = size / Math.max(coordWidth, coordHeight);
  
  // Center the shape in the viewport
  const offsetX = (size - coordWidth * scale) / 2 - minX * scale;
  const offsetY = (size - coordHeight * scale) / 2 - minY * scale;

  // Add padding to viewBox to prevent rounded caps from being clipped
  const padding = 2;
  const viewBoxSize = size + (padding * 2);
  
  // Convert pixel coordinates to viewport coordinates (with padding offset)
  const pixelVertices: Record<number, { x: number; y: number }> = {};
  diceData.vertices.forEach(vertex => {
    pixelVertices[vertex.id] = {
      x: vertex.x * scale + offsetX + padding,
      y: vertex.y * scale + offsetY + padding
    };
  });

  // Calculate center point for rotation (in viewBox coordinates)
  const centerX = size / 2 + padding;
  const centerY = size / 2 + padding;
  const rotation = diceData.rotation || 0;

  // Get colors and effects based on difficulty
  const colors = DIFFICULTY_COLORS[difficulty];
  const isGem = difficulty === 'sapphire' || difficulty === 'emerald' || difficulty === 'ruby';
  const isDiamond = difficulty === 'diamond';
  const isQuantum = difficulty === 'quantum';

  // Get convex hull for background fill
  const getConvexHull = (vertices: Vertex[]): Vertex[] => {
    if (vertices.length < 3) return vertices;
    const points = vertices.map(v => pixelVertices[v.id]).filter(Boolean);
    if (points.length < 3) return vertices;

    // Find bottom-most point (or leftmost if tie)
    let startIdx = 0;
    for (let i = 1; i < points.length; i++) {
      if (points[i].y > points[startIdx].y || 
          (points[i].y === points[startIdx].y && points[i].x < points[startIdx].x)) {
        startIdx = i;
      }
    }

    // Sort by polar angle
    const sorted = points
      .map((p, i) => ({ point: p, idx: i }))
      .filter((_, i) => i !== startIdx)
      .sort((a, b) => {
        const angleA = Math.atan2(a.point.y - points[startIdx].y, a.point.x - points[startIdx].x);
        const angleB = Math.atan2(b.point.y - points[startIdx].y, b.point.x - points[startIdx].x);
        return angleA - angleB;
      });

    // Graham scan
    const hull = [points[startIdx]];
    for (const { point } of sorted) {
      while (hull.length > 1) {
        const p1 = hull[hull.length - 2];
        const p2 = hull[hull.length - 1];
        const cross = (p2.x - p1.x) * (point.y - p1.y) - (p2.y - p1.y) * (point.x - p1.x);
        if (cross <= 0) hull.pop();
        else break;
      }
      hull.push(point);
    }
    return hull.map(p => ({ id: -1, x: p.x, y: p.y }));
  };

  const hullPoints = getConvexHull(diceData.vertices);
  const hullPath = hullPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Get edge colors and effects (darker and richer)
  const getEdgeColor = (edge: Edge, index: number): string => {
    if (difficulty === 'plastic') return '#1a1a1a';
    if (difficulty === 'copper') return '#4a2a0a';
    if (difficulty === 'silver') return '#606060';
    if (difficulty === 'gold') return '#8b6914';
    if (difficulty === 'roseGold') return '#c08081'; 
    if (difficulty === 'platinum') return '#707070';
    if (isGem) {
      // For gems, use darker gem colors
      if (difficulty === 'sapphire') return '#0a3d7a';
      if (difficulty === 'emerald') return '#004d00';
      if (difficulty === 'ruby') return '#5a0000';
    }
    if (isDiamond) return '#008ba3';
    if (isQuantum) return '#6a0dad'; // Purple for quantum
    return '#1a1a1a';
  };

  // Get glow color for gems and diamond
  const getGlowColor = (): string => {
    if (difficulty === 'sapphire') return 'rgba(15, 82, 186, 0.8)';
    if (difficulty === 'emerald') return 'rgba(0, 200, 120, 0.8)';
    if (difficulty === 'ruby') return 'rgba(220, 20, 60, 0.8)';
    if (isDiamond) return 'rgba(0, 188, 212, 0.9)';
    if (isQuantum) return 'rgba(138, 43, 226, 0.9)'; // Purple glow
    return 'transparent';
  };
  
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        margin: '0 auto',
        overflow: 'visible',
        filter: (isGem || isDiamond || isQuantum) 
          ? `drop-shadow(0 0 ${size * 0.1}px ${getGlowColor()})`
          : 'none'
      }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox={`${-padding} ${-padding} ${viewBoxSize} ${viewBoxSize}`}
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0,
          overflow: 'visible'
        }}
      >
        <defs>
          {/* Gradients for different difficulties */}
          {difficulty === 'copper' && (
            <>
              <linearGradient id="copperGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b4513" stopOpacity="1" />
                <stop offset="30%" stopColor="#a0522d" stopOpacity="1" />
                <stop offset="50%" stopColor="#b87333" stopOpacity="1" />
                <stop offset="70%" stopColor="#a0522d" stopOpacity="1" />
                <stop offset="100%" stopColor="#8b4513" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="copperShine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#daa520" stopOpacity="0.2" />
                <stop offset="50%" stopColor="transparent" stopOpacity="0" />
                <stop offset="100%" stopColor="#b87333" stopOpacity="0.2" />
              </linearGradient>
            </>
          )}
          {difficulty === 'silver' && (
            <>
              <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a0a0a0" stopOpacity="1" />
                <stop offset="25%" stopColor="#c0c0c0" stopOpacity="1" />
                <stop offset="50%" stopColor="#d3d3d3" stopOpacity="1" />
                <stop offset="75%" stopColor="#e0e0e0" stopOpacity="1" />
                <stop offset="100%" stopColor="#a0a0a0" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="silverShine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                <stop offset="50%" stopColor="transparent" stopOpacity="0" />
                <stop offset="100%" stopColor="#e8e8e8" stopOpacity="0.3" />
              </linearGradient>
            </>
          )}
          {difficulty === 'gold' && (
            <>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#daa520" stopOpacity="1" />
                <stop offset="25%" stopColor="#ffd700" stopOpacity="1" />
                <stop offset="50%" stopColor="#ffed4e" stopOpacity="1" />
                <stop offset="75%" stopColor="#ffd700" stopOpacity="1" />
                <stop offset="100%" stopColor="#daa520" stopOpacity="1" />
              </linearGradient>
            </>
          )}
          {difficulty === 'roseGold' && (
            <>
              <linearGradient id="roseGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e8b4b8" stopOpacity="1" />
                <stop offset="25%" stopColor="#f4c2c2" stopOpacity="1" />
                <stop offset="50%" stopColor="#ffb6c1" stopOpacity="1" />
                <stop offset="75%" stopColor="#ffc0cb" stopOpacity="1" />
                <stop offset="100%" stopColor="#ffd1dc" stopOpacity="1" />
              </linearGradient>
            </>
          )}
          {difficulty === 'platinum' && (
            <>
              <linearGradient id="platinumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d0d0d0" stopOpacity="1" />
                <stop offset="20%" stopColor="#e5e4e2" stopOpacity="1" />
                <stop offset="40%" stopColor="#f5f5f5" stopOpacity="1" />
                <stop offset="60%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="80%" stopColor="#f5f5f5" stopOpacity="1" />
                <stop offset="100%" stopColor="#d0d0d0" stopOpacity="1" />
              </linearGradient>
            </>
          )}
          {isGem && (
            <>
              <linearGradient id={`gemGradient-${difficulty}`} x1="0%" y1="0%" x2="100%" y2="100%">
                {difficulty === 'sapphire' && (
                  <>
                    <stop offset="0%" stopColor="#0a3d7a" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#0f52ba" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#1e5fb8" stopOpacity="0.6" />
                  </>
                )}
                {difficulty === 'emerald' && (
                  <>
                    <stop offset="0%" stopColor="#006400" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#00a86b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#00c957" stopOpacity="0.6" />
                  </>
                )}
                {difficulty === 'ruby' && (
                  <>
                    <stop offset="0%" stopColor="#8b0000" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#c41e3a" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#dc143c" stopOpacity="0.6" />
                  </>
                )}
              </linearGradient>
            </>
          )}
          {isDiamond && (
            <>
              <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#008ba3" stopOpacity="0.7" />
                <stop offset="25%" stopColor="#00acc1" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#b9f2ff" stopOpacity="0.6" />
                <stop offset="75%" stopColor="#00acc1" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#008ba3" stopOpacity="0.7" />
              </linearGradient>
            </>
          )}
          {isQuantum && (
            <>
              {/* Quantum gradient - blues, purples, orange-yellow, pink/magenta */}
              <linearGradient id="quantumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6a0dad" stopOpacity="0.8" />
                <stop offset="20%" stopColor="#4b0082" stopOpacity="0.7" />
                <stop offset="40%" stopColor="#0064c8" stopOpacity="0.6" />
                <stop offset="60%" stopColor="#8a2be2" stopOpacity="0.7" />
                <stop offset="80%" stopColor="#ff8c00" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ff1493" stopOpacity="0.8" />
              </linearGradient>
            </>
          )}
        </defs>

        {/* Group with rotation transform if needed - ALL content must be inside for proper rotation */}
        <g transform={rotation ? `rotate(${rotation} ${centerX} ${centerY})` : undefined}>
          {/* Background fill - use facets if available, otherwise use hull */}
          {difficulty === 'plastic' && diceData.facets && (
            <>
              {diceData.facets.map((facet, facetIdx) => {
                const facetPoints = facet.points
                  .map(id => pixelVertices[id])
                  .filter(Boolean)
                  .map(p => `${p.x},${p.y}`)
                  .join(' ');
                
                if (!facetPoints) return null;

                let fillColor = '#f5f5f5';

                if (diceType === 'D4') {
                  // Lighter, softer D4 for unselected state
                  const isLeft = facetIdx === 0;
                  fillColor = isLeft ? '#f7f7f7' : '#ffffff';
                } else if (diceType === 'D6') {
                  // Simple 3-face shading for plastic D6:
                  // facetIdx 0: top (lightest), 1: left (darkest), 2: right (mid)
                  if (facetIdx === 0) fillColor = '#fafafa';      // Top
                  else if (facetIdx === 1) fillColor = '#d6d6d6'; // Left
                  else if (facetIdx === 2) fillColor = '#e6e6e6'; // Right
                }

                return (
                  <polygon
                    key={facetIdx}
                    points={facetPoints}
                    fill={fillColor}
                    opacity={0.95}
                  />
                );
              })}
            </>
          )}
          {difficulty !== 'plastic' && hullPath && (
            <>
            {/* Use facets if available for multi-colored rendering */}
            {diceData.facets && (isGem || difficulty === 'copper' || difficulty === 'silver' || difficulty === 'gold' || difficulty === 'roseGold' || difficulty === 'platinum' || isDiamond || isQuantum) ? (
              diceData.facets.map((facet, facetIdx) => {
                const facetPoints = facet.points
                  .map(id => pixelVertices[id])
                  .filter(Boolean)
                  .map(p => `${p.x},${p.y}`)
                  .join(' ');
                
                if (!facetPoints) return null;
                
                // Different color/shade for each facet based on difficulty (reversed shadow direction)
                let facetColor: string;
                const numFacets = diceData.facets?.length || 1;
                const reverseIdx = numFacets - 1 - facetIdx; // Reverse the index for shadow reversal
                
                if (isGem) {
                  // Rotate colors clockwise by 1 position
                  const rotatedIdx = (reverseIdx + 1) % numFacets;
                  // Create animated color that cycles through shades
                  const baseColor = difficulty === 'sapphire' 
                    ? { r: 15, g: 82, b: 186 }
                    : difficulty === 'emerald'
                    ? { r: 0, g: 168, b: 107 }
                    : { r: 220, g: 20, b: 60 };
                  
                  // Calculate color variation for this facet
                  const r = difficulty === 'sapphire' 
                    ? baseColor.r + rotatedIdx * 20
                    : difficulty === 'emerald'
                    ? baseColor.r + rotatedIdx * 10
                    : baseColor.r - rotatedIdx * 15;
                  const g = difficulty === 'sapphire'
                    ? baseColor.g + rotatedIdx * 15
                    : difficulty === 'emerald'
                    ? baseColor.g + rotatedIdx * 20
                    : baseColor.g + rotatedIdx * 10;
                  const b = difficulty === 'sapphire'
                    ? baseColor.b + rotatedIdx * 10
                    : difficulty === 'emerald'
                    ? baseColor.b + rotatedIdx * 15
                    : baseColor.b + rotatedIdx * 20;
                  
                  facetColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
                } else if (isDiamond) {
                  // Diamond facets with varying cyan/blue shades
                  // Make top areas (0, 1) and middle bottom (4) even lighter
                  const isTopArea = facetIdx === 0 || facetIdx === 1;
                  const isMiddleBottom = facetIdx === 4;
                  const isLighter = isTopArea || isMiddleBottom;
                  
                  // Make all facets even lighter overall
                  const baseR = 0 + reverseIdx * 4;
                  const baseG = isLighter ? 240 - reverseIdx * 4 : 220 - reverseIdx * 6;
                  const baseB = isLighter ? 255 - reverseIdx * 2 : 240 - reverseIdx * 4;
                  const opacity = isLighter ? 1.0 : 0.95;
                  facetColor = `rgba(${baseR}, ${baseG}, ${baseB}, ${opacity})`;
                } else if (isQuantum) {
                  // Quantum facets with blues, purples, orange-yellow, pink/magenta
                  // Create a rotating color scheme across facets
                  const colorCycle = [
                    { r: 106, g: 13, b: 173 },  // Deep purple
                    { r: 75, g: 0, b: 130 },    // Indigo
                    { r: 0, g: 100, b: 200 },   // Deep blue
                    { r: 138, g: 43, b: 226 },  // Blue violet
                    { r: 255, g: 140, b: 0 },   // Orange-yellow highlight
                    { r: 255, g: 20, b: 147 },  // Pink/magenta
                    { r: 186, g: 85, b: 211 },  // Medium orchid
                    { r: 72, g: 61, b: 139 },   // Dark slate blue
                    { r: 123, g: 104, b: 238 }, // Medium slate blue
                    { r: 255, g: 165, b: 0 }    // Orange highlight
                  ];
                  const colorIdx = facetIdx % colorCycle.length;
                  const color = colorCycle[colorIdx];
                  // Vary brightness slightly
                  const brightness = 0.8 + (reverseIdx % 3) * 0.1;
                  facetColor = `rgba(${Math.floor(color.r * brightness)}, ${Math.floor(color.g * brightness)}, ${Math.floor(color.b * brightness)}, 0.9)`;
                } else if (difficulty === 'copper') {
                  // Varying shades of copper/bronze 
                  // Make the 2 sides (indices 2 and 3) darker
                  const isSide = facetIdx === 2 || facetIdx === 3;
                  const baseR = isSide ? 150 + reverseIdx * 6 : 180 + reverseIdx * 8;  // More red for orange
                  const baseG = isSide ? 70 + reverseIdx * 3 : 90 + reverseIdx * 4;   // More green for orange
                  const baseB = isSide ? 20 + reverseIdx * 1 : 30 + reverseIdx * 2;   // Less blue
                  facetColor = `rgba(${baseR}, ${baseG}, ${baseB}, 0.9)`;
                } else if (difficulty === 'silver') {
                  // Varying shades of silver/gray 
                  const base = 160 + reverseIdx * 15;
                  facetColor = `rgba(${base}, ${base}, ${base}, 0.9)`;
                } else if (difficulty === 'gold') {
                  // Varying shades of gold (reversed)
                  const baseR = 218 + reverseIdx * 8;
                  const baseG = 165 + reverseIdx * 5;
                  const baseB = 32 + reverseIdx * 3;
                  facetColor = `rgba(${baseR}, ${baseG}, ${baseB}, 0.9)`;
                } else if (difficulty === 'roseGold') {
                  // Varying shades of rose gold/pink 
                  const baseR = 232 + reverseIdx * 6;  // Pink/rose tones
                  const baseG = 180 + reverseIdx * 5;
                  const baseB = 184 + reverseIdx * 4;
                  facetColor = `rgba(${baseR}, ${baseG}, ${baseB}, 0.9)`;
                } else if (difficulty === 'platinum') {
                  // Varying shades of platinum/white 
                  const base = 220 + reverseIdx * 8;
                  facetColor = `rgba(${base}, ${base}, ${base}, 0.9)`;
                } else {
                  facetColor = '#ccc';
                }
                
                return (
                  <polygon
                    key={facetIdx}
                    points={facetPoints}
                    fill={facetColor}
                    opacity={0.9}
                  />
                );
              })
            ) : (
                <polygon
                  points={hullPath}
                  fill={
                    difficulty === 'copper' ? 'url(#copperGradient)' :
                    difficulty === 'silver' ? 'url(#silverGradient)' :
                    difficulty === 'gold' ? 'url(#goldGradient)' :
                    difficulty === 'roseGold' ? 'url(#roseGoldGradient)' :
                    difficulty === 'platinum' ? 'url(#platinumGradient)' :
                    isGem ? `url(#gemGradient-${difficulty})` :
                    isDiamond ? 'url(#diamondGradient)' :
                    'transparent'
                  }
                  opacity={1}
                />
              )}
            </>
          )}

          {/* Draw all edges with effects */}
          {diceData.edges.map((edge, idx) => {
            const start = pixelVertices[edge.from];
            const end = pixelVertices[edge.to];
            if (!start || !end) return null;

            const edgeColor = getEdgeColor(edge, idx);
            const isThick = edge.type === "thick";
            const isDashed = edgeStyle === 'dashed';
            
            return (
              <g key={idx}>
                {/* Base edge */}
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={edgeColor}
                  strokeWidth={isThick ? thickWidth : thinWidth}
                  strokeDasharray={isDashed ? (isThick ? '6,4' : '3,3') : undefined}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={difficulty === 'plastic' ? 1 : 0.9}
                />
              </g>
            );
          })}
          
          {/* 4D Wireframe layers for Quantum - behind layers with varied rotation */}
          {isQuantum && diceData.edges && (
            <>
              {/* First behind layer - purple, varied speeds */}
              <g transform={`translate(${centerX}, ${centerY})`}>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values={`0 0 0;360 0 0`}
                  dur="11.5s"
                  repeatCount="indefinite"
                  additive="sum"
                />
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values={`0 0 0;360 0 0`}
                    dur="8.2s"
                    repeatCount="indefinite"
                    additive="sum"
                  />
                  <g>
                    <g>
                      <animateTransform
                        attributeName="transform"
                        type="scale"
                        values="1 1;0.05 1;1 1;1 0.05;1 1"
                        dur="9.3s"
                        repeatCount="indefinite"
                      />
                      {diceData.edges.map((edge, idx) => {
                        const start = pixelVertices[edge.from];
                        const end = pixelVertices[edge.to];
                        if (!start || !end) return null;
                        
                        const offsetX = start.x - centerX;
                        const offsetY = start.y - centerY;
                        const offsetX2 = end.x - centerX;
                        const offsetY2 = end.y - centerY;
                        
                        return (
                          <line
                            key={`4d-behind-1-${idx}`}
                            x1={offsetX}
                            y1={offsetY}
                            x2={offsetX2}
                            y2={offsetY2}
                            stroke="rgba(138,43,226,0.5)"
                            strokeWidth={edge.type === "thick" ? thickWidth * 0.5 : thinWidth * 0.5}
                            strokeLinecap="round"
                            opacity={0.6}
                          />
                        );
                      })}
                    </g>
                  </g>
                </g>
              </g>
              
            </>
          )}
        </g>
        
        {/* 4D Wireframe layers for Quantum - front layers (render after main edges) with varied parameters */}
        {isQuantum && diceData.edges && (
          <>
            {/* First front layer - orange, varied speeds */}
            <g transform={`translate(${centerX}, ${centerY})`}>
              <animateTransform
                attributeName="transform"
                type="rotate"
                values={`0 0 0;360 0 0`}
                dur="10.4s"
                repeatCount="indefinite"
                additive="sum"
              />
              <g>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values={`0 0 0;-360 0 0`}
                  dur="7.1s"
                  repeatCount="indefinite"
                  additive="sum"
                />
                <g>
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="scale"
                      values="1 1;1 0.05;1 1;0.05 1;1 1"
                      dur="8.7s"
                      repeatCount="indefinite"
                    />
                    {diceData.edges.map((edge, idx) => {
                      const start = pixelVertices[edge.from];
                      const end = pixelVertices[edge.to];
                      if (!start || !end) return null;
                      
                      const offsetX = start.x - centerX;
                      const offsetY = start.y - centerY;
                      const offsetX2 = end.x - centerX;
                      const offsetY2 = end.y - centerY;
                      
                      return (
                        <line
                          key={`4d-front-1-${idx}`}
                          x1={offsetX}
                          y1={offsetY}
                          x2={offsetX2}
                          y2={offsetY2}
                          stroke="rgba(255,140,0,0.5)"
                          strokeWidth={edge.type === "thick" ? thickWidth * 0.5 : thinWidth * 0.5}
                          strokeLinecap="round"
                          opacity={0.6}
                        />
                      );
                    })}
                  </g>
                </g>
              </g>
            </g>
            
            {/* Second front layer - pink, simple rotation only (opposite direction), smaller size */}
            <g transform={`translate(${centerX}, ${centerY})`}>
              <g transform="scale(0.7)">
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values={`0 0 0;-360 0 0`}
                    dur="10s"
                    repeatCount="indefinite"
                  />
                  {diceData.edges.map((edge, idx) => {
                    const start = pixelVertices[edge.from];
                    const end = pixelVertices[edge.to];
                    if (!start || !end) return null;
                    
                    const offsetX = start.x - centerX;
                    const offsetY = start.y - centerY;
                    const offsetX2 = end.x - centerX;
                    const offsetY2 = end.y - centerY;
                    
                    return (
                      <line
                        key={`4d-front-2-${idx}`}
                        x1={offsetX}
                        y1={offsetY}
                        x2={offsetX2}
                        y2={offsetY2}
                        stroke="rgba(255,20,147,0.5)"
                        strokeWidth={edge.type === "thick" ? thickWidth * 0.55 : thinWidth * 0.55}
                        strokeLinecap="round"
                        opacity={0.6}
                      />
                    );
                  })}
                </g>
              </g>
            </g>
            
            {/* Third front layer - purple, simple rotation only (opposite direction from pink), slightly bigger */}
            <g transform={`translate(${centerX}, ${centerY})`}>
              <g transform="scale(0.85)">
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values={`0 0 0;360 0 0`}
                    dur="11s"
                    repeatCount="indefinite"
                  />
                  {diceData.edges.map((edge, idx) => {
                    const start = pixelVertices[edge.from];
                    const end = pixelVertices[edge.to];
                    if (!start || !end) return null;
                    
                    const offsetX = start.x - centerX;
                    const offsetY = start.y - centerY;
                    const offsetX2 = end.x - centerX;
                    const offsetY2 = end.y - centerY;
                    
                    return (
                      <line
                        key={`4d-front-3-${idx}`}
                        x1={offsetX}
                        y1={offsetY}
                        x2={offsetX2}
                        y2={offsetY2}
                        stroke="rgba(138,43,226,0.5)"
                        strokeWidth={edge.type === "thick" ? thickWidth * 0.55 : thinWidth * 0.55}
                        strokeLinecap="round"
                        opacity={0.6}
                      />
                    );
                  })}
                </g>
              </g>
            </g>
          </>
        )}
      </svg>

      {/* CSS animations */}
      <style>{`
        @keyframes shimmer {
          0%, 100% {
            opacity: 0.2;
            transform: translateX(-100%);
          }
          50% {
            opacity: 0.6;
            transform: translateX(100%);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
