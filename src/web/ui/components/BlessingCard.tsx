import React, { useState } from 'react';
import { Blessing } from '../../../game/types';
import { getBlessingName, getBlessingDescription } from '../../../game/data/blessings';
import { getItemTypeColor } from '../../utils/colors';
import { getRarityColor } from '../../utils/rarityColors';
import { ActionButton } from './ActionButton';

/**
 * Convert blessing ID to image filename based on blessing type and tier
 */
function getBlessingImagePath(blessing: Blessing): string | null {
  const { id, tier, effect } = blessing;
  
  // Slot blessings
  if (id.startsWith('slot')) {
    if (tier === 1) return '/assets/images/blessings/Extra_Charm_Slot.png';
    if (tier === 2) return '/assets/images/blessings/Extra_Consumable_Slot.png';
    if (tier === 3) return '/assets/images/blessings/ExtraExtra_Charm_Slot.png';
  }
  
  // Discount blessings
  if (id.startsWith('discount')) {
    if (tier === 1) return '/assets/images/blessings/Discount_Tier_1.png';
    if (tier === 2) return '/assets/images/blessings/Discount_Tier_2.png';
    if (tier === 3) return '/assets/images/blessings/Discount_Tier_3.png';
  }
  
  // Banks blessings (baseLevelBanks)
  if (id.startsWith('banks')) {
    if (tier === 1) return '/assets/images/blessings/Gun_Hand_Tier_1.png';
    if (tier === 2) return '/assets/images/blessings/Gun_Hand_Tier_2.png';
    if (tier === 3) return '/assets/images/blessings/Gun_Hand_Tier_3.png';
  }
  
  // Reroll ability blessings
  if (id.startsWith('rerollAbility')) {
    if (effect.type === 'rerollOnFlop') return '/assets/images/blessings/Reroll_Flop.png';
    if (effect.type === 'rerollOnBank') return '/assets/images/blessings/Reroll_Bank.png';
    if (effect.type === 'moneyOnRerollUsed') return '/assets/images/blessings/Reroll_Money.png';
  }
  
  // Reroll blessings (baseLevelRerolls)
  if (id.startsWith('reroll') && !id.startsWith('rerollAbility')) {
    if (tier === 1) return '/assets/images/blessings/Hand_Tier_1.png';
    if (tier === 2) return '/assets/images/blessings/Hand_Tier_2_2.png';
    if (tier === 3) return '/assets/images/blessings/Hand_Tier_3_2.png';
  }
  
  // Flop subversion blessings
  if (id.startsWith('flopSubversion')) {
    if (tier === 1) return '/assets/images/blessings/Holy_Hand_Tier_1.png';
    if (tier === 2) return '/assets/images/blessings/Holy_Hand_Tier_2.png';
    if (tier === 3) return '/assets/images/blessings/Holy_Hand_Tier_3.png';
  }
  
  // Money blessings (moneyPerBank)
  if (id.startsWith('money')) {
    if (tier === 1) return '/assets/images/blessings/Remaining_Banks_Tier_1.png';
    if (tier === 2) return '/assets/images/blessings/Remaining_Banks_Tier_2.png';
    if (tier === 3) return '/assets/images/blessings/Remaining_Banks_Tier_3.png'; 
  }
  
  return null;
}

const BLESSING_PRICE = 5;
const BLESSING_SELL_VALUE = 5; // Same as buy price

interface BlessingCardProps {
  blessing: Blessing;
  onClick?: () => void;
  showPrice?: boolean;
  price?: number;
  basePrice?: number;
  discount?: number;
  canAfford?: boolean;
  showBuyButton?: boolean;
  onBuy?: () => void;
  highlighted?: boolean;
}

export const BlessingCard: React.FC<BlessingCardProps> = ({
  blessing,
  onClick,
  showPrice = false,
  price,
  basePrice,
  discount = 0,
  canAfford = true,
  showBuyButton = false,
  onBuy,
  highlighted = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  const name = getBlessingName(blessing);
  const description = getBlessingDescription(blessing);
  const backgroundColor = getItemTypeColor('blessing');
  const imagePath = getBlessingImagePath(blessing);
  
  // Map blessing tier to rarity for border/glow
  const rarity = blessing.tier === 1 ? 'common' : blessing.tier === 2 ? 'uncommon' : 'rare';
  const borderColor = getRarityColor(rarity);
  
  // Get glow effect based on tier
  const getGlowStyle = () => {
    switch (blessing.tier) {
      case 3:
        return {
          boxShadow: '0 0 10px 4px rgba(155, 89, 182, 0.4), 0 0 20px 6px rgba(155, 89, 182, 0.2)',
          animation: 'rareGlow 2.5s ease-in-out infinite alternate'
        };
      case 2:
        return {
          boxShadow: '0 0 12px 5px rgba(52, 152, 219, 0.5), 0 0 24px 8px rgba(52, 152, 219, 0.3)'
        };
      default: // tier 1
        return {
          boxShadow: 'none'
        };
    }
  };
  
  const glowStyle = getGlowStyle();
  
  // Square aspect ratio (1:1) 
  const cardSize = 84; // 120 * 0.7 = 84
  
  const handleClick = (e: React.MouseEvent) => {
    // On mobile/touch devices, toggle tooltip on click
    // On desktop, only show tooltip on hover
    if (!onClick && !showBuyButton) {
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
          cursor: onClick || showBuyButton ? 'pointer' : 'default',
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
            {name}
          </div>
          <div style={{ marginBottom: '6px', fontSize: '11px', color: '#aaa' }}>
            Sell Value: ${BLESSING_SELL_VALUE}
          </div>
          <div style={{ fontSize: '11px', lineHeight: '1.4', color: '#ddd' }}>
            {description}
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

