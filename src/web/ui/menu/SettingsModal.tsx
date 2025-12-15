import React, { useState, useEffect } from 'react';
import { Modal } from '../components/Modal';
import { getUISettings, saveUISettings, UISettings } from '../../utils/uiSettings';
import { updateMusicVolume, updateMusicEnabled } from '../../utils/music';
import { updateSoundEffectsVolume } from '../../utils/sounds';
import { ArrowSelector } from '../components/ArrowSelector';

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

  const VolumeBars: React.FC<{ volume: number; enabled: boolean; onChange: (volume: number) => void }> = ({ volume, enabled, onChange }) => {
    const bars = 10; // 10 bars = 10% increments
    const barWidth = 16;
    const barHeight = 20;
    
    return (
      <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
        {Array.from({ length: bars }, (_, index) => {
          const barVolume = (index + 1) / bars; // 0.1, 0.2, ..., 1.0
          const isFilled = barVolume <= volume;
          
          return (
            <div
              key={index}
              onClick={() => enabled && onChange(barVolume)}
              style={{
                width: `${barWidth}px`,
                height: `${barHeight}px`,
                backgroundColor: isFilled ? (enabled ? '#28a745' : '#adb5bd') : 'transparent',
                border: `2px solid ${enabled ? (isFilled ? '#28a745' : '#dee2e6') : '#adb5bd'}`,
                borderRadius: '3px',
                cursor: enabled ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              title={`${Math.round(barVolume * 100)}%`}
            />
          );
        })}
      </div>
    );
  };

  const containerStyle: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    maxWidth: '100%',
    overflow: 'hidden'
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '30px'
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
    marginBottom: '16px'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: '500',
    color: '#2c3e50',
    marginRight: '16px',
    minWidth: '100px'
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#007bff',
    minWidth: '35px',
    textAlign: 'right'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div style={containerStyle}>
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Display</h2>
          
          <div style={settingRowStyle}>
            <label style={labelStyle}>Animation Speed</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowSelector
                direction="left"
                onClick={() => {
                  const speeds = [2.0, 1.5, 1.0, 0.5, 0.2, 0.1];
                  const currentIndex = speeds.indexOf(settings.animationSpeed);
                  if (currentIndex > 0) {
                    handleAnimationSpeedChange(speeds[currentIndex - 1]);
                  }
                }}
                disabled={settings.animationSpeed === 2.0}
                size={35}
              />
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#2c3e50',
                minWidth: '120px',
                textAlign: 'center'
              }}>
                {settings.animationSpeed === 2.0 ? 'Very Slow' :
                 settings.animationSpeed === 1.5 ? 'Slow' :
                 settings.animationSpeed === 1.0 ? 'Normal' :
                 settings.animationSpeed === 0.5 ? 'Fast' :
                 settings.animationSpeed === 0.2 ? 'Very Fast' :
                 'Speedrunner'}
              </span>
              <ArrowSelector
                direction="right"
                onClick={() => {
                  const speeds = [2.0, 1.5, 1.0, 0.5, 0.2, 0.1];
                  const currentIndex = speeds.indexOf(settings.animationSpeed);
                  if (currentIndex < speeds.length - 1) {
                    handleAnimationSpeedChange(speeds[currentIndex + 1]);
                  }
                }}
                disabled={settings.animationSpeed === 0.1}
                size={35}
              />
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Audio</h2>
          
          <div style={settingRowStyle}>
            <label style={labelStyle}>Sound Effects</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <input
                type="checkbox"
                checked={settings.soundEffectsEnabled}
                onChange={(e) => {
                  const newSettings = { ...settings, soundEffectsEnabled: e.target.checked };
                  setSettings(newSettings);
                  saveUISettings({ soundEffectsEnabled: e.target.checked });
                }}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#2c3e50', minWidth: '45px' }}>Volume:</span>
                <VolumeBars 
                  volume={settings.soundEffectsVolume} 
                  enabled={settings.soundEffectsEnabled}
                  onChange={(vol) => handleSoundEffectsVolumeChange(vol)}
                />
                <span style={{ ...valueStyle, fontSize: '12px', minWidth: '35px' }}>{Math.round(settings.soundEffectsVolume * 100)}%</span>
              </div>
            </div>
          </div>

          <div style={settingRowStyle}>
            <label style={labelStyle}>Music</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <input
                type="checkbox"
                checked={settings.musicEnabled}
                onChange={(e) => {
                  const newSettings = { ...settings, musicEnabled: e.target.checked };
                  setSettings(newSettings);
                  saveUISettings({ musicEnabled: e.target.checked });
                  // Update music state based on enabled setting
                  updateMusicEnabled();
                }}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#2c3e50', minWidth: '45px' }}>Volume:</span>
                <VolumeBars 
                  volume={settings.musicVolume} 
                  enabled={settings.musicEnabled}
                  onChange={(vol) => handleMusicVolumeChange(vol)}
                />
                <span style={{ ...valueStyle, fontSize: '12px', minWidth: '35px' }}>{Math.round(settings.musicVolume * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

