import React from 'react';
import './ui.css';

interface BadgeProps {
  status: 'normal' | 'waspada' | 'bahaya' | 'netral';
  children: React.ReactNode;
}

export function Badge({ status, children }: BadgeProps) {
  return (
    <span className={`ui-badge ui-badge-${status}`}>
      {children}
    </span>
  );
}
