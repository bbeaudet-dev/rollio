import React from 'react';
import { CreditIndicator } from '../../components/CreditIndicator';

interface ConfigOption {
  label: string;
  value: number | string;
  onIncrement?: () => void;
  onDecrement?: () => void;
  canIncrement?: boolean;
  canDecrement?: boolean;
  cost?: number;
  minValue?: number;
  displayOnly?: boolean; 
  displayValue?: React.ReactNode; 
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
    <>
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
          <span style={{ fontSize: '12px', fontWeight: 'bold', marginRight: '4px' }}>{option.label}:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {option.displayOnly ? (
              // Display-only option (like starting money)
              <span style={{ fontSize: '12px', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>
                {option.displayValue || option.value}
              </span>
            ) : (
              // Editable option with buttons
              <>
                <button
                  onClick={option.onDecrement}
                  disabled={!option.canDecrement}
                  style={{
                    width: '24px',
                    height: '24px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    cursor: option.canDecrement ? 'pointer' : 'not-allowed',
                    opacity: option.canDecrement ? 1 : 0.5,
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  −
                </button>
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
                    opacity: option.canIncrement ? 1 : 0.5,
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  +
                </button>
                {option.cost !== undefined && (
                  <CreditIndicator cost={option.cost} canAfford={creditsRemaining >= option.cost} size="medium" />
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

