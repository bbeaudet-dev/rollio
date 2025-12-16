import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginModal, RegisterModal } from './index';
import { ProfilePicture } from '../components/ProfilePicture';
import { SettingsButton } from '../components/SettingsButton';
import { ActionButton } from '../components/ActionButton';

interface AuthSectionProps {
  onSettingsClick?: () => void;
}

export const AuthSection: React.FC<AuthSectionProps> = ({ onSettingsClick }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  if (isLoading) {
    return (
      <div style={{
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        border: '1px solid #dee2e6',
        textAlign: 'center',
        color: '#6c757d',
        fontSize: '14px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <div style={{
        padding: '12px',
        backgroundColor: isAuthenticated ? '#e7f5e7' : '#f8f9fa',
        borderRadius: '6px',
        border: `1px solid ${isAuthenticated ? '#28a745' : '#dee2e6'}`
      }}>
        {isAuthenticated && user ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            {/* Profile Picture */}
            <ProfilePicture profilePictureId={user.profilePicture} size={40} />
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>
                Logged in as: <span style={{ color: '#28a745' }}>{user.username}</span>
              </div>
              {user.email && (
                <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                  {user.email}
                </div>
              )}
            </div>
            <ActionButton
              onClick={() => navigate('/profile')}
              variant="secondary"
              size="medium"
            >
              Profile
            </ActionButton>
            {onSettingsClick && (
              <SettingsButton 
                onClick={onSettingsClick}
                style={{ position: 'relative', top: 'auto', right: 'auto' }}
              />
            )}
            <ActionButton
              onClick={logout}
              variant="danger"
              size="small"
            >
              Logout
            </ActionButton>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
            <ActionButton
              onClick={() => setIsLoginOpen(true)}
              variant="primary"
              size="medium"
            >
              Login
            </ActionButton>
            <ActionButton
              onClick={() => setIsRegisterOpen(true)}
              variant="success"
              size="medium"
            >
              Register
            </ActionButton>
            {onSettingsClick && (
              <SettingsButton 
                onClick={onSettingsClick}
                style={{ position: 'relative', top: 'auto', right: 'auto' }}
              />
            )}
          </div>
        )}
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </>
  );
};

