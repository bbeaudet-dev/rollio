import React from 'react';
import { DifficultyLevel } from '../../../game/logic/difficulty';

interface DiceDisplayProps {
  difficulty: DifficultyLevel;
  size?: number;
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

interface DiceData {
  vertices: Vertex[];
  edges: Edge[];
  rotation?: number; // Optional rotation in degrees (clockwise)
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
    ]
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
    ]
  }
};

/**
 * Determines which dice shape to display based on difficulty level
 */
const getDiceType = (difficulty: DifficultyLevel): keyof typeof DICE_DATA => {
  if (difficulty === 'plastic') return 'D4';
  if (difficulty === 'copper' || difficulty === 'silver') return 'D8';
  if (difficulty === 'gold' || difficulty === 'platinum') return 'D10';
  if (difficulty === 'sapphire' || difficulty === 'emerald' || difficulty === 'ruby') return 'D12';
  if (difficulty === 'diamond') return 'D20';
  return 'D4'; // Default to D4
};

/**
 * Renders a wireframe dice display based on 2D coordinates
 */
export const DifficultyDiceDisplay: React.FC<DiceDisplayProps> = ({ difficulty, size = 60 }) => {
  const diceType = getDiceType(difficulty);
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
  
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        margin: '0 auto',
        overflow: 'visible'
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
        {/* Group with rotation transform if needed */}
        <g transform={rotation ? `rotate(${rotation} ${centerX} ${centerY})` : undefined}>
          {/* Draw all edges - thick edges are 3px, thin edges are 1px */}
          {diceData.edges.map((edge, idx) => {
            const start = pixelVertices[edge.from];
            const end = pixelVertices[edge.to];
            if (!start || !end) return null;
            
            return (
              <line
                key={idx}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="black"
                strokeWidth={edge.type === "thick" ? thickWidth : thinWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};
