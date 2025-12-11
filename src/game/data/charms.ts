import { Charm, CharmRarity } from '../types';

export type CharmType = 
  // Common charms
  | 'flopShield'
  | 'stairstepper'
  | 'generator'
  | 'oddsAndEnds'
  | 'nowWereEven'
  | 'moneyMagnet'
  | 'highStakes'
  | 'lowHangingFruit'
  | 'ninetyEightPercentAPlus'
  | 'oddOdyssey'
  | 'pairUp'
  | 'tripleThreat'
  | 'dimeADozen'
  | 'sandbagger'
  | 'flowerPower'
  | 'crystalClear'
  | 'goldenTouch'
  | 'straightShooter'
  | 'longshot'
  | 'roundRobin'
  | 'ghostWhisperer'
  | 'ironFortress'
  | 'rerollRanger'
  | 'bankBaron'
  | 'pointPirate'
  | 'solitary'
  | 'oneSongGlory'
  | 'blessed'
  | 'blessYou'
  | 'angelInvestor'
  | 'magicEightBall'
  | 'hotDiceHero'
  | 'sureShot'
  | 'flopStrategist'
  | 'pipCollector'
  | 'digitalNomad'
  | 'frequentFlyer'
  | 'hoarder'
  | 'comebackKid'

  // Uncommon charms
  | 'quadBoosters'
  | 'snowball'
  | 'rabbitsFoot'
  | 'weightedDice'
  | 'luckySevens'
  | 'savingGrace'
  | 'tasteTheRainbow'
  | 'swordInTheStone'
  | 'primeTime'
  | 'luckyLeprechaun'
  | 'irrational'
  | 'ferrisEuler'
  | 'fourForYourFavor'
  | 'fiveAlive'
  | 'sixShooter'
  | 'hedgeFund'
  | 'luckyLotus'
  | 'hotPocket'
  | 'wildCard'
  | 'whimWhisperer'
  | 'doubleAgent'
  | 'purist'
  | 'drumpfCard'
  
  // Rare charms
  | 'shootingStar'
  | 'kingslayer'
  | 'blankSlate'
  | 'doubleDown'
  | 'perfectionist'
  | 'divineIntervention'
  | 'holyGrail'
  | 'divineFavor'
  | 'dukeOfDice'
  | 'eyeOfHorus'
  | 'leadTitan'
  | 'bodyDouble'
  | 'inheritance'
  | 'resonance'
  | 'bloom'
  | 'sizeMatters'
  | 'vesuvius'
  | 'armadilloArmor'
  | 'refinery'
  | 'russianRoulette'

  // Legendary charms
  | 'paranoia'
  | 'trumpCard';

// Rarity price mapping
export const CHARM_PRICES: Record<string, { buy: number; sell: number }> = {
  legendary: { buy: 10, sell: 5 },
  rare: { buy: 8, sell: 4 },
  uncommon: { buy: 6, sell: 3 },
  common: { buy: 4, sell: 2 },
};

export const CHARMS: Omit<Charm, 'active'>[] = [


  // COMMON CHARMS

  {
    id: 'flopShield',
    name: 'Flop Shield',
    description: 'Prevents three flops (breaks on final use)',
    rarity: 'common'
  },
  {
    id: 'stairstepper',
    name: 'Stairstepper',
    description: '+20 points when scoring. Add +20 per straight played (cumulative)',
    rarity: 'common'
  },
  {
    id: 'generator',
    name: 'Generator',
    description: 'Creates a random consumable when scoring a specified combination',
    rarity: 'common'
  },
  {
    id: 'oddsAndEnds',
    name: 'Odds and Ends',
    description: '+25 points for each odd value scored',
    rarity: 'common'
  },
  {
    id: 'nowWereEven',
    name: 'Now We\'re Even',
    description: 'If all selected dice are even, gain +150 points',
    rarity: 'common'
  },
  {
    id: 'moneyMagnet',
    name: 'Money Magnet',
    description: '+1 point for every $1 you have',
    rarity: 'common'
  },
  {
    id: 'highStakes',
    name: 'High Stakes',
    description: '2x scoring multiplier, but removes Singles as valid scoring combinations',
    rarity: 'common'
  },
  {
    id: 'lowHangingFruit',
    name: 'Low Hanging Fruit',
    description: 'Allows single 3s to be scored as valid combinations (worth 25 points)',
    rarity: 'common'
  },
  {
    id: 'ninetyEightPercentAPlus',
    name: '98% A+',
    description: '+10 points if scored dice includes a pair',
    rarity: 'common'
  },
  {
    id: 'oddOdyssey',
    name: 'Odd Odyssey',
    description: '+0.25 points when scoring. Add +0.25 for each odd value scored (cumulative)',
    rarity: 'common'
  },
  {
    id: 'pairUp',
    name: 'Pair Up',
    description: '+50 points for each pair scored',
    rarity: 'common'
  },
  {
    id: 'tripleThreat',
    name: 'Triple Play',
    description: '+50 points for each triplet scored',
    rarity: 'common'
  },
  {
    id: 'dimeADozen',
    name: 'Dime-a-Dozen',
    description: '+$3 if scored dice includes six of one value',
    rarity: 'common'
  },
  {
    id: 'sandbagger',
    name: 'Sandbagger',
    description: 'Gains +50 points per flop. Each flop increases the bonus by +50 points',
    rarity: 'common'
  },
  {
    id: 'flowerPower',
    name: 'Flower Power',
    description: '+100 points for each flower die scored in current round',
    rarity: 'common'
  },
  {
    id: 'crystalClear',
    name: 'Crystal Clear',
    description: '+150 points for each crystal die scored',
    rarity: 'common'
  },
  {
    id: 'goldenTouch',
    name: 'Golden Touch',
    description: '+$1 for each golden die scored',
    rarity: 'common'
  },
  {
    id: 'straightShooter',
    name: 'Straight Shooter',
    description: '+500 points when scoring a straight',
    rarity: 'common'
  },
  {
    id: 'longshot',
    name: 'Longshot',
    description: '+250 points when scoring a straight of 6 or longer',
    rarity: 'common'
  },
  {
    id: 'roundRobin',
    name: 'Round Robin',
    description: '+750 points when scoring if no repeated combinations are scored in round',
    rarity: 'common'
  },
  {
    id: 'ghostWhisperer',
    name: 'Ghost Whisperer',
    description: '+50 points for each scored Ghost die; +250 points for each unscored Ghost die',
    rarity: 'common'
  },
  {
    id: 'ironFortress',
    name: 'Iron Fortress',
    description: 'If at least 2 lead dice are scored, all scored dice remain in hand',
    rarity: 'common'
  },
  {
    id: 'rerollRanger',
    name: 'Reroll Ranger',
    description: '+5 points when scoring. Add +5 for each reroll used (cumulative)',
    rarity: 'common'
  },
  {
    id: 'bankBaron',
    name: 'Bank Baron',
    description: '+10 PTS when scoring. Add +10 PTSfor each bank (cumulative)',
    rarity: 'common'
  },
  {
    id: 'pointPirate',
    name: 'Point Pirate',
    description: '+1000 PTS on first score of the level, -100 PTS on all other scores',
    rarity: 'common'
  },
  {
    id: 'solitary',
    name: 'Solitary',
    description: '2x MLT if no repeated values scored',
    rarity: 'common'
  },
  {
    id: 'oneSongGlory',
    name: 'One Song Glory',
    description: '+$5 for completing a level with a single bank',
    rarity: 'common'
  },
  {
    id: 'blessed',
    name: 'Blessed',
    description: '+100 PTS when banking for each blessing you own',
    rarity: 'common'
  },
  {
    id: 'blessYou',
    name: 'Bless You',
    description: '25% of forfeited points recovered when flopping',
    rarity: 'common'
  },
  {
    id: 'angelInvestor',
    name: 'Angel Investor',
    description: '+$1 for each flop',
    rarity: 'common'
  },
  {
    id: 'magicEightBall',
    name: 'Magic 8 Ball',
    description: '+4000 PTS when scoring an 8+ sided die', // not really implemented yet
    rarity: 'common'
  },
  {
    id: 'hotDiceHero',
    name: 'Hot Dice Hero',
    description: '+100 PTS for each Hot Dice counter when scoring', // so hot dice counter of 3 would give +300 PTS
    rarity: 'common'
  },
  {
    id: 'sureShot',
    name: 'Sure Shot',
    description: '+1 reroll and +100 points when rolling no scoring combinations',
    rarity: 'common'
  },
  {
    id: 'flopStrategist',
    name: 'Flop Strategist',
    description: '+100 points for flopping with remaining reroll(s)',
    rarity: 'common'
  },
  {
    id: 'pipCollector',
    name: 'Pip Collector',
    description: '+100 points for each die with a pip effect in the scoring selection',
    rarity: 'common'
  },
  {
    id: 'digitalNomad',
    name: 'Digital Nomad',
    description: '+$10 when completing a world (every 5 levels)',
    rarity: 'common'
  },
  {
    id: 'frequentFlyer',
    name: 'Frequent Flyer',
    description: '+2 banks',
    rarity: 'common'
  },
  {
    id: 'hoarder',
    name: 'Hoarder',
    description: '+100 points for each die in your set',
    rarity: 'common'
  },
  {
    id: 'comebackKid',
    name: 'Comeback Kid',
    description: '+3 rerolls',
    rarity: 'common'
  },
  {
    id: 'savingGrace',
    name: 'Saving Grace',
    description: '50% chance to prevent all flops',
    rarity: 'common'
  },
  {
    id: 'primeTime',
    name: 'Prime Time',
    description: '2x multiplier when scoring only prime numbers (2, 3, 5, 7, etc.)',
    rarity: 'common'
  },
  {
    id: 'luckyLeprechaun',
    name: 'Lucky Leprechaun',
    description: '+$2 when scoring a combination worth 1000+ points',
    rarity: 'common'
  },
  {
    id: 'fourForYourFavor',
    name: 'Four For Your Favor',
    description: '+600 points when scoring four-of-a-kind',
    rarity: 'common'
  },
  {
    id: 'fiveAlive',
    name: 'Five Alive',
    description: '+800 points when scoring five-of-a-kind',
    rarity: 'common'
  },
  {
    id: 'sixShooter',
    name: 'Six Shooter',
    description: '+1000 points when scoring six-of-a-kind',
    rarity: 'common'
  },
  {
    id: 'hotPocket',
    name: 'Hot Pocket',
    description: '2x multiplier when hot dice counter is 2 or higher',
    rarity: 'common'
  },
  {
    id: 'wildCard',
    name: 'Wild Card',
    description: '+250 points for each wild pip effect in the scoring selection',
    rarity: 'common'
  },
  {
    id: 'doubleAgent',
    name: 'Double Agent',
    description: 'Doubles rerolls at the start of the level',
    rarity: 'common'
  },
  {
    id: 'botox',
    name: 'Botox',
    description: '+0.5 EXP when scoring only plastic dice',
    rarity: 'common'
  },


  // UNCOMMON CHARMS
  
  {
    id: 'quadBoosters',
    name: 'Quad Boosters',
    description: '3x MLT if scored dice include four of the same value',
    rarity: 'uncommon'
  },
  {
    id: 'snowball',
    name: 'Snowball',
    description: 'Multiplies level score by 1.15x when banking points', // this affects banked points, not round scores
    rarity: 'uncommon'
  },
  {
    id: 'rabbitsFoot',
    name: "Rabbit's Foot",
    description: '+0.1x MLT per successful Rainbow die effect triggered (Currently: 1x)',
    rarity: 'uncommon'
  },
  {
    id: 'weightedDice',
    name: 'Weighted Dice',
    description: 'Doubles probability of all chance-based effects (e.g., Rainbow dice)',
    rarity: 'uncommon'
  },
  {
    id: 'luckySevens',
    name: 'Lucky Sevens',
    description: '+777 points if at least one 7 is scored',
    rarity: 'uncommon'
  },
  {
    id: 'tasteTheRainbow',
    name: 'Taste the Rainbow',
    description: '+300 points if all rolled dice have unique materials',
    rarity: 'uncommon'
  },
  {
    id: 'swordInTheStone',
    name: 'Sword in the Stone',
    description: 'Allows Hot Dice to trigger with Lead dice',
    rarity: 'uncommon'
  },
  {
    id: 'irrational',
    name: 'Irrational',
    description: '3.1415x multiplier if scored hand contains 1,3,4,5',
    rarity: 'uncommon'
  },
  {
    id: 'hedgeFund',
    name: 'Hedge Fund',
    description: '+1x MLT for every $100 owned',
    rarity: 'uncommon'
  },
  {
    id: 'luckyLotus',
    name: 'Lucky Lotus',
    description: '+$4 when scoring a combination worth 3000+ points',
    rarity: 'uncommon'
  },
  {
    id: 'whimWhisperer',
    name: 'Whim Whisperer',
    description: 'Whims have a 25% chance to not be consumed when used',
    rarity: 'uncommon'
  },
  {
    id: 'assassin',
    name: 'Assassin',
    description: '+1 MLT for each die destroyed (Currently: 1x)',
    rarity: 'uncommon'
  },
  {
    id: 'againstTheGrain',
    name: 'Against the Grain',
    description: '+100 points when scoring a straight, pyramid, or n=3+ pairs with a mirror die',
    rarity: 'uncommon'
  },
  {
    id: '',
    name: '',
    description: 'for each scored 1',
    rarity: 'uncommon'
  },
  {
    id: 'jefferson',
    name: 'Jefferson',
    description: '+$2 and -200 PTS for each scored 2',
    rarity: 'uncommon'
  },
  {
    id: '',
    name: '',
    description: 'for each scored 3',
    rarity: 'uncommon'
  },
  {
    id: '',
    name: '',
    description: 'for each scored 4',
    rarity: 'uncommon'
  },
  {
    id: '',
    name: '',
    description: 'for each scored 5',
    rarity: 'uncommon'
  },
  {
    id: '',
    name: '',
    description: 'for each scored 6',
    rarity: 'uncommon'
  },
  {
    id: 'shootingStar',
    name: 'Shooting Star',
    description: 'Using a whim has a 10% chance to create a random wish',
    rarity: 'uncommon'
  },
  {
    id: 'blankSlate',
    name: 'Blank Slate',
    description: 'Blank pip effects give ^1.5 EXP instead of ^1.1',
    rarity: 'uncommon'
  },
  {
    id: 'bodyDouble',
    name: 'Body Double',
    description: '+1 to Hot Dice counter when triggering Hot Dice with an unscored Ghost Die',
    rarity: 'uncommon'
  },
  {
    id: 'inheritance',
    name: 'Inheritance',
    description: 'One Rainbow effect guaranteed per Rainbow die scored',
    rarity: 'uncommon'
  },
  {
    id: 'sizeMatters',
    name: 'Size Matters',
    description: 'Multiplier based on die size: 6 faces = 1x, below 6 = -0.5x per size, above 6 = +0.5x per size',
    rarity: 'uncommon'
  },
  {
    id: 'queensGambit',
    name: 'Queen\'s Gambit',
    description: '+3 MLT for each die below set\'s starting size in your full set',
    rarity: 'uncommon'
  },
  {
    id: 'russianRoulette',
    name: 'Russian Roulette',
    description: '^1.25 EXP, but 1 in 6 chance of automatically flopping',
    rarity: 'uncommon'
  },
  {
    id: 'brotherhood',
    name: 'Brotherhood',
    description: '+1.5 MLT for each consecutive level without rerolling or flopping',
    rarity: 'uncommon'
  },
  {
    id: 'purist',
    name: 'Purist',
    description: 'Doubles banks at the start of the level, sets rerolls to 0',
    rarity: 'uncommon'
  },
  {
    id: 'drumpfCard',
    name: 'Drumpf Card',
    description: '50/50 chance to either gain +1.5x or lose -1.5x multiplier for each other charm in inventory (per score)',
    rarity: 'uncommon'
  },


  // RARE CHARMS
  
  {
    id: 'kingslayer',
    name: 'Kingslayer',
    description: '3x multiplier during miniboss and boss levels',
    rarity: 'rare'
  },
  {
    id: 'doubleDown',
    name: 'Double Down',
    description: '2x MLT for each two-faced effect scored',
    rarity: 'rare'
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: '+0.25x MLT for each consecutive time all dice are scored',
    rarity: 'rare'
  },
  { // probably remove, kinda boring
    id: 'divineIntervention',
    name: 'Divine Intervention',
    description: '80% chance to prevent all flops',
    rarity: 'rare'
  },
  {
    id: 'holyGrail',
    name: 'Holy Grail',
    description: '+2x multiplier for each Tier 3 Blessing you own',
    rarity: 'rare'
  },
  {
    id: 'divineFavor',
    name: 'Divine Favor',
    description: '+10 / +100 / +1000 points when banking for each blessing tier 1 / 2 / 3 you own',
    rarity: 'rare'
  },
  {
    id: 'dukeOfDice',
    name: 'Duke of Dice',
    description: '+0.75x MLT for each repeated value on each scored die',
    rarity: 'rare'
  },
  {
    id: 'eyeOfHorus',
    name: 'Eye of Horus',
    description: '+1.5x multiplier for each layer of a scored Pyramid, 0.25x for all other hands',
    rarity: 'rare'
  }, 
  {
    id: 'leadTitan',
    name: 'Lead Titan',
    description: 'Each scored Lead die gives ^1.1 EXP',
    rarity: 'rare'
  },
  {
    id: 'resonance',
    name: 'Resonance',
    description: '1 in 3 chance for crystal dice to bounce off of each other, repeating effect until failure',
    rarity: 'rare'
  },
  {
    id: 'bloom',
    name: 'Bloom',
    description: 'Each flower die scored adds 3 to flower dice counter',
    rarity: 'rare'
  },
  {
    id: 'vesuvius',
    name: 'Vesuvius',
    description: '+0.25 MLT per volcano die × hot dice counter',
    rarity: 'rare'
  },
  {
    id: 'armadilloArmor',
    name: 'Armadillo Armor',
    description: '+1 MLT for each reroll remaining',
    rarity: 'rare'
  },
  {
    id: 'refinery',
    name: 'Refinery',
    description: 'Multiplies round score by 1.25x when using a reroll',
    rarity: 'rare'
  },
  {
    id: 'mustBeThisTallToRide',
    name: 'Must Be This Tall to Ride',
    description: '+2 EXP if current level is 10 or higher',
    rarity: 'rare'
  },
  {
    id: 'sleeperAgent',
    name: 'Sleeper Agent',
    description: 'Copies the effect of the charm to the left after 100 dice have been scored',
    rarity: 'rare'
  },
  {
    id: 'ferrisEuler',
    name: 'Ferris Euler',
    description: '^2.71 EXP if scored hand contains 1,2,7',
    rarity: 'rare'
  },
  // LEGENDARY CHARMS

  {
    id: 'paranoia',
    name: 'Paranoia',
    description: 'Copies the effect of the charm to the left/right of this charm, alternating each roll',
    rarity: 'legendary'
  },
  {
    id: 'matterhorn',
    name: 'Matterhorn',
    description: '+3 EXP',
    rarity: 'legendary'
  },
  {
    id: 'trumpCard',
    name: 'Trump Card',
    description: '+2^n multiplier where n is the highest value scored',
    rarity: 'legendary'
  },

];



// play some combo in a row, gain mult
// disabling boss battles and stuff

