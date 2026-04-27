'use client';

import React, { useRef, useEffect } from 'react';
import { useAudio } from '@/store/AudioContext';

const ASCII_CHARS = ' .:-=+*#%@';
const TECH_CHARS = '01{}[]|\\/-_';

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

    // Clear with trail effect
    ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const charWidth = 12;
    const charHeight = 20;
    const cols = Math.floor(canvas.width / charWidth);
    const rows = Math.floor(canvas.height / charHeight);

    ctx.font = `bold ${charHeight - 4}px "Geist Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary').trim();

    for (let x = 0; x < cols; x++) {
      const offset = 2;
      const dataIdx = offset + Math.floor((x / cols) * (data.length / 2));
      const intensity = data[dataIdx] / 255;
      
      const colHeight = Math.floor(intensity * rows * 1.2);
      
      for (let y = 0; y < colHeight; y++) {
        const char = TECH_CHARS[Math.floor(Math.random() * TECH_CHARS.length)];
        
        const distFromTop = y / colHeight;
        const alpha = distFromTop * 0.8 + 0.2;
        
        // Randomly flicker some characters
        if (Math.random() > 0.95) {
          ctx.fillStyle = '#fff';
        } else {
          ctx.fillStyle = `${primaryColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        }
        
        ctx.fillText(
          char, 
          x * charWidth + charWidth / 2, 
          canvas.height - (y * charHeight + charHeight / 2)
        );
      }
      
      // Top "peak" character
      if (colHeight > 0) {
        ctx.fillStyle = '#fff';
        ctx.fillText(
          '#', 
          x * charWidth + charWidth / 2, 
          canvas.height - (colHeight * charHeight + charHeight / 2)
        );
      }
    }

    // Centered Oscilloscope Line
    ctx.beginPath();
    ctx.strokeStyle = `${primaryColor}88`;
    ctx.lineWidth = 2;
    const centerY = canvas.height / 2;
    for (let i = 0; i < canvas.width; i += 2) {
      const idx = Math.floor((i / canvas.width) * timeData.length);
      const v = timeData[idx] / 128.0;
      const y = centerY + (v - 1) * 100;
      
      if (i === 0) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
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
