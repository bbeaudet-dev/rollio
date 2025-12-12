const UI_SETTINGS_KEY = 'rollio_ui_settings';

export interface UISettings {
  animationSpeed: number; // Delay between steps in seconds (0.1 to 2.0)
  soundEffectsVolume: number; // Sound effects volume (0.0 to 1.0)
  musicVolume: number; // Background music volume (0.0 to 1.0)
}

const DEFAULT_SETTINGS: UISettings = {
  animationSpeed: 0.5, // Default 0.5 seconds
  soundEffectsVolume: 0.5, // Default 50% 
  musicVolume: 0.5, // Default 50%
};

export function getUISettings(): UISettings {
  try {
    const stored = localStorage.getItem(UI_SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate and merge with defaults
      return {
        animationSpeed: Math.max(0.1, Math.min(2.0, parsed.animationSpeed ?? DEFAULT_SETTINGS.animationSpeed)),
        soundEffectsVolume: Math.max(0.0, Math.min(1.0, parsed.soundEffectsVolume ?? DEFAULT_SETTINGS.soundEffectsVolume)),
        musicVolume: Math.max(0.0, Math.min(1.0, parsed.musicVolume ?? DEFAULT_SETTINGS.musicVolume)),
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

