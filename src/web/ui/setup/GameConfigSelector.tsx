import React, { useState, useEffect } from 'react';
import { CharmSelector } from './CharmSelector';
import { ConsumableSelector } from './ConsumableSelector';
import { DiceSetSelector } from './DiceSetSelector';
import { StartGameButton } from './StartGameButton';
import { MenuButton } from '../components';

interface GameConfigSelectorProps {
  onConfigComplete: (config: {
    diceSetIndex: number;
    selectedCharms: number[];
    selectedConsumables: number[];
  }) => void;
}

interface GameConfig {
  diceSetIndex: number;
  selectedCharms: number[];
  selectedConsumables: number[];
}

export const GameConfigSelector: React.FC<GameConfigSelectorProps> = ({ onConfigComplete }) => {
  const [config, setConfig] = useState<GameConfig>({
    diceSetIndex: 0,
    selectedCharms: [],
    selectedConsumables: []
  });
  
  const [diceSets, setDiceSets] = useState<any[]>([]);
  const [charms, setCharms] = useState<any[]>([]);
  const [consumables, setConsumables] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { ALL_DICE_SETS } = await import('../../../game/data/diceSets');
        const { CHARMS } = await import('../../../game/data/charms');
        const { CONSUMABLES } = await import('../../../game/data/consumables');
        
        setDiceSets(ALL_DICE_SETS);
        setCharms(CHARMS);
        setConsumables(CONSUMABLES);
      } catch (error) {
        console.error('Failed to load game data:', error);
      }
    };
    
    loadData();
  }, []);

  const getCurrentDiceSet = () => {
    if (diceSets.length === 0) return null;
    const diceSet = diceSets[config.diceSetIndex];
    return typeof diceSet === 'function' ? diceSet() : diceSet;
  };

  const handleDiceSetSelect = (index: number) => {
    setConfig(prev => ({ 
      ...prev, 
      diceSetIndex: index,
      selectedCharms: [], // Reset selections when dice set changes
      selectedConsumables: []
    }));
  };

  const handleCharmSelect = (index: number) => {
    const diceSet = getCurrentDiceSet();
    if (!diceSet) return;

    setConfig(prev => {
      const newCharms = prev.selectedCharms.includes(index)
        ? prev.selectedCharms.filter(i => i !== index)
        : prev.selectedCharms.length < diceSet.charmSlots
          ? [...prev.selectedCharms, index]
          : prev.selectedCharms;
      return { ...prev, selectedCharms: newCharms };
    });
  };

  const handleConsumableSelect = (index: number) => {
    const diceSet = getCurrentDiceSet();
    if (!diceSet) return;

    setConfig(prev => {
      const newConsumables = prev.selectedConsumables.includes(index)
        ? prev.selectedConsumables.filter(i => i !== index)
        : prev.selectedConsumables.length < diceSet.consumableSlots
          ? [...prev.selectedConsumables, index]
          : prev.selectedConsumables;
      return { ...prev, selectedConsumables: newConsumables };
    });
  };

  const currentDiceSet = getCurrentDiceSet();
  const maxCharmSlots = currentDiceSet?.charmSlots || 0;
  const maxConsumableSlots = currentDiceSet?.consumableSlots || 0;

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '30px auto',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      border: '1px solid #dee2e6',
      position: 'relative'
    }}>
      <MenuButton />
      
      <h1 style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '20px',
        color: '#2c3e50'
      }}>
        🎲 Choose Your Loadout
      </h1>

      <StartGameButton onClick={() => onConfigComplete(config)} />

      {/* All sections in one view */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        <DiceSetSelector
          diceSets={diceSets}
          selectedIndex={config.diceSetIndex}
          onDiceSetSelect={handleDiceSetSelect}
        />

        <CharmSelector
          charms={charms}
          selectedCharms={config.selectedCharms}
          maxSlots={maxCharmSlots}
          onCharmSelect={handleCharmSelect}
        />

        <ConsumableSelector
          consumables={consumables}
          selectedConsumables={config.selectedConsumables}
          maxSlots={maxConsumableSlots}
          onConsumableSelect={handleConsumableSelect}
        />
      </div>
    </div>
  );
};

