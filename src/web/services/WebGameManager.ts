import { GameState, RoundState, GameConfig, ShopState } from '../../game/types';
import { DEFAULT_GAME_CONFIG } from '../../game/utils/factories';
import { formatDiceAsPips } from '../utils/diceUtils';
import { ReactGameInterface, PendingAction } from './ReactGameInterface';
import { resetLevelColors } from '../utils/levelColors';
import { LevelRewards } from '../../game/logic/tallying';
import { GameAPI } from '../../game/api';
import { isFlop } from '../../game/logic/gameLogic';
import { validateRerollSelection } from '../../game/logic/rerollLogic';
import { calculateRerollsForLevel, calculateLivesForLevel } from '../../game/logic/rerollLogic';

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
  levelRewards: LevelRewards | null;
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
    const canRoll: boolean = (!roundState && !isProcessing && gameState.isActive) || 
                    !!(roundState?.isActive && !hasRolledDice && pendingAction.type === 'none');
    const canBank = !!(roundState?.isActive && roundState.roundPoints > 0 && pendingAction.type === 'bankOrReroll');
    const hasHotDice = !!(roundState?.rollHistory && roundState.rollHistory.length > 0 && 
      roundState.rollHistory[roundState.rollHistory.length - 1]?.isHotDice);
    const canReroll = !!(roundState?.isActive && pendingAction.type === 'bankOrReroll' && 
      (roundState.diceHand.length > 0 || hasHotDice));
    const canSelectDice = !!(roundState?.isActive && (pendingAction.type === 'diceSelection' || pendingAction.type === 'reroll') && !justBanked && !justFlopped);
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
        consecutiveFlopLimit: DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit,
        consecutiveFlopPenalty: DEFAULT_GAME_CONFIG.penalties.consecutiveFlopPenalty,
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

    this.addMessage(`Game started with ${diceSetConfig.name}!`);
    this.addMessage('=== ROUND 1 ===');
    this.addMessage('Click "Roll" to start the round.');

    const roundState = gameState.currentLevel.currentRound;
    return this.createWebGameState(gameState, roundState || null, [], null, [], [], false, false, false);
  }

  updateDiceSelection(state: WebGameState, selectedIndices: number[]): WebGameState {
    if (!state.roundState || !state.gameState) return state;

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

    const result = await this.gameAPI.scoreDice(state.gameState, state.selectedDice);

    if (!result.success) {
      this.addMessage('Invalid dice selection. Please select valid scoring combinations.');
      return state;
    }

    this.addMessage(`Scored ${result.points} points from: ${result.combinations.join(', ')}`);
    if (result.hotDice) {
      this.addMessage('🔥 Hot dice! All dice are available for reroll!');
    }
    this.addMessage(`Roll points: +${result.points}`);
    this.addMessage(`Round points: ${result.gameState.currentLevel.currentRound?.roundPoints || 0}`);

    const roundState = result.gameState.currentLevel.currentRound;
    const diceToReroll = roundState?.diceHand.length || 0;
    this.gameInterface.askForBankOrReroll(diceToReroll);

    return this.createWebGameState(result.gameState, roundState || null, [], null, [], [], false, false, false);
  }

  async bankPoints(state: WebGameState): Promise<WebGameState> {
    if (!state.gameState || !state.roundState) return state;

    const result = await this.gameAPI.bankPoints(state.gameState);
    const gameState = result.gameState;

    this.addMessage(`Banked ${result.bankedPoints} points!`);
    this.addMessage(`Total score: ${gameState.history.totalScore}`);
    this.addMessage(`Points banked: ${gameState.currentLevel.pointsBanked} / ${gameState.currentLevel.levelThreshold}`);

    if (result.levelCompleted) {
      const completedLevelNumber = gameState.currentLevel.levelNumber;
      this.addMessage(`Level ${completedLevelNumber} complete!`);
      
      // Tally level (calculate and apply rewards)
      const tallyResult = await this.gameAPI.tallyLevel(gameState);
      const talliedGameState = tallyResult.gameState;
      
      // Generate shop
      const shopState = this.gameAPI.generateShop(talliedGameState);
      
      const webState = this.createWebGameState(talliedGameState, null, [], null, [], [], false, false, false);
      return {
        ...webState,
        isInShop: true,
        shopState,
        levelRewards: tallyResult.rewards,
      };
    }

    const roundState = gameState.currentLevel.currentRound;
    this.addMessage(`=== ROUND ${roundState?.roundNumber || 1} ===`);
    this.addMessage('Click "Roll" to start the round.');
    
    return this.createWebGameState(gameState, roundState || null, [], null, [], [], false, false, false);
  }

  async rollDice(state: WebGameState): Promise<WebGameState> {
    if (!state.gameState || !state.roundState) return state;

    const roundState = state.roundState;
    const isHotDice = roundState.diceHand.length === 0;
    if (isHotDice) {
      this.addMessage('🔥 Hot dice! All dice restored!');
    }

    const result = await this.gameAPI.rollDice(state.gameState);
    const gameState = result.gameState;
    const newRoundState = gameState.currentLevel.currentRound;

    if (!newRoundState) return state;

    this.addMessage(`Roll ${result.rollNumber}: ${formatDiceAsPips(newRoundState.diceHand.map((d: any) => d.rolledValue || 0))}`);

    // Check for reroll prompt
    if (gameState.currentLevel.rerollsRemaining && gameState.currentLevel.rerollsRemaining > 0) {
      this.gameInterface.askForReroll(newRoundState.diceHand, gameState.currentLevel.rerollsRemaining);
      return this.createWebGameState(gameState, newRoundState, [], null, [], [], false, false, false);
    }

    // Check for flop
    if (isFlop(newRoundState.diceHand)) {
      const charmManager = this.gameAPI.getCharmManager();
      const shieldCheck = charmManager.checkFlopShieldAvailable({ gameState, roundState: newRoundState });
      
      if (shieldCheck.available) {
        (this.gameInterface as any).pendingAction = {
          type: 'flopShieldChoice',
          canPrevent: true,
          log: shieldCheck.log
        };
        this.addMessage(shieldCheck.log || '🛡️ Flop Shield available! Would you like to use it?');
        this.addMessage('(Click "Use Shield" to prevent flop, or "Skip" to proceed with flop)');
        return this.createWebGameState(gameState, newRoundState, [], null, [], [], false, false, false);
      }
      
      return this.handleFlop(gameState, newRoundState);
    } else {
      this.addMessage('Select dice to score:');
      this.gameInterface.askForDiceSelection(newRoundState.diceHand, gameState.consumables);
      return this.createWebGameState(gameState, newRoundState, [], null, [], [], false, false, false);
    }
  }

  async handleRerollSelection(state: WebGameState, selectedIndices: number[]): Promise<WebGameState> {
    if (!state.gameState || !state.roundState) return state;
    if (state.pendingAction.type !== 'reroll') return state;

    const validation = validateRerollSelection(selectedIndices, state.roundState.diceHand);
    if (!validation.valid) {
      this.addMessage(validation.error || 'Invalid reroll selection. Please try again.');
      return state;
    }

    if (selectedIndices.length === 0) {
      this.addMessage('Skipping reroll.');
      this.gameInterface.resolvePendingAction('');
      return this.checkForFlopAfterReroll(state.gameState, state.roundState);
    }

    // Use GameAPI for reroll
    const result = await this.gameAPI.rerollDice(state.gameState, selectedIndices);
    const gameState = result.gameState;
    const roundState = gameState.currentLevel.currentRound;

    if (!roundState) return state;

    this.addMessage(`Rerolled ${selectedIndices.length} dice. Rerolls remaining: ${gameState.currentLevel.rerollsRemaining || 0}`);
    this.addMessage(`Roll: ${formatDiceAsPips(roundState.diceHand.map((d: any) => d.rolledValue || 0))}`);

    this.gameInterface.resolvePendingAction(selectedIndices.map(i => i + 1).join(' '));

    if (gameState.currentLevel.rerollsRemaining && gameState.currentLevel.rerollsRemaining > 0) {
      this.gameInterface.askForReroll(roundState.diceHand, gameState.currentLevel.rerollsRemaining);
      return this.createWebGameState(gameState, roundState, [], null, [], [], false, false, false);
    }

    return this.checkForFlopAfterReroll(gameState, roundState);
  }

  private checkForFlopAfterReroll(gameState: GameState, roundState: RoundState): WebGameState {
    if (isFlop(roundState.diceHand)) {
      const charmManager = this.gameAPI.getCharmManager();
      const shieldCheck = charmManager.checkFlopShieldAvailable({ gameState, roundState });
      
      if (shieldCheck.available) {
        (this.gameInterface as any).pendingAction = {
          type: 'flopShieldChoice',
          canPrevent: true,
          log: shieldCheck.log
        };
        this.addMessage(shieldCheck.log || '🛡️ Flop Shield available! Would you like to use it?');
        this.addMessage('(Click "Use Shield" to prevent flop, or "Skip" to proceed with flop)');
        return this.createWebGameState(gameState, roundState, [], null, [], [], false, false, false);
      }
      
      return this.handleFlop(gameState, roundState);
    } else {
      this.addMessage('Select dice to score:');
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
        this.addMessage(flopResult.log || '🛡️ Flop Shield activated! Flop prevented');
        const diceToRoll = roundState.diceHand.length;
        this.gameInterface.askForBankOrReroll(diceToRoll);
        this.addMessage('Bank points or roll remaining dice.');
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
    
    this.addMessage('No valid scoring combinations found, you flopped!');
    
    return this.createWebGameState(gameState, roundState, [], null, [], [], false, false, false);
  }

  async handleFlopContinue(state: WebGameState): Promise<WebGameState> {
    if (!state.gameState || !state.roundState) return state;
    if (state.pendingAction.type !== 'flopContinue') return state;

    const result = await this.gameAPI.handleFlop(state.gameState);
    const gameState = result.gameState;

    this.addMessage(`-1 Life (${gameState.currentLevel.livesRemaining || 0} lives remaining)`);

    if (!gameState.isActive) {
      this.addMessage('=== GAME OVER ===');
      this.addMessage('You ran out of lives!');
      const roundState = gameState.currentLevel.currentRound;
      return this.createWebGameState(gameState, roundState || null, [], null, [], [], false, false, false);
    }

    // Start a new round after flop continue
    const newRoundResult = await this.gameAPI.startNewRound(gameState);
    const newGameState = newRoundResult.gameState;
    const newRoundState = newGameState.currentLevel.currentRound;

    (this.gameInterface as any).pendingAction = { type: 'none' };
    
    this.addMessage(`=== ROUND ${newRoundState?.roundNumber || 1} ===`);
    this.addMessage('Click "Roll" to start the round.');
    
    return this.createWebGameState(newGameState, newRoundState || null, [], null, [], [], false, false, false);
  }

  async useConsumable(state: WebGameState, index: number): Promise<WebGameState> {
    if (!state.gameState || !state.roundState) return state;
    
    const { applyConsumableEffect } = await import('../../game/logic/consumableEffects');
    const gameState = { ...state.gameState };
    const roundState = { ...state.roundState };
    const charmManager = this.gameAPI.getCharmManager();
    
    const result = applyConsumableEffect(index, gameState, roundState, charmManager);
    
    const oldMoney = gameState.money;
    const oldDiceSetLength = gameState.diceSet.length;
    const oldCharmSlots = gameState.charmSlots;
    const oldCharmsLength = gameState.charms.length;
    
    Object.assign(gameState, result.gameState);
    if (result.roundState) {
      Object.assign(roundState, result.roundState);
    }
    
    if (result.requiresInput && result.requiresInput.type === 'dieSelection') {
      this.addMessage(`Please select a die to ${result.requiresInput.consumableId === 'chisel' ? 'reduce' : 'enlarge'}`);
    } else {
      if (gameState.money !== oldMoney) {
        this.addMessage(`💰 Money Doubler used! You now have $${gameState.money}.`);
      }
      if (gameState.diceSet.length > oldDiceSetLength) {
        this.addMessage('🎲 Extra Die added! You will have an extra die next round.');
      }
      if (gameState.charmSlots > oldCharmSlots) {
        this.addMessage('🧳 Slot Expander used! You now have an extra charm slot.');
      }
      if (gameState.charms.length > oldCharmsLength) {
        const newCharm = gameState.charms[gameState.charms.length - 1];
        this.addMessage(`🎁 Charm Giver: You gained a new charm: ${newCharm.name}!`);
      }
      if (result.shouldRemove) {
        gameState.consumables.splice(index, 1);
      }
    }
    
    const consumable = gameState.consumables[index];
    if (consumable && consumable.uses !== undefined && consumable.uses <= 0) {
      gameState.consumables.splice(index, 1);
    }
    
    if (gameState.currentLevel.livesRemaining !== undefined && gameState.currentLevel.livesRemaining <= 0) {
      gameState.isActive = false;
      gameState.endReason = 'lost';
      this.addMessage('=== GAME OVER ===');
      this.addMessage('You ran out of lives!');
    }
    
    return this.createWebGameState(gameState, roundState, state.selectedDice, state.previewScoring, state.materialLogs, state.charmLogs, state.justBanked, state.justFlopped, state.isProcessing);
  }

  async purchaseCharm(state: WebGameState, charmIndex: number): Promise<WebGameState> {
    if (!state.gameState || !state.shopState || !state.isInShop) return state;
    
    const result = await this.gameAPI.purchaseCharm(state.gameState, state.shopState, charmIndex);
    this.addMessage(result.message);
    
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
    this.addMessage(result.message);
    
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
    this.addMessage(result.message);
    
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

  async exitShop(state: WebGameState): Promise<WebGameState> {
    if (!state.gameState || !state.isInShop) return state;
    
    // Advance to next level (moves completed level to history, creates new level state)
    const { advanceToNextLevel } = await import('../../game/logic/gameLogic');
    const newGameState = { ...state.gameState };
    advanceToNextLevel(newGameState);
    
    // Initialize the new level (creates level state and first round, emits events)
    const levelResult = await this.gameAPI.initializeLevel(newGameState, newGameState.currentLevel.levelNumber);
    const gameState = levelResult.gameState;
    const roundState = gameState.currentLevel.currentRound;
    
    if (!roundState) return state;
    
    this.addMessage(`=== LEVEL ${gameState.currentLevel.levelNumber} ===`);
    this.addMessage(`Threshold: ${gameState.currentLevel.levelThreshold} points`);
    this.addMessage(`Rerolls: ${gameState.currentLevel.rerollsRemaining}, Lives: ${gameState.currentLevel.livesRemaining}`);
    this.addMessage('Click "Roll" to start the round.');
    
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
    
    this.addMessage(`=== ROUND ${roundState.roundNumber} ===`);
    this.addMessage('Click "Roll" to start the round.');
    
    (this.gameInterface as any).pendingAction = { type: 'none' };
    
    return this.createWebGameState(gameState, roundState, [], null, [], [], false, false, false);
  }

  private addMessage(message: string): void {
    this.messageCallback(message);
  }
}

