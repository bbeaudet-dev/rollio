import React from 'react';
import { getProfilePicturePath, tryAlternativeExtensions } from '../../utils/profilePicture';

interface ProfilePictureProps {
  profilePictureId: string | null | undefined;
  size?: number; // Size in pixels (default: 40)
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const ProfilePicture: React.FC<ProfilePictureProps> = ({
  profilePictureId,
  size = 40,
  onClick,
  style
}) => {
  const containerStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    backgroundColor: profilePictureId && profilePictureId !== 'default' ? '#007bff' : '#6c757d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    border: profilePictureId && profilePictureId !== 'default' ? `2px solid #0056b3` : 'none',
    cursor: onClick ? 'pointer' : 'default',
    ...style
  };

  if (!profilePictureId || profilePictureId === 'default') {
    return (
      <div style={containerStyle} onClick={onClick}>
        <span style={{ fontSize: `${size * 0.45}px` }}>🎲</span>
      </div>
    );
  }

  const imagePath = getProfilePicturePath(profilePictureId);
  const alternatives = tryAlternativeExtensions(imagePath);
  let currentAlternativeIndex = 0;

  return (
    <div style={containerStyle} onClick={onClick}>
      <img
        src={imagePath}
        alt="Profile"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '50%'
        }}
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          if (currentAlternativeIndex < alternatives.length) {
            img.src = alternatives[currentAlternativeIndex];
            currentAlternativeIndex++;
          } else {
            img.style.display = 'none';
            const parent = img.parentElement;
            if (parent) {
              parent.innerHTML = `<span style="font-size: ${size * 0.45}px;">🎲</span>`;
            }
          }
        }}
      />
    </div>
  );
};

