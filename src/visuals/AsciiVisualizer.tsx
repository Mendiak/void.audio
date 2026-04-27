'use client';

import React, { useRef, useEffect } from 'react';
import { useAudio } from '@/store/AudioContext';

const ASCII_CHARS = ' .:-=+*#%@';

export function AsciiVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { engine, isPlaying } = useAudio();
  const requestRef = useRef<number>(0);

  const animate = () => {
    if (!canvasRef.current || !engine) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = engine.getFrequencyData();
    const timeData = engine.getTimeDomainData();

    // Clear canvas
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const charWidth = 10;
    const charHeight = 18;
    const cols = Math.floor(canvas.width / charWidth);
    const rows = Math.floor(canvas.height / charHeight);

    ctx.font = `${charHeight}px "Geist Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Get current primary color from CSS
    const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary').trim();

    for (let x = 0; x < cols; x++) {
      // Skip the first 3 bins which often have extreme energy (DC offset / sub-bass noise)
      const offset = 3;
      const dataIdx = offset + Math.floor((x / cols) * (data.length - offset));
      const intensity = data[dataIdx] / 255;
      
      const colHeight = Math.floor(intensity * rows);
      
      for (let y = 0; y < colHeight; y++) {
        const charIdx = Math.floor((y / rows) * ASCII_CHARS.length);
        const char = ASCII_CHARS[charIdx] || ' ';
        
        const alpha = (y / colHeight) * 0.8 + 0.2;
        ctx.fillStyle = `${primaryColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        
        ctx.fillText(
          char, 
          x * charWidth + charWidth / 2, 
          canvas.height - (y * charHeight + charHeight / 2)
        );
      }
    }

    // Waveform line
    ctx.beginPath();
    ctx.strokeStyle = `${primaryColor}44`;
    ctx.lineWidth = 1;
    for (let i = 0; i < cols; i++) {
      const v = timeData[Math.floor((i / cols) * timeData.length)] / 128.0;
      const y = (v * canvas.height) / 2;
      if (i === 0) ctx.moveTo(i * charWidth, y);
      else ctx.lineTo(i * charWidth, y);
    }
    ctx.stroke();

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [engine, isPlaying]);

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
      <canvas 
        ref={canvasRef} 
        className="w-full h-full opacity-80"
      />

      <div className="scanline" />
    </div>
  );
}
