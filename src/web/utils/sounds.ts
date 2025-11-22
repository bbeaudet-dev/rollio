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
  
  console.log(`[SOUND] Attempting to play dice roll sound: ${soundFile} (${numDice} dice)`);
  playSound(soundFile);
}

/**
 * Play the level complete sound
 */
export function playLevelCompleteSound(): void {
  console.log('[SOUND] Attempting to play level complete sound: level-complete.wav');
  playSound('level-complete.wav');
}

/**
 * Play a sound file
 */
function playSound(filename: string): void {
  const fullPath = `${SOUND_BASE_PATH}/${filename}`;
  const absoluteUrl = new URL(fullPath, window.location.origin).href;
  console.log(`[SOUND] Creating audio object for: ${fullPath}`);
  console.log(`[SOUND] Absolute URL: ${absoluteUrl}`);
  
  try {
    const audio = new Audio(fullPath);
    audio.volume = 0.5; // Set volume to 50%
    
    // Log audio element properties
    console.log(`[SOUND] Audio element created:`, {
      src: audio.src,
      currentSrc: audio.currentSrc,
      networkState: audio.networkState,
      readyState: audio.readyState
    });
    
    // Add event listeners for debugging
    audio.addEventListener('loadstart', () => {
      console.log(`[SOUND] Load started for: ${filename}`);
    });
    
    audio.addEventListener('canplay', () => {
      console.log(`[SOUND] Can play: ${filename}`);
    });
    
    audio.addEventListener('canplaythrough', () => {
      console.log(`[SOUND] Can play through: ${filename}`);
    });
    
    audio.addEventListener('error', (e) => {
      console.error(`[SOUND] Error loading/playing ${filename}:`, e);
      console.error(`[SOUND] Audio error details:`, {
        error: audio.error,
        code: audio.error?.code,
        message: audio.error?.message,
        networkState: audio.networkState,
        readyState: audio.readyState,
        src: audio.src,
        currentSrc: audio.currentSrc
      });
      
      // Network state codes: 0=EMPTY, 1=IDLE, 2=LOADING, 3=NO_SOURCE
      const networkStateNames = ['EMPTY', 'IDLE', 'LOADING', 'NO_SOURCE'];
      console.error(`[SOUND] Network state: ${networkStateNames[audio.networkState]} (${audio.networkState})`);
      
      // Ready state codes: 0=HAVE_NOTHING, 1=HAVE_METADATA, 2=HAVE_CURRENT_DATA, 3=HAVE_FUTURE_DATA, 4=HAVE_ENOUGH_DATA
      const readyStateNames = ['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA'];
      console.error(`[SOUND] Ready state: ${readyStateNames[audio.readyState]} (${audio.readyState})`);
      
      // Try to fetch the file to see if it exists
      fetch(fullPath, { method: 'HEAD' })
        .then(response => {
          const headers: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });
          console.log(`[SOUND] File fetch check for ${filename}:`, {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: headers
          });
        })
        .catch(fetchError => {
          console.error(`[SOUND] File fetch failed for ${filename}:`, fetchError);
        });
    });
    
    audio.addEventListener('play', () => {
      console.log(`[SOUND] Playing: ${filename}`);
    });
    
    audio.addEventListener('ended', () => {
      console.log(`[SOUND] Finished playing: ${filename}`);
    });
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log(`[SOUND] Successfully started playing: ${filename}`);
        })
        .catch((error) => {
          console.error(`[SOUND] Could not play sound ${filename}:`, error);
          console.error(`[SOUND] Error details:`, {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
        });
    }
  } catch (error) {
    console.error(`[SOUND] Could not create audio for ${filename}:`, error);
    console.error(`[SOUND] Error details:`, {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack
    });
  }
}

