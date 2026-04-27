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
        // Boost levels slightly for better visual feedback if they are too quiet
        setLevels({
          l: Math.min(newLevels.l * 1.2, 1),
          r: Math.min(newLevels.r * 1.2, 1)
        });
      } else {
        setLevels({ l: 0, r: 0 });
      }
      requestRef.current = requestAnimationFrame(update);
    };
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [engine, isPlaying]);

  const renderBar = (level: number) => {
    const segments = 24; // Increased from 15 for a wider look
    return (
      <div className="flex gap-[1.5px] h-3.5 items-end">
        {Array.from({ length: segments }).map((_, i) => {
          const threshold = i / segments;
          const isActive = level > threshold;
          let color = 'bg-zinc-800/40'; // Base color for inactive
          
          if (isActive) {
            // New color thresholds for more "liveliness"
            if (i > segments * 0.85) color = 'bg-red-500 shadow-[0_0_10px_#ef4444]'; // Peak
            else if (i > segments * 0.65) color = 'bg-orange-500 shadow-[0_0_8px_#f97316]'; // High
            else if (i > segments * 0.45) color = 'bg-yellow-400 shadow-[0_0_8px_#facc15]'; // Mid
            else color = 'bg-green-400 shadow-[0_0_8px_#4ade80]'; // Normal
          }
          
          return (
            <div 
              key={i} 
              className={cn(
                "w-1.5 h-full transition-all duration-75 rounded-[0.5px]", 
                color
              )}
              style={{ 
                opacity: isActive ? 1 : 0.1
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2 bg-[#050505] p-3 border border-white/5 rounded-sm shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-3">
        <span className="text-[6px] font-mono text-white/30 w-2">L</span>
        {renderBar(levels.l)}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[6px] font-mono text-white/30 w-2">R</span>
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
    nextTrack,
    previousTrack,
    engine,
  } = useAudio();

  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="h-32 border-t-2 border-white/10 bg-[#1a1b1c] flex items-center px-10 gap-0 relative overflow-hidden shrink-0 shadow-[0_-15px_50px_rgba(0,0,0,0.6)]">
      {/* Retro Metal Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')]" />
      
      {/* Hardware Screw Details */}
      <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-zinc-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.5)] border border-black/40" />
      <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-zinc-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.5)] border border-black/40" />
      <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-zinc-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.5)] border border-black/40" />
      <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-zinc-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.5)] border border-black/40" />

      {/* Signal Identity Slot */}
      <div className="w-80 shrink-0 flex items-center gap-5 pr-10">
        <div 
          className="relative group cursor-pointer" 
          onClick={() => setIsExpanded(true)}
        >
          <div className="w-16 h-16 bg-black rounded-sm overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.8),inset_0_0_10px_rgba(255,255,255,0.05)] border border-white/10 flex items-center justify-center relative">
            {trackInfo.cover ? (
              <img src={trackInfo.cover} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                <Activity className="w-8 h-8 text-white/10 animate-pulse" />
              </div>
            )}
            <div className="absolute inset-0 pointer-events-none border-t border-white/5" />
          </div>
          {/* Bezel */}
          <div className="absolute -inset-1.5 border border-black/60 rounded-sm pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" />
        </div>

        <div className="flex-1 min-w-0 bg-[#0a0a0a] p-3 rounded-sm border-t border-l border-white/5 border-b border-r border-black/40 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] relative overflow-hidden group/info">
          {/* VFD Screen Glass Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/30 group-hover/info:bg-orange-500 transition-colors shadow-[0_0_10px_rgba(249,115,22,0.2)]" />
          
          <div className="text-[8px] font-mono text-orange-500/40 uppercase tracking-[0.3em] truncate mb-1">
            SOURCE: {trackInfo.artist || 'NO_SIGNAL'}
          </div>
          <div className="text-xs font-bold text-orange-500/80 uppercase tracking-widest truncate leading-none font-mono drop-shadow-[0_0_3px_rgba(249,115,22,0.4)]">
            {trackInfo.title || 'IDLE_PROCESS'}
          </div>
        </div>
      </div>

      {/* Hardware Groove */}
      <div className="w-[2px] h-20 bg-black/40 shadow-[1px_0_0_rgba(255,255,255,0.05)]" />

      {/* Main Controls - Skeuomorphic Cluster */}
      <div className="flex-1 flex flex-col gap-4 max-w-2xl px-12">
        <div className="flex flex-col items-center gap-4">
          <span className="text-[7px] font-mono text-white/20 uppercase tracking-[0.5em] -mb-2">Navigation System</span>
          <div className="flex items-center justify-center gap-5">
            <EPButton variant="white" size="sm" onClick={previousTrack}>
              PREV
            </EPButton>
            
            <EPButton 
              variant="orange" 
              size="md"
              onClick={isPlaying ? pause : play}
            >
              {isPlaying ? 'PAUSE' : 'PLAY'}
            </EPButton>

            <EPButton variant="white" size="sm" onClick={nextTrack}>
              NEXT
            </EPButton>
          </div>
        </div>

        {/* Tactile Progress Bar */}
        <div className="flex items-center gap-4 group">
          <span className="text-[9px] font-mono text-white/30 w-10 text-right tabular-nums">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 relative h-6 flex items-center group/slider">
            <SkeuoSlider 
              value={[currentTime]} 
              max={duration || 100} 
              step={0.1}
              onValueChange={(v) => seek(v[0])}
              variant="neutral"
              className="flex-1"
            />
          </div>
          <span className="text-[9px] font-mono text-white/30 w-10 tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Hardware Groove */}
      <div className="w-[2px] h-20 bg-black/40 shadow-[1px_0_0_rgba(255,255,255,0.05)]" />

      {/* VU Meter & Volume Cluster */}
      <div className="w-[450px] shrink-0 flex items-center justify-end gap-8 pl-10 relative">
        <div className="flex flex-col gap-2 items-center shrink-0">
          <span className="text-[7px] font-mono text-white/20 uppercase tracking-[0.4em]">Signal Level</span>
          <VUMeter engine={engine} isPlaying={isPlaying} />
        </div>
        
        <div className="flex flex-col gap-3 flex-1 min-w-[140px]">
          <div className="flex justify-between items-center text-[7px] font-mono text-white/20 uppercase tracking-[0.3em]">
            <span>Output</span>
            <span className="text-white/40">{Math.round(volume * 100)}%</span>
          </div>
          
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

        {/* Power LED */}
        <div className="absolute top-[-10px] right-0 flex flex-col items-center gap-1">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full transition-all duration-500",
            isPlaying ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "bg-red-950"
          )} />
          <span className="text-[6px] font-mono text-white/10 uppercase">Active</span>
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
