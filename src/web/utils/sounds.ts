/**
 * Simple sound effect utility
 */

import { getSoundEffectsVolume } from './uiSettings';

const SOUND_BASE_PATH = '/assets/sounds';

// Store active sound effects so we can update their volume if needed
const activeSounds: Set<HTMLAudioElement> = new Set();

// Cache of preloaded audio buffers for instant playback
const soundCache: Map<string, HTMLAudioElement> = new Map();
let isPreloading = false;
let preloadPromise: Promise<void> | null = null;

// List of all sound files to preload with their folder paths
const SOUND_FILES = [
  // UI sounds
  'ui/roll1.mov',
  'ui/roll2.mp3',
  'ui/roll3.mp3',
  'ui/level-complete.wav',
  'ui/new-level.mp3',
  'ui/purchase.mp3',
  'ui/coin1.mp3',
  'ui/coin2.mp3',
  'ui/coin3.mp3',
  'ui/material.wav',
  'ui/click.wav',
  'ui/sell.mp3',
  'ui/general-score.wav',
  'ui/flop.wav',
  'ui/score.wav',
  'ui/bell.wav',
  'ui/hot-dice.wav',
  'ui/world-map.wav',
  'ui/new-die.wav',
  'ui/shop-refresh.wav',
  'ui/drumroll.wav',
  'ui/success.wav',
  'ui/game-over.wav',
  // Material sounds
  'materials/crystal.wav',
  'materials/mirror.wav',
  'materials/golden.wav',
  'materials/flower.wav',
  'materials/lead.wav',
  'materials/ghost.wav',
  'materials/rainbow.wav',
  'materials/volcano.wav'
];

/**
 * Preload all sound effects for instant playback
 * This should be called once when the app initializes
 */
export function preloadSounds(): Promise<void> {
  // Return existing promise if already preloading
  if (preloadPromise) {
    return preloadPromise;
  }

  if (isPreloading) {
    return Promise.resolve();
  }

  isPreloading = true;
  preloadPromise = Promise.all(
    SOUND_FILES.map(filename => {
      return new Promise<void>((resolve) => {
        const fullPath = `${SOUND_BASE_PATH}/${filename}`;
        const audio = new Audio(fullPath);
        
        // Preload the audio
        audio.preload = 'auto';
        audio.volume = 0; // Set volume to 0 so it's silent
        
        // Wait for the audio to be ready
        const handleCanPlay = () => {
          audio.removeEventListener('canplaythrough', handleCanPlay);
          audio.removeEventListener('error', handleError);
          audio.removeEventListener('loadeddata', handleCanPlay);
          
          // Force the browser to actually load the audio by playing and immediately pausing
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                audio.pause();
                audio.currentTime = 0;
                soundCache.set(filename, audio);
                resolve();
              })
              .catch(() => {
                // If play fails (autoplay blocked), still cache it - it might work later
                soundCache.set(filename, audio);
                resolve();
              });
          } else {
            soundCache.set(filename, audio);
            resolve();
          }
        };
        
        const handleError = () => {
          audio.removeEventListener('canplaythrough', handleCanPlay);
          audio.removeEventListener('error', handleError);
          audio.removeEventListener('loadeddata', handleCanPlay);
          // Still cache it even if there's an error - it might work later
          soundCache.set(filename, audio);
          resolve();
        };
        
        audio.addEventListener('canplaythrough', handleCanPlay);
        audio.addEventListener('loadeddata', handleCanPlay); // Also listen for loadeddata as fallback
        audio.addEventListener('error', handleError);
        
        // Try to load it
        audio.load();
        
        // Timeout after 5 seconds to prevent hanging
        setTimeout(() => {
          audio.removeEventListener('canplaythrough', handleCanPlay);
          audio.removeEventListener('error', handleError);
          audio.removeEventListener('loadeddata', handleCanPlay);
          if (!soundCache.has(filename)) {
            soundCache.set(filename, audio);
          }
          resolve();
        }, 5000);
      });
    })
  ).then(() => {
    isPreloading = false;
  });

  return preloadPromise;
}

/**
 * Play a dice roll sound based on the number of dice
 */
export function playDiceRollSound(numDice: number): void {
  let soundFile: string;
  
  if (numDice <= 2) {
    soundFile = 'ui/roll1.mov';
  } else if (numDice <= 3) {
    soundFile = 'ui/roll2.mp3';
  } else {
    soundFile = 'ui/roll3.mp3';
  }
  
  playSound(soundFile);
}

/**
 * Play the level complete sound
 */
export function playLevelCompleteSound(): void {
  playSound('ui/level-complete.wav');
}

/**
 * Play the new level sound
 */
export function playNewLevelSound(): void {
  playSound('ui/new-level.mp3');
}

/**
 * Play purchase sound
 */
export function playPurchaseSound(): void {
  playSound('ui/purchase.mp3');
}

/**
 * Play sell sound
 */
export function playSellSound(): void {
  const coinSounds = ['ui/coin1.mp3', 'ui/coin2.mp3', 'ui/coin3.mp3'];
  const randomSound = coinSounds[Math.floor(Math.random() * coinSounds.length)];
  playSound(randomSound);
}

/**
 * Play material change sound (generic fallback)
 */
export function playGenericMaterialSound(): void {
  playSound('ui/material.wav');
}

/**
 * Play click sound for buttons/menus
 */
export function playClickSound(): void {
  playSound('ui/click.wav');
}

/**
 * Play sell/money sound
 */
export function playSellMoneySound(): void {
  playSound('ui/sell.mp3');
}

/**
 * Play crystal die sound
 */
export function playCrystalSound(): void {
  playSound('materials/crystal.wav');
}

/**
 * Play mirror die sound
 */
export function playMirrorSound(): void {
  playSound('materials/mirror.wav');
}

/**
 * Play general score/charm activation sound
 */
export function playGeneralScoreSound(): void {
  playSound('ui/general-score.wav');
}

/**
 * Play flop sound
 */
export function playFlopSound(): void {
  playSound('ui/flop.wav');
}

/**
 * Play score sound (for Roll, Reroll, Select, Skip reroll, Deselect buttons)
 */
export function playScoreSound(): void {
  playSound('ui/score.wav');
}

/**
 * Play bell sound (for Bank button)
 */
export function playBellSound(): void {
  playSound('ui/bell.wav');
}

/**
 * Play hot dice sound
 */
export function playHotDiceSound(): void {
  playSound('ui/hot-dice.wav');
}

/**
 * Play world map sound
 */
export function playWorldMapSound(): void {
  playSound('ui/world-map.wav');
}

/**
 * Play golden material sound
 */
export function playGoldenSound(): void {
  playSound('materials/golden.wav');
}

/**
 * Play flower material sound
 */
export function playFlowerSound(): void {
  playSound('materials/flower.wav');
}

/**
 * Play lead material sound
 */
export function playLeadSound(): void {
  playSound('materials/lead.wav');
}

/**
 * Play ghost material sound
 */
export function playGhostSound(): void {
  playSound('materials/ghost.wav');
}

/**
 * Play rainbow material sound
 */
export function playRainbowSound(): void {
  playSound('materials/rainbow.wav');
}

/**
 * Play volcano material sound
 */
export function playVolcanoSound(): void {
  playSound('materials/volcano.wav');
}

/**
 * Play new die sound (when a die is added to the set)
 */
export function playNewDieSound(): void {
  playSound('ui/new-die.wav');
}

/**
 * Play shop refresh sound
 */
export function playShopRefreshSound(): void {
  playSound('ui/shop-refresh.wav');
}

/**
 * Play drumroll sound (for win sequence)
 */
export function playDrumrollSound(): void {
  playSound('ui/drumroll.wav');
}

/**
 * Play success sound (for win sequence)
 */
export function playSuccessSound(): void {
  playSound('ui/success.wav');
}

/**
 * Play game over sound
 */
export function playGameOverSound(): void {
  playSound('ui/game-over.wav');
}

/**
 * Play material-specific sound based on material type
 */
export function playMaterialSound(material: string): void {
  switch (material) {
    case 'crystal':
      playCrystalSound();
      break;
    case 'mirror':
      playMirrorSound();
      break;
    case 'golden':
      playGoldenSound();
      break;
    case 'flower':
      playFlowerSound();
      break;
    case 'lead':
      playLeadSound();
      break;
    case 'ghost':
      playGhostSound();
      break;
    case 'rainbow':
      playRainbowSound();
      break;
    case 'volcano':
      playVolcanoSound();
      break;
    default:
      playGenericMaterialSound(); // Fallback to generic material sound
      break;
  }
}

/**
 * Update volume for all active sound effects
 * Note: This is mainly for consistency with music API. Most sound effects are short-lived.
 */
export function updateSoundEffectsVolume(): void {
  const volume = getSoundEffectsVolume();
  activeSounds.forEach(audio => {
    if (!audio.paused) {
      audio.volume = volume;
    }
  });
  // Clean up finished sounds
  activeSounds.forEach(audio => {
    if (audio.ended) {
      activeSounds.delete(audio);
    }
  });
}

/**
 * Play a sound file
 * Uses preloaded audio if available, otherwise creates a new one
 */
function playSound(filename: string): void {
  const volume = getSoundEffectsVolume();
  
  try {
    let audio: HTMLAudioElement;
    
    // Try to use preloaded audio from cache
    const cachedAudio = soundCache.get(filename);
    if (cachedAudio) {
      // Clone the audio element so we can play it multiple times simultaneously
      audio = cachedAudio.cloneNode() as HTMLAudioElement;
      // Reset to beginning
      audio.currentTime = 0;
    } else {
      // Fallback: create new audio if not preloaded
      const fullPath = `${SOUND_BASE_PATH}/${filename}`;
      audio = new Audio(fullPath);
    }
    
    audio.volume = volume;
    
    // Track active sounds
    activeSounds.add(audio);
    
    // Clean up when sound ends
    audio.addEventListener('ended', () => {
      activeSounds.delete(audio);
    });
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Silently fail if audio can't play
        activeSounds.delete(audio);
      });
    }
  } catch (error) {
    // Silently fail if audio can't be created
  }
}

