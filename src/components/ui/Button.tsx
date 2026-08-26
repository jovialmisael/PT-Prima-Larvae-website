import { ButtonHTMLAttributes } from 'react';
import './ui.css'; // File terpisah untuk merapikan CSS UI primitif

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = [
    'ui-btn',
    `ui-btn-${variant}`,
    `ui-btn-${size}`,
    fullWidth ? 'ui-btn-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}

