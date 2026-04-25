'use client';

import React from 'react';
import { useAudio } from '@/store/AudioContext';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function Player() {
  const { 
    isPlaying, 
    currentTime, 
    duration, 
    volume, 
    trackInfo, 
    play, 
    pause, 
    setVolume 
  } = useAudio();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="h-24 border-t border-border/50 bg-black/60 backdrop-blur-xl flex items-center px-8 gap-8 relative overflow-hidden">
      {/* Hardware Accents */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      {/* Track Info */}
      <div className="w-64 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 items-end h-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={cn(
                "w-0.5 bg-primary/20",
                isPlaying ? "animate-[pulse_1s_infinite]" : "",
                i === 1 ? "h-1" : i === 2 ? "h-2" : i === 3 ? "h-3" : "h-2"
              )} style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
          <span className="text-[10px] font-mono text-primary uppercase tracking-[0.2em] truncate crt-glow">
            {trackInfo.title}
          </span>
        </div>
        <span className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest truncate">
          {trackInfo.artist}
        </span>
      </div>

      {/* Controls & Progress */}
      <div className="flex-1 flex flex-col gap-3 max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-8">
          <button className="text-muted-foreground/30 hover:text-primary transition-colors active:scale-90">
            <SkipBack size={16} />
          </button>
          <button 
            onClick={isPlaying ? pause : play}
            className="w-10 h-10 flex items-center justify-center border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all active:scale-95 group shadow-[inset_0_0_10px_rgba(var(--primary),0.05)]"
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-1" />
            )}
          </button>
          <button className="text-muted-foreground/30 hover:text-primary transition-colors active:scale-90">
            <SkipForward size={16} />
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4 group">
          <span className="text-[9px] font-mono text-muted-foreground/30 w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 h-1 bg-zinc-900/50 relative overflow-hidden">
            <div 
              className="h-full bg-primary/30 relative transition-all duration-100" 
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-0 w-1 h-full bg-primary shadow-[0_0_8px_var(--primary)]" />
            </div>
          </div>
          <span className="text-[9px] font-mono text-muted-foreground/30 w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume & Extras */}
      <div className="w-64 flex items-center justify-end gap-6">
        <div className="flex flex-col gap-1 w-32">
          <div className="flex justify-between items-center text-[7px] font-mono text-muted-foreground/30 uppercase tracking-[0.2em]">
            <span>Output Level</span>
            <span>{Math.round(volume * 100)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Volume2 size={12} className="text-muted-foreground/20" />
            <Slider 
              value={[volume * 100]} 
              max={100} 
              step={1}
              onValueChange={(v) => setVolume(v[0] / 100)}
              className="flex-1"
            />
          </div>
        </div>
        
        {/* Hardware Status LEDs */}
        <div className="flex gap-2">
          <div className="flex flex-col gap-1 items-center">
            <div className="w-1 h-1 rounded-full bg-primary shadow-[0_0_4px_var(--primary)]" />
            <span className="text-[6px] font-mono text-muted-foreground/20 uppercase">PWR</span>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <div className={cn(
              "w-1 h-1 rounded-full",
              isPlaying ? "bg-primary shadow-[0_0_4px_var(--primary)]" : "bg-zinc-800"
            )} />
            <span className="text-[6px] font-mono text-muted-foreground/20 uppercase">SIG</span>
          </div>
        </div>
      </div>
    </div>
  );
}
