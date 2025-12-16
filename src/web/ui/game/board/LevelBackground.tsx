import React, { useEffect, useState } from 'react';
import { isMinibossLevel, isMainBossLevel } from '../../../../game/data/worlds';

interface LevelBackgroundProps {
  levelNumber: number;
  backgroundColor: string;
  borderColor: string;
  children: React.ReactNode;
}

/**
 * LevelBackground
 * Wraps the board content and renders animated overlays for miniboss / boss levels.
 * Creates dynamic patterns with different shapes across the whole board.
 */
export const LevelBackground: React.FC<LevelBackgroundProps> = ({
  levelNumber,
  backgroundColor,
  borderColor,
  children,
}) => {
  const isMiniboss = isMinibossLevel(levelNumber);
  const isBoss = isMainBossLevel(levelNumber);

  // Phase values for different animation speeds
  const [phase1, setPhase1] = useState(0);
  const [phase2, setPhase2] = useState(0);
  const [phase3, setPhase3] = useState(0);

  useEffect(() => {
    let frame1 = 0;
    let frame2 = 0;
    let frame3 = 0;
    
    const intervalId = window.setInterval(() => {
      frame1 += 1;
      frame2 += 1.3;
      frame3 += 0.7;
      setPhase1(frame1);
      setPhase2(frame2);
      setPhase3(frame3);
    }, 100); // 10 updates per second

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  // Generate multiple animated shapes/patterns
  const generatePatterns = () => {
    if (!isMiniboss && !isBoss) return null;

    const patterns: React.ReactElement[] = [];
    const intensity = isBoss ? 1.0 : 0.6;
    
    // Pattern 1: Large rotating circles
    for (let i = 0; i < (isBoss ? 4 : 2); i++) {
      const angle1 = ((phase1 + i * 90) % 360) * (Math.PI / 180);
      const angle2 = ((phase2 + i * 60) % 360) * (Math.PI / 180);
      const x = 20 + (i % 2) * 60 + 15 * Math.sin(angle1);
      const y = 20 + Math.floor(i / 2) * 50 + 10 * Math.cos(angle2);
      const size = (isBoss ? 120 : 80) + 20 * Math.sin(angle1 * 2);
      
      patterns.push(
        <div
          key={`circle-${i}`}
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(255, 255, 255, ${0.15 * intensity}), rgba(255, 255, 255, 0) 70%)`,
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            transform: `rotate(${angle1 * (180 / Math.PI)}deg)`,
            transition: 'transform 0.3s ease, opacity 0.3s ease',
          }}
        />
      );
    }

    // Pattern 2: Moving geometric shapes (triangles, squares)
    for (let i = 0; i < (isBoss ? 6 : 3); i++) {
      const angle = ((phase2 + i * 45) % 360) * (Math.PI / 180);
      const x = 10 + (i % 3) * 40 + 25 * Math.sin(angle);
      const y = 30 + Math.floor(i / 3) * 40 + 20 * Math.cos(angle * 1.2);
      const rotation = (phase1 + i * 30) % 360;
      const size = (isBoss ? 60 : 40) + 15 * Math.sin(angle * 1.5);
      const isTriangle = i % 2 === 0;
      
      patterns.push(
        <div
          key={`shape-${i}`}
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            width: `${size}px`,
            height: `${size}px`,
            background: isTriangle
              ? `linear-gradient(135deg, rgba(255, 200, 100, ${0.2 * intensity}), rgba(255, 150, 50, ${0.1 * intensity}))`
              : `linear-gradient(45deg, rgba(200, 150, 255, ${0.2 * intensity}), rgba(150, 100, 255, ${0.1 * intensity}))`,
            clipPath: isTriangle ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            transform: `rotate(${rotation}deg)`,
            opacity: 0.6 + 0.4 * Math.sin(angle),
            transition: 'transform 0.4s ease, opacity 0.4s ease',
          }}
        />
      );
    }

    // Pattern 3: Flowing lines/waves
    for (let i = 0; i < (isBoss ? 5 : 3); i++) {
      const angle = ((phase3 + i * 72) % 360) * (Math.PI / 180);
      const offset = 20 * Math.sin(angle);
      const width = isBoss ? 200 : 150;
      const height = 4;
      
      patterns.push(
        <div
          key={`line-${i}`}
          style={{
            position: 'absolute',
            left: `${10 + i * 20}%`,
            top: `${30 + offset}%`,
            width: `${width}px`,
            height: `${height}px`,
            background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, ${0.3 * intensity}), transparent)`,
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            transform: `rotate(${15 + i * 10}deg)`,
            opacity: 0.5 + 0.5 * Math.sin(angle * 2),
            transition: 'transform 0.5s ease, opacity 0.5s ease',
          }}
        />
      );
    }

    // Pattern 4: Pulsing hexagons (boss only)
    if (isBoss) {
      for (let i = 0; i < 3; i++) {
        const angle = ((phase1 + i * 120) % 360) * (Math.PI / 180);
        const x = 25 + i * 25 + 10 * Math.sin(angle);
        const y = 60 + 15 * Math.cos(angle * 0.8);
        const size = 50 + 20 * Math.sin(angle * 3);
        
        patterns.push(
          <div
            key={`hex-${i}`}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: `${size}px`,
              height: `${size}px`,
              background: `radial-gradient(circle, rgba(255, 100, 100, ${0.25}), rgba(255, 50, 50, 0) 80%)`,
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
              mixBlendMode: 'screen',
              pointerEvents: 'none',
              transform: `rotate(${angle * (180 / Math.PI)}deg)`,
              opacity: 0.4 + 0.6 * Math.sin(angle * 2),
              transition: 'transform 0.4s ease, opacity 0.4s ease',
            }}
          />
        );
      }
    }

    return patterns;
  };

  return (
    <div
      style={{
        backgroundColor,
        border: `3px solid ${borderColor}`,
        borderTop: 'none',
        borderTopLeftRadius: '0',
        borderTopRightRadius: '0',
        borderBottomLeftRadius: '0',
        borderBottomRightRadius: '0',
        padding: '10px',
        minHeight: '400px',
        height: '500px',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {(isMiniboss || isBoss) && (
        <>
          {/* Animated pattern overlays */}
          {generatePatterns()}
          
          {/* Subtle vignette for depth */}
          <div
            style={{
              position: 'absolute',
              inset: isBoss ? -50 : -30,
              background: isBoss
                ? 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0, 0, 0, 0.4) 100%)'
                : 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.25) 100%)',
              mixBlendMode: 'multiply',
              pointerEvents: 'none',
              opacity: isBoss ? 0.8 : 0.6,
            }}
          />
        </>
      )}

      {/* Actual board content */}
      {children}
    </div>
  );
};
