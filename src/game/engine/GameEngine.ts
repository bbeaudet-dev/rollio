import { DEFAULT_GAME_CONFIG } from '../utils/factories';
import { Die, DiceMaterialType } from '../types';
import { GameInterface } from '../interfaces';
import { setDebugMode, getDebugMode, debugLog, debugAction, debugStateChange } from '../utils/debug';
import { CharmManager } from '../logic/charmSystem';
import { registerCharms } from '../logic/charms/index';
import { applyConsumableEffect } from '../logic/consumableEffects';
import { DisplayFormatter } from '../../app/utils/display';
import { CLIDisplayFormatter } from '../../cli/display/cliDisplay';
import { SetupManager } from './SetupManager';
import { RoundManager } from './RoundManager';
import { RollManager } from './RollManager';
import { TutorialSystem } from '../tutorial/tutorialSystem';

/*
 * =============================
 * GameEngine
 * =============================
 * Orchestrates the overall game flow and user interaction.
 * Delegates setup, round, and roll logic to managers.
 */
export class GameEngine {
  private interface: GameInterface;
  private charmManager: CharmManager;
  private setupManager: SetupManager;
  private roundManager: RoundManager;
  private rollManager: RollManager;

  /*
   * Constructor
   * Sets up managers and registers charms.
   */
  constructor(gameInterface: GameInterface, debugMode: boolean = false) {
    this.interface = gameInterface;
    this.charmManager = new CharmManager();
    this.setupManager = new SetupManager();
    this.roundManager = new RoundManager();
    this.rollManager = new RollManager();
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
        this.rollManager,
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
    
    await applyConsumableEffect(idx, gameState, roundState, this.interface, this.charmManager);
    
    debugAction('consumableUsage', `Consumable effect applied: ${consumable?.name || 'Unknown'}`);
  }
} 