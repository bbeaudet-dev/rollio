import React, { useState, useEffect } from 'react';
import { statsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ActionButton } from '../components/ActionButton';

interface ProfilePictureSelectorProps {
  currentPicture: string;
  onSelect: (pictureId: string) => void;
  onClose: () => void;
}

interface ProfilePicture {
  id: string;
  name: string;
  imagePath: string;
}

export const ProfilePictureSelector: React.FC<ProfilePictureSelectorProps> = ({
  currentPicture,
  onSelect,
  onClose
}) => {
  const { refreshUser } = useAuth();
  const [selected, setSelected] = useState(currentPicture);
  const [saving, setSaving] = useState(false);
  const [pictures, setPictures] = useState<ProfilePicture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPictures = async () => {
      try {
        const result = await statsApi.getProfilePictures();
        const loadedPictures: ProfilePicture[] = [];
        
        // Add default option first
        loadedPictures.push({
          id: 'default',
          name: 'Default (Die)',
          imagePath: '' // No image path for default
        });
        
        if (result.success && (result as any).pictures) {
          loadedPictures.push(...(result as any).pictures);
        }
        
        setPictures(loadedPictures);
      } catch (error) {
        console.error('Failed to load profile pictures:', error);
        // Still add default option even on error
        setPictures([{
          id: 'default',
          name: 'Default (Die)',
          imagePath: ''
        }]);
      } finally {
        setLoading(false);
      }
    };
    loadPictures();
  }, []);

  const handleSave = async () => {
    if (selected === currentPicture) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      const result = await statsApi.updateProfilePicture(selected);
      if (result.success) {
        // Refresh user data to get updated profile picture
        await refreshUser();
        // Wait a bit for context to update, then call onSelect
        setTimeout(() => {
          onSelect(selected);
          onClose();
        }, 100);
      } else {
        alert('Failed to update profile picture');
        setSaving(false);
      }
    } catch (error) {
      console.error('Failed to update profile picture:', error);
      alert('Failed to update profile picture');
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}
    onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '30px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '24px',
            margin: 0,
            color: '#2c3e50'
          }}>
            Select Profile Picture
          </h2>
          <ActionButton
            onClick={onClose}
            variant="secondary"
            size="small"
            style={{
              padding: '4px 8px',
              minWidth: '32px',
              minHeight: '32px',
              fontSize: '20px',
              lineHeight: '1'
            }}
          >
            ×
          </ActionButton>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Loading pictures...
          </div>
        ) : (
          <div style={{
            maxHeight: '60vh',
            overflowY: 'auto',
            paddingRight: '10px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
              gap: '12px',
              marginBottom: '20px'
            }}>
              {pictures.map((pic) => (
                <div
                  key={pic.id}
                  onClick={() => setSelected(pic.id)}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: selected === pic.id ? '#007bff' : '#f8f9fa',
                    border: selected === pic.id ? '3px solid #0056b3' : '3px solid #e1e5e9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    overflow: 'hidden',
                    position: 'relative',
                    flexShrink: 0
                  }}
                  title={pic.name}
                >
                  {pic.id === 'default' ? (
                    <span style={{ fontSize: '40px' }}>🎲</span>
                  ) : (
                    <img
                      src={pic.imagePath}
                      alt={pic.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: selected === pic.id ? 1 : 0.7
                      }}
                      onError={(e) => {
                        // Try alternative extensions if first fails
                        const img = e.target as HTMLImageElement;
                        if (pic.imagePath.endsWith('.png')) {
                          img.src = pic.imagePath.replace('.png', '.jpeg');
                        } else if (pic.imagePath.endsWith('.jpeg')) {
                          img.src = pic.imagePath.replace('.jpeg', '.jpg');
                        } else if (pic.imagePath.endsWith('.jpg')) {
                          img.src = pic.imagePath.replace('.jpg', '.png');
                        }
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end'
        }}>
          <ActionButton
            onClick={onClose}
            variant="secondary"
            size="medium"
          >
            Cancel
          </ActionButton>
          <ActionButton
            onClick={handleSave}
            disabled={saving}
            variant="primary"
            size="medium"
          >
            {saving ? 'Saving...' : 'Save'}
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

