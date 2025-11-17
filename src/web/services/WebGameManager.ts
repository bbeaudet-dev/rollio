import { ReactGameInterface, PendingAction } from './ReactGameInterface';
import { resetLevelColors } from '../utils/levelColors';
import { GameAPI } from '../../game/api';
import { GameState, RoundState, GameConfig, ShopState } from '../../game/types';

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
  ): WebGameState {
    const messages = this.gameInterface.getMessages();
    const pendingAction = this.gameInterface.getPendingAction();
    
    messages.forEach(msg => this.messageCallback(msg));
    
    const hasRolledDice = !!(roundState?.rollHistory && roundState.rollHistory.length > 0);
    // Use pure function to check if can bank (includes all conditions: active, roundPoints > 0, banks > 0)
    // Also need to check pendingAction for UI state (player has rolled and scored)
    const canBank = this.gameAPI.canBankPoints(gameState) && pendingAction.type === 'bankOrRoll';
    const hasBanksRemaining = (gameState.currentLevel.banksRemaining || 0) > 0;
    const canRoll: boolean = (!roundState && !isProcessing && gameState.isActive && hasBanksRemaining) ||
      !!(roundState?.isActive && !hasRolledDice && pendingAction.type === 'none' && hasBanksRemaining) ||
      !!(justFlopped && hasBanksRemaining);
    const hasHotDice = !!(roundState?.rollHistory && roundState.rollHistory.length > 0 && 
      roundState.rollHistory[roundState.rollHistory.length - 1]?.isHotDice);
    // canReroll: Allow reroll when in bankOrRoll state (after scoring, you can Bank or Roll)
    const canReroll = !!(roundState?.isActive && pendingAction.type === 'bankOrRoll' && 
      (roundState.diceHand.length > 0 || hasHotDice));
    const canSelectDice = !!(gameState.isActive && roundState?.isActive && (pendingAction.type === 'diceSelection' || pendingAction.type === 'reroll') && !justBanked && !justFlopped);
    // isWaitingForReroll: Show reroll button when waiting for reroll, but disable if we just clicked "Skip Reroll"
    const isWaitingForReroll = !!(roundState?.isActive && pendingAction.type === 'reroll' && gameState.currentLevel.rerollsRemaining && gameState.currentLevel.rerollsRemaining > 0 && !justSkippedReroll);
    const canRerollSelected = !!(isWaitingForReroll && gameState.currentLevel.rerollsRemaining && gameState.currentLevel.rerollsRemaining > 0);
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
      canRoll,
      canBank,
      canReroll,
      canSelectDice,
      isWaitingForReroll,
      canRerollSelected,
      canChooseFlopShield: canChooseFlopShield || false,
      isInShop: false,
      shopState: null,
      levelRewards: null,
      showTallyModal: false,
      pendingRewards: null,
    };
  }

  async initializeGame(diceSetIndex?: number, selectedCharms?: number[], selectedConsumables?: number[]): Promise<WebGameState> {
    resetLevelColors();
    
    const { ALL_DICE_SETS } = await import('../../game/data/diceSets');
    const selectedSet = ALL_DICE_SETS[diceSetIndex || 0];
    const diceSetConfig = typeof selectedSet === 'function' ? selectedSet() : selectedSet;
    
    const gameConfig: GameConfig = {
      diceSetConfig,
      penalties: {
        consecutiveFlopLimit: 3,
      }
    };

    const result = await this.gameAPI.initializeGame(gameConfig);
    let gameState = result.gameState;

    // Add selected charms
    if (selectedCharms && selectedCharms.length > 0) {
      const { CHARMS } = await import('../../game/data/charms');
      const charmManager = this.gameAPI.getCharmManager();
      selectedCharms.forEach(charmIndex => {
        if (charmIndex >= 0 && charmIndex < CHARMS.length) {
          const charmData = CHARMS[charmIndex];
          charmManager.addCharm({ ...charmData, active: true });
          gameState.charms.push({ ...charmData, active: true });
        }
      });
    }

    // Add selected consumables
    if (selectedConsumables && selectedConsumables.length > 0) {
      const { CONSUMABLES } = await import('../../game/data/consumables');
      selectedConsumables.forEach(consumableIndex => {
        if (consumableIndex >= 0 && consumableIndex < CONSUMABLES.length) {
          const consumableData = CONSUMABLES[consumableIndex];
          gameState.consumables.push({ 
            ...consumableData, 
            uses: consumableData.uses || 1
          });
        }
      });
    }

    // Initialize level 1 (creates level state and first round)
    const levelResult = await this.gameAPI.initializeLevel(gameState, 1);
    gameState = levelResult.gameState;

    const roundState = gameState.currentLevel.currentRound;
    return this.createWebGameState(gameState, roundState || null, [], null, false, false, false);
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

    const result = await this.gameAPI.scoreDice(state.gameState, state.selectedDice);

    if (!result.success) {
      return state;
    }

    const roundState = result.gameState.currentLevel.currentRound;
    const diceToReroll = roundState?.diceHand.length || 0;
    this.gameInterface.askForBankOrRoll(diceToReroll);

    return this.createWebGameState(result.gameState, roundState || null, [], null, false, false, false);
  }

  async bankPoints(state: WebGameState): Promise<WebGameState> {
    if (!state.gameState || !state.roundState) return state;

    const result = await this.gameAPI.bankPoints(state.gameState);
    const gameState = result.gameState;

    // Game over is handled by GameAPI - just check if we need to show messages
    // Keep roundState so board still shows with Game Over overlay
    if (!gameState.isActive && gameState.endReason === 'lost') {
      // Keep the roundState so the board still displays with the Game Over overlay
      const finalRoundState = gameState.currentLevel.currentRound || null;
      return this.createWebGameState(gameState, finalRoundState, [], null, false, false, false);
    }

    if (result.levelCompleted) {
      const completedLevelNumber = gameState.currentLevel.levelNumber;
      // Calculate rewards (but don't apply yet - wait for tally modal confirmation)
      const rewards = this.gameAPI.calculateLevelRewards(completedLevelNumber, gameState);
      
      const webState = this.createWebGameState(gameState, null, [], null, false, false, false);
      return {
        ...webState,
        showTallyModal: true,
        pendingRewards: rewards,
      };
    }

    // Start a new round (creates new round with full dice hand, but doesn't roll yet)
    const roundResult = await this.gameAPI.startNewRound(gameState);
    const newGameState = roundResult.gameState;
    const newRoundState = newGameState.currentLevel.currentRound;
    
    if (!newRoundState) return state;
    
    // Set justBanked to true so dice are hidden until first roll
    return this.createWebGameState(newGameState, newRoundState, [], null, true, false, false);
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

    const currentRoundState = gameState.currentLevel.currentRound;
    if (!currentRoundState) return state;

    const result = await this.gameAPI.rollDice(gameState);
    const finalGameState = result.gameState;
    const newRoundState = finalGameState.currentLevel.currentRound;

    if (!newRoundState) return state;

    // Check if rerolls available
    if (this.gameAPI.canReroll(finalGameState)) {
      this.gameInterface.askForReroll(newRoundState.diceHand, finalGameState.currentLevel.rerollsRemaining || 0);
      // Reset justSkippedReroll when we roll - button should be available again
      return this.createWebGameState(finalGameState, newRoundState, [], null, false, false, false, false);
    }

    // Check for flop
    if (result.isFlop) {
      if (result.flopShieldAvailable) {
        const charmManager = this.gameAPI.getCharmManager();
        const shieldCheck = charmManager.checkFlopShieldAvailable({ gameState: finalGameState, roundState: newRoundState });
        (this.gameInterface as any).pendingAction = {
          type: 'flopShieldChoice',
          canPrevent: true,
          log: shieldCheck.log
        };
        return this.createWebGameState(finalGameState, newRoundState, [], null, false, false, false, false);
      }
      
      return await this.handleFlop(finalGameState, newRoundState);
    } else {
      this.gameInterface.askForDiceSelection(newRoundState.diceHand, finalGameState.consumables);
      // Reset justSkippedReroll when we roll - button should be available again
      return this.createWebGameState(finalGameState, newRoundState, [], null, false, false, false, false);
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
      const roundState = gameState.currentLevel.currentRound;
      if (!roundState) return state;
      
      // If it's a flop, handle it immediately
      if (result.isFlop) {
        const charmManager = this.gameAPI.getCharmManager();
        const shieldCheck = charmManager.checkFlopShieldAvailable({ gameState, roundState });
        if (shieldCheck.available) {
          (this.gameInterface as any).pendingAction = {
            type: 'flopShieldChoice',
            canPrevent: true,
            log: shieldCheck.log
          };
          return this.createWebGameState(gameState, roundState, [], null, false, false, false);
        }
        return await this.handleFlop(gameState, roundState);
      }
      
      // Check if more rerolls available
      if (this.gameAPI.canReroll(gameState)) {
        this.gameInterface.askForReroll(roundState.diceHand, gameState.currentLevel.rerollsRemaining || 0);
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
    const roundState = gameState.currentLevel.currentRound;

    if (!roundState) return state;

    this.gameInterface.resolvePendingAction(selectedIndices.map(i => i + 1).join(' '));

    // Check if more rerolls available
    if (this.gameAPI.canReroll(gameState)) {
      this.gameInterface.askForReroll(roundState.diceHand, gameState.currentLevel.rerollsRemaining || 0);
      // Reset justSkippedReroll when we actually reroll dice - button should be available again
      return this.createWebGameState(gameState, roundState, [], null, false, false, false, false);
    }

    // No more rerolls - check for flop (trust result.isFlop from GameAPI)
    if (result.isFlop) {
      const charmManager = this.gameAPI.getCharmManager();
      const shieldCheck = charmManager.checkFlopShieldAvailable({ gameState, roundState });
      if (shieldCheck.available) {
        (this.gameInterface as any).pendingAction = {
          type: 'flopShieldChoice',
          canPrevent: true,
          log: shieldCheck.log
        };
        return this.createWebGameState(gameState, roundState, [], null, false, false, false);
      }
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
        return this.createWebGameState(gameState, roundState, [], null, false, false, false);
      }
    }
    
    return await this.handleFlop(gameState, roundState);
  }

  private async handleFlop(gameState: GameState, roundState: RoundState): Promise<WebGameState> {
    // Process the flop (ends the round, increments consecutive flops, etc.)
    const result = await this.gameAPI.handleFlop(gameState);
    const newGameState = result.gameState;

    // Game over check
    if (!newGameState.isActive) {
      const finalRoundState = newGameState.currentLevel.currentRound || null;
      return this.createWebGameState(newGameState, finalRoundState, [], null, false, false, false);
    }

    // Don't start a new round yet - keep the ended round state visible so player can see the flop dice
    // The new round will be started when they click "Roll"
    const endedRoundState = newGameState.currentLevel.currentRound || null;
    
    // Set justFlopped to true - the ended round state still has the dice
    (this.gameInterface as any).pendingAction = { type: 'none' };
    return this.createWebGameState(newGameState, endedRoundState, [], null, false, true, false);
  }

  async useConsumable(state: WebGameState, index: number): Promise<WebGameState> {
    if (!state.gameState || !state.roundState) return state;
    
    // Use GameAPI for consumable effects
    const result = await this.gameAPI.useConsumable(state.gameState, index);
    
    if (!result.success) {
      return state;
    }
    
    const gameState = result.gameState;
    const roundState = result.roundState || state.roundState;
    
    if (result.requiresInput && result.requiresInput.type === 'dieSelection') {
      // Requires die selection input - handled by GameAPI
    }
    
    return this.createWebGameState(gameState, roundState, state.selectedDice, state.previewScoring, state.justBanked, state.justFlopped, state.isProcessing);
  }

  async purchaseCharm(state: WebGameState, charmIndex: number): Promise<WebGameState> {
    if (!state.gameState || !state.shopState || !state.isInShop) return state;
    
    const result = await this.gameAPI.purchaseCharm(state.gameState, state.shopState, charmIndex);
    
    if (result.success) {
      const newShopState = this.gameAPI.generateShop(result.gameState);
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
      const newShopState = this.gameAPI.generateShop(result.gameState);
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
      const newShopState = this.gameAPI.generateShop(result.gameState);
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

  async confirmTally(state: WebGameState): Promise<WebGameState> {
    if (!state.gameState || !state.pendingRewards) return state;
    
    const completedLevelNumber = state.gameState.currentLevel.levelNumber;
    
    // Apply rewards and tally level
    const tallyResult = await this.gameAPI.tallyLevel(state.gameState);
    const talliedGameState = tallyResult.gameState;
    
    // Generate shop
    const shopState = this.gameAPI.generateShop(talliedGameState);
    
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
    
    // Advance to next level using GameAPI (moves completed level to history, creates new level state)
    const advanceResult = await this.gameAPI.advanceToNextLevel(state.gameState);
    
    // Initialize the new level (creates level state and first round, emits events)
    const levelResult = await this.gameAPI.initializeLevel(advanceResult.gameState, advanceResult.gameState.currentLevel.levelNumber);
    const gameState = levelResult.gameState;
    const roundState = gameState.currentLevel.currentRound;
    
    if (!roundState) return state;
    
    return this.createWebGameState(gameState, roundState, [], null, false, false, false);
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
    const roundState = gameState.currentLevel.currentRound;
    
    if (!roundState) return state;
    
    (this.gameInterface as any).pendingAction = { type: 'none' };
    
    return this.createWebGameState(gameState, roundState, [], null, false, false, false);
  }
}

