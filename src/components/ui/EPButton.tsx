'use client';

import React from 'react';
import './EPButton.css';
import { cn } from '@/lib/utils';

interface EPButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'orange' | 'dark-gray' | 'white' | 'light-gray' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function EPButton({ 
  variant = 'orange', 
  size = 'md',
  children, 
  className, 
  ...props 
}: EPButtonProps) {
  return (
    <button className={cn("ep-button", `size-${size}`, className)} {...props}>
      <span className={cn("ep-button-inside", `variant-${variant}`)}>
        {children}
      </span>
    </button>
  );
}
