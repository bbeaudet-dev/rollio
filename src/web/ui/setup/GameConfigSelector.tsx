import React, { useState, useEffect } from 'react';
import { CharmSelector } from './CharmSelector';
import { ConsumableSelector } from './ConsumableSelector';
import { BlessingSelector } from './BlessingSelector';
import { PipEffectsSelector } from './PipEffectsSelector';
import { DiceSetSelector } from './DiceSetSelector';
import { DiceSetCustomization } from './DiceSetCustomization';
import { StartGameButton } from './StartGameButton';
import { DifficultySelector } from './DifficultySelector';
import { MainMenuReturnButton, ModeButton } from '../components';
import { DifficultyLevel } from '../../../game/logic/difficulty';
import { Die, DiceSetConfig } from '../../../game/types';
import { PipEffectType } from '../../../game/data/pipEffects';
import { createDiceSetConfigFromCustomization } from './diceSetCustomizationUtils';

interface GameConfigSelectorProps {
  onConfigComplete: (config: {
    diceSetIndex?: number; // For extras mode (legacy)
    customDiceSetConfig?: DiceSetConfig; // For new game mode (customization)
    selectedCharms: number[];
    selectedConsumables: number[];
    difficulty: string; // Pass as string to avoid coupling frontend to DifficultyLevel type
  }) => void;
}

type GameMode = 'newGame' | 'challenges' | 'extras';

interface GameConfig {
  diceSetIndex: number;
  customDiceSetConfig?: DiceSetConfig; 
  selectedCharms: number[];
  selectedConsumables: number[];
  selectedBlessings: number[];
  difficulty: DifficultyLevel;
  selectedPipEffects: Record<number, Record<number, PipEffectType>>; // Map of dieIndex -> { sideValue -> pipEffectType }
  selectedChallengeId?: string; // For challenges mode
}

// Dummy challenges for now
const DUMMY_CHALLENGES = [
  { id: 'challenge1', name: 'Challenge 1', description: 'This is a placeholder challenge' },
  { id: 'challenge2', name: 'Challenge 2', description: 'Another placeholder challenge' },
  { id: 'challenge3', name: 'Challenge 3', description: 'Yet another placeholder challenge' },
];

export const GameConfigSelector: React.FC<GameConfigSelectorProps> = ({ onConfigComplete }) => {
  const [mode, setMode] = useState<GameMode>('newGame');
  const [config, setConfig] = useState<GameConfig>({
    diceSetIndex: 0,
    selectedCharms: [],
    selectedConsumables: [],
    selectedBlessings: [],
    difficulty: 'plastic',
    selectedPipEffects: {}
  });
  
  const [allDiceSets, setAllDiceSets] = useState<any[]>([]);
  const [charms, setCharms] = useState<any[]>([]);
  const [consumables, setConsumables] = useState<any[]>([]);
  const [blessings, setBlessings] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { ALL_DICE_SETS } = await import('../../../game/data/diceSets');
        const { CHARMS } = await import('../../../game/data/charms');
        const { CONSUMABLES } = await import('../../../game/data/consumables');
        const { ALL_BLESSINGS } = await import('../../../game/data/blessings');
        
        setAllDiceSets(ALL_DICE_SETS);
        setCharms(CHARMS);
        setConsumables(CONSUMABLES);
        setBlessings(ALL_BLESSINGS);
      } catch (error) {
        console.error('Failed to load game data:', error);
      }
    };
    
    loadData();
  }, []);

  // Filter dice sets - New Game only shows standard sets, Extras shows all config
  const getAvailableDiceSets = () => {
    if (mode === 'newGame') {
      // Only show Standard sets for New Game
      return allDiceSets.filter((ds) => {
        const diceSetConfig = typeof ds === 'function' ? ds() : ds;
        return diceSetConfig.name === 'Beginner Set' || 
               diceSetConfig.name === 'Low Baller Set' || 
               diceSetConfig.name === 'Hoarder Set';
      });
    }
    // Extras mode shows all dice sets
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
  }, [mode, allDiceSets, availableDiceSets]);

  const getCurrentDiceSet = () => {
    if (availableDiceSets.length === 0) return null;
    const diceSet = availableDiceSets[config.diceSetIndex];
    return typeof diceSet === 'function' ? diceSet() : diceSet;
  };

  // Get current dice array with pip effects applied
  const getCurrentDiceArray = (): Die[] => {
    const diceSet = getCurrentDiceSet();
    if (!diceSet || !diceSet.dice) return [];
    
    // Start with a deep copy of the dice
    const dice = diceSet.dice.map((die: Die) => ({ ...die }));
    
    // Apply pip effects from selectedPipEffects
    Object.entries(config.selectedPipEffects).forEach(([dieIndexStr, sideEffects]) => {
      const dieIndex = parseInt(dieIndexStr, 10);
      if (dice[dieIndex]) {
        const pipEffects: Record<number, PipEffectType> = {};
        Object.entries(sideEffects).forEach(([sideValueStr, effectType]) => {
          const sideValue = parseInt(sideValueStr, 10);
          pipEffects[sideValue] = effectType;
        });
        dice[dieIndex] = {
          ...dice[dieIndex],
          pipEffects: Object.keys(pipEffects).length > 0 ? pipEffects : undefined
        };
      }
    });
    
    return dice;
  };

  const handleDiceSetSelect = (index: number) => {
    setConfig(prev => ({ 
      ...prev, 
      diceSetIndex: index,
      selectedCharms: [], // Reset selections when dice set changes
      selectedConsumables: [],
      selectedPipEffects: {} // Reset pip effects when changing dice set
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

  const handleBlessingSelect = (index: number) => {
    setConfig(prev => {
      const newBlessings = prev.selectedBlessings.includes(index)
        ? prev.selectedBlessings.filter(i => i !== index)
        : [...prev.selectedBlessings, index];
      return { ...prev, selectedBlessings: newBlessings };
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
      
      {/* Mode Selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '30px'
      }}>
        {(['newGame', 'challenges', 'extras'] as GameMode[]).map((m) => (
          <ModeButton
            key={m}
            onClick={() => setMode(m)}
            selected={mode === m}
          >
            {m === 'newGame' ? 'New Game' : m === 'challenges' ? 'Challenges' : 'Extras'}
          </ModeButton>
        ))}
      </div>

      {/* Mode-specific content */}
      {mode === 'newGame' && (
        <div>
          {/* Difficulty selector for new game mode */}
          <div style={{ marginBottom: '20px' }}>
            <DifficultySelector
              difficulty={config.difficulty}
              onChange={handleDifficultyChange}
            />
          </div>
          <DiceSetCustomization
            difficulty={config.difficulty}
            onComplete={(diceSet, creditsRemaining) => {
              const customConfig = createDiceSetConfigFromCustomization(
                diceSet,
                creditsRemaining,
                config.difficulty
              );
              setConfig(prev => ({ ...prev, customDiceSetConfig: customConfig }));
              onConfigComplete({
                customDiceSetConfig: customConfig,
                selectedCharms: [],
                selectedConsumables: [],
                difficulty: config.difficulty
              });
            }}
          />
        </div>
      )}


      {mode === 'challenges' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Challenge Selector - similar to DifficultySelector but for challenges */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '15px',
            padding: '15px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '2px solid #dee2e6',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '15px'
            }}>
              {/* Previous arrow */}
              <button
                onClick={() => {
                  const currentIndex = DUMMY_CHALLENGES.findIndex(c => c.id === (config.selectedChallengeId || DUMMY_CHALLENGES[0].id));
                  if (currentIndex > 0) {
                    setConfig({ ...config, selectedChallengeId: DUMMY_CHALLENGES[currentIndex - 1].id });
                  }
                }}
                disabled={DUMMY_CHALLENGES.findIndex(c => c.id === (config.selectedChallengeId || DUMMY_CHALLENGES[0].id)) === 0}
                style={{
                  width: '40px',
                  height: '40px',
                  border: '2px solid #dee2e6',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  color: '#2c3e50',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                ‹
              </button>

              {/* Challenge Display */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '8px',
                minWidth: '200px'
              }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#2c3e50',
                  textAlign: 'center'
                }}>
                  {DUMMY_CHALLENGES.find(c => c.id === (config.selectedChallengeId || DUMMY_CHALLENGES[0].id))?.name || DUMMY_CHALLENGES[0].name}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#6c757d',
                  textAlign: 'center',
                  padding: '0 10px'
                }}>
                  {DUMMY_CHALLENGES.find(c => c.id === (config.selectedChallengeId || DUMMY_CHALLENGES[0].id))?.description || DUMMY_CHALLENGES[0].description}
                </div>
              </div>

              {/* Next arrow */}
              <button
                onClick={() => {
                  const currentIndex = DUMMY_CHALLENGES.findIndex(c => c.id === (config.selectedChallengeId || DUMMY_CHALLENGES[0].id));
                  if (currentIndex < DUMMY_CHALLENGES.length - 1) {
                    setConfig({ ...config, selectedChallengeId: DUMMY_CHALLENGES[currentIndex + 1].id });
                  }
                }}
                disabled={DUMMY_CHALLENGES.findIndex(c => c.id === (config.selectedChallengeId || DUMMY_CHALLENGES[0].id)) === DUMMY_CHALLENGES.length - 1}
                style={{
                  width: '40px',
                  height: '40px',
                  border: '2px solid #dee2e6',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  color: '#2c3e50',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                ›
              </button>
            </div>

            {/* Dot indicators */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              paddingTop: '5px'
            }}>
              {DUMMY_CHALLENGES.map((challenge, index) => {
                const currentIndex = DUMMY_CHALLENGES.findIndex(c => c.id === (config.selectedChallengeId || DUMMY_CHALLENGES[0].id));
                return (
                  <div
                    key={challenge.id}
                    onClick={() => setConfig({ ...config, selectedChallengeId: challenge.id })}
                    style={{
                      width: index === currentIndex ? '12px' : '8px',
                      height: index === currentIndex ? '12px' : '8px',
                      borderRadius: '50%',
                      backgroundColor: index === currentIndex ? '#007bff' : '#dee2e6',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: index === currentIndex ? '2px solid #0056b3' : '2px solid transparent'
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {mode === 'extras' && (
        <>
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

          {/* Charms and Consumables - always shown in Extras mode */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '20px',
            marginBottom: '20px'
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

          {/* Blessings and PipEffects - same row */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '20px',
            marginBottom: '20px'
          }}>
            <BlessingSelector
              blessings={blessings}
              selectedBlessings={config.selectedBlessings}
              onBlessingSelect={handleBlessingSelect}
            />

            <PipEffectsSelector
              diceSet={getCurrentDiceArray()}
              onDiceSetChange={(newDiceSet) => {
                // Extract pip effects from the modified dice set (filter out "none" values)
                const pipEffects: Record<number, Record<number, PipEffectType>> = {};
                newDiceSet.forEach((die, dieIndex) => {
                  if (die.pipEffects) {
                    const dieEffects: Record<number, PipEffectType> = {};
                    Object.entries(die.pipEffects).forEach(([sideValueStr, effectType]) => {
                      const sideValue = parseInt(sideValueStr, 10);
                      // Only include if it's not "none"
                      if (effectType !== 'none') {
                        dieEffects[sideValue] = effectType as PipEffectType;
                      }
                    });
                    if (Object.keys(dieEffects).length > 0) {
                      pipEffects[dieIndex] = dieEffects;
                    }
                  }
                });
                setConfig(prev => ({ ...prev, selectedPipEffects: pipEffects }));
              }}
            />
          </div>
          </>
        )}

      {/* Start button at the bottom - only for extras mode (newGame handles its own completion) */}
      {mode === 'extras' && (
        <StartGameButton onClick={() => onConfigComplete({
          diceSetIndex: config.diceSetIndex,
          selectedCharms: config.selectedCharms,
          selectedConsumables: config.selectedConsumables,
          difficulty: config.difficulty
        })} />
      )}
    </div>
  );
};
