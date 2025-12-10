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
        Welcome to Rollio, the dice-rolling roguelike!
      </div>

      <div style={sectionStyle}>
        <h2 style={headerStyle}>Rolling and Scoring</h2>
        <p style={textStyle}>
          You start by rolling all of your dice. Your goal is to score points by combining the dice in different patterns (like hands in Poker, e.g. Two Pair, Full House, Straight). Combinations include:
        </p>
        <ul style={listStyle}>
          <li><strong>Singles:</strong> 1s and 5s are special and can be played individually</li>
          <li><strong>Pairs:</strong> Set(s) of two dice with the same value</li>
          <li><strong>N of a Kind:</strong> Three or more dice with the same value (e.g. 3-3-3, 6-6-6-6-6)</li>
          <li><strong>Straights:</strong> Four or more dice with consecutive values (e.g., 1-2-3-4)</li>
          <li><strong>Pyramids:</strong> Dice forming a consecutive "layered" pattern (e.g. 3-3-3-2-2-1))</li>
          <li><strong>N-Tuplets:</strong> Two or more tuplets of three or more (e.g. two triplets, four triplets, three quintuplets, six quadruplets)</li>
        </ul>
        <p style={textStyle}>
          After scoring one or more combinations, the included dice are temporarily removed from your hand. You then have a chance to roll again with the remaining dice, and the process repeats. 
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headerStyle}>Flopping & Banking</h2>
        <p style={textStyle}>
          The game is made up of <strong>Levels</strong> with progressively higher thresholds for how many points you need to score. Some levels have additional effects that make them more challenging and require different strategies.
        </p>
        <p style={textStyle}>
          Each time you score dice after rolling, the points are added to a running <strong>Round</strong> total - but they're not safe yet! If you choose to roll again and are unable to form any combinations, you forfeit this Round total - this is called a <strong>Flop</strong>.
        </p>
        <p style={textStyle}>
          To safeguard your points, you can choose to <strong>Bank</strong> them instead of continuing to roll - points only count towards the Level score once they are banked. You will have a limited number of Banks per Level.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headerStyle}>Hot Dice & Rerolls</h2>
        <p style={textStyle}>
          All dice are returned to your hand after either banking or flopping. If you manage to score all of the dice in your hand, either in a single roll or over multiple rolls without flopping or banking, you get "Hot Dice", and all of your dice return to your hand. Whereas banking and flopping end the round, Hot Dice continues a round. 
        </p>
        <p style={textStyle}>
          You also have a limited number of <strong>Rerolls</strong> per Level. Whereas you typically have to score at least one combination in between rolls, rerolls allow you to roll one or more dice without having to score or remove any dice. These come in handy to prevent flops!
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headerStyle}>The Shop & Dice Modification</h2>
        <p style={textStyle}>
          After completing each level, you'll visit the <strong>Shop</strong> where you can purchase items to help you on your journey:
        </p>
        <ul style={listStyle}>
          <li><strong>Charms:</strong> Items that provide ongoing bonuses and abilities as long as they stay in your inventory</li>
          <li><strong>Consumables:</strong> One-time-use items that provide immediate effects</li>
          <li><strong>Blessings:</strong> Permanent upgrades with 3 tiers of effects, purchased separately</li>
        </ul>
        <p style={textStyle}>
          In addition to purchasing these bonuses, there are a few ways to modify the dice in your set:
        </p>
        <ul style={listStyle}>
          <li><strong>Materials:</strong> Each die has a single material. Plastic is the default, with other materials providing special bonuses.</li>
          <li><strong>Pip Effects:</strong> Each side of each die can have a pip effect, which provides a special effect if that particular side is rolled and scored.</li>
          <li><strong>Side Values:</strong>The values of each side of each die can also be changed incrementally.</li>
        </ul>
      </div>

      {/* Winning the Game */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Winning the Game</h2>
        <p style={textStyle}>
          <strong>Win Condition:</strong> Complete 25 levels to win the game!
        </p>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <MainMenuReturnButton style={{ position: 'relative', top: 'auto', left: 'auto' }} />
      </div>
    </div>
  );
};

