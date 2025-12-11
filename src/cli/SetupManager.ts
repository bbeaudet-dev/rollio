import { GameInterface } from './interfaces';
import { CharmManager } from '../game/logic/charmSystem';
import { DEFAULT_GAME_CONFIG, createInitialGameState, registerStartingCharms } from '../game/utils/factories';
import { ALL_DICE_SETS } from '../game/data/diceSets';
import { CHARMS } from '../game/data/charms';
import { CONSUMABLES, WHIMS, WISHES, COMBINATION_UPGRADES } from '../game/data/consumables';
import { MATERIALS } from '../game/data/materials';
import { DiceMaterialType } from '../game/types';

/*
 * =============================
 * SetupManager
 * =============================
 * Handles all game setup flows, including menu, dice set selection,
 * and custom game options. Used by GameEngine to initialize game state.
 */
export class SetupManager {
  /*
   * Constructor
   * (No special setup required)
   */
  constructor() {}

  /*
   * setupDefaultGame
   * -----------------
   * Sets up a default game: only dice set selection, no charms, no consumables, and default rules.
   */
  async setupDefaultGame(gameInterface: GameInterface): Promise<{ gameState: any, diceSetConfig: any }> {
    // Only allow dice set selection
    const diceSetNames = ALL_DICE_SETS.map(ds => typeof ds === 'function' ? 'Chaos' : ds.name);
    const diceSetIdx = await (gameInterface as any).askForDiceSetSelection(diceSetNames);
    const selectedSet = ALL_DICE_SETS[diceSetIdx];
    const diceSetConfig = typeof selectedSet === 'function' ? selectedSet() : selectedSet;
    await gameInterface.log(`Selected Dice Set: ${diceSetConfig.name}`);
    // Create game state (starting items are already included from createInitialGameState)
    // CLI defaults to 'plastic' difficulty since it doesn't have difficulty selection
    let gameState = createInitialGameState(diceSetConfig, 'plastic');
    
    // If no starting items were specified, clear the arrays (for default game behavior)
    if (!diceSetConfig.startingCharms || diceSetConfig.startingCharms.length === 0) {
      gameState.charms = [];
    }
    if (!diceSetConfig.startingConsumables || diceSetConfig.startingConsumables.length === 0) {
      gameState.consumables = [];
    }
    
    gameState.config.penalties.consecutiveFlopLimit = DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit;
    return { gameState, diceSetConfig };
  }

  /*
   * setupCustomGame
   * ---------------
   * Sets up a custom game: allows full configuration of rules, materials,
   * charms, consumables, etc. Used for debug and advanced play.
   */
  async setupCustomGame(gameInterface: GameInterface, charmManager: CharmManager): Promise<{ gameState: any, diceSetConfig: any }> {
    // Prompt for game rules using interface method (removed winCondition)
    const { consecutiveFlopLimit } = await (gameInterface as any).askForGameRules();
    // Prompt for dice set selection
    const diceSetNames = ALL_DICE_SETS.map(ds => typeof ds === 'function' ? 'Chaos' : ds.name);
    const diceSetIdx = await (gameInterface as any).askForDiceSetSelection(diceSetNames);
    const selectedSet = ALL_DICE_SETS[diceSetIdx];
    const diceSetConfig = typeof selectedSet === 'function' ? selectedSet() : selectedSet;
    await gameInterface.log(`Selected Dice Set: ${diceSetConfig.name}`);
    // Material Assignment (before charms)
    const availableMaterials = MATERIALS.map(material => `${material.name} - ${material.description}`);
    const assignedMaterialIndices = await gameInterface.askForMaterialAssignment(diceSetConfig.dice.length, availableMaterials);
    // Charm Selection
    const availableCharms = CHARMS.map(charm => `${charm.name} (${charm.rarity}) - ${charm.description}`);
    const selectedCharmIndices = await gameInterface.askForCharmSelection(availableCharms, 3);
    // Determine consumable slots (default 2)
    const consumableSlots = diceSetConfig.consumableSlots ?? 2;
    // Consumable Selection
    const availableConsumables = CONSUMABLES.map(consumable => {
      const isWish = WISHES.some((w: any) => w.id === consumable.id);
      const isWhim = WHIMS.some((w: any) => w.id === consumable.id);
      const isCombinationUpgrade = COMBINATION_UPGRADES.some((cu: any) => cu.id === consumable.id);
      const category = isWish ? 'wish' : (isWhim ? 'whim' : (isCombinationUpgrade ? 'combinationUpgrade' : 'whim'));
      return `${consumable.name} (${category}) - ${consumable.description}`;
    });
    const selectedConsumableIndices = await gameInterface.askForConsumableSelection(availableConsumables, consumableSlots);
    // Create game state with selected charms, materials, and consumables
    // CLI defaults to 'plastic' difficulty since it doesn't have difficulty selection
    let gameState = createInitialGameState(diceSetConfig, 'plastic');
    gameState.config.penalties.consecutiveFlopLimit = consecutiveFlopLimit;
    // Assign materials to dice
    gameState.diceSet = gameState.diceSet.map((die: any, index: number) => ({
      ...die,
      material: MATERIALS[assignedMaterialIndices[index]].id as DiceMaterialType,
      abbreviation: MATERIALS[assignedMaterialIndices[index]].abbreviation
    }));
    
    // Register starting charms with the charm manager (starting items are already in game state from createInitialGameState)
    registerStartingCharms(gameState, charmManager);
    
    // Add selected charms to game state and charm manager (in addition to starting charms)
    const selectedCharms = selectedCharmIndices
      .filter(index => index < CHARMS.length) // Filter out "Empty" selections
      .map(index => {
        const charm = CHARMS[index];
        const runtimeCharm = {
          ...charm,
          active: true
        };
        charmManager.addCharm(runtimeCharm);
        return runtimeCharm;
      });
    gameState.charms.push(...selectedCharms);
    
    // Add selected consumables to game state (in addition to starting consumables)
    const selectedConsumables = selectedConsumableIndices
      .filter(index => index < CONSUMABLES.length) // Filter out "Empty" selections
      .map((index: number) => CONSUMABLES[index]);
    gameState.consumables.push(...selectedConsumables);
    
    return { gameState, diceSetConfig };
  }
} 