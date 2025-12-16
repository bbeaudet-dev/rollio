/**
 * Shop logic and inventory generation
 */

import { GameState, Charm, Consumable, Blessing, ShopState, GamePhase } from '../types';
import { CHARMS } from '../data/charms';
import { CONSUMABLES, WHIMS, WISHES, COMBINATION_UPGRADES } from '../data/consumables';
import { selectRandomBlessing, getBlessingName, getBlessingDescription, enrichBlessingForDisplay, getAvailableBlessings } from '../data/blessings';

import { CHARM_PRICES } from '../data/charms';
import { getDifficultyConfig, getDifficulty, DifficultyLevel } from '../logic/difficulty';

export const CONSUMABLE_PRICES: Record<string, { buy: number; sell: number }> = {
  wish: { buy: 8, sell: 4 },
  whim: { buy: 4, sell: 2 },
  combinationUpgrade: { buy: 2, sell: 1 },
};

const BLESSING_PRICE = 5;

/**
 * Calculate shop discount percentage from blessings
 */
export function calculateShopDiscount(gameState: GameState): number {
  let discount = 0;
  for (const blessing of gameState.blessings || []) {
    if (blessing.effect.type === 'shopDiscount') {
      discount += blessing.effect.percentage;
    }
  }
  return discount;
}

/**
 * Apply shop discount to a price
 */
export function applyDiscount(price: number, discount: number): number {
  if (discount <= 0) return price;
  const discounted = price * (1 - discount / 100);
  return Math.ceil(discounted);
}

/**
 * Get charm price (with difficulty modifier applied)
 */
export function getCharmPrice(charm: Charm, difficulty?: DifficultyLevel): number {
  const rarity = charm.rarity || 'common';
  const priceInfo = CHARM_PRICES[rarity] || CHARM_PRICES.common;
  let price = priceInfo.buy;
  
  // Apply difficulty shop price modifier (e.g., Ruby and above 50% more expensive)
  if (difficulty) {
    const config = getDifficultyConfig(difficulty);
    if (config.shopPriceModifier) {
      price = Math.ceil(price * config.shopPriceModifier);
    }
  }
  
  return price;
}

/**
 * Get consumable price (with difficulty modifier applied)
 */
export function getConsumablePrice(consumable: Consumable, difficulty?: DifficultyLevel): number {
  // Check if consumable is a wish, whim, or combination upgrade
  const isWish = WISHES.some(w => w.id === consumable.id);
  const isWhim = WHIMS.some(w => w.id === consumable.id);
  const isCombinationUpgrade = COMBINATION_UPGRADES.some(cu => cu.id === consumable.id);
  const category = isWish ? 'wish' : (isWhim ? 'whim' : (isCombinationUpgrade ? 'combinationUpgrade' : 'whim'));
  const priceInfo = CONSUMABLE_PRICES[category] || CONSUMABLE_PRICES.whim;
  let price = priceInfo.buy;
  
  // Apply difficulty shop price modifier (e.g., Ruby and above 50% more expensive)
  if (difficulty) {
    const config = getDifficultyConfig(difficulty);
    if (config.shopPriceModifier) {
      price = Math.ceil(price * config.shopPriceModifier);
    }
  }
  
  return price;
}

/**
 * Get blessing price (with difficulty modifier applied)
 */
export function getBlessingPrice(blessing: Blessing, difficulty?: DifficultyLevel): number {
  let price = BLESSING_PRICE;
  
  // Apply difficulty shop price modifier (e.g., Ruby and above 50% more expensive)
  if (difficulty) {
    const config = getDifficultyConfig(difficulty);
    if (config.shopPriceModifier) {
      price = Math.ceil(price * config.shopPriceModifier);
    }
  }
  
  return price;
}

/**
 * Generate shop inventory
 * Returns random charms, consumables, and one random blessing
 */
export function generateShopInventory(gameState: GameState): ShopState {
  const ownedCharmIds = new Set(gameState.charms.map(c => c.id));
  const ownedConsumableIds = new Set(gameState.consumables.map(c => c.id));
  
  // Calculate bonus shop items from blessings
  let bonusCharms = 0;
  let bonusConsumables = 0;
  let bonusBlessings = 0;
  
  for (const blessing of gameState.blessings) {
    if (blessing.effect.type === 'shopItemsAvailable') {
      bonusCharms += blessing.effect.charms;
      bonusConsumables += blessing.effect.consumables;
      bonusBlessings += blessing.effect.blessings;
    }
  }
  
  // Select 4 random charms (excluding owned ones) with weighted rarity
  // 60% common, 30% uncommon, 9% rare, 1% legendary
  const availableCharms = CHARMS.filter(c => !ownedCharmIds.has(c.id));
  
  // Group charms by rarity (using Omit<Charm, 'active'> since active is added later)
  type CharmWithoutActive = Omit<Charm, 'active'>;
  const charmsByRarity: {
    common: CharmWithoutActive[];
    uncommon: CharmWithoutActive[];
    rare: CharmWithoutActive[];
    legendary: CharmWithoutActive[];
  } = {
    common: availableCharms.filter(c => (c.rarity || 'common') === 'common'),
    uncommon: availableCharms.filter(c => (c.rarity || 'common') === 'uncommon'),
    rare: availableCharms.filter(c => (c.rarity || 'common') === 'rare'),
    legendary: availableCharms.filter(c => (c.rarity || 'common') === 'legendary')
  };
  
  const selectedCharms: Charm[] = [];
  const selectedCharmIds = new Set<string>();
  
  const targetCharmCount = 4 + bonusCharms;
  while (selectedCharms.length < targetCharmCount && selectedCharmIds.size < availableCharms.length) {
    const rand = Math.random();
    let pool: CharmWithoutActive[];
    
    // Weighted selection: 60% common, 30% uncommon, 9% rare, 1% legendary
    if (rand < 0.6) {
      pool = charmsByRarity.common;
    } else if (rand < 0.9) {
      pool = charmsByRarity.uncommon;
    } else if (rand < 0.99) {
      pool = charmsByRarity.rare;
    } else {
      pool = charmsByRarity.legendary;
    }
    
    // If selected pool is empty, try other pools in order of preference
    if (pool.length === 0) {
      const fallbackPools = [
        charmsByRarity.common,
        charmsByRarity.uncommon,
        charmsByRarity.rare,
        charmsByRarity.legendary
      ].filter(p => p.length > 0);
      
      if (fallbackPools.length === 0) break;
      pool = fallbackPools[Math.floor(Math.random() * fallbackPools.length)];
    }
    
    const randomIndex = Math.floor(Math.random() * pool.length);
    const charm = pool[randomIndex];
    
    if (!selectedCharmIds.has(charm.id)) {
      selectedCharmIds.add(charm.id);
      selectedCharms.push({ ...charm, active: true });
    }
  }
  
  // Select 2 random consumables (excluding owned ones)
  // 10% chance for wishes, 50% chance for whims, 40% chance for combination upgrades
  const availableWhims = WHIMS.filter(c => !ownedConsumableIds.has(c.id));
  const availableWishes = WISHES.filter(c => !ownedConsumableIds.has(c.id));
  const availableCombinationUpgrades = COMBINATION_UPGRADES.filter(c => !ownedConsumableIds.has(c.id));
  const selectedConsumables: Consumable[] = [];
  const consumableIndices = new Set<number>();
  
  const targetConsumableCount = 2 + bonusConsumables;
  while (selectedConsumables.length < targetConsumableCount && (consumableIndices.size < availableWhims.length + availableWishes.length + availableCombinationUpgrades.length)) {
    const rand = Math.random();
    let pool: Consumable[];
    if (rand < 0.1) {
      // 10% chance for wishes
      pool = availableWishes;
    } else if (rand < 0.6) {
      // 50% chance for whims
      pool = availableWhims;
    } else {
      // 40% chance for combination upgrades
      pool = availableCombinationUpgrades;
    }
    
    if (pool.length === 0) {
      // If pool is empty, try the other pools
      const fallbackPools = [availableWishes, availableWhims, availableCombinationUpgrades].filter(p => p.length > 0);
      if (fallbackPools.length === 0) break;
      const fallbackPool = fallbackPools[Math.floor(Math.random() * fallbackPools.length)];
      pool = fallbackPool;
    }
    
    const randomIndex = Math.floor(Math.random() * pool.length);
    const consumable = pool[randomIndex];
    if (!selectedConsumables.some(c => c.id === consumable.id)) {
      selectedConsumables.push({ ...consumable });
      consumableIndices.add(consumable.id as any);
    }
  }
  
  // Select one random blessing (plus bonus from blessings)
  const purchasedBlessingIds = gameState.blessings.map(b => b.id);
  const availableBlessings: Blessing[] = [];
  const selectedBlessingIds = new Set<string>();
  
  for (let i = 0; i < 1 + bonusBlessings; i++) {
    const available = getAvailableBlessings(purchasedBlessingIds).filter(b => !selectedBlessingIds.has(b.id));
    if (available.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * available.length);
    const blessing = available[randomIndex];
    selectedBlessingIds.add(blessing.id);
    availableBlessings.push(enrichBlessingForDisplay(blessing));
  }
  
  return {
    availableCharms: selectedCharms,
    availableConsumables: selectedConsumables,
    availableBlessings
  };
}

/**
 * Purchase a charm - pure function
 * Returns new game state instead of mutating
 */
export function purchaseCharm(
  gameState: GameState,
  shopState: ShopState,
  charmIndex: number
): { success: boolean; message: string; gameState?: GameState } {
  if (charmIndex < 0 || charmIndex >= shopState.availableCharms.length) {
    return { success: false, message: 'Invalid charm selection' };
  }
  
  const charm = shopState.availableCharms[charmIndex];
  
  // Check if item was already purchased (null)
  if (!charm) {
    return { success: false, message: 'This item has already been purchased' };
  }
  
  // Check if already owned
  if (gameState.charms.some(c => c.id === charm.id)) {
    return { success: false, message: 'You already own this charm' };
  }
  
  // Check slot availability
  if (gameState.charms.length >= gameState.charmSlots) {
    return { success: false, message: 'No charm slots available' };
  }
  
  // Calculate price with discount
  const discount = calculateShopDiscount(gameState);
  const difficulty = getDifficulty(gameState);
  const basePrice = getCharmPrice(charm, difficulty);
  const finalPrice = applyDiscount(basePrice, discount);
  
  // Check money
  if (gameState.money < finalPrice) {
    return { success: false, message: `Insufficient funds. Need $${finalPrice}, have $${gameState.money}` };
  }
  
  // Purchase - create new state
  const newGameState: GameState = {
    ...gameState,
    money: gameState.money - finalPrice,
    charms: [...gameState.charms, { ...charm, active: true }]
  };
  
  // Track charm purchase
  newGameState.history = { ...newGameState.history };
  newGameState.history.charmCounters = { ...newGameState.history.charmCounters };
  newGameState.history.charmCounters[charm.id] = (newGameState.history.charmCounters[charm.id] || 0) + 1;
  
  return { 
    success: true, 
    message: `Purchased ${charm.name} for $${finalPrice}`,
    gameState: newGameState
  };
}

/**
 * Purchase a consumable - pure function
 * Returns new game state instead of mutating
 */
export function purchaseConsumable(
  gameState: GameState,
  shopState: ShopState,
  consumableIndex: number
): { success: boolean; message: string; gameState?: GameState } {
  if (consumableIndex < 0 || consumableIndex >= shopState.availableConsumables.length) {
    return { success: false, message: 'Invalid consumable selection' };
  }
  
  const consumable = shopState.availableConsumables[consumableIndex];
  
  // Check if item was already purchased (null)
  if (!consumable) {
    return { success: false, message: 'This item has already been purchased' };
  }
  
  // Check slot availability
  if (gameState.consumables.length >= gameState.consumableSlots) {
    return { success: false, message: 'No consumable slots available' };
  }
  
  // Calculate price with discount
  const discount = calculateShopDiscount(gameState);
  const difficulty = getDifficulty(gameState);
  const basePrice = getConsumablePrice(consumable, difficulty);
  const finalPrice = applyDiscount(basePrice, discount);
  
  // Check money
  if (gameState.money < finalPrice) {
    return { success: false, message: `Insufficient funds. Need $${finalPrice}, have $${gameState.money}` };
  }
  
  // Purchase - create new state
  const newGameState: GameState = {
    ...gameState,
    money: gameState.money - finalPrice,
    consumables: [...gameState.consumables, { ...consumable }]
  };
  
  return { 
    success: true, 
    message: `Purchased ${consumable.name} for $${finalPrice}`,
    gameState: newGameState
  };
}

/**
 * Sell a charm - pure function
 * Returns new game state instead of mutating
 */
export function sellCharm(
  gameState: GameState,
  charmIndex: number
): { success: boolean; message: string; gameState?: GameState } {
  if (charmIndex < 0 || charmIndex >= gameState.charms.length) {
    return { success: false, message: 'Invalid charm selection' };
  }
  
  const charm = gameState.charms[charmIndex];
  const rarity = charm.rarity || 'common';
  
  // Check if player has sellAtPurchasePrice blessing
  const hasSellAtPurchasePrice = gameState.blessings.some(b => b.effect.type === 'sellAtPurchasePrice');
  
  let sellValue: number;
  if (hasSellAtPurchasePrice) {
    // Sell at base purchase price (before discount)
    const difficulty = getDifficulty(gameState);
    sellValue = getCharmPrice(charm, difficulty);
  } else {
    // Normal sell price (half of base)
    sellValue = CHARM_PRICES[rarity]?.sell || 2;
  }
  
  // Remove charm and add money
  const newCharms = gameState.charms.filter((_, idx) => idx !== charmIndex);
  const newGameState: GameState = {
    ...gameState,
    money: gameState.money + sellValue,
    charms: newCharms
  };
  
  return { 
    success: true, 
    message: `Sold ${charm.name} for $${sellValue}`,
    gameState: newGameState
  };
}

/**
 * Sell a consumable - pure function
 * Returns new game state instead of mutating
 */
export function sellConsumable(
  gameState: GameState,
  consumableIndex: number
): { success: boolean; message: string; gameState?: GameState } {
  if (consumableIndex < 0 || consumableIndex >= gameState.consumables.length) {
    return { success: false, message: 'Invalid consumable selection' };
  }
  
  const consumable = gameState.consumables[consumableIndex];
  const isWish = WISHES.some(w => w.id === consumable.id);
  const isWhim = WHIMS.some(w => w.id === consumable.id);
  const isCombinationUpgrade = COMBINATION_UPGRADES.some(cu => cu.id === consumable.id);
  const category = isWish ? 'wish' : (isWhim ? 'whim' : (isCombinationUpgrade ? 'combinationUpgrade' : 'whim'));
  
  // Check if player has sellAtPurchasePrice blessing
  const hasSellAtPurchasePrice = gameState.blessings.some(b => b.effect.type === 'sellAtPurchasePrice');
  
  let sellValue: number;
  if (hasSellAtPurchasePrice) {
    // Sell at base purchase price (before discount)
    const difficulty = getDifficulty(gameState);
    sellValue = getConsumablePrice(consumable, difficulty);
  } else {
    // Normal sell price (half of base)
    sellValue = CONSUMABLE_PRICES[category]?.sell || 2;
  }
  
  // Remove consumable and add money
  const newConsumables = gameState.consumables.filter((_, idx) => idx !== consumableIndex);
  const newGameState: GameState = {
    ...gameState,
    money: gameState.money + sellValue,
    consumables: newConsumables
  };
  
  return { 
    success: true, 
    message: `Sold ${consumable.name} for $${sellValue}`,
    gameState: newGameState
  };
}

/**
 * Purchase a blessing - pure function
 * Returns new game state instead of mutating
 */
export function purchaseBlessing(
  gameState: GameState,
  shopState: ShopState,
  blessingIndex: number
): { success: boolean; message: string; gameState?: GameState } {
  if (blessingIndex < 0 || blessingIndex >= shopState.availableBlessings.length) {
    return { success: false, message: 'Invalid blessing selection' };
  }
  
  const blessing = shopState.availableBlessings[blessingIndex];
  
  // Check if item was already purchased (null)
  if (!blessing) {
    return { success: false, message: 'This item has already been purchased' };
  }
  
  // Check if already purchased
  if (gameState.blessings.some(b => b.id === blessing.id)) {
    return { success: false, message: 'You have already purchased this blessing' };
  }
  
  // Calculate price with discount
  const discount = calculateShopDiscount(gameState);
  const difficulty = getDifficulty(gameState);
  const basePrice = getBlessingPrice(blessing, difficulty);
  const finalPrice = applyDiscount(basePrice, discount);
  
  // Check money
  if (gameState.money < finalPrice) {
    return { success: false, message: `Insufficient funds. Need $${finalPrice}, have $${gameState.money}` };
  }
  
  // Purchase and apply blessing (store original blessing without display properties)
  const blessingToStore = { id: blessing.id, tier: blessing.tier, effect: blessing.effect };
  
  // Create new state with blessing added
  let newGameState: GameState = {
    ...gameState,
    money: gameState.money - finalPrice,
    blessings: [...gameState.blessings, blessingToStore]
  };
  
  // Track blessing purchase
  newGameState.history = { ...newGameState.history };
  newGameState.history.blessingCounters = { ...newGameState.history.blessingCounters };
  newGameState.history.blessingCounters[blessing.id] = (newGameState.history.blessingCounters[blessing.id] || 0) + 1;
  
  // Apply blessing effect (this may modify the new state)
  newGameState = applyBlessingEffect(newGameState, blessingToStore);
  
  const blessingName = (blessing as any).name || getBlessingName(blessing);
  return { 
    success: true, 
    message: `Purchased ${blessingName} for $${finalPrice}`,
    gameState: newGameState
  };
}

/**
 * Apply blessing effect to game state - pure function
 * Returns new game state instead of mutating
 */
export function applyBlessingEffect(gameState: GameState, blessing: Blessing): GameState {
  switch (blessing.effect.type) {
    case 'baseLevelRerolls':
      return {
        ...gameState,
        baseLevelRerolls: gameState.baseLevelRerolls + blessing.effect.amount
      };
    case 'baseLevelBanks':
      return {
        ...gameState,
        baseLevelBanks: (gameState.baseLevelBanks || 4) + blessing.effect.amount
      };
    case 'charmSlots':
      return {
        ...gameState,
        charmSlots: gameState.charmSlots + blessing.effect.amount
      };
    case 'consumableSlots':
      return {
        ...gameState,
        consumableSlots: gameState.consumableSlots + blessing.effect.amount
      };
    // Other effects are applied dynamically during gameplay
    // (rerollOnBank, rerollOnFlop, shopDiscount, flopSubversion, moneyOnLevelEnd, moneyOnRerollUsed)
    default:
      return gameState;
  }
}

/**
 * Apply dynamic blessing effects that trigger during gameplay
 * @param gameState Current game state
 * @param context The context in which blessings should be applied ('bank' | 'flop' | 'rerollUsed' | 'levelEnd')
 * @returns Updated game state with blessing effects applied
 */
export function applyDynamicBlessingEffects(
  gameState: GameState,
  context: 'bank' | 'flop' | 'rerollUsed' | 'levelEnd'
): GameState {
  let newGameState = { ...gameState };
  
  for (const blessing of gameState.blessings || []) {
    switch (blessing.effect.type) {
      case 'rerollOnBank':
        if (context === 'bank') {
          const rerollsToAdd = blessing.effect.amount;
          if (rerollsToAdd > 0 && newGameState.currentWorld) {
            const currentWorld = newGameState.currentWorld;
            newGameState = {
              ...newGameState,
              currentWorld: {
                ...currentWorld,
                currentLevel: {
                  ...currentWorld.currentLevel,
                  rerollsRemaining: (currentWorld.currentLevel.rerollsRemaining || 0) + rerollsToAdd
                }
              }
            };
          }
        }
        break;
        
      case 'rerollOnFlop':
        if (context === 'flop') {
          const rerollsToAdd = blessing.effect.amount;
          if (rerollsToAdd > 0 && newGameState.currentWorld) {
            const currentWorld = newGameState.currentWorld;
            newGameState = {
              ...newGameState,
              currentWorld: {
                ...currentWorld,
                currentLevel: {
                  ...currentWorld.currentLevel,
                  rerollsRemaining: (currentWorld.currentLevel.rerollsRemaining || 0) + rerollsToAdd
                }
              }
            };
          }
        }
        break;
        
      // Add other dynamic effects here as needed:
      // case 'moneyOnRerollUsed':
      //   if (context === 'rerollUsed') { ... }
      // case 'moneyOnLevelEnd':
      //   if (context === 'levelEnd') { ... }
    }
  }
  
  return newGameState;
}

/**
 * Refresh shop - pure function
 * Returns new game state with shop voucher decremented
 * Always costs 1 shop voucher (unless preserved by blessing)
 */
export function refreshShop(
  gameState: GameState,
  shopState: ShopState
): { success: boolean; message: string; gameState?: GameState } {
  // Check for blessing that prevents voucher consumption (30% chance)
  let voucherNotConsumed = false;
  for (const blessing of gameState.blessings || []) {
    if (blessing.effect.type === 'shopVoucherPreservation') {
      if (Math.random() < 0.3) {
        voucherNotConsumed = true;
        break;
      }
    }
  }
  
  // Check if player has shop vouchers
  if (gameState.shopVouchers <= 0) {
    return { 
      success: false, 
      message: 'No shop vouchers available. Shop refresh requires 1 shop voucher.' 
    };
  }
  
  // Use shop voucher (unless preserved by blessing)
  const newGameState: GameState = {
    ...gameState,
    shopVouchers: voucherNotConsumed ? gameState.shopVouchers : gameState.shopVouchers - 1
  };
  
  // Track shop voucher usage for Ticket Eater charm (always count, even if preserved)
  if (!newGameState.history.charmState) {
    newGameState.history.charmState = {};
  }
  if (!newGameState.history.charmState.ticketEater) {
    newGameState.history.charmState.ticketEater = { vouchersUsed: 0 };
  }
  newGameState.history.charmState.ticketEater.vouchersUsed = 
    (newGameState.history.charmState.ticketEater.vouchersUsed || 0) + 1;
  
  return {
    success: true,
    message: voucherNotConsumed 
      ? 'Shop refreshed (voucher preserved by blessing)' 
      : 'Shop refreshed using shop voucher',
    gameState: newGameState
  };
}

/**
 * Reorder a charm in the charms array
 * Pure function - returns new game state
 */
export function reorderCharm(
  gameState: GameState,
  charmIndex: number,
  direction: 'left' | 'right'
): { success: boolean; message: string; gameState?: GameState } {
  if (charmIndex < 0 || charmIndex >= gameState.charms.length) {
    return { success: false, message: 'Invalid charm index' };
  }
  
  const newIndex = direction === 'left' ? charmIndex - 1 : charmIndex + 1;
  
  if (newIndex < 0 || newIndex >= gameState.charms.length) {
    return { success: false, message: 'Cannot move charm in that direction' };
  }
  
  // Create new charms array with swapped positions
  const newCharms = [...gameState.charms];
  [newCharms[charmIndex], newCharms[newIndex]] = [newCharms[newIndex], newCharms[charmIndex]];
  
  const newGameState: GameState = {
    ...gameState,
    charms: newCharms
  };
  
  return {
    success: true,
    message: `Moved charm ${direction}`,
    gameState: newGameState
  };
}

