import { Die } from '../../game/types';
import { MATERIALS } from '../../game/data/materials';

/**
 * Simple dice animation using normal terminal output
 * This won't interfere with the CLI interface
 */
export class SimpleDiceAnimation {
  private animationInterval?: NodeJS.Timeout;
  private isAnimating = false;
  private resolveAnimation?: () => void;

  // ASCII art dice faces - wider and more square-like
  private readonly diceFaces = [
    ['┌───────┐', '│       │', '│   ●   │', '│       │', '└───────┘'], // 1
    ['┌───────┐', '│ ●     │', '│       │', '│     ● │', '└───────┘'], // 2
    ['┌───────┐', '│ ●     │', '│   ●   │', '│     ● │', '└───────┘'], // 3
    ['┌───────┐', '│ ●   ● │', '│       │', '│ ●   ● │', '└───────┘'], // 4
    ['┌───────┐', '│ ●   ● │', '│   ●   │', '│ ●   ● │', '└───────┘'], // 5
    ['┌───────┐', '│ ●   ● │', '│ ●   ● │', '│ ●   ● │', '└───────┘']  // 6
  ];

  // ANSI color codes for terminal
  private readonly colors = {
    white: '\x1b[37m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    brightYellow: '\x1b[93m',
    brightRed: '\x1b[91m',
    brightMagenta: '\x1b[95m',
    orange: '\x1b[38;5;208m',
    brown: '\x1b[38;5;130m',
    purple: '\x1b[38;5;99m',
    gold: '\x1b[38;5;220m',
    orangeRed: '\x1b[38;2;255;69;0m',
    fireRed: '\x1b[38;2;255;0;0m',
    royalBlue: '\x1b[38;2;65;105;225m',
    limeGreen: '\x1b[38;2;50;205;50m',
    hotPink: '\x1b[38;2;255;105;180m',
    deepPurple: '\x1b[38;2;75;0;130m',
    reset: '\x1b[0m'
  };

  /**
   * Animate dice roll with actual game dice
   * dice should have the final rolled values already set
   * animatedIndices: optional array of dice indices to animate (if not provided, all dice animate)
   * Returns a promise that resolves when animation completes
   */
  public async animateDiceRoll(dice: Die[], rollNumber?: number, animatedIndices?: number[]): Promise<void> {
    if (this.isAnimating) {
      return Promise.resolve();
    }
    
    // If animatedIndices not provided, animate all dice
    const indicesToAnimate = animatedIndices ?? dice.map((_, i) => i);

    return new Promise<void>((resolve) => {
      this.resolveAnimation = resolve;
      this.isAnimating = true;
      let frame = 0;
      const totalFrames = 14; // reduced from 21 frames for faster animation

      // Clear previous animation lines and move cursor up
      this.clearAnimationLines();

      this.animationInterval = setInterval(() => {
        frame++;
        
        // Use random values during animation for selected dice, but final frame uses actual values
        // For non-animated dice, always show their actual rolledValue
        const isFinalFrame = frame >= totalFrames - 1;
        const animatedDice = dice.map((die, index) => ({
          ...die,
          rolledValue: (indicesToAnimate.includes(index) && !isFinalFrame)
            ? Math.floor(Math.random() * die.sides) + 1 as any  // Animate selected dice
            : die.rolledValue  // Show actual value for non-animated dice or final frame
        }));
        
        // Create animated display (without Roll #)
        let content = '';
        
        for (let row = 0; row < 5; row++) {
          animatedDice.forEach(die => {
            const dieRow = this.diceFaces[die.rolledValue! - 1][row];
            const material = MATERIALS.find(m => m.id === die.material);
            const borderColor = this.getBorderColor(material);
            const pipColor = this.getPipColor(die, material, row, frame);
            
            // Render die with colored border and black pips (except rainbow)
            const renderedDie = this.renderDieWithColors(dieRow, borderColor, pipColor);
            content += `${renderedDie} `;
          });
          content += '\n';
        }
        


        // Clear and redraw the dice area
        process.stdout.write('\x1b[5A'); // Move cursor up 5 lines (5 dice rows only)
        process.stdout.write('\x1b[0J'); // Clear from cursor to end of screen
        process.stdout.write(content);

        // End animation
        if (frame >= totalFrames) {
          this.isAnimating = false;
          if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = undefined;
          }
          
          // Animation complete - resolve (dice are already displayed with blank line)
          if (this.resolveAnimation) {
            this.resolveAnimation();
          }
        }
      }, 58); // Decreased frequency by 15% from 50ms to 58ms (slower updates)
    });
  }

  private showFinalResult(dice: Die[], rollNumber?: number): void {
    setTimeout(() => {
      // Animation is complete, dice are already shown
    }, 100);
  }

  private clearAnimationLines(): void {
    // Clear just enough lines to make room for 5 dice rows
    process.stdout.write('\n\n\n\n\n');
  }



  /**
   * Clean up all animations
   */
  public cleanup(): void {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = undefined;
    }
  }

  /**
   * Get border color for a material
   */
  private getBorderColor(material: any): string {
    if (!material) return 'white';
    
    // Map material colors to our color names
    switch (material.color) {
      case 'purple':
        return 'purple';
      case 'gold':
        return 'gold';
      case 'orangeRed':
        return 'orangeRed';
      case 'fireRed':
        return 'fireRed';
      case 'royalBlue':
        return 'royalBlue';
      case 'yellow':
        return 'yellow';
      case 'rainbow':
        return 'rainbow'; // Rainbow uses pip colors, border also uses rainbow
      case 'deepPurple':
        return 'deepPurple';
      case 'white':
      default:
        return 'white';
    }
  }

  /**
   * Get pip color for a die (black for most materials, colored for rainbow and golden)
   */
  private getPipColor(die: Die, material: any, row: number, frame?: number): string {
    if (material?.color === 'rainbow') {
      // Shifting rainbow colors for rainbow die - colors cycle through rows each frame
      const rainbowColors = ['fireRed', 'yellow', 'limeGreen', 'royalBlue', 'deepPurple', 'purple', 'hotPink'];
      
      if (frame !== undefined) {
        // Calculate shifting colors: each frame, colors shift down one row
        // Frame 0: row 0=fireRed, row 1=yellow, row 2=limeGreen, etc.
        // Frame 1: row 0=yellow, row 1=limeGreen, row 2=royalBlue, etc.
        // Frame 2: row 0=limeGreen, row 1=royalBlue, row 2=deepPurple, etc.
        const shiftedIndex = (row + frame) % rainbowColors.length;
        return rainbowColors[shiftedIndex];
      } else {
        // Fallback for non-animation calls (static display)
        return rainbowColors[row % rainbowColors.length];
      }
    }
    
    if (material?.color === 'yellow') { // Golden dice
      // Shifting golden colors for golden die - colors cycle through rows each frame
      const goldenColors = ['gold', 'brightYellow', 'yellow'];
      
      if (frame !== undefined) {
        // Calculate shifting colors: each frame, colors shift down one row
        const shiftedIndex = (row + frame) % goldenColors.length;
        return goldenColors[shiftedIndex];
      } else {
        // Fallback for non-animation calls (static display)
        return goldenColors[row % goldenColors.length];
      }
    }
    
    // For all other materials, pips are black
    return 'white'; // White color shows as black pips in terminal
  }

  /**
   * Render a die face with colored border and pips
   */
  private renderDieWithColors(dieRow: string, borderColor: string, pipColor: string): string {
    // Handle rainbow border color (use the same rainbow colors as pips)
    let borderColorCode: string;
    if (borderColor === 'rainbow') {
      // Use the same rainbow color as pips for border (shifting together)
      borderColorCode = this.colors[pipColor as keyof typeof this.colors] || this.colors.white;
    } else {
      borderColorCode = this.colors[borderColor as keyof typeof this.colors] || this.colors.white;
    }
    const pipColorCode = this.colors[pipColor as keyof typeof this.colors] || this.colors.white;
    
    // Split the die row into border and pip parts
    // Border parts: ┌───────┐, │, └───────┘
    // Pip parts: ●
    let result = '';
    let inPip = false;
    
    for (let i = 0; i < dieRow.length; i++) {
      const char = dieRow[i];
      if (char === '●') {
        if (!inPip) {
          result += pipColorCode;
          inPip = true;
        }
      } else {
        if (inPip) {
          result += this.colors.reset + borderColorCode;
          inPip = false;
        } else if (i === 0) {
          result += borderColorCode;
        }
      }
      result += char;
    }
    
    result += this.colors.reset;
    return result;
  }

  /**
   * Get material color for a die
   */
  public static getDieColor(die: Die): string {
    const material = MATERIALS.find(m => m.id === die.material);
    if (material?.color === 'rainbow') {
      return 'red'; // Default to red for rainbow
    }
    return material?.color || 'white';
  }

  /**
   * Get material abbreviation for a die
   */
  public static getDieAbbreviation(die: Die): string {
    const material = MATERIALS.find(m => m.id === die.material);
    return material?.abbreviation || '--';
  }
} 