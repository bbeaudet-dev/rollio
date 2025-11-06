/**
 * Blessings data and definitions
 * Blessings are permanent upgrades that can only be purchased once per run
 */

import { Blessing } from '../core/types';

/**
 * All available blessings (tier 1, 2, and 3)
 * Tier 2/3 are unlocked after purchasing previous tier
 */
export const ALL_BLESSINGS: Blessing[] = [
  // Reroll Blessings
  {
    id: 'rerollTier1',
    tier: 1,
    effect: { type: 'rerollValue', amount: 1 }
  },
  {
    id: 'rerollTier2',
    tier: 2,
    effect: { type: 'rerollValue', amount: 1 }
  },
  {
    id: 'rerollTier3',
    tier: 3,
    effect: { type: 'rerollValue', amount: 1 }
  },

  // Lives Blessings
  {
    id: 'livesTier1',
    tier: 1,
    effect: { type: 'livesValue', amount: 1 }
  },
  {
    id: 'livesTier2',
    tier: 2,
    effect: { type: 'livesValue', amount: 1 }
  },
  {
    id: 'livesTier3',
    tier: 3,
    effect: { type: 'livesValue', amount: 1 }
  },

  // Reroll Ability Blessings
  {
    id: 'rerollAbilityTier1',
    tier: 1,
    effect: { type: 'rerollOnFlop', amount: 1 }
  },
  {
    id: 'rerollAbilityTier2',
    tier: 2,
    effect: { type: 'rerollOnBank', amount: 1 }
  },
  {
    id: 'rerollAbilityTier3',
    tier: 3,
    effect: { type: 'moneyOnRerollUsed', amount: 1 }
  },

  // Slot Blessings
  {
    id: 'slotTier1',
    tier: 1,
    effect: { type: 'charmSlots', amount: 1 }
  },
  {
    id: 'slotTier2',
    tier: 2,
    effect: { type: 'consumableSlots', amount: 1 }
  },
  {
    id: 'slotTier3',
    tier: 3,
    effect: { type: 'charmSlots', amount: 1 }
  },

  // Shop Discount Blessings
  {
    id: 'discountTier1',
    tier: 1,
    effect: { type: 'shopDiscount', percentage: 5 }
  },
  {
    id: 'discountTier2',
    tier: 2,
    effect: { type: 'shopDiscount', percentage: 10 }
  },
  {
    id: 'discountTier3',
    tier: 3,
    effect: { type: 'shopDiscount', percentage: 15 }
  },

  // Flop Subversion Blessings
  {
    id: 'flopSubversionTier1',
    tier: 1,
    effect: { type: 'flopSubversion', percentage: 10 }
  },
  {
    id: 'flopSubversionTier2',
    tier: 2,
    effect: { type: 'flopSubversion', percentage: 20 }
  },
  {
    id: 'flopSubversionTier3',
    tier: 3,
    effect: { type: 'flopSubversion', percentage: 30 }
  },

  // Money Blessings
  {
    id: 'moneyTier1',
    tier: 1,
    effect: { type: 'moneyPerLife', amount: 1 }
  },
  {
    id: 'moneyTier2',
    tier: 2,
    effect: { type: 'moneyPerLife', amount: 2 }
  },
  {
    id: 'moneyTier3',
    tier: 3,
    effect: { type: 'moneyPerLife', amount: 3 }
  }
];

/**
 * Blessing tier unlock structure
 * Maps blessing IDs to their prerequisites and unlocks
 */
export const BLESSING_TIERS: Record<string, {
  requires?: string;  // Blessing ID that must be purchased first
  unlocks?: string[];  // Blessing IDs that become available after purchase
}> = {
  // Reroll Blessings
  rerollTier1: { unlocks: ['rerollTier2'] },
  rerollTier2: { requires: 'rerollTier1', unlocks: ['rerollTier3'] },
  rerollTier3: { requires: 'rerollTier2' },

  // Lives Blessings
  livesTier1: { unlocks: ['livesTier2'] },
  livesTier2: { requires: 'livesTier1', unlocks: ['livesTier3'] },
  livesTier3: { requires: 'livesTier2' },

  // Reroll Ability Blessings
  rerollAbilityTier1: { unlocks: ['rerollAbilityTier2'] },
  rerollAbilityTier2: { requires: 'rerollAbilityTier1', unlocks: ['rerollAbilityTier3'] },
  rerollAbilityTier3: { requires: 'rerollAbilityTier2' },

  // Slot Blessings
  slotTier1: { unlocks: ['slotTier2'] },
  slotTier2: { requires: 'slotTier1', unlocks: ['slotTier3'] },
  slotTier3: { requires: 'slotTier2' },

  // Shop Discount Blessings
  discountTier1: { unlocks: ['discountTier2'] },
  discountTier2: { requires: 'discountTier1', unlocks: ['discountTier3'] },
  discountTier3: { requires: 'discountTier2' },

  // Flop Subversion Blessings
  flopSubversionTier1: { unlocks: ['flopSubversionTier2'] },
  flopSubversionTier2: { requires: 'flopSubversionTier1', unlocks: ['flopSubversionTier3'] },
  flopSubversionTier3: { requires: 'flopSubversionTier2' },

  // Money Blessings
  moneyTier1: { unlocks: ['moneyTier2'] },
  moneyTier2: { requires: 'moneyTier1', unlocks: ['moneyTier3'] },
  moneyTier3: { requires: 'moneyTier2' }
};

/**
 * Get blessing display name
 */
export function getBlessingName(blessing: Blessing): string {
  const typeMap: Record<string, string> = {
    'rerollValue': 'Reroll Blessing',
    'livesValue': 'Lives Blessing',
    'rerollOnFlop': 'Reroll Ability Blessing',
    'rerollOnBank': 'Reroll Ability Blessing',
    'moneyOnRerollUsed': 'Reroll Ability Blessing',
    'charmSlots': 'Slot Blessing',
    'consumableSlots': 'Slot Blessing',
    'shopDiscount': 'Discount Blessing',
    'flopSubversion': 'Flop Subversion Blessing',
    'moneyPerLife': 'Money Blessing',
    'moneyOnLevelEnd': 'Money Blessing'
  };
  
  const baseName = typeMap[blessing.effect.type] || 'Blessing';
  return `${baseName} ${blessing.tier === 1 ? 'I' : blessing.tier === 2 ? 'II' : 'III'}`;
}

/**
 * Get blessing description
 */
export function getBlessingDescription(blessing: Blessing): string {
  switch (blessing.effect.type) {
    case 'rerollValue':
      return `+${blessing.effect.amount} Rerolls (permanent)`;
    case 'livesValue':
      return `+${blessing.effect.amount} Lives (permanent)`;
    case 'rerollOnFlop':
      return `+${blessing.effect.amount} reroll when flopping`;
    case 'rerollOnBank':
      return `+${blessing.effect.amount} reroll when banking points`;
    case 'moneyOnRerollUsed':
      return `+$${blessing.effect.amount} for each reroll used`;
    case 'charmSlots':
      return `+${blessing.effect.amount} Charm Slot`;
    case 'consumableSlots':
      return `+${blessing.effect.amount} Consumable Slot`;
    case 'shopDiscount':
      return `Everything ${blessing.effect.percentage}% cheaper`;
    case 'flopSubversion':
      return `${blessing.effect.percentage}% chance to subvert flops`;
    case 'moneyPerLife':
      return `+$${blessing.effect.amount} per unused life at end of level`;
    case 'moneyOnLevelEnd':
      return `+$${blessing.effect.amount} at end of level`;
    default:
      return 'Unknown blessing';
  }
}

/**
 * Add name and description properties to blessing for display
 */
export function enrichBlessingForDisplay(blessing: Blessing): Blessing & { name: string; description: string } {
  return {
    ...blessing,
    name: getBlessingName(blessing),
    description: getBlessingDescription(blessing)
  };
}

/**
 * Get available blessings for a shop
 * Returns tier 1 blessings that haven't been purchased,
 * plus tier 2/3 blessings whose prerequisites have been met
 */
export function getAvailableBlessings(
  purchasedBlessingIds: string[]
): Blessing[] {
  const available: Blessing[] = [];
  const purchasedSet = new Set(purchasedBlessingIds);
  
  for (const blessing of ALL_BLESSINGS) {
    const tierInfo = BLESSING_TIERS[blessing.id];
    
    // Tier 1: available if not purchased
    if (blessing.tier === 1 && !purchasedSet.has(blessing.id)) {
      available.push(blessing);
    }
    // Tier 2/3: available if prerequisite is purchased and not already purchased
    else if (blessing.tier > 1 && tierInfo?.requires) {
      if (purchasedSet.has(tierInfo.requires) && !purchasedSet.has(blessing.id)) {
        available.push(blessing);
      }
    }
  }
  
  return available;
}

/**
 * Select one random blessing to appear in shop
 */
export function selectRandomBlessing(
  purchasedBlessingIds: string[]
): Blessing | null {
  const available = getAvailableBlessings(purchasedBlessingIds);
  if (available.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

