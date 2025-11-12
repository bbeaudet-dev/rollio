import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuButton } from '../components';
import { MATERIALS } from '../../../game/data/materials';
import { CHARMS } from '../../../game/data/charms';
import { CONSUMABLES } from '../../../game/data/consumables';
import { ALL_BLESSINGS } from '../../../game/data/blessings';
import { 
  BASIC_DICE_SET, 
  HIGH_ROLLER_SET, 
  LOW_BALLER_SET,
  COLLECTOR_SET,
  LUXURY_SET,
  CHACHING_SET,
  WOODEN_SET,
  VOLCANO_SET,
  MIRROR_SET,
  RAINBOW_SET
} from '../../../game/data/diceSets';

export const CollectionPage: React.FC = () => {
  const navigate = useNavigate();

  const containerStyle: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
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

  const itemStyle: React.CSSProperties = {
    padding: '12px',
    marginBottom: '8px',
    backgroundColor: 'white',
    borderRadius: '4px',
    border: '1px solid #dee2e6'
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '16px',
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
        {MATERIALS.map((material) => (
          <div key={material.id} style={itemStyle}>
            <strong>{material.name}</strong> ({material.abbreviation})
            <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '4px' }}>
              {material.description}
            </div>
            <div style={{ fontSize: '12px', color: '#868e96', marginTop: '4px' }}>
              Color: {material.color}
            </div>
          </div>
        ))}
      </div>

      {/* Charms */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Charms ({CHARMS.length})</h2>
        {CHARMS.map((charm) => (
          <div key={charm.id} style={itemStyle}>
            <strong>{charm.name}</strong>
            {charm.rarity && (
              <span style={{ 
                marginLeft: '8px', 
                padding: '2px 8px', 
                backgroundColor: charm.rarity === 'legendary' ? '#ff6b35' : 
                                 charm.rarity === 'rare' ? '#9b59b6' :
                                 charm.rarity === 'uncommon' ? '#3498db' : '#95a5a6',
                color: 'white',
                borderRadius: '4px',
                fontSize: '12px',
                textTransform: 'capitalize'
              }}>
                {charm.rarity}
              </span>
            )}
            <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '4px' }}>
              {charm.description}
            </div>
          </div>
        ))}
      </div>

      {/* Consumables */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Consumables ({CONSUMABLES.length})</h2>
        {CONSUMABLES.map((consumable) => (
          <div key={consumable.id} style={itemStyle}>
            <strong>{consumable.name}</strong>
            {consumable.rarity && (
              <span style={{ 
                marginLeft: '8px', 
                padding: '2px 8px', 
                backgroundColor: consumable.rarity === 'legendary' ? '#ff6b35' : 
                                 consumable.rarity === 'rare' ? '#9b59b6' :
                                 consumable.rarity === 'uncommon' ? '#3498db' : '#95a5a6',
                color: 'white',
                borderRadius: '4px',
                fontSize: '12px',
                textTransform: 'capitalize'
              }}>
                {consumable.rarity}
              </span>
            )}
            <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '4px' }}>
              {consumable.description}
            </div>
            {consumable.uses && (
              <div style={{ fontSize: '12px', color: '#868e96', marginTop: '4px' }}>
                Uses: {consumable.uses}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Blessings */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Blessings ({ALL_BLESSINGS.length})</h2>
        {ALL_BLESSINGS.map((blessing) => (
          <div key={blessing.id} style={itemStyle}>
            <strong>{blessing.id}</strong>
            <span style={{ 
              marginLeft: '8px', 
              padding: '2px 8px', 
              backgroundColor: '#27ae60',
              color: 'white',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              Tier {blessing.tier}
            </span>
            <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '4px' }}>
              Effect: {blessing.effect.type}
              {'amount' in blessing.effect && ` (${blessing.effect.amount})`}
              {'percentage' in blessing.effect && ` (${blessing.effect.percentage}%)`}
            </div>
          </div>
        ))}
      </div>

      {/* Dice Sets */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Dice Sets (10)</h2>
        {[
          BASIC_DICE_SET, 
          HIGH_ROLLER_SET, 
          LOW_BALLER_SET,
          COLLECTOR_SET,
          LUXURY_SET,
          CHACHING_SET,
          WOODEN_SET,
          VOLCANO_SET,
          MIRROR_SET,
          RAINBOW_SET
        ].map((set) => (
          <div key={set.name} style={itemStyle}>
            <strong>{set.name}</strong>
            <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '4px' }}>
              {set.dice.length} dice | Starting Money: ${set.startingMoney} | 
              Charm Slots: {set.charmSlots} | Consumable Slots: {set.consumableSlots}
            </div>
            <div style={{ fontSize: '12px', color: '#868e96', marginTop: '4px' }}>
              Type: {set.setType}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

