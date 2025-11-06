import { CharmRegistry } from '../../logic/charmSystem';
import { FlopShieldCharm } from './FlopShieldCharm';
import { ScoreMultiplierCharm } from './ScoreMultiplierCharm';
import { FourOfAKindBoosterCharm } from './FourOfAKindBoosterCharm';
import { VolcanoAmplifierCharm } from './VolcanoAmplifierCharm';
import { StraightCollectorCharm } from './StraightCollectorCharm';
import { RoundMultiplierCharm } from './RoundMultiplierCharm';
import { ConsumableGeneratorCharm } from './ConsumableGeneratorCharm';
import { OddCollectorCharm } from './OddCollectorCharm';
import { EvenPerfectionCharm } from './EvenPerfectionCharm';
import { MoneyMagnetCharm } from './MoneyMagnetCharm';
import { SizeMattersCharm } from './SizeMattersCharm';
import { RabbitsFootCharm } from './RabbitsFootCharm';
import { WeightedDiceCharm } from './WeightedDiceCharm';
import { FlopCollectorCharm } from './FlopCollectorCharm';
import { HighStakesCharm } from './HighStakesCharm';
import { LowHangingFruitCharm } from './LowHangingFruitCharm';

/**
 * Register all charm implementations with the registry
 */
export function registerCharms(): void {
  const registry = CharmRegistry.getInstance();
  
  registry.register(FlopShieldCharm, 'flopShield');
  registry.register(ScoreMultiplierCharm, 'scoreMultiplier');
  registry.register(FourOfAKindBoosterCharm, 'fourOfAKindBooster');
  registry.register(VolcanoAmplifierCharm, 'volcanoAmplifier');
  registry.register(StraightCollectorCharm, 'straightCollector');
  registry.register(RoundMultiplierCharm, 'roundMultiplier');
  registry.register(ConsumableGeneratorCharm, 'consumableGenerator');
  registry.register(OddCollectorCharm, 'oddCollector');
  registry.register(EvenPerfectionCharm, 'evenPerfection');
  registry.register(MoneyMagnetCharm, 'moneyMagnet');
  registry.register(SizeMattersCharm, 'sizeMatters');
  registry.register(RabbitsFootCharm, 'rabbitsFoot');
  registry.register(WeightedDiceCharm, 'weightedDice');
  registry.register(FlopCollectorCharm, 'flopCollector');
  registry.register(HighStakesCharm, 'highStakes');
  registry.register(LowHangingFruitCharm, 'lowHangingFruit');
} 