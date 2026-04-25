'use client';

import React from 'react';
import { useAudio } from '@/store/AudioContext';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="h-24 w-full bg-black/80 backdrop-blur-xl border-t border-border px-6 flex items-center gap-8">
      {/* Track Info */}
      <div className="flex items-center gap-4 w-1/4">
        <div className="w-12 h-12 bg-zinc-900 border border-border flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Maximize2 size={16} className="text-primary/50" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-mono font-bold tracking-tighter truncate uppercase text-primary">
            {trackInfo.title}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest truncate">
            {trackInfo.artist}
          </span>
        </div>
      </div>

      {/* Controls & Progress */}
      <div className="flex-1 flex flex-col items-center gap-2 max-w-2xl mx-auto">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <SkipBack size={18} />
          </Button>
          <Button 
            onClick={isPlaying ? pause : play}
            variant="outline" 
            size="icon" 
            className="w-10 h-10 rounded-none border-primary/50 text-primary hover:bg-primary/10 hover:border-primary transition-all shadow-[0_0_10px_rgba(0,255,65,0.1)]"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <SkipForward size={18} />
          </Button>
        </div>

        <div className="w-full flex items-center gap-3">
          <span className="text-[10px] font-mono text-muted-foreground w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-primary/5 scale-y-[0.2] group-hover:scale-y-[0.4] transition-transform" />
            <Slider 
              value={[progress]} 
              max={100} 
              step={0.1}
              className="relative z-10"
            />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume & Extras */}
      <div className="w-1/4 flex items-center justify-end gap-4">
        <div className="flex items-center gap-3 w-32">
          <Volume2 size={16} className="text-muted-foreground" />
          <Slider 
            value={[volume * 100]} 
            max={100} 
            step={1} 
            onValueChange={(v) => setVolume(v[0] / 100)}
          />
        </div>
        <div className="h-4 w-[1px] bg-border mx-2" />
        <div className="flex flex-col items-end font-mono text-[9px] text-muted-foreground/50">
          <span>SAMPLE_RATE: 44.1KHZ</span>
          <span>BUFFER_SIZE: 1024</span>
        </div>
      </div>
    </div>
  );
}
