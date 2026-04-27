'use client';

import React from 'react';
import { useAudio } from '@/store/AudioContext';
import { SkeuoSlider } from '@/components/ui/SkeuoSlider';
import { EPButton } from '@/components/ui/EPButton';
import { Play, Pause, SkipBack, SkipForward, Volume2, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const VUMeter = ({ engine, isPlaying }: { engine: any, isPlaying: boolean }) => {
  const [levels, setLevels] = React.useState({ l: 0, r: 0 });
  const requestRef = React.useRef<number>(0);

  React.useEffect(() => {
    const update = () => {
      if (engine && isPlaying) {
        const newLevels = engine.getStereoLevels();
        setLevels(newLevels);
      } else {
        setLevels({ l: 0, r: 0 });
      }
      requestRef.current = requestAnimationFrame(update);
    };
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [engine, isPlaying]);

  const renderBar = (level: number) => {
    const segments = 15;
    return (
      <div className="flex gap-[2px] h-3 items-end">
        {Array.from({ length: segments }).map((_, i) => {
          const threshold = i / segments;
          const isActive = level > threshold;
          let color = 'bg-green-500/20';
          if (isActive) {
            if (i > segments * 0.9) color = 'bg-red-500 shadow-[0_0_8px_#ef4444]';
            else if (i > segments * 0.7) color = 'bg-yellow-400 shadow-[0_0_8px_#facc15]';
            else color = 'bg-green-400 shadow-[0_0_8px_#4ade80]';
          }
          return (
            <div 
              key={i} 
              className={cn("w-1 h-full transition-all duration-75", color)}
              style={{ opacity: isActive ? 1 : 0.1 }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-1.5 bg-black/40 p-2 border border-white/5 rounded-sm">
      <div className="flex items-center gap-3">
        <span className="text-[7px] font-mono text-white/20 w-2">L</span>
        {renderBar(levels.l)}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[7px] font-mono text-white/20 w-2">R</span>
        {renderBar(levels.r)}
      </div>
    </div>
  );
};



export function Player() {
  const { 
    isPlaying, 
    currentTime, 
    duration, 
    volume, 
    trackInfo, 
    play, 
    pause, 
    setVolume,
    seek,
    engine,
  } = useAudio();

  const [isExpanded, setIsExpanded] = React.useState(false);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="h-32 border-t border-white/5 bg-[#1a1a1a] flex items-center px-12 gap-12 relative overflow-hidden shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {/* Retro Metal Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')]" />
      
      {/* Signal Identity Slot */}
      <div className="w-72 shrink-0 flex items-center gap-6">
        <div 
          className="relative group cursor-pointer" 
          onClick={() => setIsExpanded(true)}
        >
          <div className="w-16 h-16 bg-black rounded-sm overflow-hidden shadow-2xl border border-white/5">
            {trackInfo.cover ? (
              <img src={trackInfo.cover} alt="" className="w-full h-full object-cover opacity-80" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                <div className="w-8 h-8 border border-white/10 rounded-full animate-pulse" />
              </div>
            )}
          </div>
          {/* Bezel */}
          <div className="absolute -inset-1 border border-white/10 rounded-sm pointer-events-none" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] truncate">
            {trackInfo.artist}
          </div>
          <div className="text-sm font-bold text-white/90 uppercase tracking-tight truncate leading-none">
            {trackInfo.title}
          </div>
        </div>
      </div>

      {/* Main Controls - Skeuomorphic Cluster */}
      <div className="flex-1 flex flex-col gap-6 max-w-2xl">
        <div className="flex items-center justify-center gap-10">
          <EPButton variant="white">
            PREV
          </EPButton>
          
          <EPButton 
            variant="orange" 
            onClick={isPlaying ? pause : play}
          >
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </EPButton>

          <EPButton variant="white">
            NEXT
          </EPButton>
        </div>

        {/* Tactile Progress Bar */}
        <div className="flex items-center gap-4 group">
          <span className="text-[9px] font-mono text-white/20 w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 relative h-6 flex items-center group/slider">
            <SkeuoSlider 
              value={[currentTime]} 
              max={duration || 100} 
              step={0.1}
              onValueChange={(v) => seek(v[0])}
              variant="blue"
              className="flex-1"
            />
          </div>
          <span className="text-[9px] font-mono text-white/20 w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* VU Meter & Volume Cluster */}
      <div className="w-80 flex items-center justify-end gap-10">
        <VUMeter engine={engine} isPlaying={isPlaying} />
        
        <div className="flex flex-col gap-3 w-32">
          <div className="flex justify-between items-center text-[8px] font-mono text-white/20 uppercase tracking-widest">
            <span>Level</span>
            <span className="text-white/40">{Math.round(volume * 100)} dB</span>
          </div>
          
          {/* Skeuomorphic Slider Track */}
          <div className="relative h-6 flex items-center">
            <SkeuoSlider 
              value={[volume * 100]} 
              max={100} 
              onValueChange={(v) => setVolume(v[0] / 100)}
              variant="green"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Expanded Overlay Logic (unchanged from previous cleanup but integrated) */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-12"
          onClick={() => setIsExpanded(false)}
        >
          <div className="max-w-2xl w-full aspect-square bg-[#1a1a1a] shadow-2xl relative border border-white/5 flex flex-col">
            <div className="flex-1 relative overflow-hidden">
              {trackInfo.cover ? (
                <img src={trackInfo.cover} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                  <div className="w-32 h-32 border-2 border-white/5 rounded-full" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
            <div className="p-12 space-y-2">
              <h2 className="text-4xl font-bold text-white uppercase tracking-tighter">{trackInfo.title}</h2>
              <p className="text-lg text-white/40 uppercase tracking-[0.2em]">{trackInfo.artist}</p>
            </div>
            <button className="absolute top-8 right-8 text-white/20 hover:text-white font-mono text-xs uppercase tracking-widest">Close [Esc]</button>
          </div>
        </div>
      )}
    </div>
  );
}
