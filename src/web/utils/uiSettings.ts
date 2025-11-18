const UI_SETTINGS_KEY = 'rollio_ui_settings';

export interface UISettings {
  animationSpeed: number; // Delay between steps in seconds (0.1 to 2.0)
}

const DEFAULT_SETTINGS: UISettings = {
  animationSpeed: 0.5, // Default 0.5 seconds
};

export function getUISettings(): UISettings {
  try {
    const stored = localStorage.getItem(UI_SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate and merge with defaults
      return {
        animationSpeed: Math.max(0.1, Math.min(2.0, parsed.animationSpeed ?? DEFAULT_SETTINGS.animationSpeed)),
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

