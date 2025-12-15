import React, { useState, useEffect } from 'react';
import { MainMenuReturnButton, CharmCard, ConsumableCard, BlessingCard } from '../components';
import { DifficultyDiceDisplay } from '../components/DifficultyDiceDisplay';
import { MATERIALS } from '../../../game/data/materials';
import { CHARMS } from '../../../game/data/charms';
import { CONSUMABLES } from '../../../game/data/consumables';
import { ALL_BLESSINGS } from '../../../game/data/blessings';
import { PIP_EFFECTS } from '../../../game/data/pipEffects';
import { DIFFICULTY_CONFIGS } from '../../../game/logic/difficulty';
import { DiceFace } from '../game/board/dice/DiceFace';
import { useAuth } from '../../contexts/AuthContext';
import { progressApi } from '../../services/api';
import { LockIcon } from '../components/LockIcon';
import { playBackgroundMusic } from '../../utils/music';

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
  const { isAuthenticated } = useAuth();
  const [unlockedItems, setUnlockedItems] = useState<Set<string>>(new Set());

  // Play main menu music
  useEffect(() => {
    playBackgroundMusic('main-title.mp3');
  }, []);

  // Fetch unlock status when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([
        progressApi.getUnlocks('charm'),
        progressApi.getUnlocks('consumable'),
        progressApi.getUnlocks('blessing'),
        progressApi.getUnlocks('pip_effect'),
        progressApi.getUnlocks('material')
      ]).then(([charmsRes, consumablesRes, blessingsRes, pipEffectsRes, materialsRes]) => {
        const unlocked = new Set<string>();
        if (charmsRes.success && (charmsRes as any).unlocks) {
          ((charmsRes as any).unlocks as Array<{ unlockId: string }>).forEach(u => unlocked.add(`charm:${u.unlockId}`));
        }
        if (consumablesRes.success && (consumablesRes as any).unlocks) {
          ((consumablesRes as any).unlocks as Array<{ unlockId: string }>).forEach(u => unlocked.add(`consumable:${u.unlockId}`));
        }
        if (blessingsRes.success && (blessingsRes as any).unlocks) {
          ((blessingsRes as any).unlocks as Array<{ unlockId: string }>).forEach(u => unlocked.add(`blessing:${u.unlockId}`));
        }
        if (pipEffectsRes.success && (pipEffectsRes as any).unlocks) {
          ((pipEffectsRes as any).unlocks as Array<{ unlockId: string }>).forEach(u => unlocked.add(`pip_effect:${u.unlockId}`));
        }
        if (materialsRes.success && (materialsRes as any).unlocks) {
          ((materialsRes as any).unlocks as Array<{ unlockId: string }>).forEach(u => unlocked.add(`material:${u.unlockId}`));
        }
        setUnlockedItems(unlocked);
      }).catch(error => {
        console.debug('Failed to fetch unlock status:', error);
      });
    }
  }, [isAuthenticated]);

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
          {CHARMS.filter(charm => charm.id && charm.id.trim() !== '').map((charm) => (
            <CharmCard
              key={charm.id}
              charm={{ ...charm, active: false }}
              isLocked={isAuthenticated && !unlockedItems.has(`charm:${charm.id}`)}
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
              isLocked={isAuthenticated && !unlockedItems.has(`consumable:${consumable.id}`)}
              isInShop={false}
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
                    isLocked={isAuthenticated && !unlockedItems.has(`blessing:${blessing.id}`)}
                    isInShop={false}
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
          {MATERIALS.map((material) => {
            const isPlastic = material.id === 'plastic';
            const isLocked = isAuthenticated && !isPlastic && !unlockedItems.has(`material:${material.id}`);
            return (
              <div key={material.id} style={{
                padding: '10px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid #dee2e6',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  filter: isLocked ? 'grayscale(100%) brightness(0.5)' : 'none'
                }}>
                  <DiceFace value={3} size={50} material={material.id} />
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
                    {material.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6c757d' }}>
                    {material.description}
                  </div>
                </div>
                {isLocked && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1
                  }}>
                    <LockIcon size={30} color="white" strokeWidth={2} />
                  </div>
                )}
              </div>
            );
          })}
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
            <DiceFace 
              value={3} 
              size={50} 
              material="plastic"
              pipEffect="none"
            />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
                Normal
              </div>
              <div style={{ fontSize: '11px', color: '#6c757d' }}>
                Standard die face with no special effects
              </div>
            </div>
          </div>
          {PIP_EFFECTS.map((effect) => {
            const isLocked = isAuthenticated && !unlockedItems.has(`pip_effect:${effect.id}`);
            return (
              <div key={effect.id} style={{
                padding: '10px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid #dee2e6',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  filter: isLocked ? 'grayscale(100%) brightness(0.5)' : 'none'
                }}>
                  <DiceFace 
                    value={3} 
                    size={50} 
                    material="plastic"
                    pipEffect={effect.type}
                  />
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
                    {effect.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6c757d' }}>
                    {effect.description}
                  </div>
                </div>
                {isLocked && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1
                  }}>
                    <LockIcon size={30} color="white" strokeWidth={2} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Difficulties */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Difficulty Levels ({Object.keys(DIFFICULTY_CONFIGS).length})</h2>
        <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '15px' }}>
          In addition to a selected dice set, each run of Rollio has a DIFFICULTY.         </p>
        <div style={grid2ColStyle}>
          {Object.values(DIFFICULTY_CONFIGS).map((difficulty) => {
            const isPlastic = difficulty.id === 'plastic';
            const isLocked = isAuthenticated && !isPlastic && !unlockedItems.has(`difficulty:${difficulty.id}`);
            return (
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
                  gap: '12px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#007bff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#dee2e6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{
                    filter: isLocked ? 'grayscale(100%) brightness(0.5)' : 'none'
                  }}>
                    <DifficultyDiceDisplay difficulty={difficulty.id as any} size={60} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>
                      {difficulty.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {difficulty.description}
                    </div>
                  </div>
                  {isLocked && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1
                    }}>
                      <LockIcon size={30} color="white" strokeWidth={2} />
                    </div>
                  )}
                </div>
              </HoverTooltip>
            );
          })}
        </div>
      </div>
     
    </div>
  );
};
