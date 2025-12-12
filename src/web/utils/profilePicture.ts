/**
 * Utility functions for profile picture handling
 */

/**
 * Get the image path for a profile picture ID
 * Handles category-prefixed IDs (e.g., "charms-angel-investor") and legacy format
 */
export function getProfilePicturePath(profilePictureId: string): string {
  if (!profilePictureId || profilePictureId === 'default') {
    return ''; // No image path for default
  }

  // Handle category-prefixed IDs (e.g., "charms-angel-investor", "consumables-freebie")
  if (profilePictureId.includes('-')) {
    const parts = profilePictureId.split('-');
    const category = parts[0]; // e.g., "charms", "consumables", "blessings"
    const idWithoutCategory = parts.slice(1).join('-'); // e.g., "angel-investor"
    
    // Convert back to underscore format for filename
    // The server stores IDs as lowercase with dashes, but filenames use underscores
    const filenameBase = idWithoutCategory.replace(/-/g, '_');
    
    // Try .png first (most common), then .jpeg, then .jpg
    return `/assets/images/${category}/${filenameBase}.png`;
  }
  
  // Legacy format - assume charms directory with .jpeg extension
  return `/assets/images/charms/${profilePictureId.replace(/-/g, '_')}.jpeg`;
}

/**
 * Try alternative image extensions if the primary one fails
 */
export function tryAlternativeExtensions(imagePath: string): string[] {
  const alternatives: string[] = [];
  
  if (imagePath.endsWith('.png')) {
    alternatives.push(imagePath.replace('.png', '.jpeg'));
    alternatives.push(imagePath.replace('.png', '.jpg'));
  } else if (imagePath.endsWith('.jpeg')) {
    alternatives.push(imagePath.replace('.jpeg', '.png'));
    alternatives.push(imagePath.replace('.jpeg', '.jpg'));
  } else if (imagePath.endsWith('.jpg')) {
    alternatives.push(imagePath.replace('.jpg', '.png'));
    alternatives.push(imagePath.replace('.jpg', '.jpeg'));
  }
  
  return alternatives;
}

