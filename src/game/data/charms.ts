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
  | 'secondChance'
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
  | 'paranoia';

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
    description: 'Creates a random consumable when scoring 3 or more pairs',
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
    description: '2x scoring multiplier, but removes single 1 and single 5 as valid scoring combinations',
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
    description: '+20 points for each pair scored',
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
    description: '+$3 if scored dice includes 6 of one value',
    rarity: 'common'
  },
  {
    id: 'secondChance',
    name: 'Second Chance',
    description: 'Grants one extra reroll per level',
    rarity: 'common'
  },
  {
    id: 'sandbagger',
    name: 'Sandbagger',
    description: '+100 points when flopping (includes prevented flops)',
    rarity: 'common'
  },
  {
    id: 'flowerPower',
    name: 'Flower Power',
    description: '+10 points for each flower die scored in current round',
    rarity: 'common'
  },
  {
    id: 'crystalClear',
    name: 'Crystal Clear',
    description: '+75 points for each crystal die scored',
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
    description: '+100 points when scoring a straight',
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
    description: '+150 points when scoring when no repeated combinations scored in round',
    rarity: 'common'
  },
  {
    id: 'ghostWhisperer',
    name: 'Ghost Whisperer',
    description: '+50 points for each unscored Ghost die; +10 points for each scored Ghost die',
    rarity: 'common'
  },
  {
    id: 'ironFortress',
    name: 'Iron Fortress',
    description: 'Each Lead die gives +15 points when scored',
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
    description: '+5 points when scoring. Add +5 for each bank (cumulative)',
    rarity: 'common'
  },
  {
    id: 'pointPirate',
    name: 'Point Pirate',
    description: '+500 points on first roll score, -10 points per subsequent roll',
    rarity: 'common'
  },
  {
    id: 'solitary',
    name: 'Solitary',
    description: '2x multiplier if no repeated values scored',
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
    description: '+25 points when banking if you have at least one blessing',
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
    description: '+200 points when scoring an 8+ sided die',
    rarity: 'common'
  },
  {
    id: 'hotDiceHero',
    name: 'Hot Dice Hero',
    description: '+100 points for each Hot Dice trigger',
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
    description: '+10 points for each die with a pip effect in the scoring selection',
    rarity: 'common'
  },
  {
    id: 'digitalNomad',
    name: 'Digital Nomad',
    description: '+$10 when completing a world (every 5 levels)',
    rarity: 'common'
  },
  {
    id: 'hoarder',
    name: 'Hoarder',
    description: '+2 banks',
    rarity: 'common'
  },
  {
    id: 'comebackKid',
    name: 'Comeback Kid',
    description: '+3 rerolls',
    rarity: 'common'
  },


  // UNCOMMON CHARMS
  
  {
    id: 'quadBoosters',
    name: 'Quad Boosters',
    description: 'Multiplies score by 3x if scored dice include 4 of the same value',
    rarity: 'uncommon'
  },
  {
    id: 'snowball',
    name: 'Snowball',
    description: 'Multiplies level score by 1.15x when banking points',
    rarity: 'uncommon'
  },
  {
    id: 'rabbitsFoot',
    name: "Rabbit's Foot",
    description: 'Score multiplier based on number of successful Rainbow die effect triggers.',
    rarity: 'uncommon'
  },
  {
    id: 'weightedDice',
    name: 'Weighted Dice',
    description: 'Doubles probability of all chance-based effects (e.g., Rainbow dice, Lucky Token).',
    rarity: 'uncommon'
  },
  {
    id: 'luckySevens',
    name: 'Lucky Sevens',
    description: '+77 points if at least one 7 is rolled',
    rarity: 'uncommon'
  },
  {
    id: 'savingGrace',
    name: 'Saving Grace',
    description: '50% chance to prevent all flops',
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
    description: 'Hot Dice triggers if all dice (including Lead) are scored',
    rarity: 'uncommon'
  },
  {
    id: 'primeTime',
    name: 'Prime Time',
    description: '2x multiplier when scoring only prime numbers (2, 3, 5, 7, etc.)',
    rarity: 'uncommon'
  },
  {
    id: 'luckyLeprechaun',
    name: 'Lucky Leprechaun',
    description: '+$2 when scoring a combination worth 1000+ points',
    rarity: 'uncommon'
  },
  {
    id: 'irrational',
    name: 'Irrational',
    description: '3.1415x multiplier if scored hand contains 1,1,3,4,5',
    rarity: 'uncommon'
  },
  {
    id: 'ferrisEuler',
    name: 'Ferris Euler',
    description: '2.71x multiplier if scored hand contains 1,2,7',
    rarity: 'uncommon'
  },
  {
    id: 'fourForYourFavor',
    name: 'Four For Your Favor',
    description: '+40 points when scoring four-of-a-kind',
    rarity: 'uncommon'
  },
  {
    id: 'fiveAlive',
    name: 'Five Alive',
    description: '+50 points when scoring five-of-a-kind',
    rarity: 'uncommon'
  },
  {
    id: 'sixShooter',
    name: 'Six Shooter',
    description: '+60 points when scoring six-of-a-kind',
    rarity: 'uncommon'
  },
  {
    id: 'hedgeFund',
    name: 'Hedge Fund',
    description: '+1x multiplier for every $100 owned',
    rarity: 'uncommon'
  },
  {
    id: 'luckyLotus',
    name: 'Lucky Lotus',
    description: '+$4 when scoring a combination worth 3000+ points',
    rarity: 'uncommon'
  },
  {
    id: 'hotPocket',
    name: 'Hot Pocket',
    description: '2x multiplier when hot dice counter is 2 or higher',
    rarity: 'uncommon'
  },
  {
    id: 'wildCard',
    name: 'Wild Card',
    description: '+25 points for each wild pip effect in the scoring selection',
    rarity: 'uncommon'
  },
  {
    id: 'whimWhisperer',
    name: 'Whim Whisperer',
    description: 'Whims have a 25% chance to not be consumed when used',
    rarity: 'uncommon'
  },
  {
    id: 'doubleAgent',
    name: 'Double Agent',
    description: 'Doubles rerolls',
    rarity: 'uncommon'
  },
  {
    id: 'purist',
    name: 'Purist',
    description: 'Doubles banks, sets rerolls to 0',
    rarity: 'uncommon'
  },


  // RARE CHARMS
  
  {
    id: 'shootingStar',
    name: 'Shooting Star',
    description: 'Using a whim has a 10% chance to create a random wish',
    rarity: 'rare'
  },
  {
    id: 'kingslayer',
    name: 'Kingslayer',
    description: '3x multiplier during miniboss and boss levels',
    rarity: 'rare'
  },
  {
    id: 'blankSlate',
    name: 'Blank Slate',
    description: 'Blank pip effects give ^1.25 multiplier instead of ^1.1',
    rarity: 'rare'
  },
  {
    id: 'doubleDown',
    name: 'Double Down',
    description: '2x multiplier if a two-faced side is scored',
    rarity: 'rare'
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: '+0.25x multiplier for each consecutive time all dice are scored',
    rarity: 'rare'
  },
  {
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
    description: '+0.75x multiplier for each repeated value on each scored die',
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
    description: 'If at least one Lead die is scored, all scored dice remain in hand',
    rarity: 'rare'
  },
  {
    id: 'bodyDouble',
    name: 'Body Double',
    description: '+1 to Hot Dice counter when getting Hot Dice with an unscored Ghost Die',
    rarity: 'rare'
  },
  {
    id: 'inheritance',
    name: 'Inheritance',
    description: 'One Rainbow effect guaranteed per Rainbow die scored',
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
    id: 'sizeMatters',
    name: 'Size Matters',
    description: 'Multiplier based on die size: 6 faces = 1x, below 6 = -0.5x per size, above 6 = +0.5x per size',
    rarity: 'rare'
  },
  {
    id: 'vesuvius',
    name: 'Vesuvius',
    description: '+0.25x multiplier per volcano die × hot dice counter',
    rarity: 'rare'
  },
  {
    id: 'armadilloArmor',
    name: 'Armadillo Armor',
    description: '+1x multiplier for each reroll remaining',
    rarity: 'rare'
  },
  {
    id: 'queensGambit',
    name: 'Queen\'s Gambit',
    description: '+1x multiplier for each die below set\'s starting size in your full set',
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
    description: 'Copies the effect of the charm to the left if current level is 10 or higher',
    rarity: 'rare'
  },
  {
    id: 'russianRoulette',
    name: 'Russian Roulette',
    description: '^1.25 exponent, but 1 in 6 chance of automatically flopping',
    rarity: 'rare'
  },
  {
    id: 'paranoia',
    name: 'Paranoia',
    description: 'Copies the effect of the charm to the left/right of this charm, alternating each roll',
    rarity: 'legendary'
  },

];



// doubles rerolls
// play some combo in a row, gain mult
// disabling boss battles and stuff

// activation required, e.g. activates after level 20, after rerolling 100 times, etc.
// sleeper agent

/* 
Implemented but then didn't make sense? Rounds without flopping is just banks
  id: 'pennyPincher',
  name: 'Penny Pincher',
  description: '+$1 for each round completed without flopping',
  rarity: 'common'
*/