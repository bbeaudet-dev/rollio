import React, { useEffect } from 'react';
import { Modal } from '../components/Modal';
import { ActionButton } from '../components/ActionButton';
import { LevelRewards as LevelRewardsType } from '../../../game/logic/tallying';
import { playLevelCompleteSound } from '../../utils/sounds';

interface TallyModalProps {
  isOpen: boolean;
  levelNumber: number;
  rewards: LevelRewardsType;
  banksRemaining: number;
  onContinue: () => void;
}

export const TallyModal: React.FC<TallyModalProps> = ({
  isOpen,
  levelNumber,
  rewards,
  banksRemaining,
  onContinue
}) => {
  // Play level complete sound when modal opens
  useEffect(() => {
    if (isOpen) {
      playLevelCompleteSound();
    }
  }, [isOpen]);
  const containerStyle: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    padding: '12px',
    minWidth: '300px',
    maxWidth: '400px'
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#2d5a2d',
    textAlign: 'center'
  };

  const sectionStyle: React.CSSProperties = {
    padding: '8px 12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    marginBottom: '8px',
    border: '1px solid #e1e5e9'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6c757d',
    marginBottom: '2px'
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#2c3e50'
  };

  const totalStyle: React.CSSProperties = {
    padding: '10px 12px',
    backgroundColor: '#e8f5e9',
    borderRadius: '6px',
    border: '2px solid #4CAF50',
    marginTop: '10px'
  };


  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="" showCloseButton={false}>
      <div style={containerStyle}>
        <h2 style={headerStyle}>Level {levelNumber} Complete!</h2>
        
        <div style={sectionStyle}>
          <div style={labelStyle}>Base Reward</div>
          <div style={valueStyle}>${rewards.baseReward}</div>
        </div>

        {rewards.banksBonus > 0 && (
          <div style={sectionStyle}>
            <div style={labelStyle}>Banks Bonus ({banksRemaining} banks × $1)</div>
            <div style={valueStyle}>+${rewards.banksBonus}</div>
          </div>
        )}

        {rewards.charmBonuses > 0 && (
          <div style={sectionStyle}>
            <div style={labelStyle}>Charm Bonuses</div>
            <div style={valueStyle}>+${rewards.charmBonuses}</div>
          </div>
        )}

        {rewards.blessingBonuses > 0 && (
          <div style={sectionStyle}>
            <div style={labelStyle}>Blessing Bonuses</div>
            <div style={valueStyle}>+${rewards.blessingBonuses}</div>
          </div>
        )}

        <div style={totalStyle}>
          <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '2px' }}>Total Earned</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d5a2d' }}>
            ${rewards.total}
          </div>
        </div>

        <div style={{ marginTop: '12px', width: '100%' }}>
          <ActionButton onClick={onContinue} variant="success" size="large" style={{ width: '100%' }}>
            Continue to Shop
          </ActionButton>
        </div>
      </div>
    </Modal>
  );
};

