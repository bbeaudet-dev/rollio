/**
 * Shop logic and inventory generation
 */

import { GameState, Charm, Consumable, Blessing, ShopState } from '../types';
import { CHARMS } from '../data/charms';
import { CONSUMABLES } from '../data/consumables';
import { selectRandomBlessing, getBlessingName, getBlessingDescription, enrichBlessingForDisplay } from '../data/blessings';
import { CHARM_PRICES } from '../data/charms';

const CONSUMABLE_PRICES: Record<string, { buy: number; sell: number }> = {
  legendary: { buy: 10, sell: 5 },
  rare: { buy: 8, sell: 4 },
  uncommon: { buy: 6, sell: 3 },
  common: { buy: 4, sell: 2 },
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
 * Get charm price
 */
export function getCharmPrice(charm: Charm): number {
  const rarity = charm.rarity || 'common';
  const priceInfo = CHARM_PRICES[rarity] || CHARM_PRICES.common;
  return priceInfo.buy;
}

/**
 * Get consumable price
 */
export function getConsumablePrice(consumable: Consumable): number {
  const rarity = (consumable as any).rarity || 'common';
  const priceInfo = CONSUMABLE_PRICES[rarity] || CONSUMABLE_PRICES.common;
  return priceInfo.buy;
}

/**
 * Get blessing price
 */
export function getBlessingPrice(blessing: Blessing): number {
  return BLESSING_PRICE;
}

/**
 * Generate shop inventory
 * Returns random charms, consumables, and one random blessing
 */
export function generateShopInventory(gameState: GameState): ShopState {
  const ownedCharmIds = new Set(gameState.charms.map(c => c.id));
  const ownedConsumableIds = new Set(gameState.consumables.map(c => c.id));
  
  // Select 3 random charms (excluding owned ones)
  const availableCharms = CHARMS.filter(c => !ownedCharmIds.has(c.id));
  const selectedCharms: Charm[] = [];
  const charmIndices = new Set<number>();
  while (selectedCharms.length < 3 && charmIndices.size < availableCharms.length) {
    const randomIndex = Math.floor(Math.random() * availableCharms.length);
    if (!charmIndices.has(randomIndex)) {
      charmIndices.add(randomIndex);
      selectedCharms.push({ ...availableCharms[randomIndex], active: true });
    }
  }
  
  // Select 3 random consumables (excluding owned ones)
  const availableConsumables = CONSUMABLES.filter(c => !ownedConsumableIds.has(c.id));
  const selectedConsumables: Consumable[] = [];
  const consumableIndices = new Set<number>();
  while (selectedConsumables.length < 3 && consumableIndices.size < availableConsumables.length) {
    const randomIndex = Math.floor(Math.random() * availableConsumables.length);
    if (!consumableIndices.has(randomIndex)) {
      consumableIndices.add(randomIndex);
      selectedConsumables.push({ ...availableConsumables[randomIndex] });
    }
  }
  
  // Select one random blessing
  const purchasedBlessingIds = gameState.blessings.map(b => b.id);
  const randomBlessing = selectRandomBlessing(purchasedBlessingIds);
  const availableBlessings: Blessing[] = randomBlessing ? [enrichBlessingForDisplay(randomBlessing)] : [];
  
  return {
    isOpen: true,
    availableCharms: selectedCharms,
    availableConsumables: selectedConsumables,
    availableBlessings
  };
}

/**
 * Purchase a charm
 */
export function purchaseCharm(
  gameState: GameState,
  shopState: ShopState,
  charmIndex: number
): { success: boolean; message: string } {
  if (charmIndex < 0 || charmIndex >= shopState.availableCharms.length) {
    return { success: false, message: 'Invalid charm selection' };
  }
  
  const charm = shopState.availableCharms[charmIndex];
  
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
  const basePrice = getCharmPrice(charm);
  const finalPrice = applyDiscount(basePrice, discount);
  
  // Check money
  if (gameState.money < finalPrice) {
    return { success: false, message: `Insufficient funds. Need $${finalPrice}, have $${gameState.money}` };
  }
  
  // Purchase
  gameState.money -= finalPrice;
  gameState.charms.push({ ...charm, active: true });
  
  return { success: true, message: `Purchased ${charm.name} for $${finalPrice}` };
}

/**
 * Purchase a consumable
 */
export function purchaseConsumable(
  gameState: GameState,
  shopState: ShopState,
  consumableIndex: number
): { success: boolean; message: string } {
  if (consumableIndex < 0 || consumableIndex >= shopState.availableConsumables.length) {
    return { success: false, message: 'Invalid consumable selection' };
  }
  
  const consumable = shopState.availableConsumables[consumableIndex];
  
  // Check slot availability
  if (gameState.consumables.length >= gameState.consumableSlots) {
    return { success: false, message: 'No consumable slots available' };
  }
  
  // Calculate price with discount
  const discount = calculateShopDiscount(gameState);
  const basePrice = getConsumablePrice(consumable);
  const finalPrice = applyDiscount(basePrice, discount);
  
  // Check money
  if (gameState.money < finalPrice) {
    return { success: false, message: `Insufficient funds. Need $${finalPrice}, have $${gameState.money}` };
  }
  
  // Purchase
  gameState.money -= finalPrice;
  gameState.consumables.push({ ...consumable });
  
  return { success: true, message: `Purchased ${consumable.name} for $${finalPrice}` };
}

/**
 * Purchase a blessing
 */
export function purchaseBlessing(
  gameState: GameState,
  shopState: ShopState,
  blessingIndex: number
): { success: boolean; message: string } {
  if (blessingIndex < 0 || blessingIndex >= shopState.availableBlessings.length) {
    return { success: false, message: 'Invalid blessing selection' };
  }
  
  const blessing = shopState.availableBlessings[blessingIndex];
  
  // Check if already purchased
  if (gameState.blessings.some(b => b.id === blessing.id)) {
    return { success: false, message: 'You have already purchased this blessing' };
  }
  
  // Calculate price with discount
  const discount = calculateShopDiscount(gameState);
  const basePrice = getBlessingPrice(blessing);
  const finalPrice = applyDiscount(basePrice, discount);
  
  // Check money
  if (gameState.money < finalPrice) {
    return { success: false, message: `Insufficient funds. Need $${finalPrice}, have $${gameState.money}` };
  }
  
  // Purchase and apply blessing (store original blessing without display properties)
  const blessingToStore = { id: blessing.id, tier: blessing.tier, effect: blessing.effect };
  gameState.money -= finalPrice;
  gameState.blessings.push(blessingToStore);
  applyBlessingEffect(gameState, blessingToStore);
  
  const blessingName = (blessing as any).name || getBlessingName(blessing);
  return { success: true, message: `Purchased ${blessingName} for $${finalPrice}` };
}

/**
 * Apply blessing effect to game state
 */
export function applyBlessingEffect(gameState: GameState, blessing: Blessing): void {
  switch (blessing.effect.type) {
    case 'rerollValue':
      gameState.rerollValue += blessing.effect.amount;
      break;
    case 'livesValue':
      gameState.livesValue += blessing.effect.amount;
      break;
    case 'charmSlots':
      gameState.charmSlots += blessing.effect.amount;
      break;
    case 'consumableSlots':
      gameState.consumableSlots += blessing.effect.amount;
      break;
    // Other effects are applied dynamically during gameplay
    // (rerollOnBank, rerollOnFlop, shopDiscount, flopSubversion, moneyPerLife, moneyOnLevelEnd, moneyOnRerollUsed)
  }
}

