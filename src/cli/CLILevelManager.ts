/**
 * CLILevelManager
 * CLI-specific level progression, tallying, and shop with I/O
 * Contains pure helper functions that are also used internally
 */

import { GameState } from '../game/types';
import { GameInterface } from './interfaces';
import { calculateLevelRewards, applyLevelRewards, LevelRewards } from '../game/logic/tallying';
import { generateShopInventory, purchaseCharm, purchaseConsumable, purchaseBlessing, calculateShopDiscount, applyDiscount, getCharmPrice, getConsumablePrice, getBlessingPrice } from '../game/logic/shop';
import { CLIDisplayFormatter } from './display/cliDisplay';
import { debugAction, debugLog } from '../game/utils/debug';

/**
 * Calculate level rewards for a completed level
 * Pure function - returns rewards data
 */
function calculateLevelRewardsData(
  gameState: GameState,
  completedLevelNumber: number
): LevelRewards {
  const levelHistory = gameState.history.levelHistory;
  if (levelHistory.length === 0) {
    debugLog(`[TALLYING] No level history found`);
    return {
      baseReward: 0,
      banksBonus: 0,
      charmBonuses: 0,
      blessingBonuses: 0,
      total: 0
    };
  }
  const levelState = levelHistory[levelHistory.length - 1];
  return calculateLevelRewards(completedLevelNumber, levelState, gameState);
}

/**
 * Generate shop state for a level
 * Pure function - returns shop data
 */
function generateShopState(gameState: GameState) {
  const shopState = generateShopInventory(gameState);
  const discount = calculateShopDiscount(gameState);
  
  const charmPrices = shopState.availableCharms.map(charm => {
    const basePrice = getCharmPrice(charm);
    return applyDiscount(basePrice, discount);
  });
  const consumablePrices = shopState.availableConsumables.map(consumable => {
    const basePrice = getConsumablePrice(consumable);
    return applyDiscount(basePrice, discount);
  });
  const blessingPrices = shopState.availableBlessings.map(blessing => {
    const basePrice = getBlessingPrice(blessing);
    return applyDiscount(basePrice, discount);
  });
  
  return {
    shopState,
    charmPrices,
    consumablePrices,
    blessingPrices,
    discount
  };
}

/**
 * Process a shop purchase
 * Pure function - returns purchase result
 */
function processShopPurchase(
  gameState: GameState,
  shopState: any,
  type: 'charm' | 'consumable' | 'blessing',
  index: number
): { success: boolean; message: string; gameState: GameState } {
  const newGameState = { ...gameState };
  let result: { success: boolean; message: string };
  
  if (type === 'charm') {
    if (index < 0 || index >= shopState.availableCharms.length) {
      return { success: false, message: 'Invalid charm selection.', gameState: newGameState };
    }
    result = purchaseCharm(newGameState, shopState, index);
  } else if (type === 'consumable') {
    if (index < 0 || index >= shopState.availableConsumables.length) {
      return { success: false, message: 'Invalid consumable selection.', gameState: newGameState };
    }
    result = purchaseConsumable(newGameState, shopState, index);
  } else if (type === 'blessing') {
    if (index < 0 || index >= shopState.availableBlessings.length) {
      return { success: false, message: 'Invalid blessing selection.', gameState: newGameState };
    }
    result = purchaseBlessing(newGameState, shopState, index);
  } else {
    return { success: false, message: 'Invalid purchase type.', gameState: newGameState };
  }
  
  return { ...result, gameState: newGameState };
}

/**
 * Handle between-levels phase: tallying and shop
 * CLI-specific with I/O
 */
export async function handleBetweenLevels(
  gameState: GameState,
  gameInterface: GameInterface,
  completedLevelNumber: number
): Promise<void> {
  debugAction('gameFlow', `Handling between-levels phase for completed level ${completedLevelNumber}`);
  
  // === TALLYING PHASE ===
  const rewards = calculateLevelRewardsData(gameState, completedLevelNumber);
  
  // Display tallying screen
  const levelHistory = gameState.history.levelHistory;
  const levelState = levelHistory[levelHistory.length - 1];
  const tallyingLines = CLIDisplayFormatter.formatTallyingScreen(
    completedLevelNumber,
    rewards.baseReward,
    rewards.banksBonus,
    levelState.banksRemaining || 0,
    rewards.charmBonuses,
    rewards.blessingBonuses,
    rewards.total
  );
  
  for (const line of tallyingLines) {
    await gameInterface.log(line);
  }
  
  // Wait for user to press Enter before proceeding to shop
  await gameInterface.ask('Press Enter to continue to shop...');
  
  // Apply rewards
  applyLevelRewards(gameState, rewards);
  
  // === SHOP PHASE ===
  await handleShop(gameState, gameInterface, gameState.currentLevel.levelNumber);
}

/**
 * Handle shop phase
 * CLI-specific with I/O
 */
async function handleShop(
  gameState: GameState,
  gameInterface: GameInterface,
  levelNumber: number
): Promise<void> {
  debugAction('gameFlow', `Opening shop for level ${levelNumber}`);
  
  // Generate shop state using pure function
  const { shopState, charmPrices, consumablePrices, blessingPrices } = generateShopState(gameState);
  gameState.currentLevel.shop = shopState;
  
  // Display shop
  let shopOpen = true;
  while (shopOpen) {
    const shopLines = CLIDisplayFormatter.formatShopDisplay(
      gameState.money,
      shopState.availableCharms,
      shopState.availableConsumables,
      shopState.availableBlessings,
      charmPrices,
      consumablePrices,
      blessingPrices
    );
    
    for (const line of shopLines) {
      await gameInterface.log(line);
    }
    
    // Get user action
    const action = await gameInterface.ask('Buy item (b) or Next level (n): ');
    const trimmedAction = action.trim().toLowerCase();
    
    if (trimmedAction === 'n' || trimmedAction === 'next') {
      shopOpen = false;
      break;
    } else if (trimmedAction === 'b' || trimmedAction === 'buy') {
      // Ask what type to buy
      const typeInput = await gameInterface.ask('What to buy? (c) Charm, (u) Consumable, (b) Blessing, or Enter to cancel: ');
      const typeTrimmed = typeInput.trim().toLowerCase();
      
      let type: 'charm' | 'consumable' | 'blessing' | null = null;
      if (typeTrimmed === 'c' || typeTrimmed === 'charm') {
        type = 'charm';
      } else if (typeTrimmed === 'u' || typeTrimmed === 'consumable') {
        type = 'consumable';
      } else if (typeTrimmed === 'b' || typeTrimmed === 'blessing') {
        type = 'blessing';
      }
      
      if (!type) continue;
      
      // Check if items available
      const items = type === 'charm' ? shopState.availableCharms :
                   type === 'consumable' ? shopState.availableConsumables :
                   shopState.availableBlessings;
      
      if (items.length === 0) {
        await gameInterface.log(`No ${type}s available.`);
        continue;
      }
      
      const selection = await gameInterface.askForShopPurchase(type);
      const index = parseInt(selection.trim(), 10) - 1;
      
      if (!isNaN(index) && index >= 0 && index < items.length) {
        const result = processShopPurchase(gameState, shopState, type, index);
        await gameInterface.log(result.message);
        if (result.success) {
          // Update gameState
          Object.assign(gameState, result.gameState);
          // Remove from shop
          if (type === 'charm') {
            shopState.availableCharms.splice(index, 1);
            charmPrices.splice(index, 1);
          } else if (type === 'consumable') {
            shopState.availableConsumables.splice(index, 1);
            consumablePrices.splice(index, 1);
          } else if (type === 'blessing') {
            shopState.availableBlessings.splice(index, 1);
            blessingPrices.splice(index, 1);
          }
        }
      }
    }
  }
  
  debugAction('gameFlow', 'Shop closed');
}

