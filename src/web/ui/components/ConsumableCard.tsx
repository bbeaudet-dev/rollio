import React, { useState, useEffect } from 'react';
import { Consumable } from '../../../game/types';
import { WHIMS, WISHES, COMBINATION_UPGRADES } from '../../../game/data/consumables';
import { LockIcon } from './LockIcon';
import { getConsumableColor } from '../../utils/colors';
import { getRarityColor } from '../../utils/rarityColors';
import { CONSUMABLE_PRICES } from '../../../game/logic/shop';
import { CONSUMABLE_CARD_SIZE } from './cardSizes';
import { formatDescription } from '../../utils/descriptionFormatter';
import { getConsumableImagePath } from '../../utils/imagePaths';

interface ConsumableCardProps {
  consumable: Consumable;
  onClick?: () => void;
  showPrice?: boolean;
  price?: number;
  basePrice?: number;
  discount?: number;
  canAfford?: boolean;
  showBuyButton?: boolean;
  onBuy?: () => void;
  showUseButton?: boolean;
  onUse?: () => void;
  highlighted?: boolean;
  isLocked?: boolean;
  isInActiveGame?: boolean; // true if in shop or inventory during active game
}

export const ConsumableCard: React.FC<ConsumableCardProps> = ({
  consumable,
  onClick,
  showPrice = false,
  price,
  basePrice,
  discount = 0,
  canAfford = true,
  showBuyButton = false,
  onBuy,
  showUseButton = false,
  onUse,
  highlighted = false,
  isLocked = false,
  isInActiveGame = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  // Show tooltip on hover OR if clicked
  const showTooltip = isHovered || isClicked;
  
  const isWish = WISHES.some(w => w.id === consumable.id);
  const isWhim = WHIMS.some(w => w.id === consumable.id);
  const isCombinationUpgrade = COMBINATION_UPGRADES.some(cu => cu.id === consumable.id);
  const category = isWish ? 'wish' : (isWhim ? 'whim' : (isCombinationUpgrade ? 'combinationUpgrade' : 'whim'));
  const sellValue = CONSUMABLE_PRICES[category]?.sell || 2;
  const backgroundColor = getConsumableColor(consumable.id, WHIMS, WISHES, COMBINATION_UPGRADES);
  const imagePath = getConsumableImagePath(consumable.id);
  
  // Wishes are rarer than whims - use rarity colors
  const rarity = isWish ? 'rare' : 'common';
  const borderColor = getRarityColor(rarity);
  
  // Get glow effect based on rarity (wishes get glow)
  const getGlowStyle = () => {
    if (isWish) {
      return {
        boxShadow: '0 0 10px 4px rgba(155, 89, 182, 0.4), 0 0 20px 6px rgba(155, 89, 182, 0.2)',
        animation: 'rareGlow 2.5s ease-in-out infinite alternate'
      };
    }
    return {
      boxShadow: 'none'
    };
  };
  
  const glowStyle = getGlowStyle();
  
  // Square aspect ratio (1:1) 
  const cardSize = CONSUMABLE_CARD_SIZE;
  
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
      if (cardElement?.getAttribute('data-card-id') !== consumable.id) {
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
  }, [isClicked, consumable.id]);

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }} 
      data-card-id={consumable.id}
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
          cursor: onClick || showBuyButton || showUseButton ? 'pointer' : 'default',
          opacity: canAfford ? 1 : 0.6,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
          // No scale transform when in active game - causes issues with buttons when selected
          transform: isInActiveGame ? 'scale(1)' : (isHovered ? 'scale(1.05)' : 'scale(1)'),
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{consumable.name}</span>
            {/* Show lock icon in tooltip when locked (only in active game - shop/inventory) */}
            {isLocked && isInActiveGame && (
              <LockIcon size={14} color="white" strokeWidth={2} />
            )}
          </div>
          <div style={{ fontSize: '11px', lineHeight: '1.4', color: '#ddd' }}>
            {formatDescription(consumable.description)}
          </div>
        </div>
      )}
      
      <style>{`
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

