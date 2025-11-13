import React from 'react';
import { Board } from './board/Board';
import { GameControls } from './GameControls';
import { Inventory } from './Inventory';

interface GameEmptyBoardViewProps {
  gameState: any;
  roundState: any;
  inventory: any;
  board: any;
  rollActions: any;
  gameActions: any;
  inventoryActions: any;
  canPlay: boolean;
}

export const GameEmptyBoardView: React.FC<GameEmptyBoardViewProps> = ({
  gameState,
  roundState,
  inventory,
  board,
  rollActions,
  gameActions,
  inventoryActions,
  canPlay
}) => {
  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0'
    }}>
      <div style={{ 
        backgroundColor: '#e9ecef',
        border: '1px solid #dee2e6',
        borderBottom: 'none',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        borderBottomLeftRadius: '0',
        borderBottomRightRadius: '0',
        padding: '12px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          fontSize: '16px',
          gap: '30px',
          flexWrap: 'wrap'
        }}>
          <div><strong>Level:</strong> {gameState.currentLevel?.levelNumber || 1}</div>
          <div><strong>Points:</strong> {gameState.currentLevel?.pointsBanked || 0} / {gameState.currentLevel?.levelThreshold || 0}</div>
          <div><strong>Rerolls:</strong> {gameState.currentLevel?.rerollsRemaining || 0}</div>
          <div><strong>Lives:</strong> {gameState.currentLevel?.banksRemaining || 0}</div>
          <div style={{ marginLeft: 'auto' }}><strong>Money:</strong> ${gameState.money || 0}</div>
        </div>
      </div>

      <div style={{ 
        position: 'relative',
        width: '100%',
        height: '500px', 
        minHeight: '400px',
        marginTop: '0'
      }}>
        <Board
          dice={[]}
          selectedIndices={[]}
          onDiceSelect={() => {}}
          canSelect={false}
          roundNumber={roundState.roundNumber || 1}
          rollNumber={0}
          hotDiceCount={0}
          consecutiveFlops={gameState.currentLevel.consecutiveFlops}
          levelNumber={gameState.currentLevel?.levelNumber || 1}
          roundPoints={roundState.roundPoints || 0}
          gameScore={gameState.history?.totalScore || 0}
          justBanked={false}
        />
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 25
        }}>
          <GameControls 
            onRoll={rollActions.handleRollDice}
            onBank={gameActions.handleBank}
            canRoll={board.canRoll && canPlay}
            canBank={false}
            diceToReroll={gameState.diceSet.length}
            canReroll={false}
            hasRoundState={true}
          />
        </div>
      </div>

      <Inventory 
        charms={inventory.charms}
        consumables={inventory.consumables}
        blessings={gameState.blessings || []}
        onConsumableUse={inventoryActions.handleConsumableUse}
      />
    </div>
  );
};

