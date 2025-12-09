import React from 'react';
import { CreditCostDisplay } from './CreditCostDisplay';

interface ConfigOption {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  canIncrement: boolean;
  canDecrement: boolean;
  cost: number;
  minValue?: number;
}

interface ConfigOptionsProps {
  options: ConfigOption[];
  creditsRemaining: number;
}

export const ConfigOptions: React.FC<ConfigOptionsProps> = ({
  options,
  creditsRemaining
}) => {
  return (
    <div style={{
      marginTop: '20px',
      padding: '16px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <div style={{
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '12px',
        color: '#2c3e50'
      }}>
        Additional Customization
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px'
      }}>
        {options.map((option, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              border: '1px solid #dee2e6'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{option.label}:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>
                {option.value}
              </span>
              <button
                onClick={option.onIncrement}
                disabled={!option.canIncrement}
                style={{
                  width: '24px',
                  height: '24px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  cursor: option.canIncrement ? 'pointer' : 'not-allowed',
                  opacity: option.canIncrement ? 1 : 0.5
                }}
              >
                +
              </button>
              <CreditCostDisplay cost={option.cost} canAfford={creditsRemaining >= option.cost} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

