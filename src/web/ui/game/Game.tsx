import React, { useState } from 'react';
import { Board } from './board/Board';
import { GameControls } from './GameControls';
import { Inventory } from './Inventory';
import { GameShopView } from './GameShopView';
import { WorldMap } from './WorldMap';
import { SettingsButton, MainMenuReturnButton } from '../components';
import { SettingsModal } from '../menu';
import { TallyModal } from './TallyModal';
import { GameOverModal } from './GameOverModal';
import { DifficultyProvider } from '../../contexts/DifficultyContext';
import { ScoringHighlightProvider } from '../../contexts/ScoringHighlightContext';

// Intermediary interfaces for logical groups
interface RollActions {
  handleDiceSelect: (index: number) => void;
  handleSelectAllDice: () => void;
  handleDeselectAllDice: () => void;
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
  handleSellCharm?: (index: number) => void;
  handleSellConsumable?: (index: number) => void;
}

interface GameBoardData {
  dice: any[];
  selectedDice: number[];
  previewScoring: any;
  canRoll: boolean;
  canBank: boolean;
  canRollAgain: boolean; // After scoring - can roll remaining dice
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
  isInMapSelection?: boolean;
  shopState?: any;
  levelRewards?: any;
  canPlay?: boolean;
  showTallyModal?: boolean;
  pendingRewards?: any;
  onReturnToMenu?: () => void;
  onNewGame?: () => void;
  onSelectWorld?: (nodeId: number) => void;
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
  isInMapSelection = false,
  shopState = null,
  levelRewards = null,
  canPlay = true,
  showTallyModal = false,
  pendingRewards = null,
  onReturnToMenu,
  onNewGame,
  onSelectWorld
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Check if game is over
  const isGameOver = gameState && !gameState.isActive;
  
  // Check if modals should disable interactions
  const modalOpen = isGameOver || (showTallyModal && pendingRewards);
  
  // Handle map selection phase
  if (isInMapSelection && gameState && onSelectWorld) {
    return (
      <WorldMap
        gameState={gameState}
        onSelectWorld={onSelectWorld}
      />
    );
  }
  
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
  const roundNumber = gameState.currentWorld?.currentLevel.currentRound?.roundNumber || 1;
  const difficulty = gameState.config.difficulty as any; // Convert to string type for context

  return (
    <>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      <DifficultyProvider difficulty={difficulty}>
        <ScoringHighlightProvider>
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
          consecutiveFlops={gameState.consecutiveFlops}
          levelNumber={gameState.currentWorld?.currentLevel.levelNumber || 1}
          worldNumber={gameState.currentWorld?.worldNumber}
          worldEffects={gameState.currentWorld?.worldEffects}
          levelEffects={gameState.currentWorld?.currentLevel.levelEffects}
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
          hotDiceCounter={roundState?.isActive && roundState.hotDiceCounter > 0 ? roundState.hotDiceCounter : 0}
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
              // Skip Reroll when no dice selected, or reroll selected dice
              if (board.selectedDice.length === 0) {
                // Skip reroll - reroll with empty selection
                rollActions.handleRerollSelection([]);
              } else {
                // Reroll selected dice (though this should be disabled when dice are selected)
                rollActions.handleRerollSelection(board.selectedDice);
              }
            }}
            onSelectAll={rollActions.handleSelectAllDice}
            onDeselect={rollActions.handleDeselectAllDice}
            onRollOrScore={() => {
              // Rolling & Scoring Button (middle)
              // Only score if we're in diceSelection mode (canSelectDice is true) and have valid selection
              // After scoring (breakdownState is 'complete'), always roll, don't score again
              if (board.canSelectDice && board.selectedDice.length > 0 && board.previewScoring?.isValid) {
                rollActions.scoreSelectedDice();
              } else {
                rollActions.handleRollDice();
              }
            }}
            onBank={gameActions.handleBank}
            canReroll={board.isWaitingForReroll && canPlay && !modalOpen}
            canRoll={(board.canRoll || board.canRollAgain) && canPlay && !modalOpen}
            canScore={board.canSelectDice && canPlay && !modalOpen}
            canBank={board.canBank && canPlay && !modalOpen}
            canSelectDice={board.canSelectDice && canPlay && !modalOpen}
            diceToRoll={gameActions.getDiceToRollCount(gameState)}
            selectedDiceCount={board.selectedDice.length}
            totalDiceCount={board.dice.filter(d => d.rolledValue !== undefined).length}
            rerollsRemaining={gameState.currentWorld?.currentLevel.rerollsRemaining || 0}
            banksRemaining={gameState.currentWorld?.currentLevel.banksRemaining || 0}
            levelPoints={gameState.currentWorld?.currentLevel.pointsBanked || 0}
            levelThreshold={gameState.currentWorld?.currentLevel.levelThreshold || 0}
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
        charmSlots={gameState.charmSlots}
        consumableSlots={gameState.consumableSlots}
        onConsumableUse={inventoryActions.handleConsumableUse}
        onSellCharm={inventoryActions.handleSellCharm}
        onSellConsumable={inventoryActions.handleSellConsumable}
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
      
      {showTallyModal && pendingRewards && gameState?.currentWorld?.currentLevel && (
        <TallyModal
          isOpen={true}
          levelNumber={gameState.currentWorld.currentLevel.levelNumber}
          rewards={pendingRewards}
          banksRemaining={gameState.currentWorld.currentLevel.banksRemaining || 0}
          onContinue={gameActions.handleConfirmTally}
        />
      )}
      
      {isGameOver && onReturnToMenu && onNewGame && (
        <GameOverModal
          isOpen={true}
          endReason={gameState.won === false ? 'lost' : gameState.won === true ? 'win' : 'lost'}
          onReturnToMenu={onReturnToMenu}
          onNewGame={onNewGame}
        />
      )}
          </div>
        </ScoringHighlightProvider>
      </DifficultyProvider>
    </>
  );
}; 