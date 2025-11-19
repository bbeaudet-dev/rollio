import React, { useState } from 'react';
import { ShopDisplay } from './shop/ShopDisplay';
import { Inventory } from './Inventory';
import { SettingsButton, MenuButton } from '../components';
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
    <>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      <div style={{ 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '0'
      }}>
        <ShopDisplay
          shopState={shopState}
          playerMoney={gameState.money || 0}
          blessings={gameState.blessings || []}
          onPurchaseCharm={shopActions.handlePurchaseCharm}
          onPurchaseConsumable={shopActions.handlePurchaseConsumable}
          onPurchaseBlessing={shopActions.handlePurchaseBlessing}
          onContinue={shopActions.handleExitShop}
        />
        
        <Inventory 
          charms={inventory.charms}
          consumables={inventory.consumables}
          blessings={gameState.blessings || []}
          money={gameState.money}
          onConsumableUse={inventoryActions.handleConsumableUse}
        />
        
        {/* Menu and Settings buttons below shop */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #dee2e6'
        }}>
          <MenuButton style={{ position: 'relative', top: 'auto', left: 'auto' }} />
          <SettingsButton 
            onClick={() => setIsSettingsOpen(true)} 
            style={{ position: 'relative', top: 'auto', right: 'auto' }}
          />
        </div>
      </div>
    </>
  );
};

