import React, { useState } from 'react';
import { Charm } from '../../../game/types';
import { CHARM_PRICES } from '../../../game/data/charms';
import { LockIcon } from './LockIcon';
import { RarityDot, getRarityColor } from '../../utils/rarityColors';
import { CHARM_CARD_SIZE } from './cardSizes';
import { formatDescription } from '../../utils/descriptionFormatter';

/**
 * Convert charm ID to image filename
 * Maps charm IDs to their corresponding image filenames (using first version, not _2 or _3)
 * For Sleeper Agent, checks if activated (100+ dice scored) to use activated image
 */
function getCharmImagePath(charmId: string, charmState?: Record<string, any> | null): string | null {
  // Handle copied charms from Frankenstein - extract original charm ID
  // Copied charms have IDs like "originalCharmId_copy_1234567890"
  let originalCharmId = charmId;
  if (charmId.includes('_copy_')) {
    originalCharmId = charmId.split('_copy_')[0];
  }
  
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
    'ferrisEuler': 'Ferris_Euler_2.png',
    'flopShield': 'Flop_Shield_3.png',
    'flopStrategist': 'Flop_Strategist.png',
    'flowerPower': 'Flower_Power.png',
    'ghostWhisperer': 'Ghost_Whisperer.png',
    'goldenTouch': 'Golden_Touch.png',
    'hedgeFund': 'Hedge_Fund.png',
    'frequentFlyer': 'Frequent_Flyer.png',
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
    'divineIntervention': 'Divine_Intervention.png',
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
    'brotherhood': 'Brotherhood.png',
    'sleeperAgent': 'Sleeper_Agent.png',
    'sleeperAgentActivated': 'Sleep_Agent_Left_2.png',
    'matterhorn': 'Matterhorn.png',
    'trumpCard': 'Trump_Card_3.png',
    'drumpfCard': 'Drumpf_Card.png', 
    'assassin': 'Assassin.png',
    'againstTheGrain': 'Against_The_Grain_2.png',
    'jefferson': 'Jefferson.png',
    'botox': 'Botox_3.png',
    'ticketEater': 'Ticket_Eater.png',
  };

  // Special handling for Sleeper Agent - check if activated
  if (originalCharmId === 'sleeperAgent' && charmState?.sleeperAgent?.totalDiceScored >= 100) {
    const activatedFilename = imageMap['sleeperAgentActivated'];
    if (activatedFilename) {
      return `/assets/images/charms/${activatedFilename}`;
    }
  }
  
  const filename = imageMap[originalCharmId];
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
                values.currentValue = charmAny.rerollRangerBonus ?? 5;
              } else if (charm.id === 'oddOdyssey') {
                values.currentValue = charmAny.oddOdysseyBonus ?? 0.25;
              } else if (charm.id === 'bankBaron' && charmState?.bankBaron?.bankCount !== undefined) {
                values.currentValue = charmState.bankBaron.bankCount * 10;
              } else if (charm.id === 'sandbagger' && charmState?.sandbagger?.flopCount !== undefined) {
                values.currentValue = charmState.sandbagger.flopCount * 50;
              } else if (charm.id === 'rabbitsFoot' && charmState?.rabbitsFoot?.rainbowTriggers !== undefined) {
                values.currentValue = charmState.rabbitsFoot.rainbowTriggers * 0.1;
              } else if (charm.id === 'assassin' && charmState?.assassin?.destroyedDice !== undefined) {
                values.currentValue = charmState.assassin.destroyedDice;
              } else if (charm.id === 'sleeperAgent' && charmState?.sleeperAgent?.totalDiceScored !== undefined) {
                // Calculate remaining dice needed (100 - totalDiceScored)
                const totalDiceScored = charmState.sleeperAgent.totalDiceScored;
                values.remaining = Math.max(0, 100 - totalDiceScored);
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

