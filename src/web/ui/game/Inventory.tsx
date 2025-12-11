import React, { useState } from 'react';
import { CharmInventory } from './inventory/CharmInventory';
import { ConsumableInventory } from './inventory/ConsumableInventory';
import { BlessingInventory } from './inventory/BlessingInventory';
import { MoneyDisplay } from './MoneyDisplay';
import { CombinationLevelsModal } from './CombinationLevelsModal';
import { DiceSetModal } from './inventory/DiceSetModal';
import { ViewDiceSetIcon } from './inventory/ViewDiceSetIcon';
import { ViewCombinationLevelsIcon } from './inventory/ViewCombinationLevelsIcon';
import { CombinationLevels, Die } from '../../../game/types';
import { INVENTORY_ICON_SIZE, INVENTORY_ICON_GAP, MONEY_DISPLAY_MIN_WIDTH } from '../components/cardSizes';

interface InventoryProps {
  charms: any[];
  consumables: any[];
  blessings: any[];
  money?: number;
  charmSlots?: number;
  consumableSlots?: number;
  onConsumableUse?: (index: number) => void;
  onSellCharm?: (index: number) => void;
  onSellConsumable?: (index: number) => void;
  combinationLevels?: CombinationLevels | null;
  diceSet?: Die[];
  selectedDiceCount?: number;
  charmState?: Record<string, any> | null;
}

export const Inventory: React.FC<InventoryProps> = ({ 
  charms, 
  consumables, 
  blessings,
  money,
  charmSlots,
  consumableSlots,
  onConsumableUse,
  onSellCharm,
  onSellConsumable,
  combinationLevels,
  diceSet = [],
  selectedDiceCount = 0,
  charmState = null
}) => {
  const [showCombinationLevels, setShowCombinationLevels] = useState(false);
  const [showDiceSet, setShowDiceSet] = useState(false);

  return (
    <>
      <div style={{ 
        backgroundColor: '#e9ecef',
        border: '1px solid #dee2e6',
        borderTop: 'none',
        borderTopLeftRadius: '0',
        borderTopRightRadius: '0',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
        padding: '8px',
        marginTop: '0',
        position: 'relative'
      }}>
        {/* View Combination Levels, Dice Set, and Money - Top Right */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          zIndex: 10
        }}>
          {money !== undefined && <MoneyDisplay money={money} />}
          <ViewCombinationLevelsIcon onClick={() => setShowCombinationLevels(true)} />
          <ViewDiceSetIcon diceSet={diceSet} onClick={() => setShowDiceSet(true)} />
        </div>
      <div 
        className="responsive-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '8px',
          paddingRight: `${MONEY_DISPLAY_MIN_WIDTH + INVENTORY_ICON_GAP + INVENTORY_ICON_SIZE + INVENTORY_ICON_GAP + INVENTORY_ICON_SIZE + 20}px` // Responsive padding: money + gap + hand icon + gap + dice icon + buffer
        }}
      >
        <CharmInventory charms={charms} onSellCharm={onSellCharm} maxSlots={charmSlots} charmState={charmState} />
        <ConsumableInventory 
          consumables={consumables}
          onConsumableUse={onConsumableUse || (() => {})}
          onSellConsumable={onSellConsumable}
          maxSlots={consumableSlots}
          selectedDiceCount={selectedDiceCount}
        />
        <BlessingInventory blessings={blessings} />
      </div>
    </div>

    {/* Modals */}
    <CombinationLevelsModal
      isOpen={showCombinationLevels}
      onClose={() => setShowCombinationLevels(false)}
      combinationLevels={combinationLevels}
    />
    <DiceSetModal
      isOpen={showDiceSet}
      onClose={() => setShowDiceSet(false)}
      diceSet={diceSet}
    />
    </>
  );
};

