import React from 'react';
import { useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  const containerStyle: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '80px auto',
    padding: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e1e5e9',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#2c3e50',
    textAlign: 'center'
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

  const backButtonStyle: React.CSSProperties = {
    marginBottom: '20px',
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  };

  const placeholderStyle: React.CSSProperties = {
    color: '#6c757d',
    fontStyle: 'italic'
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Settings</h1>
      <button style={backButtonStyle} onClick={() => navigate('/')}>
        ← Back to Menu
      </button>

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
  );
};

