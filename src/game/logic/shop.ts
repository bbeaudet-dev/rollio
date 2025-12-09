/**
 * Shop logic and inventory generation
 */

import { GameState, Charm, Consumable, Blessing, ShopState, GamePhase } from '../types';
import { CHARMS } from '../data/charms';
import { CONSUMABLES, WHIMS, WISHES } from '../data/consumables';
import { selectRandomBlessing, getBlessingName, getBlessingDescription, enrichBlessingForDisplay } from '../data/blessings';

import { CHARM_PRICES } from '../data/charms';
import { getDifficultyConfig, getDifficulty, DifficultyLevel } from '../logic/difficulty';

const CONSUMABLE_PRICES: Record<string, { buy: number; sell: number }> = {
  wish: { buy: 8, sell: 4 },
  whim: { buy: 4, sell: 2 },
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
  // Check if consumable is a wish or whim
  const isWish = WISHES.some(w => w.id === consumable.id);
  const isWhim = WHIMS.some(w => w.id === consumable.id);
  const category = isWish ? 'wish' : (isWhim ? 'whim' : 'whim');
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
  
  // Select 4 random charms (excluding owned ones)
  const availableCharms = CHARMS.filter(c => !ownedCharmIds.has(c.id));
  const selectedCharms: Charm[] = [];
  const charmIndices = new Set<number>();
  while (selectedCharms.length < 4 && charmIndices.size < availableCharms.length) {
    const randomIndex = Math.floor(Math.random() * availableCharms.length);
    if (!charmIndices.has(randomIndex)) {
      charmIndices.add(randomIndex);
      selectedCharms.push({ ...availableCharms[randomIndex], active: true });
    }
  }
  
  // Select 2 random consumables (excluding owned ones)
  // 10% chance for wishes, 90% chance for whims
  const availableWhims = WHIMS.filter(c => !ownedConsumableIds.has(c.id));
  const availableWishes = WISHES.filter(c => !ownedConsumableIds.has(c.id));
  const selectedConsumables: Consumable[] = [];
  const consumableIndices = new Set<number>();
  
  while (selectedConsumables.length < 2 && (consumableIndices.size < availableWhims.length + availableWishes.length)) {
    // 10% chance to pick from wishes, 90% chance from whims
    const isWish = Math.random() < 0.1;
    const pool = isWish ? availableWishes : availableWhims;
    
    if (pool.length === 0) {
      // If pool is empty, use the other one
      const otherPool = isWish ? availableWhims : availableWishes;
      if (otherPool.length === 0) break;
      const randomIndex = Math.floor(Math.random() * otherPool.length);
      const consumable = otherPool[randomIndex];
      if (!selectedConsumables.some(c => c.id === consumable.id)) {
        selectedConsumables.push({ ...consumable });
        consumableIndices.add(consumable.id as any);
      }
    } else {
      const randomIndex = Math.floor(Math.random() * pool.length);
      const consumable = pool[randomIndex];
      if (!selectedConsumables.some(c => c.id === consumable.id)) {
        selectedConsumables.push({ ...consumable });
        consumableIndices.add(consumable.id as any);
      }
    }
  }
  
  // Select one random blessing
  const purchasedBlessingIds = gameState.blessings.map(b => b.id);
  const randomBlessing = selectRandomBlessing(purchasedBlessingIds);
  const availableBlessings: Blessing[] = randomBlessing ? [enrichBlessingForDisplay(randomBlessing)] : [];
  
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
  const sellValue = CHARM_PRICES[rarity]?.sell || 2;
  
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
  const category = isWish ? 'wish' : (isWhim ? 'whim' : 'whim');
  const sellValue = CONSUMABLE_PRICES[category]?.sell || 2;
  
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

