import React, { useState } from 'react';
import { ShopDisplay } from './shop/ShopDisplay';
import { LevelSummary } from './LevelSummary';
import { Inventory } from './Inventory';
import { SettingsButton } from '../components';
import { SettingsModal } from '../menu';

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
  
  if (!gameState?.currentLevel) {
    console.error('GameShopView: gameState.currentLevel is required');
    return null;
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      position: 'relative'
    }}>
      <SettingsButton onClick={() => setIsSettingsOpen(true)} />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      
      <LevelSummary gameState={gameState} roundState={roundState} />
      <Inventory 
        charms={inventory.charms}
        consumables={inventory.consumables}
        blessings={gameState.blessings || []}
        onConsumableUse={inventoryActions.handleConsumableUse}
      />
      
      <ShopDisplay
        shopState={shopState}
        playerMoney={gameState.money || 0}
        blessings={gameState.blessings || []}
        onPurchaseCharm={shopActions.handlePurchaseCharm}
        onPurchaseConsumable={shopActions.handlePurchaseConsumable}
        onPurchaseBlessing={shopActions.handlePurchaseBlessing}
        onContinue={shopActions.handleExitShop}
      />
    </div>
  );
};

