import React, { useState } from 'react';
import { Charm } from '../../../game/types';
import { CHARM_PRICES } from '../../../game/data/charms';
import { RarityDot, getRarityColor } from '../../utils/rarityColors';
import { getItemTypeColor } from '../../utils/colors';

/**
 * Convert charm ID to image filename
 * Maps charm IDs to their corresponding image filenames (using first version, not _2 or _3)
 */
function getCharmImagePath(charmId: string): string | null {
  // Map of charm IDs to their image filenames
  const imageMap: Record<string, string> = {
    'almostCertain': 'Almost_Certain.png',
    'angelInvestor': 'Angel_Investor.png',
    'armadilloArmor': 'Armadillo_Armor.png',
    'bankBaron': 'Bank_Baron.png',
    'blankSlate': 'Blank_Slate.png',
    'blessYou': 'Bless_You.png',
    'blessed': 'Blessed.png',
    'bloom': 'Bloom.png',
    'bodyDouble': 'Body_Double.png',
    'comebackKid': 'Comeback_Kid.png',
    'crystalClear': 'Crystal_Clear_2.png',
    'digitalNomad': 'World_Traveler_2.png',
    'dimeADozen': 'Dime_A_Dozen.png',
    'doubleAgent': 'Double_Agent.png',
    'doubleDown': 'Double_Down.png',
    'dukeOfDice': 'Duke_Of_Dice.png',
    'eyeOfHorus': 'Eye_Of_Horus.png',
    'ferrisEuler': 'Ferris_Euler.png',
    'flopShield': 'Flop_Shield_3.png',
    'flopStrategist': 'Flop_Strategist.png',
    'flowerPower': 'Flower_Power.png',
    'ghostWhisperer': 'Ghost_Whisperer.png',
    'goldenTouch': 'Golden_Touch.png',
    'hedgeFund': 'Hedge_Fund.png',
    'hoarder': 'Hoarder.png',
    'holyGrail': 'Holy_Grail_2.png',
    'hotDiceHero': 'Hot_Dice_Hero.png',
    'hotPocket': 'Hot_Pocket.png',
    'inheritance': 'Inheritance.png',
    'ironFortress': 'Iron_Fortress.png',
    'irrational': 'Irrational_2.png',
    'kingslayer': 'Kingslayer.png',
    'leadTitan': 'Lead_Titan.png',
    'longshot': 'Longshot.png',
    'lowHangingFruit': 'Low_Hanging_Fruit_2.png',
    'luckyLeprechaun': 'Lucky_Leprechaun.png',
    'luckyLotus': 'Lucky_Lotus_2.png',
    'luckySevens': 'Lucky_Sevens.png',
    'magicEightBall': 'Magic_Eight_Ball.png',
    'moneyMagnet': 'Money_Magnet_2.png',
    'mustBeThisTallToRide': 'Must_Be_This_Tall_To_Ride_2.png',
    'ninetyEightPercentAPlus': 'Almost_Certain.png',
    'nowWereEven': 'Now_Were_Even_2.png',
    'oddsAndEnds': 'Odds_And_Ends_2.png',
    'oddOdyssey': 'Odd_Oddyssey_2.png',
    'oneSongGlory': 'One_Song_Glory.png',
    'pairUp': 'Pair_Up.png',
    'secondChance': 'Second_Chance.png',
    'sureShot': 'Sure_Shot.png',
    'sixShooter': 'Six_Shooter.png',
    'whimWhisperer': 'Whim_Whisperer.png',
    'shootingStar': 'Whim_Whisperer_2.png',
    'highStakes': 'High_Stakes.png',
    'generator': 'Generator.png',
    'snowball': 'Snowball.png',
    'russianRoulette': 'Russian_Roulette.png',
    'fourForYourFavor': 'Five_Alive.png',
    'fiveAlive': 'Five_Alive_2.png',
    'divineIntervention': 'Second_Chance_3.png',
    'divineFavor': 'Divine_Favor_2.png',
    'paranoia': 'Paranoia.png',
    'perfectionist': 'Perfectionist.png',
    'pipCollector': 'Pip_Collector.png',
    'pointPirate': 'Point_Pirate.png',
    'primeTime': 'Prime_Time.png',
    'purist': 'Purist.png',
    'quadBoosters': 'Quad_Boosters_3.png',
    'queensGambit': 'Queens_Gambit.png',
    'rabbitsFoot': 'Rabbits_Foot_2.png',
    'refinery': 'Refinery.png',
    'rerollRanger': 'Reroll_Ranger.png',
    'resonance': 'Resonance.png',
    'roundRobin': 'Round_Robin.png',
    'sandbagger': 'Sandbagger.png',
    'savingGrace': 'Saving_Grace.png',
    'sizeMatters': 'Size_Matters.png',
    'solitary': 'Solitary.png',
    'stairstepper': 'Stairstepper_2.png',
    'straightShooter': 'Straight_Shooter.png',
    'swordInTheStone': 'Sword_In_The_Stone.png',
    'tasteTheRainbow': 'Taste_The_Rainbow_2.png',
    'tripleThreat': 'Triple_Threat.png',
    'vesuvius': 'Vesuvius.png',
    'weightedDice': 'Weighted_Dice.png',
    'wildCard': 'Wild_Card.png',
  };

  const filename = imageMap[charmId];
  if (!filename) {
    return null;
  }

  return `/assets/images/charms/${filename}`;
}

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
  isInShop?: boolean; // true if in shop, false if in inventory
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
  isInShop = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  const rarity = charm.rarity || 'common';
  const sellValue = CHARM_PRICES[rarity]?.sell || 2;
  const backgroundColor = getItemTypeColor('charm');
  const imagePath = getCharmImagePath(charm.id);
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
  const cardSize = 120; // Base size, can be adjusted
  
  const handleClick = (e: React.MouseEvent) => {
    // On mobile/touch devices, toggle tooltip on click
    // On desktop, only show tooltip on hover
    if (!onClick && !showBuyButton && !showSellButton) {
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
          <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>
            {charm.name}
          </div>
          <div style={{ fontSize: '12px', lineHeight: '1.4', color: '#ddd', marginBottom: '8px' }}>
            {charm.description}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <RarityDot rarity={rarity} />
            <span style={{ textTransform: 'capitalize', color: '#ccc' }}>{rarity}</span>
          </div>
          {showPrice && (
            <div style={{ marginBottom: '6px', fontSize: '11px', color: '#aaa' }}>
              {isInShop ? `Buy: $${price || 0}` : `Sell: $${sellValue}`}
            </div>
          )}
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

