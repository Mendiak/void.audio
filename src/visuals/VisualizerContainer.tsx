'use client';

import React from 'react';
import { useUI, VisualMode } from '@/store/UIContext';
import { AsciiVisualizer } from './AsciiVisualizer';
import { WaveformVisualizer } from './WaveformVisualizer';
import { SpectrumVisualizer } from './SpectrumVisualizer';
import { Terminal, Activity, Zap, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const MODES: { id: VisualMode; label: string; icon: any }[] = [
  { id: 'ascii', label: 'ASCII_CORE', icon: Terminal },
  { id: 'oscilloscope', label: 'OSCILLO', icon: Activity },
  { id: 'spectrum', label: 'SPECTRUM', icon: BarChart3 },
];

export function VisualizerContainer() {
  const { visualMode, setVisualMode } = useUI();

  const renderVisualizer = () => {
    switch (visualMode) {
      case 'ascii':
        return <AsciiVisualizer />;
      case 'oscilloscope':
        return <WaveformVisualizer />;
      case 'spectrum':
        return <SpectrumVisualizer />;
      default:
        return <AsciiVisualizer />;
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Mode Switcher */}
      <div className="flex gap-2 p-1 bg-black/40 border border-white/5 self-start rounded-sm">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setVisualMode(mode.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all",
              visualMode === mode.id 
                ? "bg-primary text-black font-bold shadow-[0_0_10px_var(--primary)]" 
                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
            )}
          >
            <mode.icon size={12} />
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Main Visualizer Area */}
      <div className="flex-1 min-h-0 relative">
        {renderVisualizer()}
        <div className="crt-noise" />
      </div>
    </div>
  );
}
