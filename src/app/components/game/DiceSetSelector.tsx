import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';

interface DiceSetSelectorProps {
  onDiceSetSelect: (index: number) => void;
}

interface DiceSetInfo {
  name: string;
  index: number;
  setType: string;
  startingMoney: number;
  charmSlots: number;
  consumableSlots: number;
}

export const DiceSetSelector: React.FC<DiceSetSelectorProps> = ({ onDiceSetSelect }) => {
  const [diceSets, setDiceSets] = useState<DiceSetInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    // Load dice sets dynamically
    const loadDiceSets = async () => {
      const { ALL_DICE_SETS } = await import('../../../game/data/diceSets');
      
      const diceSetInfo: DiceSetInfo[] = ALL_DICE_SETS.map((set: any, index: number) => {
        const config = typeof set === 'function' ? set() : set;
        return {
          name: config.name,
          index,
          setType: config.setType || 'mayhem',
          startingMoney: config.startingMoney,
          charmSlots: config.charmSlots,
          consumableSlots: config.consumableSlots
        };
      });
      
      setDiceSets(diceSetInfo);
    };
    
    loadDiceSets();
  }, []);

  // Group dice sets by type
  const beginnerSets = diceSets.filter(set => set.setType === 'beginner');
  const advancedSets = diceSets.filter(set => set.setType === 'advanced');
  const mayhemSets = diceSets.filter(set => set.setType === 'mayhem');

  const handleSelect = () => {
    onDiceSetSelect(selectedIndex);
  };

  const renderDiceSetGroup = (title: string, sets: DiceSetInfo[]) => {
    if (sets.length === 0) return null;
    
    return (
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', textAlign: 'left' }}>
          {title}
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '10px' 
        }}>
          {sets.map((set) => (
            <label key={set.index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '10px',
              border: selectedIndex === set.index ? '2px solid #007bff' : '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: selectedIndex === set.index ? '#f0f8ff' : '#fff',
              fontSize: '12px'
            }}>
              <input
                type="radio"
                name="diceSet"
                value={set.index}
                checked={selectedIndex === set.index}
                onChange={() => setSelectedIndex(set.index)}
                style={{ marginRight: '8px', flexShrink: 0 }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '2px' }}>{set.name}</div>
                <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.2' }}>
                  ${set.startingMoney} • {set.charmSlots}C • {set.consumableSlots}Con
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '50px auto', 
      padding: '20px',
      backgroundColor: '#fff',
      border: '1px solid #ddd',
      borderRadius: '8px'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '18px' }}>
        Select Your Dice Set
      </h2>
      
      {renderDiceSetGroup('BEGINNER SETS', beginnerSets)}
      {renderDiceSetGroup('ADVANCED SETS', advancedSets)}
      {renderDiceSetGroup('MAYHEM SETS', mayhemSets)}
      
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <Button onClick={handleSelect}>
          Start Game with {diceSets[selectedIndex]?.name || 'Selected Set'}
        </Button>
      </div>
    </div>
  );
}; 