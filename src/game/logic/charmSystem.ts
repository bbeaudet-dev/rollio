import { Charm, CharmRarity } from '../types';

/**
 * Base class for all charms
 */
export abstract class BaseCharm implements Charm {
  id: string;
  name: string;
  description: string;
  active: boolean;
  rarity?: CharmRarity;
  uses?: number;

  constructor(charm: Charm) {
    this.id = charm.id;
    this.name = charm.name;
    this.description = charm.description;
    this.active = charm.active;
    this.rarity = charm.rarity;
    this.uses = charm.uses;
  }

  /**
   * Called during scoring to modify points
   */
  abstract onScoring(context: CharmScoringContext): number;

  /**
   * Called when a flop is about to occur. Return true to prevent the flop, false/undefined otherwise.
   */
  onFlop?(context: CharmFlopContext): boolean | { prevented: boolean, log?: string } | void;

  /**
   * Called when the player banks points at the end of a round. Can modify the banked points or trigger effects.
   */
  onBank?(context: CharmBankContext): number | void;

  /**
   * Called at the start of each round (optional)
   */
  onRoundStart?(context: CharmRoundStartContext): void;

  /**
   * Optional method to filter scoring combinations.
   * If implemented, it should return a new array of combinations.
   */
  filterScoringCombinations?(combinations: any[], context: CharmScoringContext): any[];

  canUse(): boolean {
    if (!this.active) return false;
    if (this.uses !== undefined && this.uses <= 0) return false;
    return true;
  }

  use(): void {
    if (this.uses !== undefined && this.uses > 0) {
      this.uses--;
    }
  }
}

export interface CharmScoringContext {
  gameState: any;
  roundState: any;
  basePoints: number;
  combinations: any[];
  selectedIndices: number[];
}

export interface CharmFlopContext {
  gameState: any;
  roundState: any;
}

export interface CharmBankContext {
  gameState: any;
  roundState: any;
  bankedPoints: number;
}

export interface CharmRoundStartContext {
  gameState: any;
  roundState: any;
}

export class CharmRegistry {
  private static instance: CharmRegistry;
  private charms: Map<string, typeof BaseCharm> = new Map();

  private constructor() {}

  static getInstance(): CharmRegistry {
    if (!CharmRegistry.instance) {
      CharmRegistry.instance = new CharmRegistry();
    }
    return CharmRegistry.instance;
  }

  register(charmClass: typeof BaseCharm, charmId: string): void {
    this.charms.set(charmId, charmClass);
  }

  getCharmClass(id: string): typeof BaseCharm | undefined {
    return this.charms.get(id);
  }

  createCharm(charmData: Charm): BaseCharm | null {
    const CharmClass = this.getCharmClass(charmData.id);
    if (!CharmClass) {
      console.warn(`Charm class not found for ID: ${charmData.id}`);
      return null;
    }
    return new (CharmClass as any)(charmData);
  }

  getRegisteredCharmIds(): string[] {
    return Array.from(this.charms.keys());
  }
}

export class CharmManager {
  private charms: BaseCharm[] = [];
  private registry: CharmRegistry;

  constructor() {
    this.registry = CharmRegistry.getInstance();
  }

  addCharm(charmData: Charm): void {
    const charm = this.registry.createCharm(charmData);
    if (charm) {
      this.charms.push(charm);
    }
  }

  removeCharm(id: string): void {
    this.charms = this.charms.filter(charm => charm.id !== id);
  }

  getActiveCharms(): BaseCharm[] {
    return this.charms.filter(charm => charm.active);
  }

  public getAllCharms(): BaseCharm[] {
    return this.charms;
  }



  /**
   * Apply charm effects to scoring (calls onScoring on all active charms)
   */
  applyCharmEffects(context: CharmScoringContext): number {
    let totalBonus = 0;
    
    // First, filter combinations if any charm has a filter method
    let filteredCombinations = context.combinations;
    for (const charm of this.getActiveCharms()) {
      if (charm.filterScoringCombinations) {
        filteredCombinations = charm.filterScoringCombinations(filteredCombinations, context);
      }
    }
    
    // Recalculate base points with filtered combinations
    const filteredBasePoints = filteredCombinations.reduce((sum: number, combo: any) => sum + combo.points, 0);
    
    // Apply scoring effects
    for (const charm of this.getActiveCharms()) {
      const bonus = charm.onScoring({
        ...context,
        basePoints: filteredBasePoints,
        combinations: filteredCombinations
      });
      totalBonus += bonus || 0;
    }
    
    return filteredBasePoints + totalBonus;
  }

  /**
   * Call onFlop on all active charms. If any return a log, the flop is prevented.
   * Returns { prevented: boolean, log: string | null }
   */
  tryPreventFlop(context: CharmFlopContext): { prevented: boolean, log: string | null } {
    let prevented = false;
    let log = null;
    
    for (const charm of this.getActiveCharms()) {
      if (charm.onFlop && charm.canUse()) {
        const result = charm.onFlop(context);
        if (result && typeof result === 'object' && result.prevented) {
          prevented = true;
          log = result.log || null;
        } else if (result === true) {
          // For backward compatibility
          prevented = true;
        }
      }
    }
    
    return { prevented, log };
  }

  /**
   * Call onBank on all active charms. Each can modify the banked points.
   */
  applyBankEffects(context: CharmBankContext): number {
    let modified = context.bankedPoints;
    this.getActiveCharms().forEach(charm => {
      if (charm.onBank && charm.canUse()) {
        const result = charm.onBank({ ...context, bankedPoints: modified });
        if (typeof result === 'number') {
          modified = result;
        }
      }
    });
    return modified;
  }

  callAllOnRoundStart(context: CharmRoundStartContext): void {
    for (const charm of this.getActiveCharms()) {
      if (typeof charm.onRoundStart === 'function') {
        charm.onRoundStart(context);
      }
    }
  }
}

 