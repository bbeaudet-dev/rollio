import React from 'react';
import { PipEffectType } from '../../../game/data/pipEffects';

interface PipEffectIconProps {
  type: PipEffectType;
  size?: number;
}

export const PipEffectIcon: React.FC<PipEffectIconProps> = ({ type, size = 36 }) => {
  const iconStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    display: 'inline-block',
    verticalAlign: 'middle'
  };

  switch (type) {
    case 'money':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="11" fill="currentColor"/>
          <path d="M12 4v16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M9.5 8c0-1.1.9-2 2-2s2 .9 2 2c0 1.1-.9 2-2 2s-2 .9-2 2c0 1.1.9 2 2 2s2-.9 2-2" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );

    case 'createConsumable':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(12, 12) scale(1.25) translate(-12, -12)">
            <rect x="6" y="7" width="12" height="11" rx="1" fill="currentColor"/>
            <path d="M10 7V5c0-1.1.9-2 2-2s2 .9 2 2v2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M7 10h10" stroke="currentColor" strokeWidth="1.5" opacity="0.8"/>
            <circle cx="12" cy="10" r="1.5" fill="currentColor" opacity="0.9"/>
            <rect x="11" y="12" width="2" height="2" fill="currentColor" opacity="0.6"/>
          </g>
        </svg>
      );

    case 'upgradeCombo':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 20L12 5L21 20" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      );

    case 'twoFaced':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="9" cy="12" r="5.265" fill="currentColor"/>
          <circle cx="15" cy="12" r="5.265" fill="currentColor"/>
        </svg>
      );

    case 'wild':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(12, 12) scale(1.15) translate(-12, -12)">
            <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2L12 17.6l-6 3.6 2.4-7.2-6-4.8h7.6L12 2z" fill="currentColor"/>
            <path d="M12 4.5l1.8 5.4h5.4l-4.5 3.6 1.8 5.4L12 16.2l-4.5 2.7 1.8-5.4-4.5-3.6h5.4L12 4.5z" fill="currentColor" opacity="0.3"/>
          </g>
        </svg>
      );

    case 'blank':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 12 0.2 A 11.8 11.8 0 0 1 23.8 12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M 12 23.8 A 11.8 11.8 0 0 1 0.2 12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        </svg>
      );

    default:
      return null;
  }
};

