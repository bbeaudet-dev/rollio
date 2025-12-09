import React, { useState } from 'react';
import { Consumable } from '../../../game/types';
import { WHIMS, WISHES } from '../../../game/data/consumables';
import { getConsumableColor } from '../../utils/colors';
import { getRarityColor } from '../../utils/rarityColors';
import { ActionButton } from './ActionButton';

/**
 * Convert consumable ID to image filename
 * Maps consumable IDs to their corresponding image filenames (using first version, not _2 or _3)
 */
function getConsumableImagePath(consumableId: string): string | null {
  // Map of consumable IDs to their image filenames
  const imageMap: Record<string, string> = {
    'chisel': 'Chisel.png',
    'distortion': 'Distortion_3.png',
    'echo': 'Echo.png',
    'frankenstein': 'Frankenstein.png',
    'freebie': 'Freebie.png',
    'garagesale': 'Garage_Sale.png',
    'grabBag': 'Grab_Bag.png',
    'groceryList': 'Grocery_List.png',
    'hospital': 'Hospital.png',
    'liquidation': 'Liquidation.png',
    'midasTouch': 'Midas_Touch.png',
    'origin': 'Origin.png',
    'potteryWheel': 'Pottery_Wheel.png',
    'sacrifice': 'Sacrifice.png',
    'welfare': 'Welfare.png',
    'youGetACharm': 'You_Get_A_Charm.png',
    'emptyAsAPocket': 'Empty_As_A_Pocket.png',
    'moneyPip': 'Midas_Touch_3.png',
    'stallion': 'Stallion.png',
    'practice': 'Practice.png',
    'phantom': 'Phantom.png',
    'accumulation': 'Accumulation.png',
  };

  const filename = imageMap[consumableId];
  if (!filename) {
    return null;
  }

  return `/assets/images/consumables/${filename}`;
}

const CONSUMABLE_PRICES: Record<string, { buy: number; sell: number }> = {
  wish: { buy: 8, sell: 4 },
  whim: { buy: 4, sell: 2 },
};

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
  highlighted = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  const isWish = WISHES.some(w => w.id === consumable.id);
  const isWhim = WHIMS.some(w => w.id === consumable.id);
  const category = isWish ? 'wish' : (isWhim ? 'whim' : 'whim');
  const sellValue = CONSUMABLE_PRICES[category]?.sell || 2;
  const backgroundColor = getConsumableColor(consumable.id, WHIMS, WISHES);
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
  const cardSize = 96; // 120 * 0.8 = 96
  
  const handleClick = (e: React.MouseEvent) => {
    // On mobile/touch devices, toggle tooltip on click
    // On desktop, only show tooltip on hover
    if (!onClick && !showBuyButton && !showUseButton) {
      e.preventDefault();
      setIsClicked(!isClicked);
    } else if (onClick) {
      onClick();
    }
  };

  const showTooltip = isHovered || isClicked;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsClicked(false);
        }}
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
          zIndex: 0
        }} />
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
          <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '6px' }}>
            {consumable.name}
          </div>
          <div style={{ marginBottom: '6px', fontSize: '11px', color: '#aaa' }}>
            Sell Value: ${sellValue}
          </div>
          <div style={{ fontSize: '11px', lineHeight: '1.4', color: '#ddd' }}>
            {consumable.description}
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

