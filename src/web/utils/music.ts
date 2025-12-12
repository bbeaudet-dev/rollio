/**
 * Background music utility
 */

import { getMusicVolume } from './uiSettings';

const MUSIC_BASE_PATH = '/assets/music';

let currentMusic: HTMLAudioElement | null = null;
let isMusicEnabled: boolean = true;

/**
 * Initialize background music system
 */
export function initMusic(): void {
  // Music will be started when needed
}

/**
 * Play background music (looping)
 */
export function playBackgroundMusic(trackName: string): void {
  stopBackgroundMusic();
  
  if (!isMusicEnabled) {
    return;
  }
  
  const fullPath = `${MUSIC_BASE_PATH}/${trackName}`;
  
  try {
    const audio = new Audio(fullPath);
    audio.loop = true;
    audio.volume = getMusicVolume();
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          currentMusic = audio;
        })
        .catch(() => {
          // Silently fail if audio can't play
        });
    } else {
      currentMusic = audio;
    }
  } catch (error) {
    // Silently fail if audio can't be created
  }
}

/**
 * Stop background music
 */
export function stopBackgroundMusic(): void {
  if (currentMusic) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
    currentMusic = null;
  }
}

/**
 * Update music volume (for when settings change)
 */
export function updateMusicVolume(): void {
  if (currentMusic) {
    currentMusic.volume = getMusicVolume();
  }
}

/**
 * Enable/disable music
 */
export function setMusicEnabled(enabled: boolean): void {
  isMusicEnabled = enabled;
  if (!enabled) {
    stopBackgroundMusic();
  }
}

/**
 * Check if music is enabled
 */
export function isMusicPlaying(): boolean {
  return currentMusic !== null && !currentMusic.paused;
}

