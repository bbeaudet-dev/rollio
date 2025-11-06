import React from 'react';
import { DiceDisplay, CasinoDiceArea } from './dice';
import { GameControls } from './GameControls';
import { CharmInventory, ConsumableInventory } from './inventory/';
import { PreviewScoring } from './score/PreviewScoring';
import { Button } from '../ui/Button';
import { useGameState } from '../../hooks/useGameState';

// Intermediary interfaces for logical groups
interface RollActions {
  handleDiceSelect: (index: number) => void;
  handleRollDice: () => void;
  scoreSelectedDice: () => void;
}

interface GameActions {
  handleBank: () => void;
  startNewGame: (diceSetIndex: number, selectedCharms: number[], selectedConsumables: number[]) => void;
}

interface InventoryActions {
  handleConsumableUse: (index: number) => void;
}

interface GameBoardData {
  dice: any[];
  selectedDice: number[];
  previewScoring: any;
  canRoll: boolean;
  canBank: boolean;
  canReroll: boolean;
  canSelectDice: boolean;
  justBanked: boolean;
  justFlopped: boolean;
}

interface GameBoardProps {
  rollActions: RollActions;
  gameActions: GameActions;
  inventoryActions: InventoryActions;
  board: GameBoardData;
  gameState: any;
  roundState: any;
  inventory: any;
  canPlay?: boolean;
  isMultiplayer?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  rollActions, 
  gameActions, 
  inventoryActions, 
  board, 
  gameState, 
  roundState, 
  inventory, 
  canPlay = true,
  isMultiplayer = false
}) => {
  // Handle null game state
  if (!gameState || !roundState) {
    return (
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px',
        textAlign: 'center'
      }}>
        <div>Loading game...</div>
      </div>
    );
  }

  // Get last roll points from the actual round state
  const lastRollPoints = roundState.history.rollHistory.length > 0 ? 
    roundState.history.rollHistory[roundState.history.rollHistory.length - 1]?.core?.rollPoints || 0 : 0;

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px' // Reduced gap between sections
    }}>
      {/* Game Status Bar */}
      <div style={{ 
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '12px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          fontSize: '16px',
          gap: '30px'
        }}>
          <div><strong>Game Score:</strong> {gameState.history.totalScore}</div>
          <div><strong>Money:</strong> ${gameState.money}</div>
        </div>
      </div>

      {/* Charm and Consumable Inventories */}
      <div style={{ 
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '8px',
        marginBottom: '0' // Remove bottom margin to touch casino area
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px'
        }}>
          <CharmInventory 
            charms={inventory.charms}
          />
          
          <ConsumableInventory 
            consumables={inventory.consumables}
            onConsumableUse={inventoryActions.handleConsumableUse}
          />
        </div>
      </div>

      {/* Dice-Rolling Area */}
      <div style={{ position: 'relative' }}>
        <CasinoDiceArea
          dice={board.dice}
          selectedIndices={board.selectedDice}
          onDiceSelect={rollActions.handleDiceSelect}
          canSelect={board.canSelectDice && canPlay}
          roundNumber={gameState.currentLevel.currentRound?.roundNumber || 1}
          rollNumber={roundState.roundNumber}
          hotDiceCount={roundState.hotDiceCounter}
          consecutiveFlops={gameState.currentLevel.consecutiveFlops}
        />

        {/* Points Display - Top Center Overlay */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 25,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {/* Roll Points - GREEN when just scored dice */}
          {lastRollPoints > 0 && (board.canReroll && canPlay) && !board.justBanked && (
            <div style={{ color: '#28a745' }}>
              Roll points: +{lastRollPoints}
            </div>
          )}
          
          {/* Round Points - BLUE when just banked points, WHITE otherwise */}
          <div style={{ 
            color: board.justBanked ? '#007bff' : 'white'
          }}>
            Round points: {board.justBanked ? '+' : ''}{roundState.roundPoints}
          </div>
          
          {/* Game Score - show only when just banked points */}
          {board.justBanked && (
            <div style={{ 
              marginTop: '5px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              Game score: {gameState.history.totalScore}
            </div>
          )}
        </div>

        {/* Score Selected Dice Button - Center Overlay */}
        {(board.canSelectDice && canPlay) && board.selectedDice.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 30
          }}>
            <Button 
              onClick={rollActions.scoreSelectedDice}
              disabled={!board.previewScoring?.isValid}
            >
              Score Selected Dice ({board.selectedDice.length})
              {board.previewScoring?.isValid && ` - ${board.previewScoring.points} pts`}
            </Button>
          </div>
        )}

        {/* Game Controls - Bottom Center Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 25,
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          <GameControls 
            onRoll={rollActions.handleRollDice}
            onBank={gameActions.handleBank}
            canRoll={board.canRoll && canPlay}
            canBank={board.canBank && canPlay}
            diceToReroll={(roundState.diceHand.length === 0 && roundState.history.rollHistory.length > 0) ? gameState.diceSet.length : board.dice.length}
            canReroll={board.canReroll && canPlay}
          />
        </div>
      </div>

      {/* Game Controls and Info Area - Only show in single-player mode */}
      {!isMultiplayer && (
        <div style={{ 
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <DiceDisplay 
            dice={board.dice}
            selectedIndices={board.selectedDice}
            onDiceSelect={rollActions.handleDiceSelect}
            canSelect={board.canSelectDice && canPlay}
            isHotDice={roundState.diceHand.length === 0 && roundState.history.rollHistory.length > 0}
            hotDiceCount={roundState.hotDiceCounter}
            roundNumber={gameState.currentLevel.currentRound?.roundNumber || 1}
            rollNumber={roundState.rollNumber}
          />

          {/* Flop Notification */}
          {board.justFlopped && (
            <div style={{ 
              marginTop: '15px', 
              padding: '12px', 
              backgroundColor: '#ffebee',
              border: '2px solid #f44336',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#c62828'
            }}>
              🎲 FLOP! 🎲
              <div style={{ fontSize: '14px', marginTop: '5px', fontWeight: 'normal' }}>
                No valid scoring combinations found
              </div>
            </div>
          )}
          
          <PreviewScoring previewScoring={board.previewScoring} />
        </div>
      )}
    </div>
  );
}; 