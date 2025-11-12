import React from 'react';
import { Modal } from '../components/Modal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const containerStyle: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    padding: '20px'
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #e1e5e9'
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#2c3e50'
  };

  const placeholderStyle: React.CSSProperties = {
    color: '#6c757d',
    fontStyle: 'italic'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div style={containerStyle}>
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Game Settings</h2>
          <p style={placeholderStyle}>Game settings will be available here.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Audio Settings</h2>
          <p style={placeholderStyle}>Audio settings will be available here.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Display Settings</h2>
          <p style={placeholderStyle}>Display settings will be available here.</p>
        </div>
      </div>
    </Modal>
  );
};

