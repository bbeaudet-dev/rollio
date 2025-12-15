const UI_SETTINGS_KEY = 'rollio_ui_settings';

export interface UISettings {
  animationSpeed: number; // Delay between steps in seconds (0.1 to 2.0)
  soundEffectsVolume: number; // Sound effects volume (0.0 to 1.0)
  musicVolume: number; // Background music volume (0.0 to 1.0)
  soundEffectsEnabled: boolean; // Whether sound effects are enabled
  musicEnabled: boolean; // Whether music is enabled
}

const DEFAULT_SETTINGS: UISettings = {
  animationSpeed: 1.0, // Default 1.0 seconds (Normal)
  soundEffectsVolume: 0.5, // Default 50% 
  musicVolume: 0.5, // Default 50%
  soundEffectsEnabled: true, // Default enabled
  musicEnabled: true, // Default enabled
};

export function getUISettings(): UISettings {
  try {
    const stored = localStorage.getItem(UI_SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate and merge with defaults
      // Validate animation speed - round to nearest valid option
      const validSpeeds = [2.0, 1.5, 1.0, 0.5, 0.2, 0.1];
      const requestedSpeed = parsed.animationSpeed ?? DEFAULT_SETTINGS.animationSpeed;
      const closestSpeed = validSpeeds.reduce((prev, curr) => 
        Math.abs(curr - requestedSpeed) < Math.abs(prev - requestedSpeed) ? curr : prev
      );
      
      return {
        animationSpeed: closestSpeed,
        soundEffectsVolume: Math.max(0.0, Math.min(1.0, parsed.soundEffectsVolume ?? DEFAULT_SETTINGS.soundEffectsVolume)),
        musicVolume: Math.max(0.0, Math.min(1.0, parsed.musicVolume ?? DEFAULT_SETTINGS.musicVolume)),
        soundEffectsEnabled: parsed.soundEffectsEnabled !== undefined ? parsed.soundEffectsEnabled : DEFAULT_SETTINGS.soundEffectsEnabled,
        musicEnabled: parsed.musicEnabled !== undefined ? parsed.musicEnabled : DEFAULT_SETTINGS.musicEnabled,
      };
    }
  } catch (error) {
    console.warn('Failed to load UI settings:', error);
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveUISettings(settings: Partial<UISettings>): void {
  try {
    const current = getUISettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save UI settings:', error);
  }
}

export function getAnimationSpeed(): number {
  return getUISettings().animationSpeed;
}

export function getSoundEffectsVolume(): number {
  return getUISettings().soundEffectsVolume;
}

export function getMusicVolume(): number {
  return getUISettings().musicVolume;
}

export function getSoundEffectsEnabled(): boolean {
  return getUISettings().soundEffectsEnabled;
}

export function getMusicEnabled(): boolean {
  return getUISettings().musicEnabled;
}

