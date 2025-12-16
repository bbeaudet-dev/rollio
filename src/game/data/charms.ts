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
  | 'savingGrace'
  | 'primeTime'
  | 'luckyLeprechaun'
  | 'fourForYourFavor'
  | 'fiveAlive'
  | 'sixShooter'
  | 'hotPocket'
  | 'wildCard'
  | 'doubleAgent'
  | 'botox'
  | 'ticketEater'

  // Uncommon charms 
  | 'quadBoosters'
  | 'snowball'
  | 'rabbitsFoot'
  | 'weightedDice'
  | 'luckySevens'
  | 'tasteTheRainbow'
  | 'swordInTheStone'
  | 'irrational'
  | 'luckyLotus'
  | 'whimWhisperer'
  | 'assassin'
  | 'againstTheGrain'
  | 'aceInTheHole'
  | 'jefferson'
  | 'ruleOfThree'
  | 'quarterback'
  | 'cincoDeRollio'
  | 'hex'
  | 'battingTheCycle'
  | 'shootingStar'
  | 'blankSlate'
  | 'bodyDouble'
  | 'inheritance'
  | 'sizeMatters'
  | 'queensGambit'
  | 'russianRoulette'
  | 'brotherhood'
  | 'purist'
  | 'drumpfCard'

  // Rare charms
  | 'kingslayer'
  | 'doubleDown'
  | 'perfectionist'
  | 'divineIntervention'
  | 'holyGrail'
  | 'divineFavor'
  | 'dukeOfDice'
  | 'eyeOfHorus'
  | 'leadTitan'
  | 'resonance'
  | 'bloom'
  | 'vesuvius'
  | 'armadilloArmor'
  | 'refinery'
  | 'mustBeThisTallToRide'
  | 'ferrisEuler'
  | 'howlAtTheMoon'
  | 'lunarTides'

  // Legendary charms 
  | 'paranoia'
  | 'matterhorn'
  | 'trumpCard'
  | 'hedgeFund'
  | 'sleeperAgent';

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
    description: 'Prevents three {Flops}, breaks on final use (Remaining: [3])',
    rarity: 'common'
  },
  {
    id: 'stairstepper',
    name: 'Stairstepper',
    description: 'Increment +40 PTS per {Straight} played (Current: +[40] PTS)',
    rarity: 'common'
  },
  {
    id: 'generator',
    name: 'Generator',
    description: 'Creates a random Consumable when scoring a {generatorCategory} combination',
    rarity: 'common'
  },
  {
    id: 'oddsAndEnds',
    name: 'Odds and Ends',
    description: '+50 PTS per odd value scored',
    rarity: 'common'
  },
  {
    id: 'nowWereEven',
    name: 'Now We\'re Even',
    description: '+300 PTS if all selected dice are even',
    rarity: 'common'
  },
  {
    id: 'moneyMagnet',
    name: 'Money Magnet',
    description: '+5 PTS for every $1 you have (Current: +[] PTS)',
    rarity: 'common'
  },
  {
    id: 'highStakes',
    name: 'High Stakes',
    description: '2x MLT, but removes Singles as valid scoring combinations',
    rarity: 'common'
  },
  {
    id: 'lowHangingFruit',
    name: 'Low Hanging Fruit',
    description: 'Allows single 3s to be scored as valid combinations (worth 25 PTS)',
    rarity: 'common'
  },
  {
    id: 'ninetyEightPercentAPlus',
    name: '98% A+',
    description: '+98 PTS if scored dice includes a {Pair}',
    rarity: 'common'
  },
  {
    id: 'oddOdyssey',
    name: 'Odd Odyssey',
    description: 'Increment +5 PTS for each odd value scored (Current: +[5] PTS)',
    rarity: 'common'
  },
  {
    id: 'pairUp',
    name: 'Pair Up',
    description: '+0.5 MLT for each {Pair} scored',
    rarity: 'common'
  },
  {
    id: 'tripleThreat',
    name: 'Triple Play',
    description: '+250 PTS for each 3 of a Kind scored',
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
    description: 'Each {Flop} increments this charm by +50 PTS (Current: +[50] PTS)',
    rarity: 'common'
  },
  {
    id: 'flowerPower',
    name: 'Flower Power',
    description: '+100 PTS for each Flower die scored in current {Round}',
    rarity: 'common'
  },
  {
    id: 'crystalClear',
    name: 'Crystal Clear',
    description: '+150 PTS for each Crystal die scored',
    rarity: 'common'
  },
  {
    id: 'goldenTouch',
    name: 'Golden Touch',
    description: '+$2 for each Golden die scored',
    rarity: 'common'
  },
  {
    id: 'straightShooter',
    name: 'Straight Shooter',
    description: '+2 MLT when scoring a {Straight}',
    rarity: 'common'
  },
  {
    id: 'longshot',
    name: 'Longshot',
    description: '+1000 PTS when scoring a {Straight} of 6 or longer',
    rarity: 'common'
  },
  {
    id: 'roundRobin',
    name: 'Round Robin',
    description: '+750 PTS when scoring if no repeated combinations are scored in {Round}',
    rarity: 'common'
  },
  {
    id: 'ghostWhisperer',
    name: 'Ghost Whisperer',
    description: '+50 PTS for each scored Ghost die; +250 PTS for each unscored Ghost die',
    rarity: 'common'
  },
  {
    id: 'ironFortress',
    name: 'Iron Fortress',
    description: 'If at least 2 Lead dice are scored, all scored dice remain in hand',
    rarity: 'common'
  },
  {
    id: 'rerollRanger',
    name: 'Reroll Ranger',
    description: 'Increment +0.05 MLT for each {Reroll} used (Current: +[0.05] MLT)',
    rarity: 'common'
  },
  {
    id: 'bankBaron',
    name: 'Bank Baron',
    description: 'Increment +0.1 MLT for each {Bank} (Current: +[0.1] MLT)',
    rarity: 'common'
  },
  {
    id: 'pointPirate',
    name: 'Point Pirate',
    description: '+2000 PTS on first score of the {Level}, -100 PTS on all other scores',
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
    description: '+$5 for completing a {Level} with a single {Bank}',
    rarity: 'common'
  },
  {
    id: 'blessed',
    name: 'Blessed',
    description: '+100 PTS when {Banking} for each Blessing you own',
    rarity: 'common'
  },
  {
    id: 'blessYou',
    name: 'Bless You',
    description: '25% of forfeited points recovered when {Flopping}',
    rarity: 'common'
  },
  {
    id: 'angelInvestor',
    name: 'Angel Investor',
    description: '+$1 for each {Flop}',
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
    description: '+1 {Reroll} and +100 PTS when rolling no scoring combinations',
    rarity: 'common'
  },
  {
    id: 'flopStrategist',
    name: 'Flop Strategist',
    description: '+100 PTS for {Flopping} with remaining {Rerolls}',
    rarity: 'common'
  },
  {
    id: 'pipCollector',
    name: 'Pip Collector',
    description: '+100 PTS for each die with a pip effect in the scoring selection',
    rarity: 'common'
  },
  {
    id: 'digitalNomad',
    name: 'Digital Nomad',
    description: '+$10 when completing a {World} (every 5 {Levels})',
    rarity: 'common'
  },
  {
    id: 'frequentFlyer',
    name: 'Frequent Flyer',
    description: '+2 {Banks}',
    rarity: 'common'
  },
  {
    id: 'hoarder',
    name: 'Hoarder',
    description: '+50 PTS for each die in your set',
    rarity: 'common'
  },
  {
    id: 'comebackKid',
    name: 'Comeback Kid',
    description: '+3 {Rerolls}',
    rarity: 'common'
  },
  {
    id: 'savingGrace',
    name: 'Saving Grace',
    description: '50% chance to prevent all {Flops}',
    rarity: 'common'
  },
  {
    id: 'primeTime',
    name: 'Prime Time',
    description: '2x MLT when scoring only prime numbers (2, 3, 5, 7, etc.)',
    rarity: 'common'
  },
  {
    id: 'luckyLeprechaun',
    name: 'Lucky Leprechaun',
    description: '+$2 when scoring a combination worth 1000+ PTS',
    rarity: 'common'
  },
  {
    id: 'fourForYourFavor',
    name: 'Four For Your Favor',
    description: '+600 PTS when scoring Four of a Kind',
    rarity: 'common'
  },
  {
    id: 'fiveAlive',
    name: 'Five Alive',
    description: '+800 PTS when scoring Five of a Kind',
    rarity: 'common'
  },
  {
    id: 'sixShooter',
    name: 'Six Shooter',
    description: '+1000 PTS when scoring Six of a Kind',
    rarity: 'common'
  },
  {
    id: 'hotPocket',
    name: 'Hot Pocket',
    description: '+0.5 EXP when Hot Dice counter is 2 or higher',
    rarity: 'common'
  },
  {
    id: 'wildCard',
    name: 'Wild Card',
    description: '+1 MLT for each Wild pip effect in the scoring selection',
    rarity: 'common'
  },
  {
    id: 'doubleAgent',
    name: 'Double Agent',
    description: 'Doubles {Rerolls} at the start of the {Level}',
    rarity: 'common'
  },
  {
    id: 'botox',
    name: 'Botox',
    description: '+2 MLT when scoring only Plastic dice',
    rarity: 'common'
  },


  // UNCOMMON CHARMS
  
  {
    id: 'quadBoosters',
    name: 'Quad Boosters',
    description: '3x MLT if scored dice include Four of a Kind',
    rarity: 'uncommon'
  },
  {
    id: 'snowball',
    name: 'Snowball',
    description: 'Multiplies Banked points by 1.15x when {Banking}', // this affects banked points, not round scores
    rarity: 'uncommon'
  },
  {
    id: 'rabbitsFoot',
    name: "Rabbit's Foot",
    description: '+0.1 MLT per successful Rainbow die effect triggered (Current: +[0.0] MLT)',
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
    description: '+777 PTS if at least one 7 is scored',
    rarity: 'uncommon'
  },
  {
    id: 'tasteTheRainbow',
    name: 'Taste the Rainbow',
    description: '+500 PTS, +5 MLT, and +0.5 EXP if all rolled dice have unique materials',
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
    description: '3.1415x MLT if scored hand contains 1,3,4,5',
    rarity: 'uncommon'
  },
  {
    id: 'luckyLotus',
    name: 'Lucky Lotus',
    description: '+$4 when scoring a combination worth 3000+ PTS',
    rarity: 'uncommon'
  },
  {
    id: 'whimWhisperer',
    name: 'Antimatter',
    description: 'Consumables have a 15% chance to not be consumed when used',
    rarity: 'uncommon'
  },
  {
    id: 'assassin',
    name: 'Assassin',
    description: '+1 MLT for each die destroyed (Current: +[0] MLT)',
    rarity: 'uncommon'
  },
  {
    id: 'againstTheGrain',
    name: 'Against the Grain',
    description: '+100 PTS when scoring a Straight, Pyramid, or n=3+ Pairs with a mirror die',
    rarity: 'uncommon'
  },
  {
    id: 'aceInTheHole',
    name: 'Ace in the Hole',
    description: '+1 MLT for each scored 1',
    rarity: 'uncommon'
  },
  {
    id: 'jefferson',
    name: 'Jefferson',
    description: '+$2 and -200 PTS for each scored 2',
    rarity: 'uncommon'
  },
  {
    id: 'ruleOfThree',
    name: 'Rule of Three',
    description: '+300 PTS for each scored 3',
    rarity: 'uncommon'
  },
  {
    id: 'quarterback',
    name: 'Quarterback',
    description: '+0.25 EXP for each scored 4',
    rarity: 'uncommon'
  },
  {
    id: 'cincoDeRollio',
    name: 'Cinco de Rollio',
    description: '+55 PTS, +0.5 MLT, and +0.05 EXP for each scored 5',
    rarity: 'uncommon'
  },
  {
    id: 'hex',
    name: 'Hex',
    description: '50/50 chance for each scored 6 to give +666 PTS or -666 PTS',
    rarity: 'uncommon'
  },
  {
    id: 'battingTheCycle',
    name: 'Batting the Cycle',
    description: '+4 MLT once a 1, 2, 3, and 4 have been scored in the Round',
    rarity: 'uncommon'
  },
  {
    id: 'shootingStar',
    name: 'Shooting Star',
    description: 'Using a consumable has a 10% chance to create a rare consumable',
    rarity: 'uncommon'
  },
  {
    id: 'blankSlate',
    name: 'Blank Slate',
    description: 'Blank pip effects give ^1.5 EXP instead of ^1.1 EXP',
    rarity: 'uncommon'
  },
  {
    id: 'bodyDouble',
    name: 'Body Double',
    description: '+1 to Hot Dice counter when triggering Hot Dice with an unscored Ghost die',
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
    description: 'Multiplier based on die size: 6 faces = 1x, below 6 = -0.5 MLT per size, above 6 = +0.5 MLT per size',
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
    description: '^EXP, but 1 in 6 chance of automatically {Flopping}',
    rarity: 'uncommon'
  },
  {
    id: 'brotherhood',
    name: 'Brotherhood',
    description: '+1.5 MLT for each consecutive {Level} without {Rerolling} or {Flopping} (Current: +[0.0] MLT)',
    rarity: 'uncommon'
  },
  {
    id: 'purist',
    name: 'Purist',
    description: 'Doubles {Banks} at the start of the {Level}, sets {Rerolls} to 0',
    rarity: 'uncommon'
  },
  {
    id: 'drumpfCard',
    name: 'Drumpf Card',
    description: '50/50 chance for either +1.5 MLT or -1.5 MLT for each other Charm in inventory',
    rarity: 'uncommon'
  },
  
  
  // RARE CHARMS
  
  {
    id: 'kingslayer',
    name: 'Kingslayer',
    description: '^3 MLT during miniboss and boss {Levels}',
    rarity: 'rare'
  },
  {
    id: 'doubleDown',
    name: 'Double Down',
    description: '2x MLT for each Two-Faced effect scored',
    rarity: 'rare'
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: '+0.25 MLT for each consecutive time all dice are scored (Current: +[0.00] MLT)',
    rarity: 'rare'
  },
  { // probably remove, kinda boring
    id: 'divineIntervention',
    name: 'Divine Intervention',
    description: '80% chance to prevent all {Flops}',
    rarity: 'rare'
  },
  {
    id: 'holyGrail',
    name: 'Holy Grail',
    description: '+2 MLT for each Tier 3 Blessing you own',
    rarity: 'rare'
  },
  {
    id: 'divineFavor',
    name: 'Divine Favor',
    description: '+10 PTS / +100 PTS / +1000 PTS when {Banking} for each Blessing Tier 1 / 2 / 3 you own',
    rarity: 'rare'
  },
  {
    id: 'dukeOfDice',
    name: 'Duke of Dice',
    description: '+0.75 MLT for each repeated value on each scored die',
    rarity: 'rare'
  },
  {
    id: 'eyeOfHorus',
    name: 'Eye of Horus',
    description: '+1.5 MLT for each layer of a scored Pyramid, 0.25x MLT for all other hands',
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
    description: '1 in 3 chance for Crystal dice to bounce off of each other, repeating effect until failure',
    rarity: 'rare'
  },
  {
    id: 'bloom',
    name: 'Bloom',
    description: 'Each Flower die scored adds 3 to Flower dice counter',
    rarity: 'rare'
  },
  {
    id: 'vesuvius',
    name: 'Vesuvius',
    description: '+0.25 MLT per Volcano die × Hot Dice counter',
    rarity: 'rare'
  },
  {
    id: 'armadilloArmor',
    name: 'Armadillo Armor',
    description: '+1 MLT for each {Reroll} remaining',
    rarity: 'rare'
  },
  {
    id: 'refinery',
    name: 'Refinery',
    description: 'Multiplies {Round} score by 1.25x when using a {Reroll}',
    rarity: 'rare'
  },
  {
    id: 'mustBeThisTallToRide',
    name: 'Must Be This Tall to Ride',
    description: '+2 EXP if current {Level} is 10 or higher',
    rarity: 'rare'
  },
  {
    id: 'ferrisEuler',
    name: 'Ferris Euler',
    description: '^2.71 EXP if scored hand contains 1,2,7',
    rarity: 'rare'
  },
  {
    id: 'howlAtTheMoon',
    name: 'Howl at the Moon',
    description: 'Lunar dice retrigger their effects 2 additional times',
    rarity: 'rare'
  },
  {
    id: 'lunarTides',
    name: 'Lunar Tides',
    description: 'Each Lunar trigger gives 1.25x MLT',
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
    description: '+1.5^n MLT where n is the highest value scored',
    rarity: 'legendary'
  },
  {
    id: 'hedgeFund',
    name: 'Hedge Fund',
    description: '+1 EXP for every $100 owned',
    rarity: 'legendary'
  },
  {
    id: 'sleeperAgent',
    name: 'Sleeper Agent',
    description: 'Copies the effect of the charm to the left after 100 dice have been scored (Remaining: [100])',
    rarity: 'legendary'
  },
];
