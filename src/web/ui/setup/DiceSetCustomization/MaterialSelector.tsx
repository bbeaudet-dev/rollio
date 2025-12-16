import React from 'react';
import { DiceMaterialType } from '../../../../game/types';
import { MATERIALS } from '../../../../game/data/materials';
import { CreditIndicator } from '../../components/CreditIndicator';
import { useUnlocks } from '../../../contexts/UnlockContext';
import { LockIcon } from '../../components/LockIcon';
import { MATERIAL_COLORS } from '../../../utils/colors';

interface MaterialSelectorProps {
  selectedMaterial: DiceMaterialType;
  onMaterialChange: (material: DiceMaterialType) => void;
  materialCost: (material: DiceMaterialType) => number;
  creditsRemaining: number;
}

export const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  selectedMaterial,
  onMaterialChange,
  materialCost,
  creditsRemaining
}) => {
  const { unlockedItems } = useUnlocks();
  
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        fontSize: '12px',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#2c3e50'
      }}>
        Material
      </div>
      <div style={{
        display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '6px'
      }}>
        {MATERIALS.map((material) => {
          const isSelected = selectedMaterial === material.id;
          const isPlastic = material.id === 'plastic';
          const cost = materialCost(material.id as DiceMaterialType);
          const isLocked = !isPlastic && !unlockedItems.has(`material:${material.id}`);
          const canAfford = isPlastic || creditsRemaining >= cost;
          const isDisabled = (!canAfford && !isSelected) || isLocked;
          const materialColors = MATERIAL_COLORS[material.id as keyof typeof MATERIAL_COLORS] || MATERIAL_COLORS.plastic;

          return (
            <button
              key={material.id}
              onClick={() => {
                if (!isDisabled) {
                  onMaterialChange(material.id as DiceMaterialType);
                }
              }}
              disabled={isDisabled}
              style={{
                padding: '6px 8px',
                border: `2px solid ${isSelected ? materialColors.border : (isLocked ? '#dee2e6' : materialColors.border)}`,
                borderRadius: '4px',
                background: isSelected ? materialColors.background : (isLocked ? '#fff' : materialColors.background),
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled && !isLocked ? 0.5 : (isLocked ? 0.6 : 1),
                fontSize: '11px',
                textAlign: 'center',
                transition: 'border-color 0.2s ease, transform 0.2s ease',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
                color: materialColors.pip,
                fontWeight: 'bold'
              }}
              title={isLocked ? 'Locked - Use this material in a game to unlock it' : (material.description + (isPlastic ? '' : ` (${cost} credits)`))}
              onMouseEnter={(e) => {
                if (!isSelected && !isDisabled) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <div style={{
                filter: isLocked ? 'grayscale(100%) brightness(0.5)' : 'none',
                width: '100%',
                height: '100%'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {material.name}
                </div>
                {!isPlastic && (
                  <CreditIndicator cost={cost} canAfford={canAfford || isSelected} size="medium" />
                )}
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
                  <LockIcon size={20} color="white" strokeWidth={2} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

