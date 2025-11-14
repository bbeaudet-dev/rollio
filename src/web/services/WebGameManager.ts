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
  } | null;
  materialLogs: string[];
  charmLogs: string[];
  justBanked: boolean;
  justFlopped: boolean;
  isProcessing: boolean;
  // Derived flags for compatibility
  canRoll: boolean;
  canBank: boolean;
  canReroll: boolean;
  canSelectDice: boolean;
  isWaitingForReroll: boolean;
  canRerollSelected: boolean;
  canContinueFlop: boolean;
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

  private createWebGameState(
    gameState: GameState,
    roundState: RoundState | null,
    selectedDice: number[],
    previewScoring: { isValid: boolean; points: number; combinations: string[] } | null,
    materialLogs: string[],
    charmLogs: string[],
    justBanked: boolean,
    justFlopped: boolean,
    isProcessing: boolean = false
  ): WebGameState {
    const messages = this.gameInterface.getMessages();
    const pendingAction = this.gameInterface.getPendingAction();
    
    messages.forEach(msg => this.messageCallback(msg));
    
    const hasRolledDice = !!(roundState?.rollHistory && roundState.rollHistory.length > 0);
    // Use pure function to check if can bank (includes all conditions: active, roundPoints > 0, banks > 0)
    // Also need to check pendingAction for UI state (player has rolled and scored)
    const canBank = this.gameAPI.canBankPoints(gameState) && pendingAction.type === 'bankOrReroll';
    const hasBanksRemaining = (gameState.currentLevel.banksRemaining || 0) > 0;
    const canRoll: boolean = (!roundState && !isProcessing && gameState.isActive && hasBanksRemaining) || 
                    !!(roundState?.isActive && !hasRolledDice && pendingAction.type === 'none' && hasBanksRemaining);
    const hasHotDice = !!(roundState?.rollHistory && roundState.rollHistory.length > 0 && 
      roundState.rollHistory[roundState.rollHistory.length - 1]?.isHotDice);
    const canReroll = !!(roundState?.isActive && pendingAction.type === 'bankOrReroll' && 
      (roundState.diceHand.length > 0 || hasHotDice));
    const canSelectDice = !!(gameState.isActive && roundState?.isActive && (pendingAction.type === 'diceSelection' || pendingAction.type === 'reroll') && !justBanked && !justFlopped);
    const isWaitingForReroll = !!(roundState?.isActive && pendingAction.type === 'reroll' && gameState.currentLevel.rerollsRemaining && gameState.currentLevel.rerollsRemaining > 0);
    const canRerollSelected = !!(isWaitingForReroll && gameState.currentLevel.rerollsRemaining && gameState.currentLevel.rerollsRemaining > 0);
    const canContinueFlop = !!(roundState?.isActive && pendingAction.type === 'flopContinue');
    const canChooseFlopShield: boolean = !!(roundState?.isActive && pendingAction.type === 'flopShieldChoice');
    
    return {
      gameState,
      roundState,
      selectedDice,
      messages,
      pendingAction,
      previewScoring,
      materialLogs,
      charmLogs,
      justBanked,
      justFlopped,
      isProcessing,
      canRoll,
      canBank,
      canReroll,
      canSelectDice,
      isWaitingForReroll,
      canRerollSelected,
      canContinueFlop,
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
        flopPenaltyEnabled: true,
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
          gameState.consumables.push({ ...consumableData, uses: consumableData.uses || 1 });
        }
      });
    }

    // Initialize level 1 (creates level state and first round)
    const levelResult = await this.gameAPI.initializeLevel(gameState, 1);
    gameState = levelResult.gameState;

    const roundState = gameState.currentLevel.currentRound;
    return this.createWebGameState(gameState, roundState || null, [], null, [], [], false, false, false);
  }

  updateDiceSelection(state: WebGameState, selectedIndices: number[]): WebGameState {
    if (!state.roundState || !state.gameState) return state;
    
    // Don't allow dice selection if game is over
    if (!state.gameState.isActive) return state;

    const previewScoring = this.gameAPI.calculatePreviewScoring(
      state.gameState,
      selectedIndices
    );

    return this.createWebGameState(state.gameState, state.roundState, selectedIndices, previewScoring, state.materialLogs, state.charmLogs, state.justBanked, state.justFlopped, state.isProcessing);
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
    this.gameInterface.askForBankOrReroll(diceToReroll);

    return this.createWebGameState(result.gameState, roundState || null, [], null, [], [], false, false, false);
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
      return this.createWebGameState(gameState, finalRoundState, [], null, [], [], false, false, false);
    }

    if (result.levelCompleted) {
      const completedLevelNumber = gameState.currentLevel.levelNumber;
      // Calculate rewards (but don't apply yet - wait for tally modal confirmation)
      const rewards = this.gameAPI.calculateLevelRewards(completedLevelNumber, gameState);
      
      const webState = this.createWebGameState(gameState, null, [], null, [], [], false, false, false);
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
    return this.createWebGameState(newGameState, newRoundState, [], null, [], [], true, false, false);
  }

  async rollDice(state: WebGameState): Promise<WebGameState> {
    if (!state.gameState || !state.roundState) return state;

    const roundState = state.roundState;
    const result = await this.gameAPI.rollDice(state.gameState);
    const gameState = result.gameState;
    const newRoundState = gameState.currentLevel.currentRound;

    if (!newRoundState) return state;

    // Check for reroll prompt
    if (gameState.currentLevel.rerollsRemaining && gameState.currentLevel.rerollsRemaining > 0) {
      this.gameInterface.askForReroll(newRoundState.diceHand, gameState.currentLevel.rerollsRemaining);
      return this.createWebGameState(gameState, newRoundState, [], null, [], [], false, false, false);
    }

    // Check for flop (from GameAPI result)
    if (result.isFlop) {
      if (result.flopShieldAvailable) {
        const charmManager = this.gameAPI.getCharmManager();
        const shieldCheck = charmManager.checkFlopShieldAvailable({ gameState, roundState: newRoundState });
        (this.gameInterface as any).pendingAction = {
          type: 'flopShieldChoice',
          canPrevent: true,
          log: shieldCheck.log
        };
        return this.createWebGameState(gameState, newRoundState, [], null, [], [], false, false, false);
      }
      
      return this.handleFlop(gameState, newRoundState);
    } else {
      this.gameInterface.askForDiceSelection(newRoundState.diceHand, gameState.consumables);
      return this.createWebGameState(gameState, newRoundState, [], null, [], [], false, false, false);
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

    // If 0 dice selected, skip reroll (don't consume reroll) and go straight to flop check
    if (selectedIndices.length === 0) {
      this.gameInterface.resolvePendingAction('');
      const roundState = state.gameState.currentLevel.currentRound;
      if (!roundState) return state;
      return this.checkForFlopAfterReroll(state.gameState, roundState);
    }

    // Use GameAPI for reroll (this consumes a reroll and validates internally)
    const result = await this.gameAPI.rerollDice(state.gameState, selectedIndices);
    const gameState = result.gameState;
    const roundState = gameState.currentLevel.currentRound;

    if (!roundState) return state;

    this.gameInterface.resolvePendingAction(selectedIndices.map(i => i + 1).join(' '));

    // Check for flop from reroll result
    if (result.isFlop) {
      const charmManager = this.gameAPI.getCharmManager();
      const shieldCheck = charmManager.checkFlopShieldAvailable({ gameState, roundState });
      
      if (shieldCheck.available) {
        (this.gameInterface as any).pendingAction = {
          type: 'flopShieldChoice',
          canPrevent: true,
          log: shieldCheck.log
        };
        return this.createWebGameState(gameState, roundState, [], null, [], [], false, false, false);
      }
      
      return this.handleFlop(gameState, roundState);
    }

    if (gameState.currentLevel.rerollsRemaining && gameState.currentLevel.rerollsRemaining > 0) {
      this.gameInterface.askForReroll(roundState.diceHand, gameState.currentLevel.rerollsRemaining);
      return this.createWebGameState(gameState, roundState, [], null, [], [], false, false, false);
    }

    // No more rerolls - check for flop before asking for dice selection
    // If no valid scoring combinations, it's a flop
    if (this.gameAPI.checkFlop(gameState)) {
      const charmManager = this.gameAPI.getCharmManager();
      const shieldCheck = charmManager.checkFlopShieldAvailable({ gameState, roundState });
      
      if (shieldCheck.available) {
        (this.gameInterface as any).pendingAction = {
          type: 'flopShieldChoice',
          canPrevent: true,
          log: shieldCheck.log
        };
        return this.createWebGameState(gameState, roundState, [], null, [], [], false, false, false);
      }
      
      return this.handleFlop(gameState, roundState);
    }
    
    // No more rerolls - ask for dice selection
    this.gameInterface.askForDiceSelection(roundState.diceHand, gameState.consumables);
    return this.createWebGameState(gameState, roundState, [], null, [], [], false, false, false);
  }

  private checkForFlopAfterReroll(gameState: GameState, roundState: RoundState): WebGameState {
    // Use GameAPI to check for flop
    if (this.gameAPI.checkFlop(gameState)) {
      const charmManager = this.gameAPI.getCharmManager();
      const shieldCheck = charmManager.checkFlopShieldAvailable({ gameState, roundState });
      
      if (shieldCheck.available) {
        (this.gameInterface as any).pendingAction = {
          type: 'flopShieldChoice',
          canPrevent: true,
          log: shieldCheck.log
        };
        return this.createWebGameState(gameState, roundState, [], null, [], [], false, false, false);
      }
      
      return this.handleFlop(gameState, roundState);
    } else {
      this.gameInterface.askForDiceSelection(roundState.diceHand, gameState.consumables);
      return this.createWebGameState(gameState, roundState, [], null, [], [], false, false, false);
    }
  }

  handleFlopShieldChoice(state: WebGameState, useShield: boolean): WebGameState {
    if (!state.gameState || !state.roundState) return state;
    if (state.pendingAction.type !== 'flopShieldChoice') return state;

    const gameState = { ...state.gameState };
    const roundState = { ...state.roundState };
    const charmManager = this.gameAPI.getCharmManager();

    if (useShield) {
      const flopResult = charmManager.tryPreventFlop({ gameState, roundState });
      if (flopResult.prevented) {
        const diceToRoll = roundState.diceHand.length;
        this.gameInterface.askForBankOrReroll(diceToRoll);
        return this.createWebGameState(gameState, roundState, [], null, [], [], false, false, false);
      }
    }
    
    return this.handleFlop(gameState, roundState);
  }

  private handleFlop(gameState: GameState, roundState: RoundState): WebGameState {
    const forfeitedPoints = roundState.roundPoints;
    const consecutiveFlops = gameState.currentLevel.consecutiveFlops + 1;
    
    (this.gameInterface as any).pendingAction = { 
      type: 'flopContinue', 
      forfeitedPoints, 
      consecutiveFlops 
    };
    
    return this.createWebGameState(gameState, roundState, [], null, [], [], false, false, false);
  }

  async handleFlopContinue(state: WebGameState): Promise<WebGameState> {
    if (!state.gameState || !state.roundState) return state;
    if (state.pendingAction.type !== 'flopContinue') return state;

    const result = await this.gameAPI.handleFlop(state.gameState);
    const gameState = result.gameState;

    if (!gameState.isActive) {
      const roundState = gameState.currentLevel.currentRound;
      return this.createWebGameState(gameState, roundState || null, [], null, [], [], false, false, false);
    }

    // Start a new round after flop continue
    const newRoundResult = await this.gameAPI.startNewRound(gameState);
    const newGameState = newRoundResult.gameState;
    const newRoundState = newGameState.currentLevel.currentRound;

    (this.gameInterface as any).pendingAction = { type: 'none' };
    
    return this.createWebGameState(newGameState, newRoundState || null, [], null, [], [], false, false, false);
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
    
    return this.createWebGameState(gameState, roundState, state.selectedDice, state.previewScoring, state.materialLogs, state.charmLogs, state.justBanked, state.justFlopped, state.isProcessing);
  }

  async purchaseCharm(state: WebGameState, charmIndex: number): Promise<WebGameState> {
    if (!state.gameState || !state.shopState || !state.isInShop) return state;
    
    const result = await this.gameAPI.purchaseCharm(state.gameState, state.shopState, charmIndex);
    
    if (result.success) {
      const newShopState = this.gameAPI.generateShop(result.gameState);
      const webState = this.createWebGameState(result.gameState, null, [], null, [], [], false, false, false);
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
      const webState = this.createWebGameState(result.gameState, null, [], null, [], [], false, false, false);
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
      const webState = this.createWebGameState(result.gameState, null, [], null, [], [], false, false, false);
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
    
    const webState = this.createWebGameState(talliedGameState, null, [], null, [], [], false, false, false);
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
    
    return this.createWebGameState(gameState, roundState, [], null, [], [], false, false, false);
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
    
    return this.createWebGameState(gameState, roundState, [], null, [], [], false, false, false);
  }
}

