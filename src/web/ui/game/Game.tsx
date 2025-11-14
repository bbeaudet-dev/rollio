import React, { useState } from 'react';
import { Board } from './board/Board';
import { GameControls } from './GameControls';
import { LevelSummary } from './LevelSummary';
import { Inventory } from './Inventory';
import { HotDiceCounter } from './board/HotDiceCounter';
import { GameShopView } from './GameShopView';
import { GameEmptyBoardView } from './GameEmptyBoardView';
import { SettingsButton, MenuButton } from '../components';
import { SettingsModal } from '../menu';
import { TallyModal } from './TallyModal';

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
  handleConfirmTally: () => void;
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

interface GameProps {
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
  showTallyModal?: boolean;
  pendingRewards?: any;
}

export const Game: React.FC<GameProps> = ({ 
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
  showTallyModal = false,
  pendingRewards = null
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Handle shop phase
  if (isInShop && shopState && gameState && shopActions) {
    return (
      <GameShopView
        gameState={gameState}
        roundState={roundState}
        inventory={inventory}
          shopState={shopState}
        shopActions={shopActions}
        inventoryActions={inventoryActions}
      />
    );
  }
  
  // Handle tally modal FIRST (before checking roundState, since level completion sets roundState to null)
  if (showTallyModal && pendingRewards && gameState?.currentLevel) {
    // Show the game board in the background with tally modal overlay
    return (
      <>
        <MenuButton />
        <SettingsButton onClick={() => setIsSettingsOpen(true)} />
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
        {gameState && (
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0'
          }}>
            <LevelSummary gameState={gameState} roundState={roundState} />
            {roundState && (
              <div style={{ position: 'relative', marginTop: '0' }}>
                <Board
                  dice={board.dice}
                  selectedIndices={board.selectedDice}
                  onDiceSelect={() => {}}
                  canSelect={false}
                  roundNumber={gameState.currentLevel.currentRound?.roundNumber || 1}
                  rollNumber={roundState?.rollHistory?.length || 0}
                  consecutiveFlops={gameState.currentLevel.consecutiveFlops}
                  levelNumber={gameState.currentLevel?.levelNumber || 1}
                  previewScoring={null}
                  canChooseFlopShield={false}
                  onFlopShieldChoice={() => {}}
                  gameOver={false}
                  onScoreSelectedDice={() => {}}
                  lastRollPoints={0}
                  roundPoints={roundState?.roundPoints || 0}
                  gameScore={gameState.history?.totalScore || 0}
                  justBanked={false}
                  canContinueFlop={false}
                />
              </div>
            )}
            <Inventory 
              charms={inventory.charms}
              consumables={inventory.consumables}
              blessings={gameState.blessings || []}
              onConsumableUse={() => {}}
            />
          </div>
        )}
        <TallyModal
          isOpen={true}
          levelNumber={gameState.currentLevel.levelNumber}
          rewards={pendingRewards}
          banksRemaining={gameState.currentLevel.banksRemaining || 0}
          onContinue={gameActions.handleConfirmTally}
        />
      </>
    );
  }
  
  // Handle null game state
  if (!gameState) {
    return (
      <>
        <MenuButton />
        <SettingsButton onClick={() => setIsSettingsOpen(true)} />
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px',
        textAlign: 'center'
      }}>
        <div>Loading game...</div>
      </div>
      </>
    );
  }

  // Handle case where round exists but no dice have been rolled yet
  // If roundState is null, we should have already handled it (tally modal or error state)
  if (!roundState) {
    // This shouldn't happen - if we get here, something went wrong
    return (
      <>
        <MenuButton />
        <SettingsButton onClick={() => setIsSettingsOpen(true)} />
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '20px',
          textAlign: 'center'
        }}>
          <div>No active round. Please start a new game.</div>
        </div>
      </>
    );
  }
  
  const hasRolledDice = !!(roundState.rollHistory && roundState.rollHistory.length > 0);
  if (!hasRolledDice && roundState.diceHand.length === 0) {
    return (
      <>
        <MenuButton />
        <SettingsButton onClick={() => setIsSettingsOpen(true)} />
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
        <GameEmptyBoardView
          gameState={gameState}
          roundState={roundState}
          inventory={inventory}
          board={board}
          rollActions={rollActions}
          gameActions={gameActions}
          inventoryActions={inventoryActions}
          canPlay={canPlay}
        />
      </>
    );
  }

  // Get last roll points from the actual round state
  const lastRollPoints = roundState.rollHistory && roundState.rollHistory.length > 0 ? 
    roundState.rollHistory[roundState.rollHistory.length - 1]?.rollPoints || 0 : 0;

  return (
    <>
      <MenuButton />
      <SettingsButton onClick={() => setIsSettingsOpen(true)} />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0' // No gap between sections
    }}>
        <LevelSummary gameState={gameState} roundState={roundState} />

      {/* Dice-Rolling Area */}
      <div style={{ position: 'relative', marginTop: '0' }}>
        <Board
          dice={board.dice}
          selectedIndices={board.selectedDice}
          onDiceSelect={rollActions.handleDiceSelect}
          canSelect={board.canSelectDice && canPlay}
          roundNumber={gameState.currentLevel.currentRound?.roundNumber || 1}
          rollNumber={roundState?.rollHistory?.length || 0}
          consecutiveFlops={gameState.currentLevel.consecutiveFlops}
          levelNumber={gameState.currentLevel?.levelNumber || 1}
          previewScoring={board.previewScoring}
          canChooseFlopShield={board.canChooseFlopShield && canPlay}
          onFlopShieldChoice={gameActions.handleFlopShieldChoice}
          gameOver={gameState && !gameState.isActive && gameState.endReason === 'lost'}
          onScoreSelectedDice={rollActions.scoreSelectedDice}
          lastRollPoints={lastRollPoints}
          roundPoints={roundState.roundPoints}
          gameScore={gameState.history?.totalScore || 0}
          justBanked={board.justBanked}
          canContinueFlop={board.canContinueFlop && canPlay}
        />

        <HotDiceCounter count={roundState.hotDiceCounter} />

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

        <Inventory 
            charms={inventory.charms}
            consumables={inventory.consumables}
          blessings={gameState.blessings || []}
            onConsumableUse={inventoryActions.handleConsumableUse}
          />
      </div>
      
    </>
  );
}; 