import React from 'react';
import { DifficultyLevel } from '../../../game/logic/difficulty';
import { DIFFICULTY_COLORS } from '../../utils/colors';

interface D20DisplayProps {
  difficulty: DifficultyLevel;
  size?: number;
}

type DiceType = 'd3' | 'd6' | 'd12' | 'd20';

/**
 * Determines which dice shape to display based on difficulty level
 */
const getDiceType = (difficulty: DifficultyLevel): DiceType => {
  if (difficulty === 'plastic' || difficulty === 'copper') return 'd3';
  if (difficulty === 'silver' || difficulty === 'gold' || difficulty === 'platinum') return 'd6';
  if (difficulty === 'sapphire' || difficulty === 'emerald' || difficulty === 'ruby') return 'd12';
  return 'd20'; // diamond
};

/**
 * Renders a stylized dice display for difficulty selection
 * Shows different dice shapes based on difficulty matching wireframe polyhedra:
 * - d3 (D4 tetrahedron) for plastic/copper - triangle face
 * - d6 (D8 octahedron) for silver/gold/platinum - square face  
 * - d12 (D12 dodecahedron) for sapphire/emerald/ruby - pentagon face
 * - d20 (D20 icosahedron) for diamond - hexagon face
 */
export const D20Display: React.FC<D20DisplayProps> = ({ difficulty, size = 60 }) => {
  const colors = DIFFICULTY_COLORS[difficulty];
  const diceType = getDiceType(difficulty);
  const isGem = difficulty === 'sapphire' || difficulty === 'emerald' || difficulty === 'ruby' || difficulty === 'diamond';
  const isDiamond = difficulty === 'diamond';

  // Get glow colors for gem difficulties
  const getGlowColor = (opacity: number = 0.8) => {
    if (isDiamond) return `rgba(0, 188, 212, ${opacity})`;
    if (difficulty === 'ruby') return `rgba(220, 20, 60, ${opacity})`;
    if (difficulty === 'sapphire') return `rgba(15, 82, 186, ${opacity})`;
    if (difficulty === 'emerald') return `rgba(80, 200, 120, ${opacity})`;
    return 'transparent';
  };

  const glowColor = getGlowColor(0.8);
  const glowColor60 = getGlowColor(0.6);
  const glowColor40 = getGlowColor(0.4);
  const glowColor80 = getGlowColor(0.8);
  
  const outerBorderWidth = 3; // Thicker outer border
  const innerLineWidth = 1; // Thinner internal lines

  // Render D4 (Tetrahedron) - Triangle face with wireframe lines
  const renderD3 = () => {
    const centerX = size / 2;
    const topX = centerX;
    const topY = size * 0.1;
    const bottomLeftX = size * 0.1;
    const bottomLeftY = size * 0.9;
    const bottomRightX = size * 0.9;
    const bottomRightY = size * 0.9;
    
    // Midpoints of each side
    const midLeftX = (topX + bottomLeftX) / 2;
    const midLeftY = (topY + bottomLeftY) / 2;
    const midRightX = (topX + bottomRightX) / 2;
    const midRightY = (topY + bottomRightY) / 2;
    const midBottomX = (bottomLeftX + bottomRightX) / 2;
    const midBottomY = (bottomLeftY + bottomRightY) / 2;

    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: 'relative',
          margin: '0 auto',
          filter: isDiamond ? `drop-shadow(0 0 ${size * 0.3}px ${glowColor})` : isGem ? `drop-shadow(0 0 ${size * 0.15}px ${glowColor})` : 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.3))'
        }}
      >
        <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Outer triangle border */}
          <polygon
            points={`${topX},${topY} ${bottomLeftX},${bottomLeftY} ${bottomRightX},${bottomRightY}`}
            fill={colors.background}
            stroke={colors.border}
            strokeWidth={outerBorderWidth}
          />
          {/* Internal wireframe lines: from each midpoint to opposite vertex */}
          <line
            x1={midLeftX}
            y1={midLeftY}
            x2={bottomRightX}
            y2={bottomRightY}
            stroke={colors.border}
            strokeWidth={innerLineWidth}
            opacity={0.6}
          />
          <line
            x1={midRightX}
            y1={midRightY}
            x2={bottomLeftX}
            y2={bottomLeftY}
            stroke={colors.border}
            strokeWidth={innerLineWidth}
            opacity={0.6}
          />
          <line
            x1={midBottomX}
            y1={midBottomY}
            x2={topX}
            y2={topY}
            stroke={colors.border}
            strokeWidth={innerLineWidth}
            opacity={0.6}
          />
        </svg>
        {/* Shine effect for gems */}
        {isGem && !isDiamond && (
          <div
            style={{
              position: 'absolute',
              top: '10%',
              left: '30%',
              width: '40%',
              height: '30%',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5), transparent)',
              clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
              pointerEvents: 'none',
              zIndex: 3,
              animation: 'gentleShine 3s ease-in-out infinite'
            }}
          />
        )}
      </div>
    );
  };

  // Render D8 (Octahedron) - Square face with wireframe lines
  const renderD6 = () => {
    const padding = size * 0.1;
    const squareSize = size - (padding * 2);
    const centerX = size / 2;
    const centerY = size / 2;
    const halfSize = squareSize / 2;
    
    const topX = centerX;
    const topY = padding;
    const bottomX = centerX;
    const bottomY = size - padding;
    const leftX = padding;
    const leftY = centerY;
    const rightX = size - padding;
    const rightY = centerY;

    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: 'relative',
          margin: '0 auto',
          filter: isDiamond ? `drop-shadow(0 0 ${size * 0.3}px ${glowColor})` : isGem ? `drop-shadow(0 0 ${size * 0.15}px ${glowColor})` : 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.3))'
        }}
      >
        <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Outer square border */}
          <rect
            x={padding}
            y={padding}
            width={squareSize}
            height={squareSize}
            fill={colors.background}
            stroke={colors.border}
            strokeWidth={outerBorderWidth}
            rx="8"
          />
          {/* Internal wireframe: two triangles (top and bottom) with horizontal line */}
          {/* Top triangle */}
          <line
            x1={topX}
            y1={topY}
            x2={leftX}
            y2={leftY}
            stroke={colors.border}
            strokeWidth={innerLineWidth}
            opacity={0.6}
          />
          <line
            x1={topX}
            y1={topY}
            x2={rightX}
            y2={rightY}
            stroke={colors.border}
            strokeWidth={innerLineWidth}
            opacity={0.6}
          />
          {/* Horizontal line */}
          <line
            x1={leftX}
            y1={leftY}
            x2={rightX}
            y2={rightY}
            stroke={colors.border}
            strokeWidth={innerLineWidth}
            opacity={0.6}
          />
          {/* Bottom triangle */}
          <line
            x1={bottomX}
            y1={bottomY}
            x2={leftX}
            y2={leftY}
            stroke={colors.border}
            strokeWidth={innerLineWidth}
            opacity={0.6}
          />
          <line
            x1={bottomX}
            y1={bottomY}
            x2={rightX}
            y2={rightY}
            stroke={colors.border}
            strokeWidth={innerLineWidth}
            opacity={0.6}
          />
        </svg>
        {/* Shine effect for gems */}
        {isGem && !isDiamond && (
          <div
            style={{
              position: 'absolute',
              top: '15%',
              left: '15%',
              width: '40%',
              height: '40%',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5), transparent)',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 3,
              animation: 'gentleShine 3s ease-in-out infinite'
            }}
          />
        )}
      </div>
    );
  };

  // Render D12 (Dodecahedron) - Pentagon face with wireframe star pattern
  const renderD12 = () => {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;
    const numSides = 5;
    
    // Calculate pentagon vertices
    const vertices: Array<{x: number, y: number}> = [];
    for (let i = 0; i < numSides; i++) {
      const angle = (i * 2 * Math.PI / numSides) - Math.PI / 2; // Start from top
      vertices.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      });
    }
    
    const points = vertices.map(v => `${v.x},${v.y}`).join(' ');

    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: 'relative',
          margin: '0 auto',
          filter: isGem ? `drop-shadow(0 0 ${size * 0.4}px ${glowColor})` : 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.3))'
        }}
      >
        <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Outer pentagon border */}
          <polygon
            points={points}
            fill={colors.background}
            stroke={colors.border}
            strokeWidth={outerBorderWidth}
          />
          {/* Internal wireframe: star pattern - lines from center to vertices and connecting opposite vertices */}
          {vertices.map((vertex, i) => (
            <line
              key={`center-${i}`}
              x1={centerX}
              y1={centerY}
              x2={vertex.x}
              y2={vertex.y}
              stroke={colors.border}
              strokeWidth={innerLineWidth}
              opacity={0.6}
            />
          ))}
          {vertices.map((vertex, i) => {
            const oppositeIndex = (i + 2) % numSides;
            const opposite = vertices[oppositeIndex];
            return (
              <line
                key={`opposite-${i}`}
                x1={vertex.x}
                y1={vertex.y}
                x2={opposite.x}
                y2={opposite.y}
                stroke={colors.border}
                strokeWidth={innerLineWidth}
                opacity={0.6}
              />
            );
          })}
        </svg>
        {/* Enhanced shine effect for ruby/sapphire/emerald */}
        {isGem && !isDiamond && (
          <>
            <div
              style={{
                position: 'absolute',
                top: '10%',
                left: '35%',
                width: '30%',
                height: '30%',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6), transparent)',
                clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                pointerEvents: 'none',
                zIndex: 3,
                animation: 'gentleShine 3s ease-in-out infinite'
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '60%',
                height: '60%',
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle, ${getGlowColor(0.15)}, transparent 60%)`,
                pointerEvents: 'none',
                zIndex: 1,
                clipPath: `polygon(${points})`
              }}
            />
          </>
        )}
      </div>
    );
  };

  // Render D20 (Icosahedron) - Hexagon face with wireframe star pattern
  const renderD20 = () => {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;
    const numSides = 6;
    
    // Calculate hexagon vertices
    const vertices: Array<{x: number, y: number}> = [];
    for (let i = 0; i < numSides; i++) {
      const angle = (i * 2 * Math.PI / numSides) - Math.PI / 2; // Start from top
      vertices.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      });
    }
    
    const points = vertices.map(v => `${v.x},${v.y}`).join(' ');

    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: 'relative',
          margin: '0 auto',
          filter: isDiamond ? `drop-shadow(0 0 ${size * 0.5}px ${glowColor}) drop-shadow(0 0 ${size * 0.8}px ${glowColor60})` : 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.3))'
        }}
      >
        <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Outer hexagon border */}
          <polygon
            points={points}
            fill={colors.background}
            stroke={colors.border}
            strokeWidth={outerBorderWidth}
          />
          {/* Internal wireframe: star pattern - lines from center to vertices and connecting opposite vertices */}
          {vertices.map((vertex, i) => (
            <line
              key={`center-${i}`}
              x1={centerX}
              y1={centerY}
              x2={vertex.x}
              y2={vertex.y}
              stroke={colors.border}
              strokeWidth={innerLineWidth}
              opacity={0.6}
            />
          ))}
          {vertices.map((vertex, i) => {
            const oppositeIndex = (i + 3) % numSides;
            const opposite = vertices[oppositeIndex];
            return (
              <line
                key={`opposite-${i}`}
                x1={vertex.x}
                y1={vertex.y}
                x2={opposite.x}
                y2={opposite.y}
                stroke={colors.border}
                strokeWidth={innerLineWidth}
                opacity={0.6}
              />
            );
          })}
        </svg>
        {/* Diamond shimmer overlay */}
        {isDiamond && (
          <>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
                animation: 'shimmer 2s ease-in-out infinite',
                zIndex: 3,
                clipPath: `polygon(${points})`
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '90%',
                height: '90%',
                transform: 'translate(-50%, -50%)',
                background: `conic-gradient(from 0deg, transparent, ${glowColor40}, transparent, ${glowColor40}, transparent)`,
                pointerEvents: 'none',
                zIndex: 1,
                animation: 'rotateGlow 3s linear infinite',
                clipPath: `polygon(${points})`,
                borderRadius: '50%'
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '50%',
                height: '50%',
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle, ${glowColor60}, transparent 70%)`,
                pointerEvents: 'none',
                zIndex: 1,
                animation: 'pulseGlow 1.5s ease-in-out infinite',
                clipPath: `polygon(${points})`
              }}
            />
          </>
        )}
      </div>
    );
  };

  // Generate animation styles
  const getAnimationStyles = () => {
    if (!isGem) return null;
    
    const getColorWithOpacity = (opacity: number) => {
      if (isDiamond) return `rgba(0, 188, 212, ${opacity})`;
      if (difficulty === 'ruby') return `rgba(220, 20, 60, ${opacity})`;
      if (difficulty === 'sapphire') return `rgba(15, 82, 186, ${opacity})`;
      if (difficulty === 'emerald') return `rgba(80, 200, 120, ${opacity})`;
      return glowColor;
    };
    
    const glow60 = getColorWithOpacity(0.6);
    const glow40 = getColorWithOpacity(0.4);
    const glow80 = getColorWithOpacity(0.8);
    
    return (
      <style>{`
        @keyframes gentleShine {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
        @keyframes diamondPulse {
          0%, 100% {
            filter: drop-shadow(0 0 15px ${glowColor}) drop-shadow(0 0 30px ${glow80}) drop-shadow(0 0 50px ${glow40});
          }
          50% {
            filter: drop-shadow(0 0 25px ${glowColor}) drop-shadow(0 0 50px ${glowColor}) drop-shadow(0 0 80px ${glow60});
          }
        }
        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
        @keyframes rotateGlow {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.4;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.2);
          }
        }
      `}</style>
    );
  };

  return (
    <>
      {diceType === 'd3' && renderD3()}
      {diceType === 'd6' && renderD6()}
      {diceType === 'd12' && renderD12()}
      {diceType === 'd20' && renderD20()}
      {getAnimationStyles()}
    </>
  );
};
