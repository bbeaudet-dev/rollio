/**
 * Background music utility
 */

import { getMusicVolume, getMusicEnabled } from './uiSettings';

const MUSIC_BASE_PATH = '/assets/sounds/music';

let currentMusic: HTMLAudioElement | null = null;
let currentTrack: string | null = null;

/**
 * Initialize background music system
 */
export function initMusic(): void {
  // Music will be started when needed
}

/**
 * Play background music (looping)
 * Only changes music if the track is different from what's currently playing
 */
export function playBackgroundMusic(trackName: string): void {
  // If the same track is already playing, don't restart it
  if (currentTrack === trackName && currentMusic && !currentMusic.paused) {
    return;
  }
  
  stopBackgroundMusic();
  
  if (!getMusicEnabled()) {
    return;
  }
  
  currentTrack = trackName;
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
          currentTrack = null;
        });
    } else {
      currentMusic = audio;
    }
  } catch (error) {
    // Silently fail if audio can't be created
    currentTrack = null;
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
  currentTrack = null;
}

/**
 * Update music volume (for when settings change)
 */
export function updateMusicVolume(): void {
  // If music is disabled, stop it
  if (!getMusicEnabled()) {
    stopBackgroundMusic();
    return;
  }
  
  if (currentMusic) {
    currentMusic.volume = getMusicVolume();
  }
}

/**
 * Check and update music state based on enabled setting
 * Call this when the enabled setting changes
 */
export function updateMusicEnabled(): void {
  if (!getMusicEnabled()) {
    stopBackgroundMusic();
  } else if (currentTrack && !currentMusic) {
    // If music was re-enabled and we have a track, restart it
    playBackgroundMusic(currentTrack);
  }
}

/**
 * Check if music is currently playing
 */
export function getCurrentTrack(): string | null {
  return currentTrack;
}

/**
 * Check if music is enabled
 */
export function isMusicPlaying(): boolean {
  return currentMusic !== null && !currentMusic.paused;
}

