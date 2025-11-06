import { describe, it, expect } from 'vitest';
import { createInitialGameState, createInitialRoundState, resetDiceScoredState } from '../utils/factories';
import { GameState, RoundState, DiceSetConfig, Die } from '../types';
import { 
  BASIC_DICE_SET, 
  HIGH_ROLLER_SET, 
  LOW_BALLER_SET, 
  COLLECTOR_SET, 
  LUXURY_SET, 
  RANDOM_SET,
  ALL_DICE_SETS 
} from '../data/diceSets';

describe('Game State', () => {
  describe('createInitialGameState', () => {
    it('should create a valid game state with all required properties', () => {
      const gameState = createInitialGameState(BASIC_DICE_SET);
      
      // Check all required properties exist
      expect(gameState.history).toHaveProperty('totalScore', 0);
      expect(gameState.currentLevel.currentRound).toHaveProperty('roundNumber', 1);
      expect(gameState).toHaveProperty('diceSet');
      expect(gameState.currentLevel).toHaveProperty('consecutiveFlops', 0);
      expect(gameState).toHaveProperty('money');
      expect(gameState).toHaveProperty('charms');
      expect(gameState).toHaveProperty('consumables');
      expect(gameState).toHaveProperty('isActive', true);
    });

    it('should create 6 dice with correct initial state for Basic set', () => {
      const gameState = createInitialGameState(BASIC_DICE_SET);
      
      expect(gameState.diceSet).toHaveLength(6);
      
      gameState.diceSet.forEach((die, index) => {
        expect(die).toHaveProperty('id', `d${index + 1}`);
        expect(die).toHaveProperty('sides', 6);
        expect(die).toHaveProperty('allowedValues', [1, 2, 3, 4, 5, 6]);
        expect(die).toHaveProperty('material', 'plastic');
        expect(die).toHaveProperty('scored', false);
      });
    });

    it('should have correct dice set configuration for Basic set', () => {
      const gameState = createInitialGameState(BASIC_DICE_SET);
      
      expect(gameState.config.diceSetConfig.name).toBe('Basic');
      expect(gameState.config.diceSetConfig.startingMoney).toBe(10);
      expect(gameState.config.diceSetConfig.charmSlots).toBe(3);
      expect(gameState.config.diceSetConfig.consumableSlots).toBe(2);
      expect(gameState.config.diceSetConfig.dice).toHaveLength(6);
    });

    it('should initialize empty arrays for charms and consumables', () => {
      const gameState = createInitialGameState(BASIC_DICE_SET);
      
      expect(gameState.charms).toEqual([]);
      expect(gameState.consumables).toEqual([]);
    });

    it('should work with High Roller dice set', () => {
      const gameState = createInitialGameState(HIGH_ROLLER_SET);
      
      expect(gameState.diceSet).toHaveLength(6);
      expect(gameState.config.diceSetConfig.name).toBe('High Roller');
      expect(gameState.config.diceSetConfig.startingMoney).toBe(5);
      expect(gameState.config.diceSetConfig.charmSlots).toBe(3);
      expect(gameState.config.diceSetConfig.consumableSlots).toBe(2);
      
      // Check that all dice have high values (4,5,6)
      gameState.diceSet.forEach(die => {
        expect(die.allowedValues).toEqual([4, 4, 5, 5, 6, 6]);
      });
    });

    it('should work with Low Baller dice set', () => {
      const gameState = createInitialGameState(LOW_BALLER_SET);
      
      expect(gameState.diceSet).toHaveLength(6);
      expect(gameState.config.diceSetConfig.name).toBe('Low Baller');
      expect(gameState.config.diceSetConfig.startingMoney).toBe(15);
      expect(gameState.config.diceSetConfig.charmSlots).toBe(3);
      expect(gameState.config.diceSetConfig.consumableSlots).toBe(2);
      
      // Check that all dice have low values (1,2,3)
      gameState.diceSet.forEach((die: any) => {
        expect(die.allowedValues).toEqual([1, 1, 2, 2, 3, 3]);
      });
    });

    it('should work with Collector dice set (more than 6 dice)', () => {
      const gameState = createInitialGameState(COLLECTOR_SET);
      
      expect(gameState.diceSet).toHaveLength(8);
      expect(gameState.config.diceSetConfig.name).toBe('Collector Set');
      expect(gameState.config.diceSetConfig.startingMoney).toBe(5);
      expect(gameState.config.diceSetConfig.charmSlots).toBe(2);
      expect(gameState.config.diceSetConfig.consumableSlots).toBe(1);
    });

    it('should work with Luxury dice set (fewer than 6 dice)', () => {
      const gameState = createInitialGameState(LUXURY_SET);
      
      expect(gameState.diceSet).toHaveLength(4);
      expect(gameState.config.diceSetConfig.name).toBe('Luxury');
      expect(gameState.config.diceSetConfig.startingMoney).toBe(15);
      expect(gameState.config.diceSetConfig.charmSlots).toBe(3);
      expect(gameState.config.diceSetConfig.consumableSlots).toBe(2);
      
      // Check that all dice have crystal material
      gameState.diceSet.forEach((die: any) => {
        expect(die.material).toBe('crystal');
      });
    });

    it('should work with Random dice set (random configuration)', () => {
      const randomConfig = RANDOM_SET();
      const gameState = createInitialGameState(randomConfig);
      
      expect(gameState.diceSet).toHaveLength(randomConfig.dice.length);
      expect(gameState.config.diceSetConfig.name).toBe('Random Set');
      expect(gameState.config.diceSetConfig.startingMoney).toBeGreaterThanOrEqual(1);
      expect(gameState.config.diceSetConfig.startingMoney).toBeLessThanOrEqual(20);
      expect(gameState.config.diceSetConfig.charmSlots).toBeGreaterThanOrEqual(1);
      expect(gameState.config.diceSetConfig.charmSlots).toBeLessThanOrEqual(5);
      expect(gameState.config.diceSetConfig.consumableSlots).toBeGreaterThanOrEqual(0);
      expect(gameState.config.diceSetConfig.consumableSlots).toBeLessThanOrEqual(3);
    });

    it('should work with all predefined dice sets', () => {
      // Test all static dice sets (excluding RANDOM_SET which is a function)
      const staticDiceSets = ALL_DICE_SETS.filter(ds => typeof ds === 'object') as DiceSetConfig[];
      
      staticDiceSets.forEach(diceSet => {
        const gameState = createInitialGameState(diceSet);
        
        expect(gameState.diceSet).toHaveLength(diceSet.dice.length);
        expect(gameState.config.diceSetConfig.name).toBe(diceSet.name);
        expect(gameState.config.diceSetConfig.startingMoney).toBe(diceSet.startingMoney);
        expect(gameState.config.diceSetConfig.charmSlots).toBe(diceSet.charmSlots);
        expect(gameState.config.diceSetConfig.consumableSlots).toBe(diceSet.consumableSlots);
      });
    });

    it('should throw error for invalid dice set with empty name', () => {
      const invalidConfig: DiceSetConfig = {
        ...BASIC_DICE_SET,
        name: ''
      };
      
      expect(() => createInitialGameState(invalidConfig)).toThrow('Dice set must have a valid name');
    });

    it('should throw error for invalid dice set with no dice', () => {
      const invalidConfig: DiceSetConfig = {
        ...BASIC_DICE_SET,
        dice: []
      };
      
      expect(() => createInitialGameState(invalidConfig)).toThrow('Dice set must contain at least one die');
    });

    it('should throw error for invalid dice set with negative starting money', () => {
      const invalidConfig: DiceSetConfig = {
        ...BASIC_DICE_SET,
        startingMoney: -5
      };
      
      expect(() => createInitialGameState(invalidConfig)).toThrow('Starting money cannot be negative');
    });

    it('should throw error for invalid dice set with duplicate die IDs', () => {
      const invalidConfig: DiceSetConfig = {
        ...BASIC_DICE_SET,
        dice: [
          { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
          { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
          { id: "d3", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        ]
      };
      
      expect(() => createInitialGameState(invalidConfig)).toThrow('Duplicate die ID: d1');
    });

    it('should throw error for invalid die with no ID', () => {
      const invalidConfig: DiceSetConfig = {
        ...BASIC_DICE_SET,
        dice: [
          { id: "", sides: 6, allowedValues: [1,2,3,4,5,6], material: "plastic" },
        ]
      };
      
      expect(() => createInitialGameState(invalidConfig)).toThrow('Die at index 0 must have a valid ID');
    });

    it('should throw error for invalid die with no material', () => {
      const invalidConfig: DiceSetConfig = {
        ...BASIC_DICE_SET,
        dice: [
          { id: "d1", sides: 6, allowedValues: [1,2,3,4,5,6], material: "" as any },
        ]
      };
      
      expect(() => createInitialGameState(invalidConfig)).toThrow('Die d1 must have a material');
    });
  });

  describe('createInitialRoundState', () => {
    it('should create a valid round state with default round number', () => {
      const roundState = createInitialRoundState();
      
      expect(roundState).toHaveProperty('roundNumber', 0);
      expect(roundState).toHaveProperty('roundPoints', 0);
      expect(roundState).toHaveProperty('diceHand');
      expect(roundState).toHaveProperty('rollHistory');
      expect(roundState).toHaveProperty('hotDiceCounter', 0);
      expect(roundState).toHaveProperty('forfeitedPoints', 0);
      expect(roundState).toHaveProperty('isActive', true);
    });

    it('should create round state with specified round number', () => {
      const roundState = createInitialRoundState(5);
      
      expect(roundState.roundNumber).toBe(5);
    });

    it('should initialize empty arrays for diceHand and roll history', () => {
      const roundState = createInitialRoundState();
      
      expect(roundState.diceHand).toEqual([]);
      expect(roundState.rollHistory).toEqual([]);
    });
  });

  describe('resetDiceScoredState', () => {
    it('should reset all dice scored state to false', () => {
      const gameState = createInitialGameState(BASIC_DICE_SET);
      
      // Mark some dice as scored
      gameState.diceSet[0].scored = true;
      gameState.diceSet[2].scored = true;
      gameState.diceSet[4].scored = true;
      
      // Verify some are scored
      expect(gameState.diceSet[0].scored).toBe(true);
      expect(gameState.diceSet[2].scored).toBe(true);
      expect(gameState.diceSet[4].scored).toBe(true);
      
      // Reset scored state
      resetDiceScoredState(gameState.diceSet);
      
      // Verify all are now false
      gameState.diceSet.forEach((die: any) => {
        expect(die.scored).toBe(false);
      });
    });
  });

  describe('Game State Serialization', () => {
    it('should serialize and deserialize correctly', () => {
      const gameState = createInitialGameState(BASIC_DICE_SET);
      
      const serialized = JSON.stringify(gameState);
      const deserialized = JSON.parse(serialized) as GameState;
      
      expect(deserialized.money).toBe(gameState.money);
      expect(deserialized.diceSet.length).toBe(gameState.diceSet.length);
      expect(deserialized.config.diceSetConfig.name).toBe(gameState.config.diceSetConfig.name);
    });
  });
}); 