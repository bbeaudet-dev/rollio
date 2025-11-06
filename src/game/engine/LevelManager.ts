/**
 * LevelManager
 * Handles level progression, tallying, and shop phases
 */

import { GameState } from '../core/types';
import { GameInterface } from '../interfaces';
import { calculateLevelRewards, applyLevelRewards, LevelRewards } from '../logic/tallying';
import { generateShopInventory, purchaseCharm, purchaseConsumable, purchaseBlessing, calculateShopDiscount, applyDiscount, getCharmPrice, getConsumablePrice, getBlessingPrice } from '../logic/shop';
import { CLIDisplayFormatter } from '../../cli/display/cliDisplay';
import { debugLog, debugAction } from '../utils/debug';

/**
 * Handle between-levels phase: tallying and shop
 */
export async function handleBetweenLevels(
  gameState: GameState,
  gameInterface: GameInterface,
  completedLevelNumber: number
): Promise<void> {
  debugAction('gameFlow', `Handling between-levels phase for completed level ${completedLevelNumber}`);
  
  // === TALLYING PHASE ===
  // Get the completed level state from history (it was just added by advanceToNextLevel)
  const levelHistory = gameState.history.levelHistory;
  if (levelHistory.length === 0) {
    debugLog(`[TALLYING] No level history found, skipping tallying`);
    return;
  }
  const levelState = levelHistory[levelHistory.length - 1];
  const rewards = calculateLevelRewards(completedLevelNumber, levelState, gameState);
  
  // Display tallying screen
  const tallyingLines = CLIDisplayFormatter.formatTallyingScreen(
    completedLevelNumber,
    rewards.baseReward,
    rewards.livesBonus,
    levelState.livesRemaining || 0,
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
 */
async function handleShop(
  gameState: GameState,
  gameInterface: GameInterface,
  levelNumber: number
): Promise<void> {
  debugAction('gameFlow', `Opening shop for level ${levelNumber}`);
  
  // Generate shop inventory
  const shopState = generateShopInventory(gameState);
  gameState.currentLevel.shop = shopState;
  
  // Calculate prices with discounts
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
      
      if (typeTrimmed === 'c' || typeTrimmed === 'charm') {
        if (shopState.availableCharms.length === 0) {
          await gameInterface.log('No charms available.');
          continue;
        }
        const selection = await gameInterface.askForShopPurchase('charm');
        const index = parseInt(selection.trim(), 10) - 1;
        if (!isNaN(index) && index >= 0 && index < shopState.availableCharms.length) {
          const result = purchaseCharm(gameState, shopState, index);
          await gameInterface.log(result.message);
          if (result.success) {
            // Remove from shop
            shopState.availableCharms.splice(index, 1);
            charmPrices.splice(index, 1);
          }
        }
      } else if (typeTrimmed === 'u' || typeTrimmed === 'consumable') {
        if (shopState.availableConsumables.length === 0) {
          await gameInterface.log('No consumables available.');
          continue;
        }
        const selection = await gameInterface.askForShopPurchase('consumable');
        const index = parseInt(selection.trim(), 10) - 1;
        if (!isNaN(index) && index >= 0 && index < shopState.availableConsumables.length) {
          const result = purchaseConsumable(gameState, shopState, index);
          await gameInterface.log(result.message);
          if (result.success) {
            // Remove from shop
            shopState.availableConsumables.splice(index, 1);
            consumablePrices.splice(index, 1);
          }
        }
      } else if (typeTrimmed === 'b' || typeTrimmed === 'blessing') {
        if (shopState.availableBlessings.length === 0) {
          await gameInterface.log('No blessings available.');
          continue;
        }
        const selection = await gameInterface.askForShopPurchase('blessing');
        const index = parseInt(selection.trim(), 10) - 1;
        if (!isNaN(index) && index >= 0 && index < shopState.availableBlessings.length) {
          const result = purchaseBlessing(gameState, shopState, index);
          await gameInterface.log(result.message);
          if (result.success) {
            // Remove from shop
            shopState.availableBlessings.splice(index, 1);
            blessingPrices.splice(index, 1);
          }
        }
      }
    }
  }
  
  debugAction('gameFlow', 'Shop closed');
}

