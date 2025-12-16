import React, { useState } from 'react';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { useAuth } from '../../contexts/AuthContext';
import { ActionButton } from '../components/ActionButton';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
}) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);

    if (!username || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    const result = await login(username, password);
    setIsLoading(false);

    if (result.success) {
      // Success - close modal and reset form
      setUsername('');
      setPassword('');
      setError(null);
      onClose();
    } else {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Login">
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{
            padding: '10px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500' }}>Username</label>
          <Input
            type="text"
            value={username}
            onChange={setUsername}
            placeholder="Enter your username"
            disabled={isLoading}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500' }}>Password</label>
          <Input
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            disabled={isLoading}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              borderRadius: '10px',
              minHeight: '38px',
              fontWeight: 600,
              border: '2px solid #000',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2), 0 0 6px rgba(255, 255, 255, 0.1)',
              backgroundColor: isLoading ? '#6c757d' : '#007bff',
              color: 'white',
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3), 0 0 10px rgba(255, 255, 255, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2), 0 0 6px rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseDown={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
            onMouseUp={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          {onSwitchToRegister && (
            <button
              type="button"
              onClick={onSwitchToRegister}
              disabled={isLoading}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                color: '#007bff',
                border: 'none',
                fontSize: '14px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                textDecoration: 'underline'
              }}
            >
              Don't have an account? Register
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

