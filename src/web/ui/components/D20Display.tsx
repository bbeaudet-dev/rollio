import React from 'react';
import { DifficultyLevel } from '../../../game/logic/difficulty';
import { DIFFICULTY_COLORS } from '../../utils/colors';

interface D20DisplayProps {
  difficulty: DifficultyLevel;
  size?: number;
}

/**
 * Renders a stylized d20 icosahedron for difficulty display
 * Shows the number "20" prominently on the top face
 */
export const D20Display: React.FC<D20DisplayProps> = ({ difficulty, size = 60 }) => {
  const colors = DIFFICULTY_COLORS[difficulty];
  const isDiamond = difficulty === 'diamond';

  return (
    <>
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: 'relative',
          margin: '0 auto',
          filter: 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.3))'
        }}
      >
        {/* Main visible face - hexagon shape like a d20 face */}
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            background: colors.background,
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            border: `3px solid ${colors.border}`,
            boxShadow: isDiamond 
              ? '0 0 20px rgba(0, 188, 212, 0.6), 0 0 40px rgba(0, 188, 212, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.3), inset -2px -2px 4px rgba(0, 0, 0, 0.2)' 
              : 'inset 0 0 20px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...(isDiamond && {
              animation: 'diamondShimmer 3s ease-in-out infinite',
            })
          }}
        >
          {/* Main "20" number */}
          <div
            style={{
              fontSize: `${size * 0.35}px`,
              fontWeight: 'bold',
              color: colors.number,
              lineHeight: 1,
              textShadow: isDiamond 
                ? '0 0 10px rgba(0, 188, 212, 0.8), 0 0 5px rgba(255, 255, 255, 0.5)' 
                : '0 2px 4px rgba(0, 0, 0, 0.5), 1px 1px 2px rgba(0, 0, 0, 0.3)',
              zIndex: 2,
              position: 'relative',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            20
          </div>

          {/* Diamond shimmer overlay */}
          {isDiamond && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                animation: 'shimmer 2s ease-in-out infinite',
                zIndex: 1,
                clipPath: 'inherit'
              }}
            />
          )}
        </div>

        {/* Additional visible faces for 3D effect - using pseudo-3D shadows and borders */}
        {/* Top edge highlight */}
        <div
          style={{
            position: 'absolute',
            top: '0%',
            left: '25%',
            width: '50%',
            height: '25%',
            background: `linear-gradient(180deg, rgba(255, 255, 255, 0.3), transparent)`,
            clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
        
        {/* Left edge shadow */}
        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: '0%',
            width: '25%',
            height: '50%',
            background: `linear-gradient(90deg, rgba(0, 0, 0, 0.2), transparent)`,
            clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
        
        {/* Right edge shadow */}
        <div
          style={{
            position: 'absolute',
            top: '25%',
            right: '0%',
            width: '25%',
            height: '50%',
            background: `linear-gradient(270deg, rgba(0, 0, 0, 0.2), transparent)`,
            clipPath: 'polygon(100% 0%, 0% 50%, 100% 100%)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
        
        {/* Bottom edge shadow */}
        <div
          style={{
            position: 'absolute',
            bottom: '0%',
            left: '25%',
            width: '50%',
            height: '25%',
            background: `linear-gradient(0deg, rgba(0, 0, 0, 0.3), transparent)`,
            clipPath: 'polygon(0% 0%, 50% 100%, 100% 0%)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      </div>

      {isDiamond && (
        <style>{`
          @keyframes diamondShimmer {
            0%, 100% {
              box-shadow: 0 0 20px rgba(0, 188, 212, 0.6), 0 0 40px rgba(0, 188, 212, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.3);
            }
            50% {
              box-shadow: 0 0 30px rgba(0, 188, 212, 0.9), 0 0 60px rgba(0, 188, 212, 0.6), 0 0 80px rgba(0, 188, 212, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.5);
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
        `}</style>
      )}
    </>
  );
};

