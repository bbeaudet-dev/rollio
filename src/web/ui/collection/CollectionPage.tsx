import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuButton } from '../components';
import { MATERIALS } from '../../../game/data/materials';
import { CHARMS } from '../../../game/data/charms';
import { CONSUMABLES, WHIMS, WISHES } from '../../../game/data/consumables';
import { getConsumableColor, getItemTypeColor } from '../../utils/colors';
import { ALL_BLESSINGS, getBlessingName, getBlessingDescription } from '../../../game/data/blessings';
import { STATIC_DICE_SETS } from '../../../game/data/diceSets';
import { PIP_EFFECTS } from '../../../game/data/pipEffects';
import { DIFFICULTY_CONFIGS } from '../../../game/logic/difficulty';
import { DiceFace } from '../game/board/dice/DiceFace';
import { PipEffectIcon } from './PipEffectIcon';

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
  const navigate = useNavigate();

  const containerStyle: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
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
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#2c3e50'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#2c3e50',
    textAlign: 'center'
  };

  const backButtonStyle: React.CSSProperties = {
    marginBottom: '20px',
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  };

  // Grid layouts
  const grid3ColStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px'
  };

  const grid2ColStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px'
  };

  const grid8ColStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '15px'
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
      <MenuButton />
      <h1 style={titleStyle}>Collection</h1>
      <button style={backButtonStyle} onClick={() => navigate('/')}>
        ← Back to Menu
      </button>

      {/* Materials */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Materials ({MATERIALS.length})</h2>
        <div style={grid3ColStyle}>
          {MATERIALS.map((material) => (
            <div key={material.id} style={{
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '2px solid #dee2e6',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px'
            }}>
              <DiceFace value={3} size={80} material={material.id} />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>
                  {material.name}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>
                  {material.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dice Sets */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Dice Sets ({STATIC_DICE_SETS.length})</h2>
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
                    value={1} 
                    size={45} 
                    material={die.material} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consumables */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Consumables ({CONSUMABLES.length})</h2>
        <div style={grid8ColStyle}>
          {CONSUMABLES.map((consumable) => (
            <HoverTooltip key={consumable.id} text={consumable.description}>
              <div style={{
                padding: '12px',
                backgroundColor: getConsumableColor(consumable.id, WHIMS, WISHES),
                borderRadius: '6px',
                border: '2px solid #dee2e6',
                textAlign: 'center',
                cursor: 'help',
                transition: 'all 0.2s',
                minHeight: '100px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#007bff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#dee2e6';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>
                  {consumable.name}
                </div>
              </div>
            </HoverTooltip>
          ))}
        </div>
      </div>

      {/* Charms */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Charms ({CHARMS.length})</h2>
        <div style={grid8ColStyle}>
          {CHARMS.map((charm) => (
            <HoverTooltip key={charm.id} text={charm.description}>
              <div style={{
                padding: '12px',
                backgroundColor: getItemTypeColor('charm'),
                borderRadius: '6px',
                border: '2px solid #dee2e6',
                textAlign: 'center',
                cursor: 'help',
                transition: 'all 0.2s',
                minHeight: '100px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#007bff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#dee2e6';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>
                  {charm.name}
                </div>
                {charm.rarity && (
                  <span style={{ 
                    padding: '2px 6px', 
                    backgroundColor: charm.rarity === 'legendary' ? '#ff6b35' : 
                                     charm.rarity === 'rare' ? '#9b59b6' :
                                     charm.rarity === 'uncommon' ? '#3498db' : '#95a5a6',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '10px',
                    textTransform: 'capitalize',
                    display: 'inline-block'
                  }}>
                    {charm.rarity}
                  </span>
                )}
              </div>
            </HoverTooltip>
          ))}
        </div>
      </div>

      {/* Blessings */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Blessings ({ALL_BLESSINGS.length})</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {Object.entries(groupedBlessings).map(([type, blessings]) => (
            <div key={type} style={{
              padding: '15px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px',
                color: '#2c3e50',
                textTransform: 'capitalize'
              }}>
                {type.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div style={grid3ColStyle}>
                {blessings.map((blessing) => (
                  <div key={blessing.id} style={{
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    border: '2px solid #dee2e6',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                      {getBlessingName(blessing)}
                    </div>
                    <div style={{ 
                      marginBottom: '8px',
                      padding: '4px 8px', 
                      backgroundColor: '#27ae60',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                      display: 'inline-block'
                    }}>
                      Tier {blessing.tier}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6c757d' }}>
                      {getBlessingDescription(blessing)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Pip Effects */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Pip Effects ({PIP_EFFECTS.length})</h2>
        <div style={grid3ColStyle}>
          {PIP_EFFECTS.map((effect) => (
            <div key={effect.id} style={{
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '2px solid #dee2e6',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '36px' }}>
                <PipEffectIcon type={effect.type} size={36} />
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

      {/* Levels & Worlds */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Levels & Worlds</h2>
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '2px solid #dee2e6',
          textAlign: 'center',
          color: '#6c757d'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>
            Level System
          </div>
          <div style={{ fontSize: '14px', marginBottom: '20px' }}>
            Every 5 levels is a World. Levels 3, 8, 13... are Minibosses. Levels 5, 10, 15... are Main Bosses.
          </div>
          <div style={{ fontSize: '14px', fontStyle: 'italic' }}>
            More details coming soon...
          </div>
        </div>
      </div>

      {/* Difficulties */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Difficulty Levels ({Object.keys(DIFFICULTY_CONFIGS).length})</h2>
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
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#007bff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#dee2e6';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>
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
