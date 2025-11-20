import React, { useState } from 'react';
import { Board } from './board/Board';
import { GameControls } from './GameControls';
import { Inventory } from './Inventory';
import { GameShopView } from './GameShopView';
import { SettingsButton, MainMenuReturnButton } from '../components';
import { SettingsModal } from '../menu';
import { TallyModal } from './TallyModal';
import { GameOverModal } from './GameOverModal';
import { DifficultyProvider } from '../../contexts/DifficultyContext';

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
  onReturnToMenu?: () => void;
  onNewGame?: () => void;
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
  pendingRewards = null,
  onReturnToMenu,
  onNewGame
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Check if game is over
  const isGameOver = gameState && !gameState.isActive;
  
  // Check if modals should disable interactions
  const modalOpen = isGameOver || (showTallyModal && pendingRewards);
  
  // Handle shop phase - this is a completely different view, so early return makes sense
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
        <MainMenuReturnButton style={{ position: 'relative', top: 'auto', left: 'auto' }} />
        <SettingsButton 
          onClick={() => setIsSettingsOpen(true)} 
          style={{ position: 'relative', top: 'auto', right: 'auto' }}
        />
      </div>
      </>
    );
  }

  // Handle case where roundState is null
  // This can happen when level is completed (showing tally modal) or if there's an error
  // If we're showing tally modal, we still want to render the game view with the last known state
  if (!roundState && !showTallyModal) {
    // No active round and not showing tally modal - error state
    return (
      <>
        <MainMenuReturnButton />
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
  
  // Handle null roundState when showing tally modal (level completed)
  // Use safe defaults for roundState-dependent values
  const hasRolledDice = roundState ? !!(roundState.rollHistory && roundState.rollHistory.length > 0) : false;
  const lastRollPoints = roundState && roundState.rollHistory && roundState.rollHistory.length > 0 ? 
    roundState.rollHistory[roundState.rollHistory.length - 1]?.rollPoints || 0 : 0;
  const rollNumber = roundState?.rollHistory?.length || 0;
  const roundNumber = gameState.currentLevel.currentRound?.roundNumber || 1;
  const difficulty = gameState.config.difficulty as any; // Convert to string type for context

  return (
    <>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      <DifficultyProvider difficulty={difficulty}>
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
          canSelect={board.canSelectDice && canPlay && !modalOpen}
          roundNumber={roundNumber}
          rollNumber={rollNumber}
          consecutiveFlops={gameState.currentLevel.consecutiveFlops}
          levelNumber={gameState.currentLevel?.levelNumber || 1}
          previewScoring={board.previewScoring}
          canChooseFlopShield={board.canChooseFlopShield && canPlay && !modalOpen}
          onFlopShieldChoice={gameActions.handleFlopShieldChoice}
          onScoreSelectedDice={rollActions.scoreSelectedDice}
          lastRollPoints={lastRollPoints}
          justBanked={board.justBanked}
          justFlopped={board.justFlopped}
          scoringBreakdown={board.scoringBreakdown}
          breakdownState={board.breakdownState}
          onCompleteBreakdown={rollActions.handleCompleteBreakdown}
          diceSet={gameState.diceSet}
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
            canReroll={board.isWaitingForReroll && canPlay && !modalOpen}
            canRoll={(board.canRoll || board.canReroll) && canPlay && !modalOpen}
            canScore={board.canSelectDice && canPlay && !modalOpen}
            canBank={board.canBank && canPlay && !modalOpen}
            diceToRoll={gameActions.getDiceToRollCount(gameState)}
            selectedDiceCount={board.selectedDice.length}
            rerollsRemaining={gameState.currentLevel?.rerollsRemaining || 0}
            banksRemaining={gameState.currentLevel?.banksRemaining || 0}
            levelPoints={gameState.currentLevel?.pointsBanked || 0}
            levelThreshold={gameState.currentLevel?.levelThreshold || 0}
            roundPoints={roundState?.roundPoints || 0}
            hotDiceCounter={roundState?.isActive && roundState.hotDiceCounter > 0 ? roundState.hotDiceCounter : 0}
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
      
      {/* Menu and Settings buttons below inventory */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #dee2e6'
      }}>
        <MainMenuReturnButton style={{ position: 'relative', top: 'auto', left: 'auto' }} />
        <SettingsButton 
          onClick={() => setIsSettingsOpen(true)} 
          style={{ position: 'relative', top: 'auto', right: 'auto' }}
        />
      </div>
      
      {/* Modals overlay on top - conditionally rendered */}
      
      {showTallyModal && pendingRewards && gameState?.currentLevel && (
        <TallyModal
          isOpen={true}
          levelNumber={gameState.currentLevel.levelNumber}
          rewards={pendingRewards}
          banksRemaining={gameState.currentLevel.banksRemaining || 0}
          onContinue={gameActions.handleConfirmTally}
        />
      )}
      
      {isGameOver && onReturnToMenu && onNewGame && (
        <GameOverModal
          isOpen={true}
          endReason={gameState.endReason || 'lost'}
          onReturnToMenu={onReturnToMenu}
          onNewGame={onNewGame}
        />
      )}
        </div>
      </DifficultyProvider>
    </>
  );
}; 