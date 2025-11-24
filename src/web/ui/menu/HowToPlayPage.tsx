import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainMenuReturnButton } from '../components/MenuButton';

export const HowToPlayPage: React.FC = () => {
  const navigate = useNavigate();

  const containerStyle: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '900px',
    margin: '40px auto',
    padding: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e1e5e9',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #e1e5e9'
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#2c3e50'
  };

  const subheaderStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '16px',
    marginBottom: '8px',
    color: '#34495e'
  };

  const textStyle: React.CSSProperties = {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#555',
    marginBottom: '12px'
  };

  const listStyle: React.CSSProperties = {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#555',
    marginLeft: '20px',
    marginBottom: '12px'
  };

  return (
    <div style={containerStyle}>
      <MainMenuReturnButton />
      
      <h1 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#2c3e50',
        textAlign: 'center'
      }}>
        How To Play
      </h1>

      <div style={{
        fontSize: '16px',
        color: '#6c757d',
        marginBottom: '30px',
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        Welcome to Rollio! The rules take some inspiration from combination poker and Farkle, while also mixing in roguelike elements. Don't worry, I'll explain everything!
      </div>

      {/* Rolling and Combinations */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Rolling and Combinations</h2>
        <p style={textStyle}>
          At the start of each round, you'll roll all your dice. Your goal is to create scoring combinations from the rolled dice. Select dice that form valid combinations, then click "Score" to add those points to your round total.
        </p>
        <p style={textStyle}>
          Valid combinations include:
        </p>
        <ul style={listStyle}>
          <li><strong>Singles:</strong> Individual dice with values 1 or 5</li>
          <li><strong>Pairs:</strong> Two dice with the same value</li>
          <li><strong>Three of a Kind:</strong> Three dice with the same value</li>
          <li><strong>Straights:</strong> Three or more consecutive values (e.g., 1-2-3, 4-5-6)</li>
          <li><strong>Pyramids:</strong> Three dice forming a pyramid pattern (e.g., 1-2-1, 3-4-3)</li>
        </ul>
        <p style={textStyle}>
          After scoring, the selected dice are removed. You can then roll the remaining dice again, or bank your points to end the round.
        </p>
      </div>

      {/* Scoring vs Banking */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Scoring vs Banking</h2>
        <p style={textStyle}>
          When you score dice, those points are added to your <strong>round total</strong>, but they're not yet safe. You can continue rolling the remaining dice to score more points, or you can <strong>bank</strong> your round total to add it to your <strong>level progress</strong>.
        </p>
        <p style={textStyle}>
          Banking ends the round and adds your round points to your level progress. Once banked, those points count toward completing the level. However, if you flop (roll with no valid combinations), you lose all unbanked points for that round.
        </p>
        <p style={textStyle}>
          <strong>Hot Dice:</strong> If you score all your dice in a single roll, you get "Hot Dice" and can roll all your dice again without using a reroll!
        </p>
      </div>

      {/* Flopping and Rerolls */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Flopping and Rerolls</h2>
        <p style={textStyle}>
          A <strong>flop</strong> occurs when you roll dice and there are no valid scoring combinations available. When you flop, you lose all unbanked points for that round and the round ends.
        </p>
        <p style={textStyle}>
          Each level gives you a certain number of <strong>rerolls</strong>. After scoring dice, you can choose to reroll some or all of the remaining dice. You can also skip the reroll if you want to bank your points instead.
        </p>
        <p style={textStyle}>
          <strong>Progressive Flop Penalty:</strong> Each flop in a level incurs an increasing penalty that reduces your banked points. The first flop has no penalty, but subsequent flops become increasingly costly!
        </p>
      </div>

      {/* Worlds, Levels, Rounds, Rolls */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Worlds, Levels, Rounds, and Rolls</h2>
        <p style={textStyle}>
          The game is organized into a hierarchy:
        </p>
        <ul style={listStyle}>
          <li><strong>Worlds:</strong> Every 5 levels forms a world. Each world has unique effects that apply to all levels within it. After completing a world, you'll choose your next world from a map.</li>
          <li><strong>Levels:</strong> Each level has a point threshold you must reach by banking points. Complete 25 levels to win the game!</li>
          <li><strong>Rounds:</strong> Within each level, you play multiple rounds. Each round starts with rolling all your dice.</li>
          <li><strong>Rolls:</strong> Within each round, you can roll your dice multiple times (using rerolls) to build up your round score before banking.</li>
        </ul>
        <p style={textStyle}>
          <strong>Minibosses and Bosses:</strong> The 2nd and 4th levels of each world feature minibosses with special effects. The 5th level of each world is a main boss with even more challenging effects!
        </p>
      </div>

      {/* Shop, Charms, Consumables, Blessings */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Shop, Charms, Consumables, and Blessings</h2>
        <p style={textStyle}>
          After completing each level, you'll visit the <strong>Shop</strong> where you can purchase items to help you on your journey:
        </p>
        <ul style={listStyle}>
          <li><strong>Charms:</strong> Permanent items that provide ongoing bonuses and abilities. They stay in your inventory and affect gameplay as long as you hold them. Charms have different rarities (common, uncommon, rare, legendary) and can be sold if you need money.</li>
          <li><strong>Consumables:</strong> One-time-use items (Whims and Wishes) that provide immediate effects like money, dice manipulation, or special actions. Once used, they're removed from your inventory.</li>
          <li><strong>Blessings:</strong> Permanent upgrades with 3 tiers of effects. Each tier must be purchased separately, and blessings cannot be sold. They provide persistent bonuses throughout your run.</li>
        </ul>
        <p style={textStyle}>
          You can also use consumables and sell charms/consumables directly from your inventory during gameplay.
        </p>
      </div>

      {/* Materials and Pip Effects */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Materials and Pip Effects</h2>
        <p style={textStyle}>
          Each die in your set has a <strong>Material</strong> that provides special effects. Plastic is the default material with no special effect, but other materials like Crystal, Flower, Golden, and more provide powerful abilities that are essential for success.
        </p>
        <p style={textStyle}>
          <strong>Pip Effects</strong> can be applied to individual sides of your dice. When that side is face-up after a roll, the pip effect activates. These effects can modify dice values, provide bonuses, or trigger special abilities.
        </p>
        <p style={textStyle}>
          You can view and manage your dice set, materials, and pip effects in the Collection page.
        </p>
      </div>

      {/* Winning the Game and Difficulty Levels */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Winning the Game and Difficulty Levels</h2>
        <p style={textStyle}>
          <strong>Win Condition:</strong> Complete all 25 levels (5 worlds × 5 levels) to win the game!
        </p>
        <p style={textStyle}>
          <strong>Difficulty Levels:</strong> When starting a new game, you'll choose a difficulty level. Each difficulty has unique effects and modifiers that make the game more challenging:
        </p>
        <ul style={listStyle}>
          <li><strong>Plastic/Copper:</strong> Beginner difficulties with basic effects</li>
          <li><strong>Silver/Gold/Rose Gold:</strong> Intermediate difficulties with moderate challenges</li>
          <li><strong>Platinum/Sapphire/Emerald/Ruby:</strong> Advanced difficulties with significant restrictions and modifiers</li>
          <li><strong>Diamond/Quantum:</strong> Expert difficulties with extreme challenges and unique mechanics</li>
        </ul>
        <p style={textStyle}>
          Higher difficulties provide greater rewards but also impose cumulative effects from all lower difficulties. Choose wisely!
        </p>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <MainMenuReturnButton style={{ position: 'relative', top: 'auto', left: 'auto' }} />
      </div>
    </div>
  );
};

