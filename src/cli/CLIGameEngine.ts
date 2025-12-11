import { GameInterface } from './interfaces';
import { setDebugMode, getDebugMode, debugLog, debugAction, debugStateChange } from '../game/utils/debug';
import { CharmManager } from '../game/logic/charmSystem';
import { registerCharms } from '../game/logic/charms/index';
import { applyConsumableEffect, applyDieSelectionConsumable } from '../game/logic/consumableEffects';
import { DIE_SIZE_SEQUENCE } from '../game/utils/dieSizeUtils';
import { CLIDisplayFormatter } from './display/cliDisplay';
import { SetupManager } from './SetupManager';
import { CLIRoundManager } from './CLIRoundManager';
import { TutorialSystem } from './tutorialSystem';
import { registerStartingCharms } from '../game/utils/factories';

/*
 * =============================
 * CLIGameEngine
 * =============================
 * CLI-specific game engine orchestrator.
 * Handles menu, setup, and round orchestration for CLI.
 * 
 * NOTE: This is CLI-specific. For web/API usage, use GameAPI.
 */
export class CLIGameEngine {
  private interface: GameInterface;
  private charmManager: CharmManager;
  private setupManager: SetupManager;
  private roundManager: CLIRoundManager;

  /*
   * Constructor
   * Sets up managers and registers charms.
   */
  constructor(gameInterface: GameInterface, debugMode: boolean = false) {
    this.interface = gameInterface;
    this.charmManager = new CharmManager();
    this.setupManager = new SetupManager();
    this.roundManager = new CLIRoundManager();
    if (debugMode) {
      setDebugMode(true);
    }
    registerCharms();
    
    debugAction('gameFlow', 'GameEngine initialized', { debugMode });
  }

  /*
   * run
   * ---
   * Main game loop. Handles menu, setup, and round orchestration.
   */
  async run(): Promise<void> {
    // Display startup dice animation if available
    if (typeof (this.interface as any).displayStartupAnimation === 'function') {
      await (this.interface as any).displayStartupAnimation();
    }
    
    await this.interface.displayWelcome();

    // Show main menu
    let gameMode: 'new' | 'cheat' | 'tutorial' = 'new';
    if (typeof (this.interface as any).showMainMenu === 'function') {
      gameMode = await (this.interface as any).showMainMenu();
    }
    debugAction('gameFlow', `Game mode selected: ${gameMode}`);

    let gameState: any;
    let diceSetConfig: any;

    // Use SetupManager for game setup
    if (gameMode === 'new') {
      debugAction('gameFlow', 'Setting up default game');
      ({ gameState, diceSetConfig } = await this.setupManager.setupDefaultGame(this.interface));
      // Register starting charms with the charm manager (for default game setup)
      registerStartingCharms(gameState, this.charmManager);
    } else if (gameMode === 'tutorial') {
      debugAction('gameFlow', 'Starting tutorial system');
      // Show tutorial system
      const tutorialSystem = new TutorialSystem(this.interface);
      await tutorialSystem.showTutorialMenu();
      return; // Exit after tutorial
    } else {
      debugAction('gameFlow', 'Setting up custom game');
      ({ gameState, diceSetConfig } = await this.setupManager.setupCustomGame(this.interface, this.charmManager));
    }
    
    debugAction('gameFlow', 'Game setup completed', { 
      diceSetName: diceSetConfig.name, 
      charmsCount: gameState.charms?.length || 0,
      consumablesCount: gameState.consumables?.length || 0
    });

    await this.interface.log(CLIDisplayFormatter.formatGameSetupSummary(gameState));

    // Main game loop
    debugAction('gameFlow', 'Starting main game loop');
    while (gameState.isActive) {
      
      // Ask user to start the round
      const next = await (this.interface as any).askForNextRound(gameState, null, async (idx: number) => await this.useConsumable(idx, gameState, null));
      if (next.trim().toLowerCase() !== 'y') {
        debugAction('gameFlow', 'Player quit game');
        gameState.isActive = false;
        gameState.endReason = 'quit';
        await this.interface.displayGameEnd(gameState);
        break;
      }
      
      debugAction('roundTransitions', 'Round confirmed, starting play');
      await this.roundManager.playRound(
        gameState,
        diceSetConfig.name,
        this.charmManager,
        this.interface,
        this.useConsumable.bind(this)
      );
      
      // In roguelike system, game ends when:
      // - Lives run out (handled in RoundManager/LevelManager)
      // - Player quits (handled above)
      // No winCondition based on totalScore
    }
  }

  /*
   * useConsumable
   * -------------
   * Handles consumable usage, passed as a callback to RoundManager.
   */
  async useConsumable(idx: number, gameState: any, roundState: any): Promise<void> {
    const consumable = gameState.consumables?.[idx];
    debugAction('consumableUsage', `Using consumable: ${consumable?.name || 'Unknown'}`, { 
      consumableIndex: idx,
      roundContext: roundState ? 'in-round' : 'between-rounds'
    });
    
    const result = await applyConsumableEffect(idx, gameState, roundState, this.charmManager);
    
    // Update gameState and roundState from result
    const oldMoney = gameState.money;
    const oldDiceSetLength = gameState.diceSet.length;
    const oldCharmSlots = gameState.charmSlots;
    const oldCharmsLength = gameState.charms.length;
    
    Object.assign(gameState, result.gameState);
    if (result.roundState && roundState) {
      Object.assign(roundState, result.roundState);
    }
    
    // Generate messages based on state changes (CLI-specific)
    if (result.requiresInput && result.requiresInput.type === 'dieSelection') {
      const prompt = result.requiresInput.consumableId === 'chisel'
        ? `🪓 Chisel: Select a die to reduce (Die sequence: ${DIE_SIZE_SEQUENCE.join(', ')}):`
        : `🧱 Pottery Wheel: Select a die to enlarge (Die sequence: ${DIE_SIZE_SEQUENCE.join(', ')}):`;
      const selectedDieIndex = await this.interface.askForDieSelection(
        result.requiresInput.diceSet,
        prompt
      );
      
      // Apply the die selection
      const selectionResult = applyDieSelectionConsumable(
        result.requiresInput.consumableId,
        selectedDieIndex,
        gameState,
        roundState
      );
      
      // Update gameState and roundState
      Object.assign(gameState, selectionResult.gameState);
      if (selectionResult.roundState && roundState) {
        Object.assign(roundState, selectionResult.roundState);
      }
      
      // Generate message based on result
      const selectedDie = gameState.diceSet[selectedDieIndex];
      if (selectionResult.success && selectionResult.shouldRemove) {
        if (result.requiresInput.consumableId === 'chisel') {
          await this.interface.log(`🪓 Chisel: Die ${selectedDieIndex + 1} reduced to ${selectedDie.sides}-sided!`);
        } else {
          await this.interface.log(`🧱 Pottery Wheel: Die ${selectedDieIndex + 1} enlarged to ${selectedDie.sides}-sided!`);
        }
      } else if (!selectionResult.shouldRemove) {
        await this.interface.log(`Cannot modify die ${selectedDieIndex + 1} - already at ${selectedDie.sides}-sided (${result.requiresInput.consumableId === 'chisel' ? 'minimum' : 'maximum'}).`);
      }
      
      // Remove consumable if needed
      if (selectionResult.shouldRemove) {
        gameState.consumables.splice(idx, 1);
      }
    } else {
      // Generate messages based on state changes
      if (gameState.money !== oldMoney) {
        await this.interface.log(`💰 Money Doubler used! You now have $${gameState.money}.`);
      }
      if (gameState.diceSet.length > oldDiceSetLength) {
        await this.interface.log('🎲 Extra Die added! You will have an extra die next round.');
      }
      if (gameState.charmSlots > oldCharmSlots) {
        await this.interface.log('🧳 Slot Expander used! You now have an extra charm slot.');
      }
      if (gameState.charms.length > oldCharmsLength) {
        const newCharm = gameState.charms[gameState.charms.length - 1];
        await this.interface.log(`🎁 Charm Giver: You gained a new charm: ${newCharm.name}!`);
      }
      if (result.shouldRemove) {
        gameState.consumables.splice(idx, 1);
      }
    }
    
    debugAction('consumableUsage', `Consumable effect applied: ${consumable?.name || 'Unknown'}`);
  }
} 