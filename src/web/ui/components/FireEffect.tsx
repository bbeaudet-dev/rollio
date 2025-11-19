import React, { useState, useEffect } from 'react';

interface FireEffectProps {
  intensity: number; // 0-5 or higher, controls glow intensity
  style?: React.CSSProperties;
}

export const FireEffect: React.FC<FireEffectProps> = ({ intensity, style }) => {
  const [colorIndex, setColorIndex] = useState(0);

  const getColorPalette = (intensity: number): string[] => {
    if (intensity <= 1) {
      return ['#ff0000'];
    } else if (intensity <= 2) {
      return ['#ff0000', '#ffa500'];
    } else if (intensity <= 3) {
      return ['#ff0000', '#ffa500', '#ffff00'];
    } else if (intensity <= 4) {
      return ['#ff0000', '#ffa500', '#ffff00', '#0080ff'];
    } else if (intensity <= 5) {
      return ['#ff0000', '#ffa500', '#ffff00', '#0080ff', '#ffffff'];
    } else if (intensity <= 6) {
      return ['#ff0000', '#ffa500', '#ffff00', '#0080ff', '#ffffff', '#ff00ff'];
    } else if (intensity <= 7) {
      return ['#ff0000', '#ffa500', '#ffff00', '#0080ff', '#ffffff', '#ff00ff', '#8000ff']; 
    } else {
      return ['#ff0000', '#ff8000', '#ffff00', '#0080ff', '#ffffff', '#ff00ff', '#8000ff', '#00ff00'];
    }
  };

  const colors = getColorPalette(intensity);
  
  // Calculate rotation speed: faster with higher intensity
  // Level 1: no rotation (static)
  // Level 2+: 1.5s base, decreasing to 0.3s at high intensity
  const getRotationSpeed = (intensity: number): number => {
    if (intensity <= 1) return 0; // No rotation for level 1
    const baseSpeed = 1.5;
    const minSpeed = 0.3;
    const speedRange = baseSpeed - minSpeed;
    const speed = baseSpeed - (speedRange * Math.min((intensity - 1) / 7, 1));
    return speed;
  };

  const rotationSpeed = getRotationSpeed(intensity);

  // Rotate colors
  useEffect(() => {
    if (intensity <= 1 || colors.length <= 1) return; // No rotation for level 1 or single color

    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colors.length);
    }, rotationSpeed * 1000);

    return () => clearInterval(interval);
  }, [intensity, colors.length, rotationSpeed]);

  const currentColor = colors[colorIndex] || colors[0];

  // Calculate glow size: starts smaller, increases with intensity
  // Level 1: smaller base (2px blur, 1px spread)
  // Higher levels: progressively larger
  const baseBlur = 2;
  const baseSpread = 1;
  const glowIntensity = baseBlur + (intensity * 2); // 2-18px blur
  const glowSpread = baseSpread + (intensity * 1.5); // 1-13px spread

  // Calculate transition duration: should be slightly shorter than rotation speed for smooth transitions
  // Use 80% of rotation speed, with a minimum of 0.2s and maximum of 1.2s
  const transitionDuration = intensity > 1 && rotationSpeed > 0
    ? Math.max(0.2, Math.min(1.2, rotationSpeed * 0.8))
    : 0.3;

  // Generate unique ID for this component instance to avoid CSS conflicts
  const effectId = `fire-effect-${intensity}`;

  return (
    <>
      <style>
        {`
          .${effectId} {
            --glow-spread: ${glowSpread}px;
            --glow-intensity: ${glowIntensity}px;
            transition: box-shadow ${transitionDuration}s ease-in-out;
            box-shadow: 0 0 var(--glow-spread) var(--glow-intensity) var(--glow-color), 
                        0 0 calc(var(--glow-spread) * 2) calc(var(--glow-intensity) * 1.5) var(--glow-color);
          }
          
          ${intensity > 1 ? `
          @keyframes glowPulse-${effectId} {
            0% { 
              opacity: 0.6;
              filter: brightness(0.8);
            }
            100% { 
              opacity: 1;
              filter: brightness(1.2);
            }
          }
          .${effectId} {
            animation: glowPulse-${effectId} 1.5s ease-in-out infinite alternate;
          }
          ` : ''}
        `}
      </style>
      <div
        className={effectId}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          borderRadius: '12px',
          ['--glow-color' as string]: currentColor, // Set CSS variable via inline style
          ...style
        }}
      />
    </>
  );
};


