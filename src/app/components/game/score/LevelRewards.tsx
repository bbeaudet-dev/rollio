import React from 'react';
import { LevelRewards as LevelRewardsType } from '../../../../game/logic/tallying';

interface LevelRewardsProps {
  levelNumber: number;
  rewards: LevelRewardsType;
  livesRemaining: number;
}

export const LevelRewards: React.FC<LevelRewardsProps> = ({
  levelNumber,
  rewards,
  livesRemaining
}) => {
  return (
    <div style={{
      padding: '20px',
      border: '2px solid #4CAF50',
      borderRadius: '8px',
      backgroundColor: '#f1f8f4',
      marginBottom: '20px'
    }}>
      <h2 style={{ marginTop: 0, marginBottom: '16px', color: '#2d5a2d' }}>
        🎉 Level {levelNumber} Complete! 🎉
      </h2>
      
      <div style={{
        padding: '12px',
        backgroundColor: 'white',
        borderRadius: '4px',
        marginBottom: '12px'
      }}>
        <div style={{ fontSize: '14px', marginBottom: '8px' }}>
          <strong>Rewards Earned:</strong>
        </div>
        <div style={{ fontSize: '13px', marginLeft: '12px' }}>
          <div>Base Reward: <strong>${rewards.baseReward}</strong></div>
          {rewards.livesBonus > 0 && (
            <div>Lives Bonus ({livesRemaining} lives × $1): <strong>+${rewards.livesBonus}</strong></div>
          )}
          {rewards.charmBonuses > 0 && (
            <div>Charm Bonuses: <strong>+${rewards.charmBonuses}</strong></div>
          )}
          {rewards.blessingBonuses > 0 && (
            <div>Blessing Bonuses: <strong>+${rewards.blessingBonuses}</strong></div>
          )}
        </div>
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #ddd',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#2d5a2d'
        }}>
          Total: <strong>${rewards.total}</strong>
        </div>
      </div>
    </div>
  );
};

