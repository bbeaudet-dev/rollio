import React from 'react';
import { DiceDisplay, CasinoDiceArea } from './dice';
import { GameControls } from './GameControls';
import { CharmInventory, ConsumableInventory, BlessingInventory } from './inventory/';
import { PreviewScoring } from './score/PreviewScoring';
import { ShopDisplay } from './shop/ShopDisplay';
import { LevelRewards } from './score/LevelRewards';
import { Button } from '../ui/Button';
import { useGameState } from '../../hooks/useGameState';

// Intermediary interfaces for logical groups
interface RollActions {
  handleDiceSelect: (index: number) => void;
  handleRollDice: () => void;
  scoreSelectedDice: () => void;
  handleRerollSelection: (selectedIndices: number[]) => void;
}

interface GameActions {
  handleBank: () => void;
  startNewGame: (diceSetIndex: number, selectedCharms: number[], selectedConsumables: number[]) => void;
  handleFlopContinue: () => void;
  handleFlopShieldChoice: (useShield: boolean) => void;
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
  canReroll: boolean; // After scoring - can roll remaining dice
  canSelectDice: boolean;
  isWaitingForReroll: boolean; // Before scoring - can reroll any dice
  canRerollSelected: boolean; // Before scoring - can reroll selected dice
  canContinueFlop: boolean; // After flop - can continue
  canChooseFlopShield: boolean; // Can choose whether to use flop shield
  justBanked: boolean;
  justFlopped: boolean;
}

interface ShopActions {
  handlePurchaseCharm: (index: number) => void;
  handlePurchaseConsumable: (index: number) => void;
  handlePurchaseBlessing: (index: number) => void;
  handleExitShop: () => void;
}

interface GameBoardProps {
  rollActions: RollActions;
  gameActions: GameActions;
  inventoryActions: InventoryActions;
  shopActions?: ShopActions;
  board: GameBoardData;
  gameState: any;
  roundState: any;
  inventory: any;
  isInShop?: boolean;
  shopState?: any;
  levelRewards?: any;
  canPlay?: boolean;
  isMultiplayer?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  rollActions, 
  gameActions, 
  inventoryActions,
  shopActions,
  board, 
  gameState, 
  roundState, 
  inventory,
  isInShop = false,
  shopState = null,
  levelRewards = null,
  canPlay = true,
  isMultiplayer = false
}) => {
  // Handle shop phase
  if (isInShop && shopState && gameState && shopActions) {
    const completedLevelNumber = gameState.currentLevel?.levelNumber ? gameState.currentLevel.levelNumber - 1 : 1;
    const livesRemaining = gameState.history?.levelHistory?.[gameState.history.levelHistory.length - 1]?.livesRemaining || 0;
    
    return (
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {levelRewards && (
          <LevelRewards
            levelNumber={completedLevelNumber}
            rewards={levelRewards}
            livesRemaining={livesRemaining}
          />
        )}
        
        {/* Game Status Bar - same as main game board */}
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
            <div><strong>Lives:</strong> {gameState.currentLevel?.livesRemaining || 0}</div>
            <div style={{ marginLeft: 'auto' }}><strong>Money:</strong> ${gameState.money || 0}</div>
          </div>
        </div>

        {/* Charm, Consumable, and Blessing Inventories - same as main game board */}
        <div style={{ 
          backgroundColor: '#e9ecef',
          border: '1px solid #dee2e6',
          borderTop: 'none',
          borderTopLeftRadius: '0',
          borderTopRightRadius: '0',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
          padding: '8px',
          marginBottom: '0'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '10px'
          }}>
            <CharmInventory 
              charms={inventory.charms}
            />
            
            <ConsumableInventory 
              consumables={inventory.consumables}
              onConsumableUse={inventoryActions.handleConsumableUse}
            />
            
            <BlessingInventory 
              blessings={gameState.blessings || []}
            />
          </div>
        </div>
        
        <ShopDisplay
          shopState={shopState}
          playerMoney={gameState.money || 0}
          blessings={gameState.blessings || []}
          onPurchaseCharm={shopActions.handlePurchaseCharm}
          onPurchaseConsumable={shopActions.handlePurchaseConsumable}
          onPurchaseBlessing={shopActions.handlePurchaseBlessing}
          onContinue={shopActions.handleExitShop}
        />
      </div>
    );
  }
  
  // Handle null game state
  if (!gameState) {
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

  // Handle case where game is initialized but no round has started yet
  if (!roundState) {
    return (
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h2>Game Ready!</h2>
          <p>Click "Start New Round" to begin playing.</p>
        </div>
        <GameControls 
          onRoll={rollActions.handleRollDice}
          onBank={gameActions.handleBank}
          canRoll={board.canRoll && canPlay}
          canBank={false}
          diceToReroll={0}
          canReroll={false}
          hasRoundState={false}
        />
      </div>
    );
  }

  // Handle case where round exists but no dice have been rolled yet
  const hasRolledDice = !!(roundState.rollHistory && roundState.rollHistory.length > 0);
  if (!hasRolledDice && roundState.diceHand.length === 0) {
    // Round started but no dice rolled - show blank board with Roll button
    return (
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0'
      }}>
        {/* Game Status Bar */}
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
            <div><strong>Lives:</strong> {gameState.currentLevel?.livesRemaining || 0}</div>
            <div style={{ marginLeft: 'auto' }}><strong>Money:</strong> ${gameState.money || 0}</div>
          </div>
        </div>

        {/* Blank dice area with Roll button */}
        <div style={{ 
          position: 'relative',
          width: '100%',
          height: '500px', 
          minHeight: '400px',
          marginTop: '0'
        }}>
          <CasinoDiceArea
            dice={[]}
            selectedIndices={[]}
            onDiceSelect={() => {}}
            canSelect={false}
            roundNumber={roundState.roundNumber || 1}
            rollNumber={0}
            hotDiceCount={0}
            consecutiveFlops={gameState.currentLevel.consecutiveFlops}
            levelNumber={gameState.currentLevel?.levelNumber || 1}
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

        {/* Charm, Consumable, and Blessing Inventories - underneath game board */}
        <div style={{ 
          backgroundColor: '#e9ecef',
          border: '1px solid #dee2e6',
          borderTop: 'none',
          borderTopLeftRadius: '0',
          borderTopRightRadius: '0',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
          padding: '8px',
          marginTop: '0'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '10px'
          }}>
            <CharmInventory 
              charms={inventory.charms}
            />
            
            <ConsumableInventory 
              consumables={inventory.consumables}
              onConsumableUse={inventoryActions.handleConsumableUse}
            />
            
            <BlessingInventory 
              blessings={gameState.blessings || []}
            />
          </div>
        </div>
      </div>
    );
  }

  // Get last roll points from the actual round state
  const lastRollPoints = roundState.rollHistory && roundState.rollHistory.length > 0 ? 
    roundState.rollHistory[roundState.rollHistory.length - 1]?.rollPoints || 0 : 0;

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0' // No gap between sections
    }}>
      {/* Game Status Bar */}
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
          <div><strong>Lives:</strong> {gameState.currentLevel?.livesRemaining || 0}</div>
          <div style={{ marginLeft: 'auto' }}><strong>Money:</strong> ${gameState.money || 0}</div>
        </div>
      </div>

      {/* Dice-Rolling Area */}
      <div style={{ position: 'relative', marginTop: '0' }}>
        <CasinoDiceArea
          dice={board.dice}
          selectedIndices={board.selectedDice}
          onDiceSelect={rollActions.handleDiceSelect}
          canSelect={board.canSelectDice && canPlay}
          roundNumber={gameState.currentLevel.currentRound?.roundNumber || 1}
          rollNumber={(() => {
            // If dice are rolled but not in history yet, show 1
            if (roundState.diceHand.length > 0 && (!roundState.rollHistory || roundState.rollHistory.length === 0)) {
              return 1;
            }
            // Otherwise use history length
            return roundState.rollHistory?.length || 0;
          })()}
          hotDiceCount={roundState.hotDiceCounter}
          consecutiveFlops={gameState.currentLevel.consecutiveFlops}
          levelNumber={gameState.currentLevel?.levelNumber || 1}
          previewScoring={board.previewScoring}
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
            zIndex: 30,
            opacity: 0.9 // Make slightly transparent
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

        {/* Flop Shield Choice - Center Overlay */}
        {board.canChooseFlopShield && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 30,
            backgroundColor: 'rgba(255, 243, 224, 0.9)', // Make slightly transparent
            border: '2px solid #ff9800',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#e65100',
            minWidth: '300px'
          }}>
            🛡️ Flop Shield Available!
            <div style={{ fontSize: '14px', marginTop: '8px', fontWeight: 'normal', marginBottom: '12px' }}>
              Would you like to use your Flop Shield to prevent this flop?
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => gameActions.handleFlopShieldChoice(true)}
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Use Shield
              </button>
              <button
                onClick={() => gameActions.handleFlopShieldChoice(false)}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Game Over Notification - Center Overlay */}
        {gameState && !gameState.isActive && gameState.endReason === 'lost' && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 30,
            backgroundColor: 'rgba(255, 235, 238, 0.9)', // Make slightly transparent
            border: '2px solid #f44336',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#c62828',
            minWidth: '250px'
          }}>
            💀 GAME OVER 💀
            <div style={{ fontSize: '14px', marginTop: '8px', fontWeight: 'normal' }}>
              You ran out of lives!
            </div>
          </div>
        )}

        {/* Flop Notification - Center Overlay */}
        {board.canContinueFlop && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 30,
            backgroundColor: 'rgba(255, 235, 238, 0.9)', // Make slightly transparent
            border: '2px solid #f44336',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#c62828',
            minWidth: '250px'
          }}>
            🎲 FLOP! 🎲
            <div style={{ fontSize: '14px', marginTop: '8px', fontWeight: 'normal' }}>
              No valid scoring combinations found
            </div>
          </div>
        )}

        {/* Hot Dice counter - positioned to the left of controls (absolute, doesn't affect centering) */}
        {roundState.hotDiceCounter > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '50%',
            transform: 'translateX(calc(-100% - 20px))', // Position to the left of center with gap
            zIndex: 25,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}>
            {'🔥'.repeat(Math.min(roundState.hotDiceCounter, 3))} Hot dice! x{roundState.hotDiceCounter}
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
            onRoll={() => {
              if (board.isWaitingForReroll) {
                // Reroll selected dice
                rollActions.handleRerollSelection(board.selectedDice);
              } else {
                // Regular roll/reroll
                rollActions.handleRollDice();
              }
            }}
            onContinue={gameActions.handleFlopContinue}
            onBank={gameActions.handleBank}
            canRoll={board.canRoll && canPlay}
            canBank={board.canBank && canPlay}
            diceToReroll={(() => {
              // If hot dice occurred (diceHand is empty but we can roll full set), use full dice set
              const hasHotDice = !!(roundState.rollHistory && roundState.rollHistory.length > 0 && 
                roundState.rollHistory[roundState.rollHistory.length - 1]?.isHotDice);
              if (roundState.diceHand.length === 0 && hasHotDice) {
                return gameState.diceSet.length;
              }
              // Otherwise, use remaining dice count
              return board.dice.length;
            })()}
            canReroll={board.canReroll && canPlay}
            isWaitingForReroll={board.isWaitingForReroll && canPlay}
            canRerollSelected={board.canRerollSelected && canPlay}
            canContinueFlop={board.canContinueFlop && canPlay}
            selectedDiceCount={board.selectedDice.length}
            hasRoundState={true}
          />
        </div>
      </div>

      {/* Charm, Consumable, and Blessing Inventories - underneath game board */}
      <div style={{ 
        backgroundColor: '#e9ecef',
        border: '1px solid #dee2e6',
        borderTop: 'none',
        borderTopLeftRadius: '0',
        borderTopRightRadius: '0',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
        padding: '8px',
        marginTop: '0'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '10px'
        }}>
          <CharmInventory 
            charms={inventory.charms}
          />
          
          <ConsumableInventory 
            consumables={inventory.consumables}
            onConsumableUse={inventoryActions.handleConsumableUse}
          />
          
          <BlessingInventory 
            blessings={gameState.blessings || []}
          />
        </div>
      </div>
    </div>
  );
}; 