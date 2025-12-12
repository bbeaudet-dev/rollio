import React from 'react';
import { Modal } from '../../components/Modal';
import { DiceFace } from '../board/dice/DiceFace';
import { Die } from '../../../../game/types';

interface DiceSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  diceSet: Die[];
}

export const DiceSetModal: React.FC<DiceSetModalProps> = ({
  isOpen,
  onClose,
  diceSet
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dice Set">
      <div style={{
        minWidth: '500px',
        maxWidth: '700px',
        maxHeight: '600px',
        overflowY: 'auto',
        padding: '0 20px'
      }}>
        {diceSet.length === 0 ? (
          <div style={{
            color: '#6c757d',
            fontSize: '14px',
            textAlign: 'center',
            padding: '40px 20px'
          }}>
            No dice in your set.
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {diceSet.map((die, index) => (
              <div 
                key={die.id}
                style={{
                  paddingBottom: index < diceSet.length - 1 ? '12px' : '0',
                  borderBottom: index < diceSet.length - 1 ? '2px solid #e1e5e9' : 'none',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
                  gap: '12px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  {die.allowedValues.map((value) => (
                    <DiceFace
                      key={value}
                      value={value}
                      size={50}
                      material={die.material}
                      pipEffect={die.pipEffects?.[value]}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

