import React, { useState, useEffect } from 'react';
import { Modal } from '../components/Modal';
import { getUISettings, saveUISettings, UISettings } from '../../utils/uiSettings';
import { updateMusicVolume } from '../../utils/music';
import { updateSoundEffectsVolume } from '../../utils/sounds';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<UISettings>(getUISettings());

  useEffect(() => {
    if (isOpen) {
      setSettings(getUISettings());
    }
  }, [isOpen]);

  const handleAnimationSpeedChange = (value: number) => {
    const newSettings = { ...settings, animationSpeed: value };
    setSettings(newSettings);
    saveUISettings({ animationSpeed: value });
  };

  const handleSoundEffectsVolumeChange = (value: number) => {
    const newSettings = { ...settings, soundEffectsVolume: value };
    setSettings(newSettings);
    saveUISettings({ soundEffectsVolume: value });
    updateSoundEffectsVolume(); 
  };

  const handleMusicVolumeChange = (value: number) => {
    const newSettings = { ...settings, musicVolume: value };
    setSettings(newSettings);
    saveUISettings({ musicVolume: value });
    updateMusicVolume(); // Update currently playing music
  };

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

  const settingRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    border: '1px solid #dee2e6'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#2c3e50',
    marginRight: '16px',
    minWidth: '150px'
  };

  const sliderContainerStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const sliderStyle: React.CSSProperties = {
    flex: 1,
    height: '6px',
    borderRadius: '3px',
    outline: 'none',
    cursor: 'pointer',
    WebkitAppearance: 'none',
    appearance: 'none',
    backgroundColor: '#dee2e6'
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#007bff',
    minWidth: '50px',
    textAlign: 'right'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div style={containerStyle}>
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Display Settings</h2>
          
          <div style={settingRowStyle}>
            <label style={labelStyle}>Animation Speed</label>
            <div style={sliderContainerStyle}>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={settings.animationSpeed}
                onChange={(e) => handleAnimationSpeedChange(parseFloat(e.target.value))}
                style={sliderStyle}
              />
              <span style={valueStyle}>{settings.animationSpeed.toFixed(1)}s</span>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '-8px', marginBottom: '8px', paddingLeft: '12px' }}>
            Controls the pause between steps in the scoring breakdown animation
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Audio Settings</h2>
          
          <div style={settingRowStyle}>
            <label style={labelStyle}>Sound Effects</label>
            <div style={sliderContainerStyle}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.soundEffectsVolume}
                onChange={(e) => handleSoundEffectsVolumeChange(parseFloat(e.target.value))}
                style={sliderStyle}
              />
              <span style={valueStyle}>{Math.round(settings.soundEffectsVolume * 100)}%</span>
            </div>
          </div>

          <div style={settingRowStyle}>
            <label style={labelStyle}>Music</label>
            <div style={sliderContainerStyle}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.musicVolume}
                onChange={(e) => handleMusicVolumeChange(parseFloat(e.target.value))}
                style={sliderStyle}
              />
              <span style={valueStyle}>{Math.round(settings.musicVolume * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #007bff;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #007bff;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        input[type="range"]::-webkit-slider-thumb:hover {
          background: #0056b3;
        }
        
        input[type="range"]::-moz-range-thumb:hover {
          background: #0056b3;
        }
      `}</style>
    </Modal>
  );
};

