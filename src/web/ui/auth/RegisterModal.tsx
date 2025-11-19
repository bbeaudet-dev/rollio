import React, { useState } from 'react';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}) => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validation
    if (!username || !password) {
      setError('Username and password are required');
      setIsLoading(false);
      return;
    }

    if (username.length < 3 || username.length > 50) {
      setError('Username must be between 3 and 50 characters');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const result = await register(username, email || null, password);
    setIsLoading(false);

    if (result.success) {
      // Success - close modal and reset form
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError(null);
      onClose();
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register">
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
          <label style={{ fontSize: '14px', fontWeight: '500' }}>
            Username <span style={{ color: '#c33' }}>*</span>
          </label>
          <Input
            type="text"
            value={username}
            onChange={setUsername}
            placeholder="3-50 characters"
            disabled={isLoading}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500' }}>Email (optional)</label>
          <Input
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="your@email.com"
            disabled={isLoading}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500' }}>
            Password <span style={{ color: '#c33' }}>*</span>
          </label>
          <Input
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="At least 6 characters"
            disabled={isLoading}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500' }}>
            Confirm Password <span style={{ color: '#c33' }}>*</span>
          </label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Re-enter your password"
            disabled={isLoading}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>

          {onSwitchToLogin && (
            <button
              type="button"
              onClick={onSwitchToLogin}
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
              Already have an account? Login
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

