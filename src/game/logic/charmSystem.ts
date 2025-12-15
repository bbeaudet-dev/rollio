import { Charm, CharmRarity } from '../types';
import { ScoringElements } from './scoringElements';

/**
 * Scoring value modification returned by charms
 * Supports ADD, MULTIPLY, and EXPONENT operations for all three scoring elements:
 * - Points: basePointsAdd (ADD), basePointsMultiply (MULTIPLY), basePointsExponent (EXPONENT)
 * - Multiplier: multiplierAdd (ADD), multiplierMultiply (MULTIPLY), multiplierExponent (EXPONENT)
 * - Exponent: exponentAdd (ADD), exponentMultiply (MULTIPLY), exponentExponent (EXPONENT)
 * 
 * Operations are applied in order: ADD → MULTIPLY → EXPONENT
 */
export interface ScoringValueModification {
  basePointsAdd?: number;        // ADD to base points
  basePointsMultiply?: number;   // MULTIPLY base points
  basePointsExponent?: number;   // Raise base points to the power of this value
  multiplierAdd?: number;        // ADD to multiplier
  multiplierMultiply?: number;   // MULTIPLY multiplier
  multiplierExponent?: number;   // Raise multiplier to the power of this value
  exponentAdd?: number;          // ADD to exponent
  exponentMultiply?: number;     // MULTIPLY exponent
  exponentExponent?: number;     // Raise exponent to the power of this value
}

/**
 * Scoring value modification with context about what triggered it
 * Used for multiple trigger support - each trigger can include context about which die/material/value caused it
 */
export interface ScoringValueModificationWithContext extends ScoringValueModification {
  triggerContext?: {
    dieIndex?: number;           // Index of die that triggered this (in selectedIndices)
    material?: string;            // Material of die that triggered this
    value?: number;               // Value that triggered this
    description?: string;         // Custom description for this trigger
    isScored?: boolean;           // Whether the die was scored (for Ghost Whisperer unscored dice)
    [key: string]: any;           // Allow additional context fields
  };
}

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
   * Called during scoring to modify scoring values
   * Returns either:
   * - A single modification object (backward compatible)
   * - An array of modifications with context (for multiple triggers)
   * Each modification in the array will create a separate breakdown step
   */
  abstract onScoring(context: CharmScoringContext): ScoringValueModification | ScoringValueModificationWithContext[];

  /**
   * Called per-die during pip effect processing (before each die's pip effect is applied)
   * This allows charms to trigger based on specific die values or conditions
   * Returns a modification object if the charm should trigger for this die
   * Return null/undefined if the charm should not trigger for this die
   */
  onDieScored?(context: CharmDieScoredContext): ScoringValueModification | null | undefined;

  /**
   * Called when a flop is about to occur. Return true to prevent the flop, false/undefined otherwise.
   */
  onFlop?(context: CharmFlopContext): boolean | { prevented: boolean, log?: string } | void;

  /**
   * Called when the player banks points at the end of a round. Can modify the banked points.
   */
  onBank?(context: CharmBankContext): number | void;
  
  /**
   * Optional method to return reroll bonuses/modifiers for this charm
   */
  getRerollBonus?(gameState: any): { add?: number; multiply?: number; override?: number };
  
  /**
   * Optional method to return bank bonuses/modifiers for this charm
   */
  getBankBonus?(gameState: any): { add?: number; multiply?: number };
  
  /**
   * Optional method to return world completion bonus (called when completing a world, every 5 levels)
   */
  calculateWorldCompletionBonus?(completedLevelNumber: number, levelState: any, gameState: any): number;

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
  scoringElements: ScoringElements;
  combinations: any[];
  selectedIndices: number[];
  charmManager?: any; // Optional charm manager for position tracking
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

export interface CharmDieScoredContext {
  gameState: any;
  roundState: any;
  scoringElements: ScoringElements;
  die: any; // Die object
  dieIndex: number; // Index in selectedIndices
  sideValue: number; // The rolled value (which side is face up)
  selectedIndices: number[];
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
   * Get the position/index of a charm in the charms array
   * Returns -1 if charm not found
   */
  getCharmPosition(charmId: string): number {
    return this.charms.findIndex(charm => charm.id === charmId);
  }

  /**
   * Get the charm to the left of the given charm
   * Returns null if no charm to the left
   */
  getCharmToLeft(charmId: string): BaseCharm | null {
    const position = this.getCharmPosition(charmId);
    if (position <= 0) return null;
    return this.charms[position - 1] || null;
  }

  /**
   * Get the charm to the right of the given charm
   * Returns null if no charm to the right
   */
  getCharmToRight(charmId: string): BaseCharm | null {
    const position = this.getCharmPosition(charmId);
    if (position < 0 || position >= this.charms.length - 1) return null;
    return this.charms[position + 1] || null;
  }

  /**
   * Sync charm manager with gameState.charms
   * This ensures newly purchased charms are included in charm effects
   * Should be called after purchasing charms or when gameState.charms changes
   */
  syncFromGameState(gameState: { charms: Charm[] }): void {
    // Clear existing charms
    this.charms = [];
    
    // Re-add all charms from gameState
    gameState.charms.forEach(charmData => {
      this.addCharm(charmData);
    });
  }



  /**
   * Apply charm effects to scoring (calls onScoring on all active charms)
   * Returns updated ScoringElements
   * Optionally tracks each charm in breakdown if breakdownBuilder is provided.
   */
  applyCharmEffects(context: CharmScoringContext, breakdownBuilder?: any): ScoringElements {
    // IMPORTANT: Sync with gameState to ensure charm order matches inventory order
    // This is critical for charms like Paranoia and Sleeper Agent that reference position
    if (context.gameState) {
      this.syncFromGameState(context.gameState);
    }
    
    // First, filter combinations if any charm has a filter method
    let filteredCombinations = context.combinations;
    for (const charm of this.getActiveCharms()) {
      if (charm.filterScoringCombinations) {
        filteredCombinations = charm.filterScoringCombinations(filteredCombinations, context);
      }
    }
    
    // Start with current scoring elements
    let values: ScoringElements = { ...context.scoringElements };
    
    // Apply scoring effects from each charm individually in order
    for (const charm of this.getActiveCharms()) {
      const beforeCharm = { ...values };
      const result = charm.onScoring({
        ...context,
        scoringElements: values,
        combinations: filteredCombinations,
        charmManager: this
      });
      
      // Check if result is an array (multiple triggers) or single modification
      const modifications: ScoringValueModificationWithContext[] = Array.isArray(result) 
        ? result 
        : (result ? [result as ScoringValueModificationWithContext] : []);
      
      // Apply each modification sequentially, creating separate breakdown steps
      for (let i = 0; i < modifications.length; i++) {
        const mod = modifications[i];
        const beforeMod = { ...values };
        
        // Apply modifications in order: ADD → MULTIPLY → EXPONENT
        // Points: ADD → MULTIPLY → EXPONENT
        if (mod.basePointsAdd !== undefined) {
          values.basePoints += mod.basePointsAdd;
        }
        if (mod.basePointsMultiply !== undefined) {
          values.basePoints *= mod.basePointsMultiply;
        }
        if (mod.basePointsExponent !== undefined) {
          values.basePoints = Math.pow(values.basePoints, mod.basePointsExponent);
        }
        
        // Multiplier: ADD → MULTIPLY → EXPONENT
        if (mod.multiplierAdd !== undefined) {
          values.multiplier += mod.multiplierAdd;
        }
        if (mod.multiplierMultiply !== undefined) {
          values.multiplier *= mod.multiplierMultiply;
        }
        if (mod.multiplierExponent !== undefined) {
          values.multiplier = Math.pow(values.multiplier, mod.multiplierExponent);
        }
        
        // Exponent: ADD → MULTIPLY → EXPONENT
        if (mod.exponentAdd !== undefined) {
          values.exponent += mod.exponentAdd;
        }
        if (mod.exponentMultiply !== undefined) {
          values.exponent *= mod.exponentMultiply;
        }
        if (mod.exponentExponent !== undefined) {
          values.exponent = Math.pow(values.exponent, mod.exponentExponent);
        }
        
        // Track in breakdown if builder provided (TODO I think we should start removing text like this)
        if (breakdownBuilder) {
          const changed = JSON.stringify(beforeMod) !== JSON.stringify(values);
          if (changed || modifications.length > 1) {
            // Generate step ID and description
            let stepId: string;
            let description: string;
            
            if (mod.triggerContext) {
              const ctx = mod.triggerContext;
              // Use custom description if provided
              if (ctx.description) {
                description = ctx.description;
              } else {
                // Generate description from context
                const parts: string[] = [charm.name];
                
                if (ctx.material) {
                  const materialName = ctx.material.charAt(0).toUpperCase() + ctx.material.slice(1);
                  if (ctx.dieIndex !== undefined) {
                    parts.push(`(${materialName} Die #${ctx.dieIndex + 1})`);
                  } else {
                    parts.push(`(${materialName} Die)`);
                  }
                } else if (ctx.value !== undefined) {
                  if (ctx.dieIndex !== undefined) {
                    parts.push(`(Value: ${ctx.value}, Die #${ctx.dieIndex + 1})`);
                  } else {
                    parts.push(`(Value: ${ctx.value})`);
                  }
                } else if (ctx.dieIndex !== undefined) {
                  parts.push(`(Die #${ctx.dieIndex + 1})`);
                } else if (ctx.isScored !== undefined) {
                  parts.push(`(${ctx.isScored ? 'Scored' : 'Unscored'} Ghost Die)`);
                }
                
                description = parts.join(' ');
              }
              
              // Generate step ID
              if (ctx.dieIndex !== undefined) {
                stepId = `charm_${charm.id}_die${ctx.dieIndex}`;
              } else {
                stepId = `charm_${charm.id}_${i}`;
              }
            } else {
              // No context - use default format
              if (modifications.length > 1) {
                stepId = `charm_${charm.id}_${i}`;
                description = `${charm.name} (Trigger ${i + 1})`;
              } else {
                stepId = `charm_${charm.id}`;
                description = `Charm ${charm.name}`;
              }
            }
            
            breakdownBuilder.addStep(stepId, values, description);
          }
        }
      }
      
      // For backward compatibility: if single modification and no breakdown builder,
      // or if no modifications were applied, check if we should add a step
      if (breakdownBuilder && modifications.length === 1 && !modifications[0].triggerContext) {
        const changed = JSON.stringify(beforeCharm) !== JSON.stringify(values);
        if (!changed) {
          // Still track charms that didn't modify values for visibility
          breakdownBuilder.addStep(
            `charm_${charm.id}`,
            values,
            `Charm ${charm.name} (no effect)`
          );
        }
      }
    }
    
    return values;
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
   * Call onFlop on all active charms (for tracking purposes, even when flop isn't prevented).
   * This is called after a flop occurs to allow charms like Sandbagger to track flops.
   */
  callAllOnFlop(context: CharmFlopContext): void {
    for (const charm of this.getActiveCharms()) {
      if (charm.onFlop && charm.canUse()) {
        // Call onFlop - some charms just track flops (return void), others might prevent
        // We call this after the flop has already occurred, so prevention results are ignored
        charm.onFlop(context);
      }
    }
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

 