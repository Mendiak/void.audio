'use client';

import React from 'react';
import './HifiButton.css';
import { cn } from '@/lib/utils';

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
  ...props 
}: HifiButtonProps) {
  return (
    <button 
      className={cn(
        "hifi-button-wrapper", 
        `size-${size}`,
        active && "is-active",
        className
      )} 
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
