import { Blessing } from '../../game/types';

/**
 * Centralized image path mappings for charms, consumables, and blessings
 */

// ============================================================================
// CHARM IMAGE MAPPINGS
// ============================================================================

const CHARM_IMAGE_MAP: Record<string, string> = {
  'aceInTheHole': 'Ace_In_The_Hole.png',
  'againstTheGrain': 'Against_The_Grain_2.png',
  'almostCertain': 'Almost_Certain.png',
  'angelInvestor': 'Angel_Investor.png',
  'armadilloArmor': 'Armadillo_Armor.png',
  'assassin': 'Assassin.png',
  'bankBaron': 'Bank_Baron.png',
  'battingTheCycle': 'Batting_The_Cycle.png',
  'blankSlate': 'Blank_Slate.png',
  'blessed': 'Blessed.png',
  'blessYou': 'Bless_You.png',
  'bloom': 'Bloom.png',
  'bodyDouble': 'Body_Double.png',
  'botox': 'Botox_3.png',
  'brotherhood': 'Brotherhood.png',
  'cincoDeRollio': 'Cinco_De_Rollio_3.png',
  'comebackKid': 'Comeback_Kid.png',
  'crystalClear': 'Crystal_Clear_2.png',
  'digitalNomad': 'World_Traveler_2.png',
  'dimeADozen': 'Dime_A_Dozen.png',
  'divineFavor': 'Divine_Favor_2.png',
  'divineIntervention': 'Divine_Intervention.png',
  'doubleAgent': 'Double_Agent.png',
  'doubleDown': 'Double_Down.png',
  'drumpfCard': 'Drumpf_Card.png', 
  'dukeOfDice': 'Duke_Of_Dice.png',
  'eyeOfHorus': 'Eye_Of_Horus.png',
  'ferrisEuler': 'Ferris_Euler_2.png',
  'fiveAlive': 'Five_Alive_2.png',
  'flopShield': 'Flop_Shield_3.png',
  'flopStrategist': 'Flop_Strategist.png',
  'flowerPower': 'Flower_Power.png',
  'fourForYourFavor': 'Five_Alive.png',
  'frequentFlyer': 'Frequent_Flyer.png',
  'generator': 'Generator.png',
  'ghostWhisperer': 'Ghost_Whisperer.png',
  'goldenTouch': 'Golden_Touch.png',
  'hedgeFund': 'Hedge_Fund.png',
  'hex': 'Hex.png',
  'highStakes': 'High_Stakes.png',
  'hoarder': 'Hoarder.png',
  'holyGrail': 'Holy_Grail_2.png',
  'hotDiceHero': 'Hot_Dice_Hero.png',
  'hotPocket': 'Hot_Pocket.png',
  'howlAtTheMoon': 'Howl_At_The_Moon.png',
  'inheritance': 'Inheritance.png',
  'ironFortress': 'Iron_Fortress.png',
  'irrational': 'Irrational_2.png',
  'jefferson': 'Jefferson.png',
  'kingslayer': 'Kingslayer.png',
  'leadTitan': 'Lead_Titan.png',
  'longshot': 'Longshot.png',
  'lowHangingFruit': 'Low_Hanging_Fruit_2.png',
  'luckyLeprechaun': 'Lucky_Leprechaun.png',
  'luckyLotus': 'Lucky_Lotus_2.png',
  'luckySevens': 'Lucky_Sevens.png',
  'lunarTides': 'Lunar_Tides.png',
  'magicEightBall': 'Magic_Eight_Ball.png',
  'matterhorn': 'Matterhorn.png',
  'moneyMagnet': 'Money_Magnet_2.png',
  'mustBeThisTallToRide': 'Must_Be_This_Tall_To_Ride_2.png',
  'ninetyEightPercentAPlus': 'Almost_Certain.png',
  'nowWereEven': 'Now_Were_Even_2.png',
  'oddsAndEnds': 'Odds_And_Ends_2.png',
  'oddOdyssey': 'Odd_Oddyssey_2.png',
  'oneSongGlory': 'One_Song_Glory.png',
  'pairUp': 'Pair_Up.png',
  'paranoia': 'Paranoia.png',
  'perfectionist': 'Perfectionist.png',
  'pipCollector': 'Pip_Collector.png',
  'pointPirate': 'Point_Pirate.png',
  'primeTime': 'Prime_Time.png',
  'purist': 'Purist.png',
  'quadBoosters': 'Quad_Boosters_3.png',
  'quarterback': 'Quarterback_3.png',
  'queensGambit': 'Queens_Gambit.png',
  'rabbitsFoot': 'Rabbits_Foot_2.png',
  'refinery': 'Refinery.png',
  'rerollRanger': 'Reroll_Ranger.png',
  'russianRoulette': 'Russian_Roulette.png',
  'resonance': 'Resonance.png',
  'roundRobin': 'Round_Robin.png',
  'ruleOfThree': 'Rule_Of_Three.png',
  'sandbagger': 'Sandbagger.png',
  'savingGrace': 'Saving_Grace.png',
  'secondChance': 'Second_Chance.png',
  'shootingStar': 'Whim_Whisperer_2.png',
  'sixShooter': 'Six_Shooter.png',
  'sizeMatters': 'Size_Matters.png',
  'sleeperAgent': 'Sleeper_Agent.png',
  'sleeperAgentActivated': 'Sleeper_Agent_Left_2.png',
  'snowball': 'Snowball.png',
  'solitary': 'Solitary.png',
  'stairstepper': 'Stairstepper_2.png',
  'straightShooter': 'Straight_Shooter.png',
  'sureShot': 'Sure_Shot.png',
  'swordInTheStone': 'Sword_In_The_Stone.png',
  'tasteTheRainbow': 'Taste_The_Rainbow_2.png',
  'ticketEater': 'Ticket_Eater.png',
  'tripleThreat': 'Triple_Threat.png',
  'trumpCard': 'Trump_Card_3.png',
  'vesuvius': 'Vesuvius.png',
  'weightedDice': 'Weighted_Dice.png',
  'wildCard': 'Wild_Card.png',
  'whimWhisperer': 'Whim_Whisperer.png',
};

/**
 * Get the image path for a charm
 * @param charmId - The charm ID (handles copied charms from Frankenstein)
 * @param charmState - Optional charm state for special cases (e.g., Sleeper Agent activation)
 * @returns The full image path or null if not found
 */
export function getCharmImagePath(charmId: string, charmState?: Record<string, any> | null): string | null {
  // Handle copied charms from Frankenstein - extract original charm ID
  // Copied charms have IDs like "originalCharmId_copy_1234567890"
  let originalCharmId = charmId;
  if (charmId.includes('_copy_')) {
    originalCharmId = charmId.split('_copy_')[0];
  }
  
  // Special handling for Sleeper Agent - check if activated
  if (originalCharmId === 'sleeperAgent' && charmState?.sleeperAgent?.totalDiceScored >= 100) {
    const activatedFilename = CHARM_IMAGE_MAP['sleeperAgentActivated'];
    if (activatedFilename) {
      return `/assets/images/charms/${activatedFilename}`;
    }
  }
  
  const filename = CHARM_IMAGE_MAP[originalCharmId];
  if (!filename) {
    return null;
  }
  
  return `/assets/images/charms/${filename}`;
}

// ============================================================================
// CONSUMABLE IMAGE MAPPINGS
// ============================================================================

const CONSUMABLE_IMAGE_MAP: Record<string, string> = {
  // Whims
  'alchemist': 'Alchemist.png',
  'chisel': 'Chisel.png',
  'echo': 'Echo.png',
  'garagesale': 'Garage_Sale.png',
  'grabBag': 'Grab_Bag.png',
  'groceryList': 'Grocery_List.png',
  'hospital': 'Hospital.png',
  'liquidation': 'Liquidation.png',
  'potteryWheel': 'Pottery_Wheel.png',
  'youGetACharm': 'You_Get_A_Charm.png',
  'emptyAsAPocket': 'Empty_As_A_Pocket.png',
  'moneyPip': 'Midas_Touch_3.png',
  'stallion': 'Stallion.png',
  'practice': 'Practice.png',
  'phantom': 'Phantom_3.png',
  'accumulation': 'Accumulation.png',
  'jackpot': 'Jackpot.png',
  // Wishes
  'distortion': 'Distortion_3.png',
  'frankenstein': 'Frankenstein.png',
  'freebie': 'Freebie.png',
  'midasTouch': 'Midas_Touch.png',
  'origin': 'Origin.png',
  'sacrifice': 'Sacrifice.png',
  'welfare': 'Welfare.png',
  'interest': 'Interest.png',
  'mulligan': 'Mulligan.png',
  // Combination upgrades
  'upgradeSingleN': 'Upgrade_Singles.png',
  'upgradeNPairs': 'Upgrade_Pairs.png',
  'upgradeNOfAKind': 'Upgrade_N_Of_A_Kind.png',
  'upgradeStraightOfN': 'Upgrade_Straights.png',
  'upgradePyramidOfN': 'Upgrade_Pyramids.png',
  'upgradeNTuplets': 'Upgrade_N_Tuplets.png',
};

/**
 * Get the image path for a consumable
 * @param consumableId - The consumable ID
 * @returns The full image path or null if not found
 */
export function getConsumableImagePath(consumableId: string): string | null {
  const filename = CONSUMABLE_IMAGE_MAP[consumableId];
  if (!filename) {
    return null;
  }
  
  return `/assets/images/consumables/${filename}`;
}

// ============================================================================
// BLESSING IMAGE MAPPINGS
// ============================================================================

/**
 * Get the image path for a blessing
 * Blessings use logic-based mapping based on ID prefix and tier
 * @param blessing - The blessing object
 * @returns The full image path or null if not found
 */
export function getBlessingImagePath(blessing: Blessing): string | null {
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
  
  // Shop voucher blessings
  if (id.startsWith('shopVoucher')) {
    if (tier === 1) return '/assets/images/blessings/Ticket_Tier_1_2.png';
    if (tier === 2) return '/assets/images/blessings/Ticket_Tier_2_2.png';
    if (tier === 3) return '/assets/images/blessings/Ticket_Tier_3_2.png';
  }
  
  return null;
}

