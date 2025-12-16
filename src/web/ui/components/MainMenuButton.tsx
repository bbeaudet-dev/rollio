import React from 'react';
import { ActionButton } from './ActionButton';

export type ButtonVariant = 'primary' | 'success' | 'secondary';

interface MainMenuButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export const MainMenuButton: React.FC<MainMenuButtonProps> = ({
  onClick,
  children,
  variant = 'secondary',
  disabled = false,
  style
}) => {
  // Map ButtonVariant to ActionButton variant
  const actionButtonVariant = variant === 'success' ? 'success' : 
                               variant === 'primary' ? 'primary' : 
                               'secondary';

  return (
    <ActionButton
      onClick={onClick}
      variant={actionButtonVariant}
      size="large"
      disabled={disabled}
      style={style}
    >
      {children}
    </ActionButton>
  );
};

