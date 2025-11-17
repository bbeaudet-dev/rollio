/**
 * Shared utility functions for charms
 */

/**
 * Check if single 3s should be allowed as valid combinations
 * This is used by the combination finding logic for LowHangingFruit charm
 */
export function shouldAllowSingleThrees(charmManager?: any, charms?: any[]): boolean {
  if (charmManager) {
    const activeCharms = charmManager.getActiveCharms?.() || [];
    return activeCharms.some((c: any) => c.id === 'lowHangingFruit');
  }
  if (charms) {
    return charms.some((c: any) => c.id === 'lowHangingFruit' && c.active);
  }
  return false;
}

