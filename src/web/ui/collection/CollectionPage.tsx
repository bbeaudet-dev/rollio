import React, { useState } from 'react';
import { MainMenuReturnButton, CharmCard, ConsumableCard, BlessingCard } from '../components';
import { DifficultyDiceDisplay } from '../components/DifficultyDiceDisplay';
import { MATERIALS } from '../../../game/data/materials';
import { CHARMS } from '../../../game/data/charms';
import { CONSUMABLES } from '../../../game/data/consumables';
import { ALL_BLESSINGS } from '../../../game/data/blessings';
import { STATIC_DICE_SETS } from '../../../game/data/diceSets';
import { PIP_EFFECTS } from '../../../game/data/pipEffects';
import { DIFFICULTY_CONFIGS } from '../../../game/logic/difficulty';
import { DiceFace } from '../game/board/dice/DiceFace';

// Simple hover tooltip component
const HoverTooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      style={{ position: 'relative' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#333',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          zIndex: 1000,
          marginBottom: '8px',
          maxWidth: '250px',
          whiteSpace: 'normal',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          pointerEvents: 'none'
        }}>
          {text}
        </div>
      )}
    </div>
  );
};

export const CollectionPage: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '15px',
    position: 'relative'
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '40px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e1e5e9'
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#2c3e50'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#2c3e50',
    textAlign: 'center'
  };

  // Grid layouts
  const grid3ColStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px'
  };

  const grid2ColStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px'
  };

  const grid8ColStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '12px'
  };

  // Group blessings by type
  const groupedBlessings = ALL_BLESSINGS.reduce((acc, blessing) => {
    const type = blessing.id.replace(/Tier\d+$/, '');
    if (!acc[type]) acc[type] = [];
    acc[type].push(blessing);
    return acc;
  }, {} as Record<string, typeof ALL_BLESSINGS>);

  // Sort each group by tier
  Object.keys(groupedBlessings).forEach(key => {
    groupedBlessings[key].sort((a, b) => a.tier - b.tier);
  });

  return (
    <div style={containerStyle}>
      <MainMenuReturnButton />
      <h1 style={titleStyle}>Collection</h1>

      {/* Charms */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Charms ({CHARMS.length})</h2>
        <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '15px' }}>
          CHARMS are items gained through the Shop (and a few other means) that provide scoring bonuses and other abilities as long as they are held in the player's Inventory. 
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '15px',
          justifyContent: 'center'
        }}>
          {CHARMS.map((charm) => (
            <CharmCard
              key={charm.id}
              charm={{ ...charm, active: false }}
            />
          ))}
        </div>
      </div>

      {/* Consumables */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Consumables ({CONSUMABLES.length})</h2>
        <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '15px' }}>
          The two types of consumable items, WHIMS and WISHES, are one-time-use items providing the player with money, dice set manipulation, and other special actions.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '15px',
          justifyContent: 'center'
        }}>
          {CONSUMABLES.map((consumable) => (
            <ConsumableCard
              key={consumable.id}
              consumable={consumable}
            />
          ))}
        </div>
      </div>

      {/* Blessings */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Blessings ({ALL_BLESSINGS.length})</h2>
        <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '15px' }}>
          BLESSINGS are permanent upgrades that each have 3 tiers of effects (purchased separately)and cannot be sold. 
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {Object.entries(groupedBlessings).map(([type, blessings]) => (
            <div key={type} style={{
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                marginBottom: '10px',
                color: '#2c3e50',
                textTransform: 'capitalize'
              }}>
                {type.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '10px',
                justifyContent: 'center'
              }}>
                {blessings.map((blessing) => (
                  <BlessingCard
                    key={blessing.id}
                    blessing={blessing}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Materials */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Materials ({MATERIALS.length})</h2>
        <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '15px' }}>
          Each of the die in your set have one MATERIAL. Plastic, the default material, is the only material without a special effect, many of which are very powerful and essential for getting far in the game.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px'
        }}>
          {MATERIALS.map((material) => (
            <div key={material.id} style={{
              padding: '10px',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #dee2e6',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              <DiceFace value={3} size={50} material={material.id} />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
                  {material.name}
                </div>
                <div style={{ fontSize: '11px', color: '#6c757d' }}>
                  {material.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pip Effects */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Pip Effects ({PIP_EFFECTS.length + 1})</h2>
        <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '15px' }}>
          Each side of a die has a number of PIPS (these are how you know you've rolled a 5, or a 1, for example). You can apply special PIP EFFECTS to individual sides of your dice that can be activated when that side is face-up.
        </p>
        <div style={grid3ColStyle}>
          <div style={{
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '2px solid #dee2e6',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80px' }}>
              <DiceFace 
                value={3} 
                size={80} 
                material="plastic"
                pipEffect="none"
              />
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>
              Normal
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              Standard die face with no special effects
            </div>
          </div>
          {PIP_EFFECTS.map((effect) => (
            <div key={effect.id} style={{
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '2px solid #dee2e6',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80px' }}>
                <DiceFace 
                  value={3} 
                  size={80} 
                  material="plastic"
                  pipEffect={effect.type}
                />
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>
                {effect.name}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>
                {effect.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dice Sets */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Dice Sets ({STATIC_DICE_SETS.length})</h2>
        <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '15px' }}>
          Before starting each run, you'll choose a DICE SET, which each have pros and cons based on play style, strategy, and gameplay variation.
        </p>
        <div style={grid2ColStyle}>
          {STATIC_DICE_SETS.map((set) => (
            <div key={set.name} style={{
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '2px solid #dee2e6'
            }}>
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#2c3e50', marginBottom: '8px' }}>{set.name}</h3>
                <div style={{ fontSize: '13px', color: '#6c757d' }}>
                  {set.dice.length} dice | ${set.startingMoney} | 
                  {set.charmSlots} charm slots | {set.consumableSlots} consumable slots
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px',
                alignItems: 'center',
                justifyContent: 'flex-start'
              }}>
                {set.dice.map((die, idx) => (
                  <DiceFace 
                    key={`${set.name}-${die.id}-${idx}`}
                    value={3} 
                    size={45} 
                    material={die.material} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Difficulties */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Difficulty Levels ({Object.keys(DIFFICULTY_CONFIGS).length})</h2>
        <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '15px' }}>
          In addition to a selected dice set, each run of Rollio has a DIFFICULTY.         </p>
        <div style={grid2ColStyle}>
          {Object.values(DIFFICULTY_CONFIGS).map((difficulty) => (
            <HoverTooltip key={difficulty.id} text={difficulty.description}>
              <div style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '2px solid #dee2e6',
                textAlign: 'center',
                cursor: 'help',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#007bff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#dee2e6';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <DifficultyDiceDisplay difficulty={difficulty.id as any} size={60} />
                <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>
                  {difficulty.name}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {difficulty.description}
                </div>
              </div>
            </HoverTooltip>
          ))}
        </div>
      </div>
     
    </div>
  );
};
