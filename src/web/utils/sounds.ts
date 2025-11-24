/**
 * Simple sound effect utility
 */

const SOUND_BASE_PATH = '/assets/sounds';

/**
 * Play a dice roll sound based on the number of dice
 */
export function playDiceRollSound(numDice: number): void {
  let soundFile: string;
  
  if (numDice <= 2) {
    soundFile = 'roll1.mov';
  } else if (numDice <= 3) {
    soundFile = 'roll2.mp3';
  } else {
    soundFile = 'roll3.mp3';
  }
  
  playSound(soundFile);
}

/**
 * Play the level complete sound
 */
export function playLevelCompleteSound(): void {
  playSound('level-complete.wav');
}

/**
 * Play a sound file
 */
function playSound(filename: string): void {
  const fullPath = `${SOUND_BASE_PATH}/${filename}`;
  
  try {
    const audio = new Audio(fullPath);
    audio.volume = 0.5; // Set volume to 50%
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Silently fail if audio can't play
      });
    }
  } catch (error) {
    // Silently fail if audio can't be created
  }
}

