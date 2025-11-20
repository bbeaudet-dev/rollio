import React, { useState } from 'react';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { useAuth } from '../../contexts/AuthContext';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
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

