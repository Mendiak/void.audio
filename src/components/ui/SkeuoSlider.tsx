'use client';

import React from 'react';
import './SkeuoSlider.css';

interface SkeuoSliderProps {
  value: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange: (value: number[]) => void;
  variant?: 'blue' | 'green' | 'red' | 'neutral';
  className?: string;
}

export function SkeuoSlider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  variant = 'neutral',
  className = '',
}: SkeuoSliderProps) {
  const currentValue = value[0];
  const percentage = ((currentValue - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onValueChange([newValue]);
  };

  return (
    <div 
      className={`skeuo-slider-wrapper variant-${variant} ${className}`}
      style={{ '--slider-value': percentage } as React.CSSProperties}
    >
      <div className="skeuo-slider-container">
        <div className="skeuo-slider-track">
          <div className="skeuo-slider-track-fill" />
          <div className="skeuo-slider-thumb" />
          <input
            className="skeuo-slider-input"
            type="range"
            min={min}
            max={max}
            step={step}
            value={currentValue}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}
