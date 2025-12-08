import { CharmRegistry } from '../charmSystem';

// Rarity-based charm files
import {
  OddsAndEndsCharm,
  NowWereEvenCharm,
  NinetyEightPercentAPlusCharm,
  OddOdysseyCharm,
  PairUpCharm,
  TripleThreatCharm,
  DimeADozenCharm,
  SandbaggerCharm,
  FlowerPowerCharm,
  CrystalClearCharm,
  GoldenTouchCharm,
  StraightShooterCharm,
  LongshotCharm,
  GhostWhispererCharm,
  IronFortressCharm,
  SolitaryCharm,
  MagicEightBallCharm,
  HotDiceHeroCharm,
  PipCollectorCharm,
  StairstepperCharm,
  RerollRangerCharm,
  BankBaronCharm,
  PointPirateCharm,
  BlessedCharm,
  BlessYouCharm,
  AngelInvestorCharm,
  SureShotCharm,
  FlopStrategistCharm,
  SecondChanceCharm,
  RoundRobinCharm,
  OneSongGloryCharm,
  DigitalNomadCharm,
  FlopShieldCharm,
  MoneyMagnetCharm,
  HighStakesCharm,
  LowHangingFruitCharm,
  HoarderCharm,
  ComebackKidCharm,
  GeneratorCharm,
} from './CommonCharms';

import {
  QuadBoostersCharm,
  LuckySevensCharm,
  SavingGraceCharm,
  TasteTheRainbowCharm,
  PrimeTimeCharm,
  LuckyLeprechaunCharm,
  IrrationalCharm,
  FerrisEulerCharm,
  FourForYourFavorCharm,
  FiveAliveCharm,
  SixShooterCharm,
  HedgeFundCharm,
  LuckyLotusCharm,
  HotPocketCharm,
  WildCardCharm,
  SwordInTheStoneCharm,
  WhimWhispererCharm,
  SnowballCharm,
  RabbitsFootCharm,
  WeightedDiceCharm,
  DoubleAgentCharm,
  PuristCharm,
  RussianRouletteCharm,
} from './UncommonCharms';

import {
  KingslayerCharm,
  DoubleDownCharm,
  PerfectionistCharm,
  DivineInterventionCharm,
  HolyGrailCharm,
  DivineFavorCharm,
  DukeOfDiceCharm,
  EyeOfHorusCharm,
  ArmadilloArmorCharm,
  VesuviusCharm,
  ShootingStarCharm,
  BlankSlateCharm,
  LeadTitanCharm,
  BodyDoubleCharm,
  InheritanceCharm,
  ResonanceCharm,
  BloomCharm,
  MustBeThisTallToRideCharm,
  QueensGambitCharm,
  FlopCollectorCharm,
  SizeMattersCharm,
  RefineryCharm,
} from './RareCharms';

import {
  ParanoiaCharm,
} from './LegendaryCharms';

/**
 * Register all charm implementations with the registry
 */
export function registerCharms(): void {
  const registry = CharmRegistry.getInstance();
  
  // Common charms
  registry.register(OddsAndEndsCharm, 'oddsAndEnds');
  registry.register(NowWereEvenCharm, 'nowWereEven');
  registry.register(NinetyEightPercentAPlusCharm, 'ninetyEightPercentAPlus');
  registry.register(OddOdysseyCharm, 'oddOdyssey');
  registry.register(PairUpCharm, 'pairUp');
  registry.register(TripleThreatCharm, 'tripleThreat');
  registry.register(DimeADozenCharm, 'dimeADozen');
  registry.register(SandbaggerCharm, 'sandbagger');
  registry.register(FlowerPowerCharm, 'flowerPower');
  registry.register(CrystalClearCharm, 'crystalClear');
  registry.register(GoldenTouchCharm, 'goldenTouch');
  registry.register(StraightShooterCharm, 'straightShooter');
  registry.register(LongshotCharm, 'longshot');
  registry.register(GhostWhispererCharm, 'ghostWhisperer');
  registry.register(IronFortressCharm, 'ironFortress');
  registry.register(SolitaryCharm, 'solitary');
  registry.register(MagicEightBallCharm, 'magicEightBall');
  registry.register(HotDiceHeroCharm, 'hotDiceHero');
  registry.register(PipCollectorCharm, 'pipCollector');
  registry.register(StairstepperCharm, 'stairstepper');
  registry.register(RerollRangerCharm, 'rerollRanger');
  registry.register(BankBaronCharm, 'bankBaron');
  registry.register(PointPirateCharm, 'pointPirate');
  registry.register(BlessedCharm, 'blessed');
  registry.register(BlessYouCharm, 'blessYou');
  registry.register(AngelInvestorCharm, 'angelInvestor');
  registry.register(SureShotCharm, 'sureShot');
  registry.register(FlopStrategistCharm, 'flopStrategist');
  registry.register(SecondChanceCharm, 'secondChance');
  registry.register(RoundRobinCharm, 'roundRobin');
  registry.register(OneSongGloryCharm, 'oneSongGlory');
  registry.register(DigitalNomadCharm, 'digitalNomad');
  registry.register(FlopShieldCharm, 'flopShield'); // legacy charm, might be duplicate
  registry.register(MoneyMagnetCharm, 'moneyMagnet'); // legacy charm, might be duplicate
  registry.register(HighStakesCharm, 'highStakes'); // legacy charm, might be duplicate
  registry.register(LowHangingFruitCharm, 'lowHangingFruit'); // legacy charm, might be duplicate
  registry.register(HoarderCharm, 'hoarder');
  registry.register(ComebackKidCharm, 'comebackKid');
  registry.register(GeneratorCharm, 'generator');
  
  // Uncommon charms
  registry.register(QuadBoostersCharm, 'quadBoosters');
  registry.register(LuckySevensCharm, 'luckySevens');
  registry.register(SavingGraceCharm, 'savingGrace');
  registry.register(TasteTheRainbowCharm, 'tasteTheRainbow');
  registry.register(PrimeTimeCharm, 'primeTime');
  registry.register(LuckyLeprechaunCharm, 'luckyLeprechaun');
  registry.register(IrrationalCharm, 'irrational');
  registry.register(FerrisEulerCharm, 'ferrisEuler');
  registry.register(FourForYourFavorCharm, 'fourForYourFavor');
  registry.register(FiveAliveCharm, 'fiveAlive');
  registry.register(SixShooterCharm, 'sixShooter');
  registry.register(HedgeFundCharm, 'hedgeFund');
  registry.register(LuckyLotusCharm, 'luckyLotus');
  registry.register(HotPocketCharm, 'hotPocket');
  registry.register(WildCardCharm, 'wildCard');
  registry.register(SwordInTheStoneCharm, 'swordInTheStone');
  registry.register(WhimWhispererCharm, 'whimWhisperer');
  registry.register(SnowballCharm, 'snowball');
  registry.register(RabbitsFootCharm, 'rabbitsFoot'); // legacy charm, might be duplicate
  registry.register(WeightedDiceCharm, 'weightedDice'); // legacy charm, might be duplicate
  registry.register(DoubleAgentCharm, 'doubleAgent');
  registry.register(PuristCharm, 'purist');
  registry.register(RussianRouletteCharm, 'russianRoulette');
  
  // Rare charms
  registry.register(KingslayerCharm, 'kingslayer');
  registry.register(DoubleDownCharm, 'doubleDown');
  registry.register(PerfectionistCharm, 'perfectionist');
  registry.register(DivineInterventionCharm, 'divineIntervention');
  registry.register(HolyGrailCharm, 'holyGrail');
  registry.register(DivineFavorCharm, 'divineFavor');
  registry.register(DukeOfDiceCharm, 'dukeOfDice');
  registry.register(EyeOfHorusCharm, 'eyeOfHorus');
  registry.register(ArmadilloArmorCharm, 'armadilloArmor');
  registry.register(VesuviusCharm, 'vesuvius');
  registry.register(ShootingStarCharm, 'shootingStar');
  registry.register(BlankSlateCharm, 'blankSlate');
  registry.register(LeadTitanCharm, 'leadTitan');
  registry.register(BodyDoubleCharm, 'bodyDouble');
  registry.register(InheritanceCharm, 'inheritance');
  registry.register(ResonanceCharm, 'resonance');
  registry.register(BloomCharm, 'bloom');
  registry.register(MustBeThisTallToRideCharm, 'mustBeThisTallToRide');
  registry.register(QueensGambitCharm, 'queensGambit');
  registry.register(FlopCollectorCharm, 'flopCollector'); // legacy charm, might be duplicate
  registry.register(SizeMattersCharm, 'sizeMatters'); // legacy charm, might be duplicate
  registry.register(RefineryCharm, 'refinery');
  
  // Legendary charms
  registry.register(ParanoiaCharm, 'paranoia');
} 