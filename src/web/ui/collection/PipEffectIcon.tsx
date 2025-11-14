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
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" fill="currentColor"/>
        </svg>
      );

    case 'createConsumable':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Suitcase body */}
          <rect x="6" y="7" width="12" height="11" rx="1" fill="currentColor"/>
          {/* Suitcase handle */}
          <path d="M10 7V5c0-1.1.9-2 2-2s2 .9 2 2v2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          {/* Rope tied around */}
          <path d="M7 10h10" stroke="currentColor" strokeWidth="1.5" opacity="0.8"/>
          <circle cx="12" cy="10" r="1.5" fill="currentColor" opacity="0.9"/>
          {/* Suitcase latch */}
          <rect x="11" y="12" width="2" height="2" fill="currentColor" opacity="0.6"/>
        </svg>
      );

    case 'upgradeHand':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 16L12 10L18 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      );

    case 'twoFaced':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="9" cy="12" r="3" fill="currentColor"/>
          <circle cx="15" cy="12" r="3" fill="currentColor"/>
        </svg>
      );

    case 'wild':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2L12 17.6l-6 3.6 2.4-7.2-6-4.8h7.6L12 2z" fill="currentColor"/>
          <path d="M12 4.5l1.8 5.4h5.4l-4.5 3.6 1.8 5.4L12 16.2l-4.5 2.7 1.8-5.4-4.5-3.6h5.4L12 4.5z" fill="currentColor" opacity="0.3"/>
        </svg>
      );

    case 'blank':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Top semi-circle */}
          <path d="M 12 2 A 10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          {/* Bottom semi-circle */}
          <path d="M 12 22 A 10 10 0 0 1 2 12" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      );

    default:
      return null;
  }
};

