import { Charm, CharmRarity } from '../types';

export type CharmType = 
  | 'flopShield'
  | 'scoreMultiplier' 
  | 'fourOfAKindBooster'
  | 'volcanoAmplifier'
  | 'straightCollector'
  | 'roundMultiplier'
  | 'consumableGenerator'
  | 'oddCollector'
  | 'evenPerfection'
  | 'moneyMagnet'
  | 'sizeMatters'
  | 'rabbitsFoot'
  | 'weightedDice'
  | 'highStakes'
  | 'lowHangingFruit'
  // New charms
  | 'diceDoubler'
  | 'sequentialSurge'
  | 'luckySeven'
  | 'evenFlow'
  | 'oddOdyssey'
  | 'primeTime'
  | 'tripleThreat'
  | 'mirrorMatch'
  | 'ascendingAce'
  | 'descendingDynamo'
  | 'roundRobin'
  | 'fullHouseBonus'
  | 'straightShooter'
  | 'fourOfAKindBonus'
  | 'fiveAlive'
  | 'sixShooter'
  | 'pairUp'
  | 'triplePlay'
  | 'quadQuest'
  | 'quintupleCrown'
  | 'levelLeap'
  | 'flawlessFinish'
  | 'speedster'
  | 'comboKing'
  | 'riskTaker'
  | 'perfectionist'
  | 'comebackKid'
  | 'steadyHand'
  | 'highRoller'
  | 'lowRoller'
  | 'coinCollector'
  | 'treasureTrove'
  | 'pennyPincher'
  | 'dimeDozen'
  | 'quarterQuest'
  | 'halfDollar'
  | 'dollarDash'
  | 'bankersBonus'
  | 'investorsInsight'
  | 'jackpotJoy'
  | 'safetyNet'
  | 'secondChance'
  | 'guardianAngel'
  | 'luckyCharm'
  | 'resilientRoller'
  | 'bounceBack'
  | 'sureShot'
  | 'flopInsurance'
  | 'flopFortune'
  | 'flopFighter'
  | 'flopMaster'
  | 'flopSurvivor'
  | 'flopStrategist'
  | 'flopResistor'
  | 'flopExpert'
  | 'flopNavigator'
  | 'flopCommander'
  | 'flopConqueror'
  | 'woodenWonder'
  | 'crystalClear'
  | 'metallicMight'
  | 'stoneStrength'
  | 'glassGuardian'
  | 'obsidianObelisk'
  | 'marbleMarvel'
  | 'goldGlimmer'
  | 'silverShine'
  | 'doubleDip'
  | 'tripleTrouble'
  | 'quadrupleQuake'
  | 'straightFlush'
  | 'pairParade'
  | 'tripletTriumph'
  | 'hotDiceHero'
  | 'hotDiceMaven'
  | 'hotDiceVeteran'
  | 'hotDiceLegend'
  | 'rerollRanger'
  | 'rerollRogue'
  | 'rerollRoyal'
  | 'bankBaron'
  | 'bankBaroness'
  | 'levelLord'
  | 'levelLady'
  | 'pointPirate'
  | 'pointPrincess'
  | 'diceDuke'
  | 'diceDuchess'
  | 'fortuneFinder'
  | 'fortuneFavor'
  | 'luckyLeprechaun'
  | 'luckyLotus'
  | 'mysticMagnet'
  | 'mysticMoon'
  | 'crystalCrown'
  | 'volcanoVanguard'
  | 'rainbowRider'
  | 'mirrorMage'
  | 'goldenGuard'
  | 'woodenWarden'
  | 'dollarDash'
  | 'sureShot'
  | 'flopInsurance'
  | 'flopExpert'
  | 'silverShine'
  | 'obsidianObelisk'
  | 'marbleMarvel'
  | 'quadrupleQuake'
  | 'hotDiceMaven'
  | 'rerollRoyal'
  | 'levelLord'
  | 'flopCommander'
  | 'flopConqueror'
  | 'flawlessFinish'
  | 'speedster'
  | 'riskTaker'
  | 'perfectionist'
  | 'comebackKid'
  | 'steadyHand'
  | 'highRoller'
  | 'lowRoller'
  | 'investorsInsight'
  | 'jackpotJoy'
  | 'flopStrategist'
  | 'hotDiceVeteran'
  | 'hotDiceLegend'
  | 'flopMasterSupreme';

// Rarity price mapping
export const CHARM_PRICES: Record<string, { buy: number; sell: number }> = {
  legendary: { buy: 10, sell: 5 },
  rare: { buy: 8, sell: 4 },
  uncommon: { buy: 6, sell: 3 },
  common: { buy: 4, sell: 2 },
};

export const CHARMS: Omit<Charm, 'active'>[] = [
  // ========== EXISTING CHARMS (15) ==========
  {
    id: 'flopShield',
    name: 'Flop Shield',
    description: 'Prevents three flops (breaks on final use)',
    rarity: 'common'
  },
  {
    id: 'scoreMultiplier',
    name: 'Score Multiplier',
    description: 'Multiplies all scored roll points by 1.25x',
    rarity: 'uncommon'
  },
  {
    id: 'fourOfAKindBooster',
    name: 'Four-of-a-Kind Booster',
    description: 'Multiplies 4+ of a kind scoring by 2.0x',
    rarity: 'rare'
  },
  {
    id: 'volcanoAmplifier',
    name: 'Volcano Amplifier',
    description: '+0.5x multiplier per volcano die × hot dice counter',
    rarity: 'legendary'
  },
  {
    id: 'straightCollector',
    name: 'Straight Collector',
    description: '+20 score per straight played (cumulative)',
    rarity: 'uncommon'
  },
  {
    id: 'roundMultiplier',
    name: 'Round Multiplier',
    description: 'Multiplies round score by 1.25x when banking points',
    rarity: 'rare'
  },
  {
    id: 'consumableGenerator',
    name: 'Consumable Generator',
    description: 'Creates a random consumable when scoring 4+ of a digit',
    rarity: 'legendary'
  },
  {
    id: 'oddCollector',
    name: 'Odd Collector',
    description: '+15 points for each odd number in the selected dice',
    rarity: 'uncommon'
  },
  {
    id: 'evenPerfection',
    name: 'Even Perfection',
    description: 'If all selected dice are even, gain +300 points',
    rarity: 'rare'
  },
  {
    id: 'moneyMagnet',
    name: 'Money Magnet',
    description: '+5 points for every $1 you have',
    rarity: 'common'
  },
  {
    id: 'sizeMatters',
    name: 'Size Matters',
    description: 'Multiplier based on die size: 6 faces = 1x, below 6 = -0.5x per size, above 6 = +0.5x per size',
    rarity: 'rare'
  },
  {
    id: 'rabbitsFoot',
    name: "Rabbit's Foot",
    description: 'Score multiplier based on number of successful Rainbow die effect triggers.',
    rarity: 'legendary'
  },
  {
    id: 'weightedDice',
    name: 'Weighted Dice',
    description: 'Doubles probability of all chance-based effects (e.g., Rainbow dice, Lucky Token).',
    rarity: 'rare'
  },
  {
    id: 'highStakes',
    name: 'High Stakes',
    description: '3x scoring multiplier, but removes single 1 and single 5 as valid scoring combinations',
    rarity: 'legendary'
  },
  {
    id: 'lowHangingFruit',
    name: 'Low Hanging Fruit',
    description: 'Allows single 3s to be scored as valid combinations (worth 25 points each)',
    rarity: 'rare'
  },

  // ========== COMMON CHARMS (30 new, 45 total) ==========
  {
    id: 'diceDoubler',
    name: 'Dice Doubler',
    description: '+10 points when rolling two identical numbers',
    rarity: 'common'
  },
  {
    id: 'luckySeven',
    name: 'Lucky Seven',
    description: '+7 points when any die shows 7 (if using 7+ sided dice)',
    rarity: 'common'
  },
  {
    id: 'evenFlow',
    name: 'Even Flow',
    description: '+5 points for each even number rolled',
    rarity: 'common'
  },
  {
    id: 'oddOdyssey',
    name: 'Odd Odyssey',
    description: '+5 points for each odd number rolled',
    rarity: 'common'
  },
  {
    id: 'pairUp',
    name: 'Pair Up',
    description: '+10 points for each pair in the roll',
    rarity: 'common'
  },
  {
    id: 'triplePlay',
    name: 'Triple Play',
    description: '+15 points for each three-of-a-kind in the roll',
    rarity: 'common'
  },
  {
    id: 'coinCollector',
    name: 'Coin Collector',
    description: '+$1 for each round completed without flopping',
    rarity: 'common'
  },
  {
    id: 'pennyPincher',
    name: 'Penny Pincher',
    description: '+$2 for each pair scored',
    rarity: 'common'
  },
  {
    id: 'dimeDozen',
    name: 'Dime Dozen',
    description: '+$3 for each three-of-a-kind scored',
    rarity: 'common'
  },
  {
    id: 'safetyNet',
    name: 'Safety Net',
    description: 'Prevents one flop per level (single use)',
    rarity: 'common'
  },
  {
    id: 'secondChance',
    name: 'Second Chance',
    description: 'Grants one extra reroll per level',
    rarity: 'common'
  },
  {
    id: 'flopFortune',
    name: 'Flop Fortune',
    description: '+10 points for each flop recovered from this round',
    rarity: 'common'
  },
  {
    id: 'flopFighter',
    name: 'Flop Fighter',
    description: '+5 points for each consecutive flop avoided',
    rarity: 'common'
  },
  {
    id: 'woodenWonder',
    name: 'Wooden Wonder',
    description: '+5 points for each wooden die in the scoring selection',
    rarity: 'common'
  },
  {
    id: 'crystalClear',
    name: 'Crystal Clear',
    description: '+3 points for each crystal die in the scoring selection',
    rarity: 'common'
  },
  {
    id: 'goldGlimmer',
    name: 'Gold Glimmer',
    description: '+$1 for each golden die scored',
    rarity: 'common'
  },
  {
    id: 'straightShooter',
    name: 'Straight Shooter',
    description: '+25 points when scoring a straight',
    rarity: 'common'
  },
  {
    id: 'fullHouseBonus',
    name: 'Full House Bonus',
    description: '+30 points when scoring two triplets',
    rarity: 'common'
  },
  {
    id: 'roundRobin',
    name: 'Round Robin',
    description: '+15 points when all dice show different numbers',
    rarity: 'common'
  },
  {
    id: 'mirrorMatch',
    name: 'Mirror Match',
    description: '+20 points when first and last dice match',
    rarity: 'common'
  },
  {
    id: 'ascendingAce',
    name: 'Ascending Ace',
    description: '+10 points when dice are in ascending order',
    rarity: 'common'
  },
  {
    id: 'descendingDynamo',
    name: 'Descending Dynamo',
    description: '+10 points when dice are in descending order',
    rarity: 'common'
  },
  {
    id: 'primeTime',
    name: 'Prime Time',
    description: '+8 points when rolling only prime numbers (2, 3, 5, 7)',
    rarity: 'common'
  },
  {
    id: 'tripleThreat',
    name: 'Triple Threat',
    description: '+25 points when three dice show the same number',
    rarity: 'common'
  },
  {
    id: 'rerollRanger',
    name: 'Reroll Ranger',
    description: '+5 points for each reroll used this round',
    rarity: 'common'
  },
  {
    id: 'bankBaron',
    name: 'Bank Baron',
    description: '+$2 when banking points',
    rarity: 'common'
  },
  {
    id: 'pointPirate',
    name: 'Point Pirate',
    description: '+10 points when round score exceeds 500',
    rarity: 'common'
  },
  {
    id: 'diceDuke',
    name: 'Dice Duke',
    description: '+5 points for each die with 6 or more faces',
    rarity: 'common'
  },
  {
    id: 'fortuneFinder',
    name: 'Fortune Finder',
    description: '+$1 for each level completed',
    rarity: 'common'
  },
  {
    id: 'luckyLeprechaun',
    name: 'Lucky Leprechaun',
    description: '+$3 when scoring a combination worth 1000+ points',
    rarity: 'common'
  },
  {
    id: 'mysticMagnet',
    name: 'Mystic Magnet',
    description: '+5 points for each rainbow die in the scoring selection',
    rarity: 'common'
  },
  {
    id: 'volcanoVanguard',
    name: 'Volcano Vanguard',
    description: '+10 points for each volcano die in the scoring selection',
    rarity: 'common'
  },
  {
    id: 'mirrorMage',
    name: 'Mirror Mage',
    description: '+15 points for each mirror die in the scoring selection',
    rarity: 'common'
  },
  {
    id: 'woodenWarden',
    name: 'Wooden Warden',
    description: '+8 points when all scored dice are wooden',
    rarity: 'common'
  },

  // ========== UNCOMMON CHARMS (20 new, 35 total) ==========
  {
    id: 'sequentialSurge',
    name: 'Sequential Surge',
    description: '+20 points for each consecutive number in the roll',
    rarity: 'uncommon'
  },
  {
    id: 'fourOfAKindBonus',
    name: 'Four-of-a-Kind Bonus',
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
    id: 'quadQuest',
    name: 'Quad Quest',
    description: '+30 points for each four-of-a-kind scored',
    rarity: 'uncommon'
  },
  {
    id: 'quintupleCrown',
    name: 'Quintuple Crown',
    description: '+40 points for each five-of-a-kind scored',
    rarity: 'uncommon'
  },
  {
    id: 'levelLeap',
    name: 'Level Leap',
    description: '+10% to banked points when completing a level (per round without flopping)',
    rarity: 'uncommon'
  },
  {
    id: 'comboKing',
    name: 'Combo King',
    description: '+5% to round score for each consecutive successful roll',
    rarity: 'uncommon'
  },
  {
    id: 'treasureTrove',
    name: 'Treasure Trove',
    description: '+$5 for completing a level without any flops',
    rarity: 'uncommon'
  },
  {
    id: 'quarterQuest',
    name: 'Quarter Quest',
    description: '+$4 for each four-of-a-kind scored',
    rarity: 'uncommon'
  },
  {
    id: 'halfDollar',
    name: 'Half Dollar',
    description: '+$5 for each five-of-a-kind scored',
    rarity: 'uncommon'
  },
  {
    id: 'bankersBonus',
    name: "Banker's Bonus",
    description: '+10% money earned when banking points',
    rarity: 'uncommon'
  },
  {
    id: 'guardianAngel',
    name: 'Guardian Angel',
    description: 'Automatically prevents one flop per level (single use)',
    rarity: 'uncommon'
  },
  {
    id: 'luckyCharm',
    name: 'Lucky Charm',
    description: 'Reduces flop chance by 15%',
    rarity: 'uncommon'
  },
  {
    id: 'resilientRoller',
    name: 'Resilient Roller',
    description: 'Prevents flops for the first two rounds of each level',
    rarity: 'uncommon'
  },
  {
    id: 'bounceBack',
    name: 'Bounce Back',
    description: 'Recover from one flop per level without losing life',
    rarity: 'uncommon'
  },
  {
    id: 'flopMaster',
    name: 'Flop Master',
    description: '+5% to banked points when completing a level without flopping',
    rarity: 'uncommon'
  },
  {
    id: 'flopSurvivor',
    name: 'Flop Survivor',
    description: '+$3 for each flop survived',
    rarity: 'uncommon'
  },
  {
    id: 'flopResistor',
    name: 'Flop Resistor',
    description: 'Reduces flop penalty by 50%',
    rarity: 'uncommon'
  },
  {
    id: 'flopNavigator',
    name: 'Flop Navigator',
    description: '+15 points for each consecutive flop avoided',
    rarity: 'uncommon'
  },
  {
    id: 'metallicMight',
    name: 'Metallic Might',
    description: '+15 points for each golden die in the scoring selection',
    rarity: 'uncommon'
  },
  {
    id: 'stoneStrength',
    name: 'Stone Strength',
    description: '+20 points when all scored dice are crystal',
    rarity: 'uncommon'
  },
  {
    id: 'glassGuardian',
    name: 'Glass Guardian',
    description: 'Reduces flop chance by 10% for each mirror die in set',
    rarity: 'uncommon'
  },
  {
    id: 'doubleDip',
    name: 'Double Dip',
    description: 'Doubles points and money earned for rolling pairs',
    rarity: 'uncommon'
  },
  {
    id: 'tripleTrouble',
    name: 'Triple Trouble',
    description: 'Triples points for three-of-a-kind combinations',
    rarity: 'uncommon'
  },
  {
    id: 'straightFlush',
    name: 'Straight Flush',
    description: '+50 points when scoring a straight',
    rarity: 'uncommon'
  },
  {
    id: 'pairParade',
    name: 'Pair Parade',
    description: '+20 points for each pair in the roll',
    rarity: 'uncommon'
  },
  {
    id: 'tripletTriumph',
    name: 'Triplet Triumph',
    description: '+25 points for each three-of-a-kind in the roll',
    rarity: 'uncommon'
  },
  {
    id: 'hotDiceHero',
    name: 'Hot Dice Hero',
    description: '+50 points when hot dice is triggered',
    rarity: 'uncommon'
  },
  {
    id: 'rerollRogue',
    name: 'Reroll Rogue',
    description: '+10 points for each reroll used this round',
    rarity: 'uncommon'
  },
  {
    id: 'bankBaroness',
    name: 'Bank Baroness',
    description: '+$5 when banking points',
    rarity: 'uncommon'
  },
  {
    id: 'levelLady',
    name: 'Level Lady',
    description: '+15% to banked points when completing a level',
    rarity: 'uncommon'
  },
  {
    id: 'pointPrincess',
    name: 'Point Princess',
    description: '+20 points when round score exceeds 1000',
    rarity: 'uncommon'
  },
  {
    id: 'diceDuchess',
    name: 'Dice Duchess',
    description: '+10 points for each die with 8 or more faces',
    rarity: 'uncommon'
  },
  {
    id: 'fortuneFavor',
    name: 'Fortune Favor',
    description: '+$2 for each level completed',
    rarity: 'uncommon'
  },
  {
    id: 'luckyLotus',
    name: 'Lucky Lotus',
    description: '+$5 when scoring a combination worth 2000+ points',
    rarity: 'uncommon'
  },
  {
    id: 'mysticMoon',
    name: 'Mystic Moon',
    description: '+10 points for each rainbow die in the scoring selection',
    rarity: 'uncommon'
  },
  {
    id: 'crystalCrown',
    name: 'Crystal Crown',
    description: '+20 points when all scored dice are crystal',
    rarity: 'uncommon'
  },
  {
    id: 'rainbowRider',
    name: 'Rainbow Rider',
    description: '+15 points for each rainbow die in the scoring selection',
    rarity: 'uncommon'
  },
  {
    id: 'goldenGuard',
    name: 'Golden Guard',
    description: '+25 points when all scored dice are golden',
    rarity: 'uncommon'
  },

  // ========== COMMON CHARMS (13 more to reach 45 total) ==========
  {
    id: 'dollarDash',
    name: 'Dollar Dash',
    description: '+$6 for each six-of-a-kind scored',
    rarity: 'common'
  },
  {
    id: 'sureShot',
    name: 'Sure Shot',
    description: 'Guarantees at least one scoring combination on next roll (once per level)',
    rarity: 'common'
  },
  {
    id: 'flopInsurance',
    name: 'Flop Insurance',
    description: '+20 points if a flop occurs this round',
    rarity: 'common'
  },
  {
    id: 'flopExpert',
    name: 'Flop Expert',
    description: '+5 points for each flop that occurred this level',
    rarity: 'common'
  },
  {
    id: 'silverShine',
    name: 'Silver Shine',
    description: '+$2 for each crystal die scored',
    rarity: 'common'
  },
  {
    id: 'obsidianObelisk',
    name: 'Obsidian Obelisk',
    description: '+12 points for each volcano die in the scoring selection',
    rarity: 'common'
  },
  {
    id: 'marbleMarvel',
    name: 'Marble Marvel',
    description: '+8 points when all scored dice are mirror',
    rarity: 'common'
  },
  {
    id: 'quadrupleQuake',
    name: 'Quadruple Quake',
    description: '+35 points for each four-of-a-kind in the roll',
    rarity: 'common'
  },
  {
    id: 'hotDiceMaven',
    name: 'Hot Dice Maven',
    description: '+25 points when hot dice counter is 2 or higher',
    rarity: 'common'
  },
  {
    id: 'rerollRoyal',
    name: 'Reroll Royal',
    description: '+8 points for each reroll used this round',
    rarity: 'common'
  },
  {
    id: 'levelLord',
    name: 'Level Lord',
    description: '+$3 when completing a level',
    rarity: 'common'
  },
  {
    id: 'flopCommander',
    name: 'Flop Commander',
    description: '+30 points when banking after completing a level with no flops',
    rarity: 'common'
  },
  {
    id: 'flopConqueror',
    name: 'Flop Conqueror',
    description: '+$4 for completing a level with multiple flops but still succeeding',
    rarity: 'common'
  },

  // ========== RARE CHARMS (9 new to reach 15 total) ==========
  {
    id: 'flawlessFinish',
    name: 'Flawless Finish',
    description: '+100 points when banking after completing a level without any flops',
    rarity: 'rare'
  },
  {
    id: 'speedster',
    name: 'Speedster',
    description: '+50 points when banking after completing a level within 3 rounds',
    rarity: 'rare'
  },
  {
    id: 'riskTaker',
    name: 'Risk Taker',
    description: '+75 points when banking after completing a level with only one roll per round',
    rarity: 'rare'
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: '+200 points when banking after achieving maximum points in every round',
    rarity: 'rare'
  },
  {
    id: 'comebackKid',
    name: 'Comeback Kid',
    description: '+100 points when banking after recovering from a flop to complete the level',
    rarity: 'rare'
  },
  {
    id: 'steadyHand',
    name: 'Steady Hand',
    description: '+20% to banked points when maintaining consistent points across rounds',
    rarity: 'rare'
  },
  {
    id: 'highRoller',
    name: 'High Roller',
    description: '+50 points when banking after rolling the highest possible number in each round',
    rarity: 'rare'
  },
  {
    id: 'lowRoller',
    name: 'Low Roller',
    description: '+50 points when banking after rolling the lowest possible number in each round',
    rarity: 'rare'
  },
  {
    id: 'investorsInsight',
    name: "Investor's Insight",
    description: '+$10 for completing a level with only one roll per round',
    rarity: 'rare'
  },
  {
    id: 'jackpotJoy',
    name: 'Jackpot Joy',
    description: '+$15 for achieving maximum roll points in every round',
    rarity: 'rare'
  },
  {
    id: 'flopStrategist',
    name: 'Flop Strategist',
    description: '+100 points for intentionally causing and recovering from a flop',
    rarity: 'rare'
  },
  {
    id: 'hotDiceVeteran',
    name: 'Hot Dice Veteran',
    description: '+100 points when hot dice counter is 3 or higher',
    rarity: 'rare'
  },
  {
    id: 'hotDiceLegend',
    name: 'Hot Dice Legend',
    description: '+200 points when hot dice counter is 5 or higher',
    rarity: 'rare'
  },

  // ========== LEGENDARY CHARMS (1 new to reach 5 total) ==========
  {
    id: 'flopMasterSupreme',
    name: 'Flop Master Supreme',
    description: '2x multiplier to banked points, but lose 1 life for each flop',
    rarity: 'legendary'
  }
];
