import React, { useState } from 'react';
import { Consumable } from '../../../game/types';
import { WHIMS, WISHES } from '../../../game/data/consumables';
import { getConsumableColor } from '../../utils/colors';
import { StandardButton } from './StandardButton';

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
  onUse
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  const isWish = WISHES.some(w => w.id === consumable.id);
  const isWhim = WHIMS.some(w => w.id === consumable.id);
  const category = isWish ? 'wish' : (isWhim ? 'whim' : 'whim');
  const sellValue = CONSUMABLE_PRICES[category]?.sell || 2;
  const backgroundColor = getConsumableColor(consumable.id, WHIMS, WISHES);
  
  // Square aspect ratio (1:1) - same as charms
  const cardSize = 120; // Base size, can be adjusted
  
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
          border: '2px solid #333',
          borderRadius: '8px',
          cursor: onClick || showBuyButton || showUseButton ? 'pointer' : 'default',
          opacity: canAfford ? 1 : 0.6,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          transition: 'transform 0.2s ease',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          boxShadow: isHovered ? '0 4px 8px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)'
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
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0
        }} />
        
        {/* Bottom overlay with info */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '4px 6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '4px',
          zIndex: 1
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flex: 1,
            minWidth: 0
          }}>
            {/* Price if shown */}
            {showPrice && price !== undefined && (
              <div style={{
                fontSize: '9px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}>
                <span>${price}</span>
                {discount > 0 && basePrice !== undefined && basePrice !== price && (
                  <span style={{
                    fontSize: '7px',
                    color: '#999',
                    textDecoration: 'line-through'
                  }}>
                    ${basePrice}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Buttons */}
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            {/* Buy button if shown */}
            {showBuyButton && onBuy && (
              <div onClick={(e) => e.stopPropagation()}>
                <StandardButton
                  onClick={onBuy}
                  disabled={!canAfford}
                  variant="success"
                  size="small"
                  style={{ padding: '2px 6px', fontSize: '8px' }}
                >
                  Buy
                </StandardButton>
              </div>
            )}
            
            {/* Use button if shown */}
            {showUseButton && onUse && (
              <div onClick={(e) => e.stopPropagation()}>
                <StandardButton
                  onClick={onUse}
                  variant="primary"
                  size="small"
                  style={{ padding: '2px 6px', fontSize: '8px' }}
                >
                  Use
                </StandardButton>
              </div>
            )}
          </div>
        </div>
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
    </div>
  );
};

