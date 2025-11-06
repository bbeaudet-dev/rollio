import React, { useState, useEffect } from 'react';

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



  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '30px auto',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      border: '1px solid #dee2e6'
    }}>
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

      {/* Start Game Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '30px' 
      }}>
        <button 
          onClick={() => onConfigComplete(config)}
          style={{
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            padding: '15px 40px',
            borderRadius: '8px',
            fontSize: '18px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif',
            boxShadow: '0 4px 8px rgba(40, 167, 69, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(40, 167, 69, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(40, 167, 69, 0.3)';
          }}
        >
          🚀 Start Adventure!
        </button>
      </div>

      {/* All sections in one view */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        {/* Dice Set Selection */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: '#007bff'
          }}>
            Dice Set
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {diceSets.map((diceSet, index) => {
              const diceSetConfig = typeof diceSet === 'function' ? diceSet() : diceSet;
              return (
                <div
                  key={index}
                  style={{
                    border: config.diceSetIndex === index ? '2px solid #007bff' : '1px solid #ddd',
                    padding: '8px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    backgroundColor: config.diceSetIndex === index ? '#f0f8ff' : '#fff'
                  }}
                  onClick={() => handleDiceSetSelect(index)}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{diceSetConfig.name}</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    💰 ${diceSetConfig.startingMoney} • 🎭 {diceSetConfig.charmSlots} • 🧪 {diceSetConfig.consumableSlots}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charm Selection */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: '#28a745'
          }}>
            Charms ({config.selectedCharms.length}/{getCurrentDiceSet()?.charmSlots || 0})
          </h3>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '6px'
          }}>
            {charms.map((charm, index) => (
              <div
                key={index}
                style={{
                  border: config.selectedCharms.includes(index) ? '2px solid #28a745' : '1px solid #ddd',
                  padding: '6px',
                  cursor: config.selectedCharms.includes(index) || config.selectedCharms.length < (getCurrentDiceSet()?.charmSlots || 0) ? 'pointer' : 'not-allowed',
                  opacity: config.selectedCharms.includes(index) || config.selectedCharms.length < (getCurrentDiceSet()?.charmSlots || 0) ? 1 : 0.5,
                  borderRadius: '4px',
                  backgroundColor: config.selectedCharms.includes(index) ? '#f0fff0' : '#fff'
                }}
                onClick={() => handleCharmSelect(index)}
              >
                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{charm.name}</div>
                <div style={{ fontSize: '10px', color: '#666' }}>{charm.description}</div>
                <div style={{ fontSize: '9px', color: '#999' }}>{charm.rarity}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Consumable Selection */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: '#17a2b8'
          }}>
            Consumables ({config.selectedConsumables.length}/{getCurrentDiceSet()?.consumableSlots || 0})
          </h3>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '6px'
          }}>
            {consumables.map((consumable, index) => (
              <div
                key={index}
                style={{
                  border: config.selectedConsumables.includes(index) ? '2px solid #17a2b8' : '1px solid #ddd',
                  padding: '6px',
                  cursor: config.selectedConsumables.includes(index) || config.selectedConsumables.length < (getCurrentDiceSet()?.consumableSlots || 0) ? 'pointer' : 'not-allowed',
                  opacity: config.selectedConsumables.includes(index) || config.selectedConsumables.length < (getCurrentDiceSet()?.consumableSlots || 0) ? 1 : 0.5,
                  borderRadius: '4px',
                  backgroundColor: config.selectedConsumables.includes(index) ? '#f0f8ff' : '#fff'
                }}
                onClick={() => handleConsumableSelect(index)}
              >
                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{consumable.name}</div>
                <div style={{ fontSize: '10px', color: '#666' }}>{consumable.description}</div>
                <div style={{ fontSize: '9px', color: '#999' }}>{consumable.rarity}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 