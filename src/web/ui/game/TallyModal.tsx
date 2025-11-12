import React from 'react';
import { Modal } from '../components/Modal';
import { LevelRewards as LevelRewardsType } from '../../../game/logic/tallying';

interface TallyModalProps {
  isOpen: boolean;
  levelNumber: number;
  rewards: LevelRewardsType;
  livesRemaining: number;
  onContinue: () => void;
}

export const TallyModal: React.FC<TallyModalProps> = ({
  isOpen,
  levelNumber,
  rewards,
  livesRemaining,
  onContinue
}) => {
  const containerStyle: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    minWidth: '400px'
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#2d5a2d',
    textAlign: 'center'
  };

  const sectionStyle: React.CSSProperties = {
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    marginBottom: '16px',
    border: '1px solid #e1e5e9'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#6c757d',
    marginBottom: '4px'
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2c3e50'
  };

  const totalStyle: React.CSSProperties = {
    padding: '16px',
    backgroundColor: '#e8f5e9',
    borderRadius: '6px',
    border: '2px solid #4CAF50',
    marginTop: '16px'
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px'
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="" showCloseButton={false}>
      <div style={containerStyle}>
        <h2 style={headerStyle}>Level {levelNumber} Complete!</h2>
        
        <div style={sectionStyle}>
          <div style={labelStyle}>Base Reward</div>
          <div style={valueStyle}>${rewards.baseReward}</div>
        </div>

        {rewards.livesBonus > 0 && (
          <div style={sectionStyle}>
            <div style={labelStyle}>Lives Bonus ({livesRemaining} lives × $1)</div>
            <div style={valueStyle}>+${rewards.livesBonus}</div>
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
          <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Total Earned</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d5a2d' }}>
            ${rewards.total}
          </div>
        </div>

        <button onClick={onContinue} style={buttonStyle}>
          Continue to Shop
        </button>
      </div>
    </Modal>
  );
};

