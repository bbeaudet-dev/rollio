import { Die, GameState } from '../../game/types';

// Just extend existing types where needed for UI-specific props
export interface DiceDisplayProps {
  dice: Die[];
  selectedIndices: number[];
  onDiceSelect: (index: number) => void;
  disabled?: boolean;
}

export interface GameControlsProps {
  onRoll: () => void;
  onBank: () => void;
  onReroll: () => void;
  canRoll: boolean;
  canBank: boolean;
  canReroll: boolean;
  diceToReroll: number;
} 