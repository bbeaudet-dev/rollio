import { ReactGameInterface, PendingAction } from './ReactGameInterface';
import { resetLevelColors } from '../utils/levelColors';
import { GameAPI } from '../../game/api';
import { GameState, RoundState, ShopState, GamePhase } from '../../game/types';
import type { ScoringBreakdown } from '../../game/logic/scoringBreakdown';
import { playDiceRollSound } from '../utils/sounds';

export interface WebGameState {
  gameState: GameState | null;
  roundState: RoundState | null;
  selectedDice: number[];
  messages: string[];
  pendingAction: PendingAction;
  previewScoring: {
    isValid: boolean;
    points: number;
    combinations: string[];
    breakdown?: any; // ScoringBreakdown for detailed view
  } | null;
  justBanked: boolean;
  justFlopped: boolean;
  justSkippedReroll: boolean; 
  isProcessing: boolean;
  bankingDisplayInfo?: {
    pointsJustBanked: number;
    previousTotal: number;
    newTotal: number;
  } | null;
  scoringBreakdown: ScoringBreakdown | null;
  // Breakdown state machine:
  // - 'hidden': No breakdown shown (default state)
  // - 'animating': Breakdown animation is playing (buttons/dice selection disabled)
  // - 'complete': Animation finished, breakdown still visible (buttons enabled, breakdown stays on screen until roll/bank)
  breakdownState: 'hidden' | 'animating' | 'complete';
  // Derived flags for compatibility
  canRoll: boolean;
  canBank: boolean;
  canReroll: boolean;
  canSelectDice: boolean;
  isWaitingForReroll: boolean;
  canRerollSelected: boolean;
  canChooseFlopShield: boolean;
  // Shop state
  isInShop: boolean;
  shopState: ShopState | null;
  levelRewards: any | null;
  // Map selection state
  isInMapSelection: boolean;
  // Tally modal state
  showTallyModal: boolean;
  pendingRewards: any | null;
}

export class WebGameManager {
  private gameAPI: GameAPI;
  private gameInterface: ReactGameInterface;
  private messageCallback: (message: string) => void;

  constructor(onMessage: (message: string) => void) {
    this.gameInterface = new ReactGameInterface();
    this.messageCallback = onMessage;
    this.gameAPI = new GameAPI(this.gameInterface);
    
    // Subscribe to GameAPI events for messages
    this.gameAPI.on('stateChanged', () => {
      // Messages are handled via ReactGameInterface
    });
    
    // Subscribe to gameEnded event to save statistics
    this.gameAPI.on('gameEnded', async (data: { reason: string; gameState: GameState }) => {
      const endReason = data.reason as 'win' | 'lost' | 'quit';
      await this.saveGameStats(data.gameState, endReason);
    });
  }
  
  /**
   * Save game statistics when game ends
   */
  private async saveGameStats(gameState: GameState, endReason: 'win' | 'lost' | 'quit'): Promise<void> {
    try {
      // Import dynamically to avoid circular dependency
      const { gameApi } = await import('./api');
      
      // Save completion stats first
      const saveResult = await gameApi.saveGameCompletion(gameState, endReason);
      
      // Only delete the save if completion was successfully saved
      if (saveResult.success) {
        await gameApi.deleteGame();
        console.log('Game completion saved and active save deactivated');
      } else {
        console.error('Failed to save game completion, keeping save active for retry:', saveResult.error);
        // Keep the save active so we can retry later or user can manually retry
      }
    } catch (error) {
      // Silently fail - don't interrupt gameplay if stats save fails
      // Keep the save active so we can retry later
      console.error('Failed to save game stats:', error);
    }
  }

  /**
   * Get the number of dice that will be rolled on the next roll
   * Delegates to GameAPI
   */
  getDiceToRollCount(gameState: any): number {
    return this.gameAPI.getDiceToRollCount(gameState);
  }

  /**
   * Get banking display information for UI
   * Delegates to GameAPI
   */
  getBankingDisplayInfo(gameState: any, justBanked: boolean): {
    pointsJustBanked: number;
    previousTotal: number;
    newTotal: number;
  } | null {
    return this.gameAPI.getBankingDisplayInfo(gameState, justBanked);
  }

  private createWebGameState(
    gameState: GameState,
    roundState: RoundState | null,
    selectedDice: number[],
    previewScoring: { isValid: boolean; points: number; combinations: string[] } | null,
    justBanked: boolean,
    justFlopped: boolean,
    isProcessing: boolean = false,
    justSkippedReroll: boolean = false,
    scoringBreakdown: ScoringBreakdown | null = null,
    breakdownState: 'hidden' | 'animating' | 'complete' = 'hidden',
  ): WebGameState {
    const messages = this.gameInterface.getMessages();
    const pendingAction = this.gameInterface.getPendingAction();
    
    messages.forEach(msg => this.messageCallback(msg));
    
    // Use GameAPI methods only - no game logic here
    const canBankFromAPI = this.gameAPI.canBankPoints(gameState);
    const canBank = canBankFromAPI && pendingAction.type === 'bankOrRoll' && breakdownState !== 'animating';
    
    const hasRolledDice = !!(roundState?.rollHistory && roundState.rollHistory.length > 0);
    let canRoll: boolean;
    
    // Check if this is a new round (active round with no roll history)
    const isNewRound = roundState?.isActive && !hasRolledDice && roundState.rollHistory.length === 0;
    
    if (hasRolledDice && roundState?.isActive) {
      canRoll = !isProcessing && pendingAction.type === 'bankOrRoll' && (gameState.currentWorld?.currentLevel.banksRemaining || 0) > 0;
    } else if (pendingAction.type === 'reroll' || pendingAction.type === 'diceSelection' || pendingAction.type === 'flopShieldChoice') {
      canRoll = false;
    } else if (isNewRound) {
      // New round - can roll if no pending actions and game allows it
      canRoll = !isProcessing && pendingAction.type === 'none' && this.gameAPI.canRoll(gameState);
    } else {
      canRoll = !isProcessing && (this.gameAPI.canRoll(gameState) || justFlopped);
    }
    
    const canSelectDice = this.gameAPI.canSelectDice(gameState) && breakdownState !== 'animating';
    const canReroll = this.gameAPI.canReroll(gameState);
    
    const isWaitingForReroll = !!(roundState?.isActive && pendingAction.type === 'reroll' && 
      canReroll && !justSkippedReroll && breakdownState !== 'animating');
    const canRerollSelected = isWaitingForReroll;
    
    // canChooseFlopShield: Check pendingAction for flop shield (this is a special case that needs the action)
    const canChooseFlopShield: boolean = !!(roundState?.isActive && pendingAction.type === 'flopShieldChoice');
    
    // Calculate banking display info if just banked
    const bankingDisplayInfo = justBanked ? this.getBankingDisplayInfo(gameState, justBanked) : null;
    
    return {
      gameState,
      roundState,
      selectedDice,
      messages,
      pendingAction,
      previewScoring,
      justBanked,
      justFlopped,
      justSkippedReroll,
      isProcessing,
      bankingDisplayInfo,
      scoringBreakdown,
      breakdownState,
      canRoll,
      canBank,
      canReroll,
      canSelectDice,
      isWaitingForReroll,
      canRerollSelected,
      canChooseFlopShield: canChooseFlopShield || false,
      isInShop: false,
      isInMapSelection: false,
      shopState: null,
      levelRewards: null,
      showTallyModal: false,
      pendingRewards: null,
    };
  }

  async initializeGame(diceSetIndex: number, difficulty: string): Promise<WebGameState> {
    resetLevelColors();
    
    // Pass selections to GameAPI 
    const result = await this.gameAPI.initializeGame(diceSetIndex, difficulty);
    const gameState = result.gameState;

    // Check gamePhase to determine what to show
    if (gameState.gamePhase === 'worldSelection') {
      // Show map selection (game start or after world boundary)
      return {
        ...this.createWebGameState(gameState, null, [], null, false, false, false),
        isInShop: false,
        isInMapSelection: true,
        shopState: null,
        showTallyModal: false,
        pendingRewards: null,
      };
    }

    // World already selected - initialize level (creates level state and first round)
    const levelResult = await this.gameAPI.initializeLevel(gameState, gameState.currentWorld!.currentLevel.levelNumber);
    const updatedGameState = levelResult.gameState;

    const roundState = updatedGameState.currentWorld?.currentLevel.currentRound;
    
    // Reset pending action to 'none' for new level
    (this.gameInterface as any).pendingAction = { type: 'none' };
    
    return this.createWebGameState(updatedGameState, roundState || null, [], null, false, false, false);
  }

  /**
   * Load a saved game from the server
   */
  async loadGame(): Promise<WebGameState> {
    resetLevelColors();
    
    // Import dynamically to avoid circular dependency
    const { gameApi } = await import('./api');
    const result = await gameApi.loadGame();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to load game');
    }

    // The API response has gameState at the top level
    const gameState = (result as any).gameState;
    if (!gameState) {
      throw new Error('No game state in response');
    }
    
    // Register charms with the charm manager
    // The backend already deserialized and rebuilt charm instances, so we just need to register them
    const { registerStartingCharms } = await import('../../game/utils/factories');
    registerStartingCharms(gameState, (this.gameAPI as any).charmManager);

    // The gameState should already have the current level and round state
    const roundState = gameState.currentWorld?.currentLevel?.currentRound || null;
    
    // Check if game is in shop state (shop is stored in gameState.shop)
    const shop = gameState.shop;
    const isInShop = !!(shop && shop.availableCharms.length > 0);
    const shopState = isInShop ? shop : null;
    const isInMapSelection = false; // This will be set by exitShop when at world boundary
    
    // Check if we need to show tally modal (level completed but not yet confirmed)
    // This would be if level has rewards but shop is not open yet
    const showTallyModal = !!(gameState.currentWorld?.currentLevel?.rewards && !isInShop && !roundState);
    const pendingRewards = showTallyModal ? gameState.currentWorld?.currentLevel.rewards : null;
    
    const baseState = this.createWebGameState(gameState, roundState, [], null, false, false, false);
    
    return {
      ...baseState,
      isInShop,
      isInMapSelection,
      shopState,
      showTallyModal,
      pendingRewards,
      levelRewards: gameState.currentWorld?.currentLevel?.rewards || null,
    };
  }

  updateDiceSelection(state: WebGameState, selectedIndices: number[]): WebGameState {
    if (!state.roundState || !state.gameState) return state;
    
    // Don't allow dice selection if game is over
    if (!state.gameState.isActive) return state;

    const previewScoring = this.gameAPI.calculatePreviewScoring(
      state.gameState,
      selectedIndices
    );

    return this.createWebGameState(state.gameState, state.roundState, selectedIndices, previewScoring, state.justBanked, state.justFlopped, state.isProcessing);
  }

  async scoreSelectedDice(state: WebGameState): Promise<WebGameState> {
    if (!state.gameState || !state.roundState || state.selectedDice.length === 0) {
      return state;
    }
    
    // Don't allow scoring if game is over
    if (!state.gameState.isActive) return state;

    // Store selected dice indices and dice snapshot before scoring (needed for breakdown highlighting)
    const selectedIndicesForBreakdown = [...state.selectedDice];
    const scoredDiceSnapshot = state.selectedDice.map(idx => state.roundState!.diceHand[idx]).filter(Boolean);

    const result = await this.gameAPI.scoreDice(state.gameState, state.selectedDice);

    if (!result.success) {
      return state;
    }

    const roundState = result.gameState.currentWorld?.currentLevel.currentRound;
    
    // Store breakdown and show animation - don't proceed to bankOrRoll yet
    // Store selected indices and dice snapshot in breakdown for highlighting
    if (result.breakdown) {
      const breakdownWithIndices = {
        ...result.breakdown,
        selectedIndices: selectedIndicesForBreakdown,
        scoredDice: scoredDiceSnapshot
      } as any;
      
      // Create a temporary round state with the scored dice still visible for the breakdown
      // The scored dice are at the beginning of the array, so their indices are 0, 1, 2, etc.
      const tempRoundState = roundState ? {
        ...roundState,
        diceHand: [...scoredDiceSnapshot, ...(roundState.diceHand || [])]
      } : null;
      
      // Remap selected indices to new positions (scored dice are now at 0, 1, 2, etc.)
      const remappedSelectedIndices = scoredDiceSnapshot.map((_, idx) => idx);
      
      return this.createWebGameState(
        result.gameState, 
        tempRoundState, 
        remappedSelectedIndices, // Remapped indices for highlighting
        null, 
        false, 
        false, 
        false,
        false,
        breakdownWithIndices,
        'animating' // Animation is starting
      );
    }

    // No breakdown available, proceed normally
    const diceToReroll = roundState?.diceHand.length || 0;
    this.gameInterface.askForBankOrRoll(diceToReroll);

    return this.createWebGameState(result.gameState, roundState || null, [], null, false, false, false);
  }

  completeBreakdownAnimation(state: WebGameState): WebGameState {
    if (!state.gameState) {
      return state;
    }

    // Use the actual round state from gameState (dice already removed from scoring)
    const roundState = state.gameState.currentWorld?.currentLevel.currentRound;
    if (!roundState) {
      return state;
    }

    // Clear selected dice and proceed to bankOrRoll state
    // Keep breakdown visible until player clicks Roll, but animation is done
    const diceToReroll = roundState.diceHand.length || 0;
    this.gameInterface.askForBankOrRoll(diceToReroll);

    return this.createWebGameState(
      state.gameState,
      roundState, // Use actual roundState (dice removed)
      [], // Clear selected dice
      null, // Clear preview scoring
      false, // justBanked
      false, // justFlopped
      false, // isProcessing
      false, // justSkippedReroll
      state.scoringBreakdown, // Keep breakdown data
      'complete' // Animation is complete, breakdown still visible, buttons re-enabled
    );
  }

  async bankPoints(state: WebGameState): Promise<WebGameState> {
    if (!state.gameState || !state.roundState) return state;

    const result = await this.gameAPI.bankPoints(state.gameState);
    const gameState = result.gameState;

    // Game over is handled by GameAPI - just check if we need to show messages
    // Keep roundState so board still shows with Game Over overlay
    if (!gameState.isActive && gameState.won === false) {
      // Keep the roundState so the board still displays with the Game Over overlay
      // Clear breakdown state when banking
      const finalRoundState = gameState.currentWorld?.currentLevel.currentRound || null;
      return this.createWebGameState(gameState, finalRoundState, [], null, false, false, false, false, null, 'hidden');
    }

    if (result.levelCompleted) {
      const completedLevelNumber = gameState.currentWorld?.currentLevel.levelNumber || 0;
      // Calculate rewards (but don't apply yet - wait for tally modal confirmation)
      const rewards = this.gameAPI.calculateLevelRewards(completedLevelNumber, gameState);
      
      // Clear breakdown state when banking
      const webState = this.createWebGameState(gameState, null, [], null, false, false, false, false, null, 'hidden');
      return {
        ...webState,
        showTallyModal: true,
        pendingRewards: rewards,
      };
    }

    // Start a new round (creates new round with full dice hand, but doesn't roll yet)
    const roundResult = await this.gameAPI.startNewRound(gameState);
    const newGameState = roundResult.gameState;
    const newRoundState = newGameState.currentWorld?.currentLevel.currentRound;
    
    if (!newRoundState) return state;
    
    // Set justBanked to true so dice are hidden until first roll
    // Clear breakdown state when banking (starting new round)
    return this.createWebGameState(newGameState, newRoundState, [], null, true, false, false, false, null, 'hidden');
  }

  async rollDice(state: WebGameState): Promise<WebGameState> {
    if (!state.gameState) return state;

    // If the round has ended (e.g., after a flop), start a new round first
    const roundState = state.roundState;
    let gameState = state.gameState;
    if (!roundState || !roundState.isActive) {
      const roundResult = await this.gameAPI.startNewRound(gameState);
      gameState = roundResult.gameState;
    }

    const currentRoundState = gameState.currentWorld?.currentLevel.currentRound;
    if (!currentRoundState) return state;

    const result = await this.gameAPI.rollDice(gameState);
    const finalGameState = result.gameState;
    const newRoundState = finalGameState.currentWorld?.currentLevel.currentRound;

    if (!newRoundState) return state;

    // Play dice roll sound
    const numDice = newRoundState.diceHand.length;
    playDiceRollSound(numDice);

    // Check if we can reroll (before scoring - after initial roll, before flop check)
    if (this.gameAPI.canReroll(finalGameState)) {
      this.gameInterface.askForReroll(newRoundState.diceHand, finalGameState.currentWorld?.currentLevel.rerollsRemaining || 0);
      return this.createWebGameState(finalGameState, newRoundState, [], null, false, false, false, false, null, 'hidden');
    }

    // Check for flop shield availability (even if isFlop is false, shield might be available)
    // isFlop() returns false when shield is available, so we need to check shield separately
    if (result.flopShieldAvailable) {
      // Check if there are actually no scoring combinations (would be a flop without shield)
      const { hasAnyScoringCombination } = await import('../../game/logic/findCombinations');
      const difficulty = finalGameState.config.difficulty;
      const hasScoringCombinations = hasAnyScoringCombination(newRoundState.diceHand, difficulty);
      
      if (!hasScoringCombinations) {
        // No scoring combinations and shield is available - show prompt
        (this.gameInterface as any).pendingAction = {
          type: 'flopShieldChoice',
          canPrevent: true,
          log: '🛡️ Flop Shield available'
        };
        // Clear breakdown state when starting a new roll
        return this.createWebGameState(finalGameState, newRoundState, [], null, false, false, false, false, null, 'hidden');
      }
    }

    // Check for flop
    if (result.isFlop) {
      // Flop with no shield - handle flop
      return await this.handleFlop(finalGameState, newRoundState);
    } else {
      this.gameInterface.askForDiceSelection(newRoundState.diceHand, finalGameState.consumables);
      return this.createWebGameState(finalGameState, newRoundState, [], null, false, false, false, false, null, 'hidden');
    }
  }

  async handleRerollSelection(state: WebGameState, selectedIndices: number[]): Promise<WebGameState> {
    if (!state.gameState || !state.roundState) return state;
    if (state.pendingAction.type !== 'reroll') return state;

    // Validate using GameAPI
    const validation = this.gameAPI.validateReroll(state.gameState, selectedIndices);
    if (!validation.valid) {
      return state;
    }

    // If 0 dice selected, check for scoring combinations
    if (selectedIndices.length === 0) {
      const result = await this.gameAPI.rerollDice(state.gameState, []);
      const gameState = result.gameState;
      const roundState = gameState.currentWorld?.currentLevel.currentRound;
      if (!roundState) return state;
      
      // Check for flop shield availability first (even if isFlop is false, shield might be available)
      if (result.flopShieldAvailable) {
        // Check if there are actually no scoring combinations (would be a flop without shield)
        const { hasAnyScoringCombination } = await import('../../game/logic/findCombinations');
        const difficulty = gameState.config.difficulty;
        const hasScoringCombinations = hasAnyScoringCombination(roundState.diceHand, difficulty);
        
        if (!hasScoringCombinations) {
          // No scoring combinations and shield is available - show prompt
          (this.gameInterface as any).pendingAction = {
            type: 'flopShieldChoice',
            canPrevent: true,
            log: '🛡️ Flop Shield available'
          };
          return this.createWebGameState(gameState, roundState, [], null, false, false, false);
        }
      }
      
      // If it's a flop, handle it
      if (result.isFlop) {
        // Flop with no shield - check if we have rerolls
        if (this.gameAPI.canReroll(gameState)) {
          // Still have rerolls - ask for reroll
          this.gameInterface.askForReroll(roundState.diceHand, gameState.currentWorld?.currentLevel.rerollsRemaining || 0);
          return this.createWebGameState(gameState, roundState, [], null, false, false, false, true);
        }
        
        // No rerolls - handle flop
        return await this.handleFlop(gameState, roundState);
      }
      
      // Check if more rerolls available
      if (this.gameAPI.canReroll(gameState)) {
        this.gameInterface.askForReroll(roundState.diceHand, gameState.currentWorld?.currentLevel.rerollsRemaining || 0);
        // Set justSkippedReroll to true to prevent clicking "Skip Reroll" again
        return this.createWebGameState(gameState, roundState, [], null, false, false, false, true);
      }
      
      // Not a flop and no rerolls - ask for dice selection
      this.gameInterface.askForDiceSelection(roundState.diceHand, gameState.consumables);
      // Set justSkippedReroll to true to prevent clicking "Skip Reroll" again
      return this.createWebGameState(gameState, roundState, [], null, false, false, false, true);
    }

    // Use GameAPI for reroll (this consumes a reroll and validates internally)
    const result = await this.gameAPI.rerollDice(state.gameState, selectedIndices);
    const gameState = result.gameState;
    const roundState = gameState.currentWorld?.currentLevel.currentRound;

    if (!roundState) return state;

    // Play dice roll sound
    const numDice = roundState.diceHand.length;
    playDiceRollSound(numDice);

    this.gameInterface.resolvePendingAction(selectedIndices.map(i => i + 1).join(' '));

    // Check if more rerolls available
    if (this.gameAPI.canReroll(gameState)) {
      this.gameInterface.askForReroll(roundState.diceHand, gameState.currentWorld?.currentLevel.rerollsRemaining || 0);
      // Reset justSkippedReroll when we actually reroll dice - button should be available again
      return this.createWebGameState(gameState, roundState, [], null, false, false, false, false);
    }

    // No more rerolls - check for flop shield availability first
    if (result.flopShieldAvailable) {
      // Check if there are actually no scoring combinations (would be a flop without shield)
      const { hasAnyScoringCombination } = await import('../../game/logic/findCombinations');
      const difficulty = gameState.config.difficulty;
      const hasScoringCombinations = hasAnyScoringCombination(roundState.diceHand, difficulty);
      
      if (!hasScoringCombinations) {
        // No scoring combinations and shield is available - show prompt
        (this.gameInterface as any).pendingAction = {
          type: 'flopShieldChoice',
          canPrevent: true,
          log: '🛡️ Flop Shield available'
        };
        return this.createWebGameState(gameState, roundState, [], null, false, false, false);
      }
    }
    
    // Check for flop (trust result.isFlop from GameAPI)
    if (result.isFlop) {
      return await this.handleFlop(gameState, roundState);
    }

    // Not a flop - ask for dice selection
    this.gameInterface.askForDiceSelection(roundState.diceHand, gameState.consumables);
    return this.createWebGameState(gameState, roundState, [], null, false, false, false);
  }


  async handleFlopShieldChoice(state: WebGameState, useShield: boolean): Promise<WebGameState> {
    if (!state.gameState || !state.roundState) return state;
    if (state.pendingAction.type !== 'flopShieldChoice') return state;

    const gameState = { ...state.gameState };
    const roundState = { ...state.roundState };
    const charmManager = this.gameAPI.getCharmManager();

    if (useShield) {
      const flopResult = charmManager.tryPreventFlop({ gameState, roundState });
      if (flopResult.prevented) {
        const diceToRoll = roundState.diceHand.length;
        this.gameInterface.askForBankOrRoll(diceToRoll);
        // Clear pending action after using shield
        (this.gameInterface as any).pendingAction = { type: 'bankOrRoll' };
        return this.createWebGameState(gameState, roundState, [], null, false, false, false);
      }
    }
    
    // User chose not to use shield - process the flop
    // Clear pending action before handling flop
    (this.gameInterface as any).pendingAction = { type: 'none' };
    return await this.handleFlop(gameState, roundState);
  }

  private async handleFlop(gameState: GameState, roundState: RoundState): Promise<WebGameState> {
    // Process the flop (ends the round, increments consecutive flops, etc.)
    const result = await this.gameAPI.handleFlop(gameState);
    const newGameState = result.gameState;

    // Game over check
    if (!newGameState.isActive) {
      const finalRoundState = newGameState.currentWorld?.currentLevel.currentRound || null;
      return this.createWebGameState(newGameState, finalRoundState, [], null, false, false, false);
    }

    // Don't start a new round yet - keep the ended round state visible so player can see the flop dice
    // The new round will be started when they click "Roll"
    const endedRoundState = newGameState.currentWorld?.currentLevel.currentRound || null;
    
    // Set justFlopped to true - the ended round state still has the dice
    (this.gameInterface as any).pendingAction = { type: 'none' };
    return this.createWebGameState(newGameState, endedRoundState, [], null, false, true, false);
  }

  async useConsumable(state: WebGameState, index: number): Promise<WebGameState> {
    if (!state.gameState) {
      return state;
    }
    
    // Use GameAPI for consumable effects
    const result = await this.gameAPI.useConsumable(state.gameState, index);
    
    if (!result.success) {
      return state;
    }
    
    const gameState = result.gameState;
    // Use the roundState from result if available, otherwise use the existing one (might be null between rounds)
    const roundState = result.roundState !== undefined ? result.roundState : state.roundState;
    
    if (result.requiresInput && result.requiresInput.type === 'dieSelection') {
      // Requires die selection input - handled by GameAPI
    }
    
    const newState = this.createWebGameState(gameState, roundState, state.selectedDice, state.previewScoring, state.justBanked, state.justFlopped, state.isProcessing);
    
    // Preserve shop state - don't switch views when using consumables from shop
    return {
      ...newState,
      isInShop: state.isInShop,
      shopState: state.shopState,
      levelRewards: state.levelRewards,
      showTallyModal: state.showTallyModal,
      pendingRewards: state.pendingRewards,
    };
  }

  async purchaseCharm(state: WebGameState, charmIndex: number): Promise<WebGameState> {
    if (!state.gameState || !state.shopState || !state.isInShop) return state;
    
    const result = await this.gameAPI.purchaseCharm(state.gameState, state.shopState, charmIndex);
    
    if (result.success) {
      // Mark the purchased item as null instead of regenerating the shop
      const newShopState = {
        ...state.shopState,
        availableCharms: state.shopState.availableCharms.map((charm, idx) => 
          idx === charmIndex ? null : charm
        ) as (typeof state.shopState.availableCharms[0] | null)[]
      };
      const webState = this.createWebGameState(result.gameState, null, [], null, false, false, false);
      return {
        ...webState,
        isInShop: true,
        shopState: newShopState,
        levelRewards: state.levelRewards,
      };
    }
    
    return state;
  }

  async purchaseConsumable(state: WebGameState, consumableIndex: number): Promise<WebGameState> {
    if (!state.gameState || !state.shopState || !state.isInShop) return state;
    
    const result = await this.gameAPI.purchaseConsumable(state.gameState, state.shopState, consumableIndex);
    
    if (result.success) {
      // Mark the purchased item as null instead of regenerating the shop
      const newShopState = {
        ...state.shopState,
        availableConsumables: state.shopState.availableConsumables.map((consumable, idx) => 
          idx === consumableIndex ? null : consumable
        ) as (typeof state.shopState.availableConsumables[0] | null)[]
      };
      const webState = this.createWebGameState(result.gameState, null, [], null, false, false, false);
      return {
        ...webState,
        isInShop: true,
        shopState: newShopState,
        levelRewards: state.levelRewards,
      };
    }
    
    return state;
  }

  async purchaseBlessing(state: WebGameState, blessingIndex: number): Promise<WebGameState> {
    if (!state.gameState || !state.shopState || !state.isInShop) return state;
    
    const result = await this.gameAPI.purchaseBlessing(state.gameState, state.shopState, blessingIndex);
    
    if (result.success) {
      // Mark the purchased item as null instead of regenerating the shop
      const newShopState = {
        ...state.shopState,
        availableBlessings: state.shopState.availableBlessings.map((blessing, idx) => 
          idx === blessingIndex ? null : blessing
        ) as (typeof state.shopState.availableBlessings[0] | null)[]
      };
      const webState = this.createWebGameState(result.gameState, null, [], null, false, false, false);
      return {
        ...webState,
        isInShop: true,
        shopState: newShopState,
        levelRewards: state.levelRewards,
      };
    }
    
    return state;
  }

  async refreshShop(state: WebGameState): Promise<WebGameState> {
    if (!state.gameState || !state.isInShop) return state;
    
    // Regenerate the entire shop
    const newShopState = this.gameAPI.generateShop(state.gameState);
    const webState = this.createWebGameState(state.gameState, null, [], null, false, false, false);
    return {
      ...webState,
      isInShop: true,
      shopState: newShopState,
      levelRewards: state.levelRewards,
    };
  }

  /**
   * Sell a charm from inventory
   */
  async sellCharm(state: WebGameState, charmIndex: number): Promise<WebGameState> {
    if (!state.gameState) return state;
    
    const result = await this.gameAPI.sellCharm(state.gameState, charmIndex);
    const gameState = result.gameState;
    const roundState = gameState.currentWorld?.currentLevel?.currentRound || null;
    
    const webState = this.createWebGameState(gameState, roundState, [], null, false, false, false);
    return {
      ...webState,
      isInShop: state.isInShop,
      isInMapSelection: state.isInMapSelection,
      shopState: state.shopState,
      levelRewards: state.levelRewards,
    };
  }

  /**
   * Sell a consumable from inventory
   */
  async sellConsumable(state: WebGameState, consumableIndex: number): Promise<WebGameState> {
    if (!state.gameState) return state;
    
    const result = await this.gameAPI.sellConsumable(state.gameState, consumableIndex);
    const gameState = result.gameState;
    const roundState = gameState.currentWorld?.currentLevel?.currentRound || null;
    
    const webState = this.createWebGameState(gameState, roundState, [], null, false, false, false);
    return {
      ...webState,
      isInShop: state.isInShop,
      isInMapSelection: state.isInMapSelection,
      shopState: state.shopState,
      levelRewards: state.levelRewards,
    };
  }

  async confirmTally(state: WebGameState): Promise<WebGameState> {
    if (!state.gameState || !state.pendingRewards) return state;
    
    const completedLevelNumber = state.gameState.currentWorld?.currentLevel.levelNumber || 0;
    
    // Apply rewards and tally level (sets gamePhase = 'tallying')
    const tallyResult = await this.gameAPI.tallyLevel(state.gameState);
    let talliedGameState = tallyResult.gameState;
    
    // Generate shop and set gamePhase = 'shop'
    const shopState = this.gameAPI.generateShop(talliedGameState);
    talliedGameState = {
      ...talliedGameState,
      gamePhase: 'shop' as GamePhase,
      shop: shopState,
    };
    
    const webState = this.createWebGameState(talliedGameState, null, [], null, false, false, false);
    return {
      ...webState,
      isInShop: true,
      shopState,
      levelRewards: state.pendingRewards,
      showTallyModal: false,
      pendingRewards: null,
    };
  }

  async exitShop(state: WebGameState): Promise<WebGameState> {
    if (!state.gameState || !state.isInShop) return state;
    
    // Advance to next level using GameAPI (moves completed level to history, sets gamePhase appropriately)
    const advanceResult = await this.gameAPI.advanceToNextLevel(state.gameState);
    const gameState = advanceResult.gameState;
    
    // Check gamePhase to determine what to show next
    if (gameState.gamePhase === 'worldSelection') {
      // At world boundary - show map selection
      return {
        ...state,
        gameState,
        isInShop: false,
        isInMapSelection: true,
        shopState: null,
      };
    }
    
    // Not at world boundary - advanceToNextLevel already created the level state
    // But we need to call initializeLevel to trigger charm hooks and emit events
    // However, if the level state already exists with a round, we should use it
    let newGameState = gameState;
    let roundState = gameState.currentWorld?.currentLevel.currentRound;
    
    // Only initialize if the level doesn't have a proper round state yet
    if (!roundState || !roundState.isActive || roundState.rollHistory.length > 0) {
      const levelResult = await this.gameAPI.initializeLevel(gameState, gameState.currentWorld!.currentLevel.levelNumber);
      newGameState = levelResult.gameState;
      roundState = newGameState.currentWorld?.currentLevel.currentRound;
    } else {
      // Level already initialized, but we still need to emit events and call charm hooks
      // Call initializeLevel anyway to ensure events are emitted (it will reuse the existing state)
      const levelResult = await this.gameAPI.initializeLevel(gameState, gameState.currentWorld!.currentLevel.levelNumber);
      newGameState = levelResult.gameState;
      roundState = newGameState.currentWorld?.currentLevel.currentRound;
    }
    
    if (!roundState) return state;
    
    // Reset pending action to 'none' for new level/round
    (this.gameInterface as any).pendingAction = { type: 'none' };
    
    // Auto-save after level completion (after advancing to next level)
    await this.autoSaveGame(newGameState);
    
    const webState = this.createWebGameState(newGameState, roundState, [], null, false, false, false);
    return {
      ...webState,
      isInShop: false,
      isInMapSelection: false,
      shopState: null,
      levelRewards: state.levelRewards,
    };
  }

  /**
   * Select a world from the map
   * This generates all level configs for the world and starts level 1
   */
  async selectWorld(state: WebGameState, worldId: string): Promise<WebGameState> {
    if (!state.gameState || !state.isInMapSelection) return state;
    
    const newGameState = await this.gameAPI.selectWorld(state.gameState, worldId);
    
    // Initialize the new level (creates level state and first round, emits events)
    const levelResult = await this.gameAPI.initializeLevel(newGameState.gameState, newGameState.gameState.currentWorld!.currentLevel.levelNumber);
    const gameState = levelResult.gameState;
    const roundState = gameState.currentWorld?.currentLevel.currentRound;
    
    if (!roundState) return state;
    
    // Reset pending action to 'none' for new level/round
    (this.gameInterface as any).pendingAction = { type: 'none' };
    
    // For first world selection (level 1), go directly to the game board, not the shop
    // Shop only appears after completing a level
    const isFirstLevel = gameState.currentWorld?.currentLevel.levelNumber === 1;
    
    // Auto-save after world selection
    await this.autoSaveGame(gameState);
    
    const webState = this.createWebGameState(gameState, roundState, [], null, false, false, false);
    return {
      ...webState,
      isInMapSelection: false,
      isInShop: false, // Don't go to shop on first level
      shopState: null,
      levelRewards: null,
    };
  }

  /**
   * Auto-save game state (only if user is authenticated)
   */
  private async autoSaveGame(gameState: GameState): Promise<void> {
    try {
      // Check if user is authenticated by checking for token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        // User is not logged in, skip auto-save
        return;
      }
      
      // Save game (import dynamically to avoid circular dependency)
      const { gameApi } = await import('./api');
      const result = await gameApi.saveGame(gameState);
      if (result.success) {
        console.log('Game auto-saved successfully');
      } else {
        console.error('Failed to auto-save game:', result.error);
      }
    } catch (error) {
      // Silently fail - don't interrupt gameplay if save fails
      console.error('Auto-save error:', error);
    }
  }

  resolvePendingAction(state: WebGameState, value: string): WebGameState {
    this.gameInterface.resolvePendingAction(value);
    const messages = this.gameInterface.getMessages();
    messages.forEach(msg => this.messageCallback(msg));
    
    return {
      ...state,
      messages: [...state.messages, ...messages],
      pendingAction: this.gameInterface.getPendingAction(),
    };
  }

  async startRound(state: WebGameState): Promise<WebGameState> {
    if (!state.gameState) return state;
    if (state.isProcessing) return state;

    const result = await this.gameAPI.startNewRound(state.gameState);
    const gameState = result.gameState;
    const roundState = gameState.currentWorld?.currentLevel.currentRound;
    
    if (!roundState) return state;
    
    (this.gameInterface as any).pendingAction = { type: 'none' };
    
    return this.createWebGameState(gameState, roundState, [], null, false, false, false);
  }
}

