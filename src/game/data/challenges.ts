/**
 * Challenge configurations and definitions
 * Challenges are special game modes with unique constraints/abilities
 * Similar to Balatro's challenge system
 */

export interface ChallengeConstraint {
  type: 'charmSlots' | 'moneyLimit' | 'scoringCombinations' | 'lives' | 'rerolls' | 'diceSet' | 'custom';
  value?: any; // Value depends on constraint type
  description: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  constraints: ChallengeConstraint[];
  startingCharms?: string[]; // Charm IDs to start with
  startingConsumables?: string[]; // Consumable IDs to start with
  startingBlessings?: string[]; // Blessing IDs to start with
  unlockCondition?: string; // How to unlock this challenge
  difficulty?: 'easy' | 'medium' | 'hard' | 'extreme';
}

/**
 * Challenge pool - all available challenges
 */
export const CHALLENGES: Challenge[] = [
  {
    id: 'jokerless',
    name: 'Jokerless',
    description: 'No charms allowed',
    constraints: [
      {
        type: 'charmSlots',
        value: 0,
        description: 'Charm slots set to 0',
      },
    ],
    difficulty: 'hard',
  },
  {
    id: 'moneyLimit',
    name: 'Money Limit',
    description: 'Money earned cannot exceed number of dice',
    constraints: [
      {
        type: 'moneyLimit',
        value: true,
        description: 'Money earned cannot exceed number of dice in set',
      },
    ],
    difficulty: 'medium',
  },
  // Additional challenges will be added here
];

/**
 * Get a challenge by ID
 */
export function getChallengeById(id: string): Challenge | undefined {
  return CHALLENGES.find(challenge => challenge.id === id);
}

/**
 * Get all unlocked challenges (for now, returns all challenges)
 * TODO: Implement unlock system
 */
export function getUnlockedChallenges(): Challenge[] {
  return CHALLENGES.filter(challenge => {
    // TODO: Check unlock condition
    return true;
  });
}

