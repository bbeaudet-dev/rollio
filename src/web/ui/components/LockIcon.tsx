import React from 'react';

interface LockIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const LockIcon: React.FC<LockIconProps> = ({ 
  size = 24, 
  color = 'white',
  strokeWidth = 2 
}) => {
  return (
    <div style={{
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))'
    }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    </div>
  );
};

