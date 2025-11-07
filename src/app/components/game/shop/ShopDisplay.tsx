import React from 'react';
import { Button } from '../../ui/Button';
import { ShopState, Charm, Consumable, Blessing } from '../../../../game/types';
import { getCharmPrice, getConsumablePrice, getBlessingPrice, calculateShopDiscount, applyDiscount } from '../../../../game/logic/shop';
import { getBlessingName, getBlessingDescription } from '../../../../game/data/blessings';
import { RarityDot } from '../../../utils/rarityColors';

interface ShopDisplayProps {
  shopState: ShopState;
  playerMoney: number;
  blessings?: any[];
  onPurchaseCharm: (index: number) => void;
  onPurchaseConsumable: (index: number) => void;
  onPurchaseBlessing: (index: number) => void;
  onContinue: () => void;
}

export const ShopDisplay: React.FC<ShopDisplayProps> = ({ 
  shopState,
  playerMoney,
  blessings = [],
  onPurchaseCharm,
  onPurchaseConsumable,
  onPurchaseBlessing,
  onContinue
}) => {
  const discount = calculateShopDiscount({ money: playerMoney, blessings } as any);
  
  const renderCharm = (charm: Charm, index: number) => {
    const basePrice = getCharmPrice(charm);
    const finalPrice = applyDiscount(basePrice, discount);
    const canAfford = playerMoney >= finalPrice;
    
    return (
      <div key={charm.id} style={{
        padding: '6px 8px',
        border: '1px solid #ddd',
        borderRadius: '3px',
        backgroundColor: 'white',
        opacity: canAfford ? 1 : 0.6,
        fontSize: '11px',
        marginBottom: '4px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <RarityDot rarity={charm.rarity || 'common'} />
            <span style={{ fontWeight: 'bold', fontSize: '11px', marginRight: '4px' }}>{charm.name}</span>
            <span style={{ fontSize: '10px', color: '#666' }}>${finalPrice}</span>
            {discount > 0 && basePrice !== finalPrice && (
              <span style={{ fontSize: '9px', color: '#999', textDecoration: 'line-through', marginLeft: '4px' }}>
                ${basePrice}
              </span>
            )}
          </div>
          <Button 
            onClick={() => onPurchaseCharm(index)}
            disabled={!canAfford}
            style={{ padding: '4px 8px', fontSize: '10px' }}
          >
            Buy
          </Button>
        </div>
        <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
          {charm.description}
        </div>
      </div>
    );
  };

  const renderConsumable = (consumable: Consumable, index: number) => {
    const basePrice = getConsumablePrice(consumable);
    const finalPrice = applyDiscount(basePrice, discount);
    const canAfford = playerMoney >= finalPrice;
    const rarity = (consumable as any).rarity || 'common';
    
    return (
      <div key={consumable.id} style={{
        padding: '6px 8px',
        border: '1px solid #ddd',
        borderRadius: '3px',
        backgroundColor: 'white',
        opacity: canAfford ? 1 : 0.6,
        fontSize: '11px',
        marginBottom: '4px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <RarityDot rarity={rarity} />
            <span style={{ fontWeight: 'bold', fontSize: '11px', marginRight: '4px' }}>{consumable.name}</span>
            <span style={{ fontSize: '10px', color: '#666' }}>${finalPrice}</span>
            {discount > 0 && basePrice !== finalPrice && (
              <span style={{ fontSize: '9px', color: '#999', textDecoration: 'line-through', marginLeft: '4px' }}>
                ${basePrice}
              </span>
            )}
          </div>
          <Button 
            onClick={() => onPurchaseConsumable(index)}
            disabled={!canAfford}
            style={{ padding: '4px 8px', fontSize: '10px' }}
          >
            Buy
          </Button>
        </div>
        <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
          {consumable.description}
        </div>
      </div>
    );
  };

  const renderBlessing = (blessing: Blessing, index: number) => {
    const basePrice = getBlessingPrice(blessing);
    const finalPrice = applyDiscount(basePrice, discount);
    const canAfford = playerMoney >= finalPrice;
    const name = getBlessingName(blessing);
    const description = getBlessingDescription(blessing);
    
    return (
      <div key={blessing.id} style={{
        padding: '6px 8px',
        border: '1px solid #ddd',
        borderRadius: '3px',
        backgroundColor: 'white',
        opacity: canAfford ? 1 : 0.6,
        fontSize: '11px',
        marginBottom: '4px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <span style={{ fontWeight: 'bold', fontSize: '11px', marginRight: '4px' }}>{name}</span>
            <span style={{ fontSize: '10px', color: '#666' }}>${finalPrice}</span>
            {discount > 0 && basePrice !== finalPrice && (
              <span style={{ fontSize: '9px', color: '#999', textDecoration: 'line-through', marginLeft: '4px' }}>
                ${basePrice}
              </span>
            )}
          </div>
          <Button 
            onClick={() => onPurchaseBlessing(index)}
            disabled={!canAfford}
            style={{ padding: '4px 8px', fontSize: '10px' }}
          >
            Buy
          </Button>
        </div>
        <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
          {description}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      padding: '12px',
      border: '2px solid #4CAF50',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>🛒 Shop</h2>
        <div style={{ fontSize: '14px' }}>
          <strong>Money:</strong> <span style={{ color: '#2d5a2d', fontWeight: 'bold' }}>${playerMoney}</span>
        </div>
      </div>
      
      {discount > 0 && (
        <div style={{
          padding: '6px',
          backgroundColor: '#e8f5e9',
          borderRadius: '4px',
          marginBottom: '12px',
          fontSize: '11px',
          color: '#2d5a2d'
        }}>
          🎁 Shop Discount: {discount}% off!
        </div>
      )}
      
      {/* Three Column Layout */}
      <div style={{ 
        display: 'flex', 
        gap: '12px',
        marginBottom: '16px',
        alignItems: 'flex-start'
      }}>
        {/* Charms Column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ marginBottom: '8px', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' }}>Charms</h3>
          {shopState.availableCharms.length === 0 ? (
            <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '4px', color: '#666', textAlign: 'center', fontSize: '10px' }}>
              (None)
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {shopState.availableCharms.map((charm, idx) => renderCharm(charm, idx))}
            </div>
          )}
        </div>
        
        {/* Consumables Column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ marginBottom: '8px', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' }}>Consumables</h3>
          {shopState.availableConsumables.length === 0 ? (
            <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '4px', color: '#666', textAlign: 'center', fontSize: '10px' }}>
              (None)
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {shopState.availableConsumables.map((consumable, idx) => renderConsumable(consumable, idx))}
            </div>
          )}
        </div>
        
        {/* Blessings Column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ marginBottom: '8px', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' }}>Blessings</h3>
          {shopState.availableBlessings.length === 0 ? (
            <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '4px', color: '#666', textAlign: 'center', fontSize: '10px' }}>
              (None)
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {shopState.availableBlessings.map((blessing, idx) => renderBlessing(blessing, idx))}
            </div>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block' }}>
          <Button onClick={onContinue}>
            Continue to Next Level
          </Button>
        </div>
      </div>
    </div>
  );
}; 