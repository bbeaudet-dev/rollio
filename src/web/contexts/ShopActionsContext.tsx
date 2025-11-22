import React, { createContext, useContext, ReactNode } from 'react';

interface ShopActionsContextType {
  purchaseCharm: (index: number) => void;
  purchaseConsumable: (index: number) => void;
  purchaseBlessing: (index: number) => void;
  exitShop: () => void;
  refreshShop: () => void;
}

const ShopActionsContext = createContext<ShopActionsContextType | undefined>(undefined);

interface ShopActionsProviderProps {
  children: ReactNode;
  purchaseCharm: (index: number) => void;
  purchaseConsumable: (index: number) => void;
  purchaseBlessing: (index: number) => void;
  exitShop: () => void;
  refreshShop: () => void;
}

export const ShopActionsProvider: React.FC<ShopActionsProviderProps> = ({
  children,
  purchaseCharm,
  purchaseConsumable,
  purchaseBlessing,
  exitShop,
  refreshShop
}) => {
  return (
    <ShopActionsContext.Provider
      value={{
        purchaseCharm,
        purchaseConsumable,
        purchaseBlessing,
        exitShop,
        refreshShop,
      }}
    >
      {children}
    </ShopActionsContext.Provider>
  );
};

export const useShopActions = (): ShopActionsContextType => {
  const context = useContext(ShopActionsContext);
  if (context === undefined) {
    throw new Error('useShopActions must be used within a ShopActionsProvider');
  }
  return context;
};

