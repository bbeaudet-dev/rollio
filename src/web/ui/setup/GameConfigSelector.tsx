import React, { useState, useEffect } from 'react';
import { CharmSelector } from './CharmSelector';
import { ConsumableSelector } from './ConsumableSelector';
import { DiceSetSelector } from './DiceSetSelector';
import { StartGameButton } from './StartGameButton';
import { CheatModeToggle } from './CheatModeToggle';
import { DifficultySelector } from './DifficultySelector';
import { MainMenuReturnButton } from '../components';
import { DifficultyLevel } from '../../../game/logic/difficulty';

interface GameConfigSelectorProps {
  onConfigComplete: (config: {
    diceSetIndex: number;
    selectedCharms: number[];
    selectedConsumables: number[];
    difficulty: string; // Pass as string to avoid coupling frontend to DifficultyLevel type
  }) => void;
}

interface GameConfig {
  diceSetIndex: number;
  selectedCharms: number[];
  selectedConsumables: number[];
  difficulty: DifficultyLevel;
  cheatMode: boolean;
}

export const GameConfigSelector: React.FC<GameConfigSelectorProps> = ({ onConfigComplete }) => {
  const [config, setConfig] = useState<GameConfig>({
    diceSetIndex: 0,
    selectedCharms: [],
    selectedConsumables: [],
    difficulty: 'plastic',
    cheatMode: false
  });
  
  const [allDiceSets, setAllDiceSets] = useState<any[]>([]);
  const [charms, setCharms] = useState<any[]>([]);
  const [consumables, setConsumables] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { ALL_DICE_SETS } = await import('../../../game/data/diceSets');
        const { CHARMS } = await import('../../../game/data/charms');
        const { CONSUMABLES } = await import('../../../game/data/consumables');
        
        setAllDiceSets(ALL_DICE_SETS);
        setCharms(CHARMS);
        setConsumables(CONSUMABLES);
      } catch (error) {
        console.error('Failed to load game data:', error);
      }
    };
    
    loadData();
  }, []);

  // Filter dice sets based on cheat mode
  const getAvailableDiceSets = () => {
    if (!config.cheatMode) {
      // Only show Standard sets when cheat mode is off
      return allDiceSets.filter((ds, index) => {
        const diceSetConfig = typeof ds === 'function' ? ds() : ds;
        // Find Basic, Low Baller, and Collector sets by name
        return diceSetConfig.name === 'Beginner Set' || 
               diceSetConfig.name === 'Low Baller Set' || 
               diceSetConfig.name === 'Hoarder Set';
      });
    }
    return allDiceSets;
  };

  const availableDiceSets = getAvailableDiceSets();
  
  // Adjust diceSetIndex if current selection is not available
  useEffect(() => {
    if (availableDiceSets.length > 0) {
      const currentSet = allDiceSets[config.diceSetIndex];
      const isAvailable = availableDiceSets.includes(currentSet);
      if (!isAvailable) {
        setConfig(prev => ({ ...prev, diceSetIndex: 0 }));
      }
    }
  }, [config.cheatMode, allDiceSets, availableDiceSets]);

  const getCurrentDiceSet = () => {
    if (availableDiceSets.length === 0) return null;
    const diceSet = availableDiceSets[config.diceSetIndex];
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

  const handleCheatModeToggle = () => {
    setConfig(prev => ({ 
      ...prev, 
      cheatMode: !prev.cheatMode,
      selectedCharms: [], // Reset when toggling cheat mode
      selectedConsumables: [],
      diceSetIndex: 0
    }));
  };

  const handleDifficultyChange = (difficulty: DifficultyLevel) => {
    setConfig(prev => ({ ...prev, difficulty }));
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
      <MainMenuReturnButton />
      
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

      {/* Cheat Mode Toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <CheatModeToggle
          cheatMode={config.cheatMode}
          onToggle={handleCheatModeToggle}
        />
      </div>

      {/* Main configuration sections - Dice Set and Difficulty */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        <DiceSetSelector
          diceSets={availableDiceSets}
          selectedIndex={config.diceSetIndex}
          onDiceSetSelect={handleDiceSetSelect}
        />

        <DifficultySelector
          difficulty={config.difficulty}
          onChange={handleDifficultyChange}
        />
      </div>

      {/* Charms and Consumables - shown below main sections */}
      {config.cheatMode && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '20px' 
        }}>
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
      )}

      {/* Start button at the bottom */}
      <StartGameButton onClick={() => onConfigComplete({
        diceSetIndex: config.diceSetIndex,
        selectedCharms: config.selectedCharms,
        selectedConsumables: config.selectedConsumables,
        difficulty: config.difficulty
      })} />
    </div>
  );
};

