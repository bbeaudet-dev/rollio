import React, { useState } from 'react';
import { ShopDisplay } from './shop/ShopDisplay';
import { Inventory } from './Inventory';
import { SettingsButton, MainMenuReturnButton } from '../components';
import { SettingsModal } from '../menu';
import { DifficultyProvider } from '../../contexts/DifficultyContext';
import { ShopActionsProvider } from '../../contexts/ShopActionsContext';

interface GameShopViewProps {
  gameState: any;
  roundState: any;
  inventory: any;
  shopState: any;
  shopActions: any;
  inventoryActions: any;
}

export const GameShopView: React.FC<GameShopViewProps> = ({
  gameState,
  roundState,
  inventory,
  shopState,
  shopActions,
  inventoryActions
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  if (!gameState?.currentWorld?.currentLevel) {
    console.error('GameShopView: gameState.currentWorld.currentLevel is required');
    return null;
  }

  const difficulty = gameState.config.difficulty as any; // Convert to string type for context

  return (
    <>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      <DifficultyProvider difficulty={difficulty}>
        <ShopActionsProvider
          purchaseCharm={shopActions.handlePurchaseCharm}
          purchaseConsumable={shopActions.handlePurchaseConsumable}
          purchaseBlessing={shopActions.handlePurchaseBlessing}
          exitShop={shopActions.handleExitShop}
          refreshShop={shopActions.handleRefreshShop}
        >
            <div style={{ 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '0',
              position: 'relative',
              zIndex: 1
            }}>
          <ShopDisplay
            shopState={shopState}
            playerMoney={gameState.money || 0}
            shopVouchers={gameState.shopVouchers}
            blessings={gameState.blessings || []}
            currentLevelNumber={gameState.currentWorld?.currentLevel.levelNumber}
            difficulty={gameState.config?.difficulty}
            gameState={gameState}
          />
          
          <div style={{ position: 'relative', zIndex: 2, backgroundColor: '#f8f9fa' }}>
            <Inventory 
              charms={inventory.charms}
              consumables={inventory.consumables}
              blessings={gameState.blessings || []}
              money={gameState.money}
              shopVouchers={gameState.shopVouchers}
              charmSlots={gameState.charmSlots}
              consumableSlots={gameState.consumableSlots}
              onConsumableUse={inventoryActions.handleConsumableUse}
              onSellCharm={inventoryActions.handleSellCharm}
              onSellConsumable={inventoryActions.handleSellConsumable}
              onMoveCharm={inventoryActions.handleMoveCharm}
              combinationLevels={gameState.history?.combinationLevels}
              diceSet={gameState.diceSet}
              selectedDiceCount={0}
              charmState={gameState.history?.charmState}
              menuButtons={
                <>
                  <SettingsButton 
                    onClick={() => setIsSettingsOpen(true)} 
                    style={{ position: 'relative', top: 'auto', right: 'auto' }}
                  />
                  <MainMenuReturnButton style={{ position: 'relative', top: 'auto', left: 'auto' }} />
                </>
              }
            />
          </div>
            </div>
          </ShopActionsProvider>
      </DifficultyProvider>
    </>
  );
};

