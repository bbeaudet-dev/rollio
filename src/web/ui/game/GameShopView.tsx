import React from 'react';
import { ShopDisplay } from './shop/ShopDisplay';
import { LevelRewards } from './board/score/LevelRewards';
import { LevelSummary } from './LevelSummary';
import { Inventory } from './Inventory';

interface GameShopViewProps {
  gameState: any;
  roundState: any;
  inventory: any;
  shopState: any;
  levelRewards: any;
  shopActions: any;
  inventoryActions: any;
}

export const GameShopView: React.FC<GameShopViewProps> = ({
  gameState,
  roundState,
  inventory,
  shopState,
  levelRewards,
  shopActions,
  inventoryActions
}) => {
  const completedLevelNumber = gameState.currentLevel?.levelNumber ? gameState.currentLevel.levelNumber - 1 : 1;
  const livesRemaining = gameState.history?.levelHistory?.[gameState.history.levelHistory.length - 1]?.livesRemaining || 0;

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {levelRewards && (
        <LevelRewards
          levelNumber={completedLevelNumber}
          rewards={levelRewards}
          livesRemaining={livesRemaining}
        />
      )}
      
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

