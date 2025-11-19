import React, { useState } from 'react';
import { Board } from './board/Board';
import { GameControls } from './GameControls';
import { Inventory } from './Inventory';
import { HotDiceCounter } from './board/HotDiceCounter';
import { GameShopView } from './GameShopView';
import { SettingsButton, MenuButton } from '../components';
import { SettingsModal } from '../menu';
import { TallyModal } from './TallyModal';

// Intermediary interfaces for logical groups
interface RollActions {
  handleDiceSelect: (index: number) => void;
  handleRollDice: () => void;
  scoreSelectedDice: () => void;
  handleRerollSelection: (selectedIndices: number[]) => void;
  handleCompleteBreakdown: () => void;
}

interface GameActions {
  handleBank: () => void;
  startNewGame: (diceSetIndex: number, difficulty: string) => void;
  handleFlopShieldChoice: (useShield: boolean) => void;
  handleConfirmTally: () => void;
  getDiceToRollCount: (gameState: any) => number;
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
  canChooseFlopShield: boolean; // Can choose whether to use flop shield
  justBanked: boolean;
  justFlopped: boolean;
  bankingDisplayInfo?: {
    pointsJustBanked: number;
    previousTotal: number;
    newTotal: number;
  } | null;
  scoringBreakdown?: any;
  breakdownState?: 'hidden' | 'animating' | 'complete';
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
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
        {gameState && (
          <div style={{ 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '0'
          }}>
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
                  gameScore={gameState.history?.totalScore || 0}
                  justBanked={false}
                />
              </div>
            )}
            <Inventory 
              charms={inventory.charms}
              consumables={inventory.consumables}
              blessings={gameState.blessings || []}
              money={gameState.money}
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
        {/* Menu and Settings buttons below inventory in tally view */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #dee2e6'
        }}>
          <MenuButton style={{ position: 'relative', top: 'auto', left: 'auto' }} />
          <SettingsButton 
            onClick={() => setIsSettingsOpen(true)} 
            style={{ position: 'relative', top: 'auto', right: 'auto' }}
          />
        </div>
      </>
    );
  }
  
  // Handle null game state
  if (!gameState) {
    return (
      <>
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      <div style={{ 
        width: '100%',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div>Loading game...</div>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #dee2e6'
      }}>
        <MenuButton style={{ position: 'relative', top: 'auto', left: 'auto' }} />
        <SettingsButton 
          onClick={() => setIsSettingsOpen(true)} 
          style={{ position: 'relative', top: 'auto', right: 'auto' }}
        />
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
  // No need for separate empty board view - just show the normal game view with empty dice
  // The Board component handles empty dice just fine

  // Get last roll points from the actual round state
  const lastRollPoints = roundState.rollHistory && roundState.rollHistory.length > 0 ? 
    roundState.rollHistory[roundState.rollHistory.length - 1]?.rollPoints || 0 : 0;

  return (
    <>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    <div style={{ 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '0' // No gap between sections
    }}>
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
          gameScore={gameState.history?.totalScore || 0}
          justBanked={board.justBanked}
          justFlopped={board.justFlopped}
          scoringBreakdown={board.scoringBreakdown}
          breakdownState={board.breakdownState}
          onCompleteBreakdown={rollActions.handleCompleteBreakdown}
        />

        {/* Game Controls - Bottom Center Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 25,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: 'calc(100% - 40px)',
          maxWidth: '500px'
        }}>
          {/* Hot Dice Counter - only show during active rounds */}
          {roundState.isActive && roundState.hotDiceCounter > 0 && (
            <HotDiceCounter count={roundState.hotDiceCounter} />
          )}
          
          <GameControls 
            onReroll={() => {
              // Reroll Button (left)
              rollActions.handleRerollSelection(board.selectedDice);
            }}
            onRollOrScore={() => {
              // Rolling & Scoring Button (middle)
              if (board.selectedDice.length > 0 && board.previewScoring?.isValid) {
                rollActions.scoreSelectedDice();
              } else {
                rollActions.handleRollDice();
              }
            }}
            onBank={gameActions.handleBank}
            canReroll={board.isWaitingForReroll && canPlay}
            canRoll={(board.canRoll || board.canReroll) && canPlay}
            canScore={board.canSelectDice && canPlay}
            canBank={board.canBank && canPlay}
            diceToRoll={gameActions.getDiceToRollCount(gameState)}
            selectedDiceCount={board.selectedDice.length}
            rerollsRemaining={gameState.currentLevel?.rerollsRemaining || 0}
            banksRemaining={gameState.currentLevel?.banksRemaining || 0}
            levelPoints={gameState.currentLevel?.pointsBanked || 0}
            levelThreshold={gameState.currentLevel?.levelThreshold || 0}
            roundPoints={roundState?.roundPoints || 0}
            previewScoring={board.previewScoring}
            breakdownState={board.breakdownState}
          />
        </div>
      </div>

        <Inventory 
            charms={inventory.charms}
            consumables={inventory.consumables}
          blessings={gameState.blessings || []}
            money={gameState.money}
            onConsumableUse={inventoryActions.handleConsumableUse}
          />
      </div>
      
      {/* Menu and Settings buttons below inventory */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #dee2e6'
      }}>
        <MenuButton style={{ position: 'relative', top: 'auto', left: 'auto' }} />
        <SettingsButton 
          onClick={() => setIsSettingsOpen(true)} 
          style={{ position: 'relative', top: 'auto', right: 'auto' }}
        />
      </div>
    </>
  );
}; 