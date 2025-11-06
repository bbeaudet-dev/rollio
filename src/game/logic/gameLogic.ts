import { DEFAULT_GAME_CONFIG, DEFAULT_SHOP_STATE } from '../core/gameInitializer';
import { debugStateChangeWithContext, debugLog, debugActionWithContext, debugAction, debugVerbose } from '../utils/debug';
import { Die, DieValue, ScoringCombination, Charm, GameState, RoundState, LevelState } from '../core/types';
import { getLevelConfig, MAX_LEVEL } from '../data/levels';
import { calculateRerollsForLevel, calculateLivesForLevel } from './rerollLogic';
import { getScoringCombinations, hasAnyScoringCombination, getAllPartitionings } from '../logic/scoring';
import { validateDiceSelection } from '../utils/effectUtils';
import { getRandomInt } from '../utils/effectUtils';

interface ScoringContext {
  charms: Charm[];
}

/**
 * Pure game logic functions - no I/O, no side effects
 * These can be used by both CLI and web interfaces
 */

export interface GameActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

export interface ScoringResult {
  selectedIndices: number[];
  scoringResult: {
    valid: boolean;
    points: number;
    combinations: ScoringCombination[];
  };
}

export interface RoundActionResult {
  roundActive: boolean;
  newHand: DieValue[];
  hotDice: boolean;
  flop: boolean;
  banked: boolean;
  pointsScored: number;
  message?: string;
}

/**
 * Validates dice selection and returns scoring result
 */
export function validateDiceSelectionAndScore(input: string, diceHand: Die[], context: ScoringContext): { selectedIndices: number[], scoringResult: { valid: boolean, points: number, combinations: ScoringCombination[], allPartitionings: ScoringCombination[][] } } {
  // Ensure diceHand is not undefined
  if (!diceHand || !Array.isArray(diceHand)) {
    console.error('validateDiceSelectionAndScore: diceHand is undefined or not an array:', diceHand);
    return {
      selectedIndices: [],
      scoringResult: { valid: false, points: 0, combinations: [], allPartitionings: [] }
    };
  }
  
  debugAction('scoring', `Validating dice selection: ${input}`, { 
    diceValues: diceHand.map(d => d.rolledValue),
    charmsActive: context.charms.length
  });
  
  const selectedIndices = validateDiceSelection(input, diceHand.map(die => die.rolledValue) as DieValue[]);
  debugVerbose(`Selected dice indices: [${selectedIndices.join(', ')}]`);
  
  const combos = getScoringCombinations(diceHand, selectedIndices, context);
  const allPartitionings = getAllPartitionings(diceHand, selectedIndices, context);
  const totalComboDice = combos.reduce((sum, c) => sum + c.dice.length, 0);
  
  const valid = combos.length > 0 && totalComboDice === selectedIndices.length;
  const points = combos.reduce((sum, c) => sum + c.points, 0);
  
  debugAction('scoring', `Scoring result: ${valid ? 'valid' : 'invalid'}`, {
    points,
    combinations: combos.map(c => ({ type: c.type, points: c.points })),
    partitioningOptions: allPartitionings.length
  });
  
  return {
    selectedIndices,
    scoringResult: { valid, points, combinations: combos, allPartitionings },
  };
}

/**
 * Checks if a roll is a flop (no scoring combinations)
 */
export function isFlop(diceHand: Die[]): boolean {
  const result = !hasAnyScoringCombination(diceHand);
  debugAction('diceRolls', `Flop check: ${result ? 'FLOP' : 'scoring available'}`, {
    diceValues: diceHand.map(d => d.rolledValue)
  });
  return result;
}

/**
 * Processes a dice scoring action
 */
export function processDiceScoring(
  diceHand: Die[],
  selectedIndices: number[], 
  scoringResult: { valid: boolean, points: number, combinations: ScoringCombination[] }
): { newHand: Die[], hotDice: boolean } {
  debugAction('scoring', 'Processing dice scoring', {
    originalDice: diceHand.length,
    scoredDice: selectedIndices.length,
    points: scoringResult.points
  });
  
  // Remove scored dice from diceHand
  const newHand = diceHand.filter((_, i) => !selectedIndices.includes(i));
  // Hot dice if all dice scored
  const hotDice = newHand.length === 0;
  
  return { newHand, hotDice };
}

/**
 * Processes a bank action
 */
export function processBankAction(
  roundPoints: number
): RoundActionResult {
  return {
    roundActive: false,
    newHand: [],
    hotDice: false,
    flop: false,
    banked: true,
    pointsScored: roundPoints,
    message: `You banked ${roundPoints} points!`
  };
}

/**
 * Rolls a single die and returns a new Die object with the rolled value set.
 */
export function rollSingleDie(die: Die): Die {
  const randomIndex = getRandomInt(0, die.allowedValues.length - 1);
  return {
    ...die,
    rolledValue: die.allowedValues[randomIndex],
    scored: false,
  };
}

/**
 * Processes a reroll action
 */
export function processRerollAction(
  diceHand: Die[],
  hotDice: boolean,
  fullDiceSet?: Die[]
): { newHand: Die[] } {
  // If hotDice, reroll the full dice set; otherwise, reroll the current hand
  const diceToReroll = hotDice && fullDiceSet ? fullDiceSet : diceHand;
  const newHand = diceToReroll.map(rollSingleDie);
  return { newHand };
}

/**
 * Processes a flop that has occurred and was not prevented
 * Increments consecutive flops counter, decrements lives, and calculates penalties
 */
export function processFlop(
  roundPoints: number,
  levelBankedPoints: number, 
  gameState: GameState
): RoundActionResult {
  // Increment consecutive flops counter
  const consecutiveFlopCount = incrementConsecutiveFlops(gameState);
  
  // Decrement lives on flop
  if (gameState.currentLevel.livesRemaining !== undefined) {
    gameState.currentLevel.livesRemaining--;
    debugLog(`[LIVES] Flop occurred. Lives remaining: ${gameState.currentLevel.livesRemaining}`);
  }
  
  const forfeitedPoints = roundPoints;
  const consecutiveFlopLimit = gameState.config?.penalties?.consecutiveFlopLimit ?? DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit;
  const consecutiveFlopPenalty = gameState.config?.penalties?.consecutiveFlopPenalty ?? DEFAULT_GAME_CONFIG.penalties.consecutiveFlopPenalty;

  // Apply penalty if consecutive flop limit reached 
  const penaltyApplied = consecutiveFlopCount >= consecutiveFlopLimit;
  const penaltyMessage = penaltyApplied 
    ? `You flopped! Round points forfeited: ${forfeitedPoints}. Penalty applied.` 
    : `You flopped! Round points forfeited: ${forfeitedPoints}.`;

  return {
    roundActive: false,
    newHand: [],
    hotDice: false,
    flop: true,
    banked: false,
    pointsScored: 0,
    message: penaltyApplied 
      ? `${penaltyMessage} Points banked: ${levelBankedPoints - consecutiveFlopPenalty}` 
      : penaltyMessage
  };
}

/**
 * Calculates dice to reroll for display purposes
 */
export function calculateDiceToReroll(selectedIndices: number[], diceLength: number): number {
  return selectedIndices.length === diceLength ? diceLength : diceLength - selectedIndices.length;
}

/**
 * Increments the consecutive flop counter
 */
export function incrementConsecutiveFlops(gameState: GameState): number {
  const oldValue = gameState.currentLevel.consecutiveFlops;
  gameState.currentLevel.consecutiveFlops = oldValue + 1;
  
  debugStateChangeWithContext(
    'incrementConsecutiveFlops',
    `Consecutive flops incremented: ${oldValue} → ${gameState.currentLevel.consecutiveFlops}`,
    gameState,
    {
      'currentLevel.consecutiveFlops': { old: oldValue, new: gameState.currentLevel.consecutiveFlops }
    }
  );
  
  return gameState.currentLevel.consecutiveFlops;
}

/**
 * Resets the consecutive flop counter to 0
 */
export function resetConsecutiveFlops(gameState: GameState): void {
  const oldValue = gameState.currentLevel.consecutiveFlops;
  gameState.currentLevel.consecutiveFlops = 0;
  
  if (oldValue !== 0) {
    debugStateChangeWithContext(
      'resetConsecutiveFlops',
      `Consecutive flops reset: ${oldValue} → 0`,
      gameState,
      {
        'currentLevel.consecutiveFlops': { old: oldValue, new: 0 }
      }
    );
  }
}

/**
 * Checks if the current level is completed (pointsBanked >= levelThreshold)
 */
export function isLevelCompleted(gameState: GameState): boolean {
  return gameState.currentLevel.pointsBanked >= gameState.currentLevel.levelThreshold;
}

/**
 * Applies level effects (boss effects, modifiers) to rerolls and lives
 * Returns modified values after applying all effects
 */
function applyLevelEffects(
  baseRerolls: number,
  baseLives: number,
  levelConfig: ReturnType<typeof getLevelConfig>
): { rerolls: number; lives: number } {
  let rerolls = baseRerolls;
  let lives = baseLives;

  // Apply effects from boss and level modifiers
  const effects = levelConfig.effects || [];
  if (levelConfig.boss?.effects) {
    effects.push(...levelConfig.boss.effects);
  }

  for (const effect of effects) {
    if (effect.livesModifier !== undefined) {
      lives += effect.livesModifier;
      debugLog(`[LEVEL EFFECT] Applied ${effect.name}: ${effect.livesModifier > 0 ? '+' : ''}${effect.livesModifier} lives`);
    }
    if (effect.rerollsModifier !== undefined) {
      rerolls += effect.rerollsModifier;
      debugLog(`[LEVEL EFFECT] Applied ${effect.name}: ${effect.rerollsModifier > 0 ? '+' : ''}${effect.rerollsModifier} rerolls`);
    }
  }

  // Ensure values don't go below 0
  rerolls = Math.max(0, rerolls);
  lives = Math.max(0, lives);

  return { rerolls, lives };
}

/**
 * Advances to the next level
 * Resets level-specific state (rerolls, lives, consecutiveFlops, pointsBanked)
 * Applies level effects (boss effects, modifiers)
 * Moves completed level to history
 */
export function advanceToNextLevel(gameState: GameState): void {
  const oldLevelNumber = gameState.currentLevel.levelNumber;
  const newLevelNumber = oldLevelNumber + 1;
  const levelConfig = getLevelConfig(newLevelNumber);
  
  // Move completed level to history
  const completedLevel: LevelState = {
    ...gameState.currentLevel,
    completed: true,
    roundHistory: gameState.currentLevel.currentRound 
      ? [gameState.currentLevel.currentRound] 
      : [],
  };
  gameState.history.levelHistory.push(completedLevel);
  
  // Calculate base rerolls and lives (from game state + charms/blessings)
  const baseRerolls = calculateRerollsForLevel(gameState);
  const baseLives = calculateLivesForLevel(gameState);
  
  // Apply level effects (boss effects, modifiers)
  const { rerolls, lives } = applyLevelEffects(baseRerolls, baseLives, levelConfig);
  
  // Create new level state
  const newLevel: LevelState = {
    levelNumber: newLevelNumber,
    levelThreshold: levelConfig.pointThreshold,
    rerollsRemaining: rerolls,
    livesRemaining: lives,
    consecutiveFlops: 0,
    pointsBanked: 0,
    shop: DEFAULT_SHOP_STATE,
    currentRound: undefined,
  };
  
  gameState.currentLevel = newLevel;
  
  debugActionWithContext(
    'gameFlow',
    `Level ${oldLevelNumber} completed, advancing to Level ${newLevelNumber}`,
    undefined,
    {
      oldLevel: oldLevelNumber,
      newLevel: newLevelNumber,
      newThreshold: levelConfig.pointThreshold,
      boss: levelConfig.boss?.name || null,
      rerollsRemaining: newLevel.rerollsRemaining,
      livesRemaining: newLevel.livesRemaining,
    }
  );
}

/**
 * Updates game state after a round
 */
export function updateGameStateAfterRound(
  gameState: GameState,
  roundState: any,
  roundActionResult: RoundActionResult
): { levelCompleted?: boolean; levelAdvanced?: boolean } {
  const changes: { [key: string]: { old: any; new: any } } = {};
  let levelCompleted = false;
  let levelAdvanced = false;
  
  if (roundActionResult.banked) {
    const oldPointsBanked = gameState.currentLevel.pointsBanked;
    const oldTotalScore = gameState.history.totalScore;
    const oldConsecutiveFlops = gameState.currentLevel.consecutiveFlops;
    
    gameState.currentLevel.pointsBanked += roundActionResult.pointsScored;
    gameState.history.totalScore += roundActionResult.pointsScored;
    
    debugLog(`[BANKING] Added ${roundActionResult.pointsScored} points. Level ${gameState.currentLevel.levelNumber}: Points banked: ${gameState.currentLevel.pointsBanked} / Threshold: ${gameState.currentLevel.levelThreshold}`);
    // Reset consecutive flops on bank
    resetConsecutiveFlops(gameState);
    
    changes['currentLevel.pointsBanked'] = { old: oldPointsBanked, new: gameState.currentLevel.pointsBanked };
    changes['history.totalScore'] = { old: oldTotalScore, new: gameState.history.totalScore };
    changes['currentLevel.consecutiveFlops'] = { old: oldConsecutiveFlops, new: 0 };
    
    debugStateChangeWithContext(
      'updateGameStateAfterRound',
      'Points banked, consecutive flops reset',
      gameState,
      changes
    );
    
    // Check for level completion after banking
    if (isLevelCompleted(gameState)) {
      levelCompleted = true;
      const completedLevelNumber = gameState.currentLevel.levelNumber;
      const pointsBanked = gameState.currentLevel.pointsBanked;
      const threshold = gameState.currentLevel.levelThreshold;
      
      debugLog(`[LEVEL COMPLETE] Level ${completedLevelNumber} completed! Points banked: ${pointsBanked} >= Threshold: ${threshold}`);
      
      // Check if player won the game (completed max level)
      if (completedLevelNumber >= MAX_LEVEL) {
        gameState.isActive = false;
        gameState.endReason = 'win';
        debugAction('gameFlow', `Level ${completedLevelNumber} completed! Game won!`);
      } else {
        advanceToNextLevel(gameState);
        levelAdvanced = true;
        debugAction('gameFlow', `Level ${completedLevelNumber} completed! Advanced to Level ${gameState.currentLevel.levelNumber}`);
      }
    } else {
      // Debug: Log why level isn't complete
      const pointsBanked = gameState.currentLevel.pointsBanked;
      const threshold = gameState.currentLevel.levelThreshold;
      debugLog(`[LEVEL CHECK] Level ${gameState.currentLevel.levelNumber}: Points banked: ${pointsBanked} < Threshold: ${threshold}`);
    }
  } else if (roundActionResult.flop) {
    // Set forfeitedPoints for display and Forfeit Recovery consumable
    roundState.forfeitedPoints = roundState.roundPoints;
        
    // Apply penalty to level's banked points if needed
    const consecutiveFlopLimit = gameState.config?.penalties?.consecutiveFlopLimit ?? DEFAULT_GAME_CONFIG.penalties.consecutiveFlopLimit;
    const consecutiveFlopPenalty = gameState.config?.penalties?.consecutiveFlopPenalty ?? DEFAULT_GAME_CONFIG.penalties.consecutiveFlopPenalty;
    const charmPreventingFlop = (gameState.charms || []).some((charm: any) => charm.flopPreventing);
    
    if (gameState.currentLevel.consecutiveFlops >= consecutiveFlopLimit && !charmPreventingFlop) {
      // Apply penalty to level's banked points
      const newPointsBanked = Math.max(0, gameState.currentLevel.pointsBanked - consecutiveFlopPenalty);
      changes['currentLevel.pointsBanked'] = { old: gameState.currentLevel.pointsBanked, new: newPointsBanked };
      gameState.currentLevel.pointsBanked = newPointsBanked;
    }
    
    debugStateChangeWithContext(
      'updateGameStateAfterRound',
      `Flop occurred (consecutive: ${gameState.currentLevel.consecutiveFlops})`,
      gameState,
      changes
    );
  }
  
  // TODO: Future - track total rolls across entire game/run in history
  // For now, roll count is tracked per round in roundState.rollHistory.length
  
  // Log state changes if we have any
  if (Object.keys(changes).length > 0 && !roundActionResult.banked && !roundActionResult.flop) {
    debugStateChangeWithContext(
      'updateGameStateAfterRound',
      'Game state updated',
      gameState,
      changes
    );
  }
  
  return { 
    levelCompleted: levelCompleted || false, 
    levelAdvanced: levelAdvanced || false 
  };
} 