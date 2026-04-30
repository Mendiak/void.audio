'use client';

import React from 'react';
import './HifiButton.css';
import { cn } from '@/lib/utils';
import { useAudio } from '@/store/AudioContext';

interface HifiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

export function HifiButton({ 
  variant = 'secondary', 
  size = 'md',
  active = false,
  className, 
  children,
  onMouseDown,
  ...props 
}: HifiButtonProps) {
  const { engine } = useAudio();

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'primary') {
      engine?.playRelay(!active);
    } else {
      engine?.playClick(size === 'lg' ? 'metal' : 'light');
    }
    onMouseDown?.(e);
  };

  return (
    <button 
      className={cn(
        "hifi-button-wrapper", 
        `size-${size}`,
        active && "is-active",
        className
      )} 
      onMouseDown={handleMouseDown}
      {...props}
    >
      <div className="hifi-button-well">
        <div className={cn("hifi-button-cap", `variant-${variant}`)}>
          <div className="hifi-button-lathe-texture" />
          <div className="hifi-button-content">
            {children}
          </div>
        </div>
      </div>
    </button>
  );
}
