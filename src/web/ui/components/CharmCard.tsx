import React, { useState } from 'react';
import { Charm } from '../../../game/types';
import { CHARM_PRICES } from '../../../game/data/charms';
import { LockIcon } from './LockIcon';
import { RarityDot, getRarityColor } from '../../utils/rarityColors';
import { CHARM_CARD_SIZE } from './cardSizes';
import { formatDescription } from '../../utils/descriptionFormatter';
import { getCharmImagePath } from '../../utils/imagePaths';

interface CharmCardProps {
  charm: Charm;
  onClick?: () => void;
  showPrice?: boolean;
  price?: number;
  basePrice?: number;
  discount?: number;
  canAfford?: boolean;
  showBuyButton?: boolean;
  onBuy?: () => void;
  showSellButton?: boolean;
  onSell?: () => void;
  highlighted?: boolean;
  isInActiveGame?: boolean; // true if in shop or inventory during active game
  isLocked?: boolean; // true if item is locked (not unlocked in collection)
  charmState?: Record<string, any> | null; // For checking charm-specific state (e.g., Sleeper Agent activation, generator.currentCategory)
}

export const CharmCard: React.FC<CharmCardProps> = ({
  charm,
  onClick,
  showPrice = false,
  price,
  basePrice,
  discount = 0,
  canAfford = true,
  showBuyButton = false,
  onBuy,
  showSellButton = false,
  onSell,
  highlighted = false,
  isInActiveGame = false,
  isLocked = false,
  charmState = null
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  // Show tooltip on hover OR if clicked
  const showTooltip = isHovered || isClicked;
  
  const rarity = charm.rarity || 'common';
  const sellValue = CHARM_PRICES[rarity]?.sell || 2;
  const backgroundColor = '#1a1a1a'; // Dark gray background for charms
  const imagePath = getCharmImagePath(charm.id, charmState);
  const borderColor = getRarityColor(rarity);
  
  // Get glow effect based on rarity
  const getGlowStyle = () => {
    switch (rarity) {
      case 'legendary':
        return {
          boxShadow: '0 0 20px 8px rgba(255, 107, 53, 0.6), 0 0 40px 12px rgba(255, 107, 53, 0.3)',
          animation: 'legendaryGlow 2s ease-in-out infinite alternate'
        };
      case 'rare':
        return {
          boxShadow: '0 0 10px 4px rgba(155, 89, 182, 0.4), 0 0 20px 6px rgba(155, 89, 182, 0.2)',
          animation: 'rareGlow 2.5s ease-in-out infinite alternate'
        };
      case 'uncommon':
        return {
          boxShadow: '0 0 12px 5px rgba(52, 152, 219, 0.5), 0 0 24px 8px rgba(52, 152, 219, 0.3)'
        };
      default: // common
        return {
          boxShadow: 'none'
        };
    }
  };
  
  const glowStyle = getGlowStyle();
  
  // Square aspect ratio (1:1)
  const cardSize = CHARM_CARD_SIZE;
  
  const handleClick = (e: React.MouseEvent) => {
    // If there's an onClick handler, call it
    if (onClick) {
      onClick();
      return;
    }
    
    // If we're in active game (shop or inventory), let the parent handle ALL clicks
    // The parent needs to handle selection, so don't interfere
    if (isInActiveGame) {
      return;
    }
    
    // Otherwise, toggle clicked state for tooltip (collection page only)
    e.preventDefault();
    e.stopPropagation();
    setIsClicked(!isClicked);
  };
  
  // Close clicked state when clicking anywhere
  React.useEffect(() => {
    if (!isClicked) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cardElement = target.closest('[data-card-id]');
      if (cardElement?.getAttribute('data-card-id') !== charm.id) {
        setIsClicked(false);
      }
    };
    
    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isClicked, charm.id]);

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }} 
      data-card-id={charm.id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={handleClick}
        style={{
          width: `${cardSize}px`,
          height: `${cardSize}px`,
          backgroundColor: backgroundColor,
          border: highlighted 
            ? `3px solid #ffc107` 
            : `3px solid ${borderColor}`,
          borderRadius: '8px',
          cursor: onClick || showBuyButton || showSellButton ? 'pointer' : 'default',
          opacity: canAfford ? 1 : 0.6,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          ...(highlighted 
            ? {
                boxShadow: '0 0 15px 5px rgba(255, 193, 7, 0.6), 0 4px 8px rgba(0,0,0,0.3)',
                animation: 'charmHighlight 0.6s ease-out'
              }
            : isHovered
              ? {
                  boxShadow: glowStyle.boxShadow || '0 4px 8px rgba(0,0,0,0.3)',
                  ...(glowStyle.animation ? { animation: glowStyle.animation } : {})
                }
              : glowStyle
          )
        }}
      >
        {/* Image will fill the whole card as background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: backgroundColor,
          backgroundImage: imagePath ? `url(${imagePath})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
          filter: isLocked && !isInActiveGame ? 'grayscale(100%) brightness(0.5)' : 'none'
        }} />
        
        {/* Lock overlay - only show in collection page, not in shop/inventory */}
        {isLocked && !isInActiveGame && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}>
            <LockIcon size={32} color="white" strokeWidth={2} />
          </div>
        )}
      </div>
      
      {/* Tooltip on hover/click */}
      {showTooltip && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '8px',
          backgroundColor: '#333',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '12px',
          minWidth: '200px',
          maxWidth: '300px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          pointerEvents: 'none',
          whiteSpace: 'normal',
          wordWrap: 'break-word'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{charm.name}</span>
            {/* Show lock icon in tooltip when locked (only in active game - shop/inventory) */}
            {isLocked && isInActiveGame && (
              <LockIcon size={14} color="white" strokeWidth={2} />
            )}
          </div>
          <div style={{ fontSize: '12px', lineHeight: '1.4', color: '#ddd', marginBottom: '8px' }}>
            {formatDescription(charm.description, (() => {
              // Extract currentValue from charm object or charmState
              // This is still a bit hardcoded, but it's the simplest way to get the values
              const charmAny = charm as any;
              const values: any = {};
              
              if (charm.id === 'stairstepper') {
                values.currentValue = charmAny.stairstepperBonus ?? 20;
              } else if (charm.id === 'rerollRanger') {
                if (charmState?.rerollRanger?.multiplierBonus !== undefined) {
                  values.currentValue = charmState.rerollRanger.multiplierBonus;
                } else {
                  values.currentValue = charmAny.rerollRangerBonus ?? 0.05;
                }
              } else if (charm.id === 'oddOdyssey') {
                values.currentValue = charmAny.oddOdysseyBonus ?? 0;
              } else if (charm.id === 'bankBaron' && charmState?.bankBaron?.bankCount !== undefined) {
                values.currentValue = charmState.bankBaron.bankCount * 0;
              } else if (charm.id === 'sandbagger' && charmState?.sandbagger?.flopCount !== undefined) {
                values.currentValue = charmState.sandbagger.flopCount * 0;
              } else if (charm.id === 'rabbitsFoot' && charmState?.rabbitsFoot?.rainbowTriggers !== undefined) {
                values.currentValue = charmState.rabbitsFoot.rainbowTriggers * 0;
              } else if (charm.id === 'assassin' && charmState?.assassin?.destroyedDice !== undefined) {
                values.currentValue = charmState.assassin.destroyedDice;
              } else if (charm.id === 'sleeperAgent' && charmState?.sleeperAgent?.totalDiceScored !== undefined) {
                const totalDiceScored = charmState.sleeperAgent.totalDiceScored;
                values.remaining = Math.max(0, 100 - totalDiceScored);
              } else if (charm.id === 'flopShield') {
                const charmAny = charm as any;
                const uses = charmAny.uses;
                values.remaining = uses === '∞' || uses === undefined ? '∞' : uses;
              }
              
              // Handle Generator charm category
              if (charm.id === 'generator' && charmState?.generator?.currentCategory) {
                const category = charmState.generator.currentCategory;
                // Format category name nicely
                const categoryNames: Record<string, string> = {
                  'singleN': 'Single',
                  'nPairs': 'Pair',
                  'nTuplets': 'Tuplet',
                  'straightOfN': 'Straight',
                  'pyramidOfN': 'Pyramid',
                  'nOfAKind': 'N of a Kind'
                };
                values.generatorCategory = categoryNames[category] || category;
              }
              
              return values;
            })())}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RarityDot rarity={rarity} />
            <span style={{ textTransform: 'capitalize', color: '#ccc' }}>{rarity}</span>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes charmHighlight {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
          }
          50% {
            box-shadow: 0 0 20px 8px rgba(255, 193, 7, 0.8);
          }
          100% {
            box-shadow: 0 0 15px 5px rgba(255, 193, 7, 0.6);
          }
        }
        
        @keyframes legendaryGlow {
          0% {
            box-shadow: 0 0 20px 8px rgba(255, 107, 53, 0.6), 0 0 40px 12px rgba(255, 107, 53, 0.3);
          }
          100% {
            box-shadow: 0 0 30px 12px rgba(255, 107, 53, 0.8), 0 0 50px 18px rgba(255, 107, 53, 0.5);
          }
        }
        
        @keyframes rareGlow {
          0% {
            box-shadow: 0 0 10px 4px rgba(155, 89, 182, 0.4), 0 0 20px 6px rgba(155, 89, 182, 0.2);
          }
          100% {
            box-shadow: 0 0 14px 6px rgba(155, 89, 182, 0.6), 0 0 28px 10px rgba(155, 89, 182, 0.3);
          }
        }
      `}</style>
    </div>
  );
};

