'use client';

import React from 'react';
import './SkeuoSlider.css';
import { useAudio } from '@/store/AudioContext';

interface SkeuoSliderProps {
  value: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange: (value: number[]) => void;
  variant?: 'blue' | 'green' | 'red' | 'neutral';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function SkeuoSlider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  variant = 'neutral',
  orientation = 'horizontal',
  className = '',
}: SkeuoSliderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = React.useState(100);
  const { engine } = useAudio();
  const lastSoundValue = React.useRef(value[0]);
  
  const currentValue = value[0];
  const percentage = ((currentValue - min) / (max - min)) * 100;

  React.useEffect(() => {
    if (orientation === 'vertical' && containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
    }
  }, [orientation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onValueChange([newValue]);
    
    // Play sound only when value changes significantly (every 5% or so)
    if (Math.abs(newValue - lastSoundValue.current) >= (max - min) * 0.05) {
      engine?.playClick('light');
      lastSoundValue.current = newValue;
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`skeuo-slider-wrapper variant-${variant} orientation-${orientation} ${className}`}
      style={{ 
        '--slider-value': percentage,
        '--slider-height': `${containerHeight}px`
      } as React.CSSProperties}
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
