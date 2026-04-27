'use client';

import React, { useRef, useEffect } from 'react';
import { useAudio } from '@/store/AudioContext';

export function SpectrumVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { engine } = useAudio();
  const requestRef = useRef<number>(0);
  const peaks = useRef<number[]>([]);

  const animate = () => {
    if (!canvasRef.current || !engine) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = engine.getFrequencyData();
    if (peaks.current.length !== data.length) {
        peaks.current = new Array(data.length).fill(0);
    }

    // Clear
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary').trim();
    
    const barWidth = (canvas.width / (data.length / 2)) * 2;
    let x = 0;

    for (let i = 0; i < data.length / 2; i++) {
      const barHeight = (data[i] / 255) * canvas.height;
      
      // Update peaks
      if (barHeight > peaks.current[i]) {
          peaks.current[i] = barHeight;
      } else {
          peaks.current[i] -= 1.5;
      }

      // Draw main bar with gradient
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
      gradient.addColorStop(0, `${primaryColor}aa`);
      gradient.addColorStop(1, `${primaryColor}`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

      // Draw peak line
      ctx.fillStyle = '#fff';
      ctx.fillRect(x, canvas.height - peaks.current[i] - 2, barWidth - 2, 2);

      x += barWidth;
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [engine]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden terminal-border">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute top-4 right-4 font-mono text-[10px] text-primary/40 uppercase tracking-widest">
        SPECTRUM_ANALYZER // FFT_CORE
      </div>
      <div className="scanline" />
    </div>
  );
}
