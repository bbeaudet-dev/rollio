import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginModal, RegisterModal } from './index';
import { ProfilePicture } from '../components/ProfilePicture';
import { SettingsButton } from '../components/SettingsButton';

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
            <button
              onClick={() => navigate('/profile')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '500',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5a6268';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#6c757d';
              }}
            >
              Profile
            </button>
            {onSettingsClick && (
              <SettingsButton 
                onClick={onSettingsClick}
                style={{ position: 'relative', top: 'auto', right: 'auto' }}
              />
            )}
            <button
              onClick={logout}
              style={{
                padding: '6px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: '500',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#c82333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc3545';
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
            <button
              onClick={() => setIsLoginOpen(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0056b3';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#007bff';
              }}
            >
              Login
            </button>
            <button
              onClick={() => setIsRegisterOpen(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#218838';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#28a745';
              }}
            >
              Register
            </button>
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

