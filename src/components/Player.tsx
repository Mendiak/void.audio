'use client';

import React from 'react';
import { useAudio } from '@/store/AudioContext';
import { SkeuoSlider } from '@/components/ui/SkeuoSlider';
import { HifiButton } from '@/components/ui/HifiButton';
import { Play, Pause, SkipBack, SkipForward, Volume2, Activity, FastForward, Rewind } from 'lucide-react';
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
    setEQ,
    engine,
  } = useAudio();

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [eqValues, setEqValues] = React.useState(new Array(7).fill(0));

  const handleEqChange = (index: number, value: number) => {
    const newValues = [...eqValues];
    newValues[index] = value;
    setEqValues(newValues);
    setEQ(index, value);
  };

  return (
    <div className="h-60 border-t-2 border-white/10 bg-[#1a1b1c] flex flex-col relative overflow-hidden shrink-0 shadow-[0_-25px_50px_rgba(0,0,0,0.8)] z-50">
      {/* Physical Chassis 'Lip' - Shadow casting upwards onto the screen */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5 pointer-events-none z-[60]" />
      <div className="absolute top-[2px] left-0 right-0 h-4 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-[60]" />
      
      {/* Side Bezels - to simulate the chassis wrapping around */}
      <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-r from-black/40 to-transparent pointer-events-none z-[60]" />
      <div className="absolute top-0 right-0 bottom-0 w-2 bg-gradient-to-l from-black/40 to-transparent pointer-events-none z-[60]" />

      {/* Retro Metal Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')]" />
      
      {/* Hardware Screw Details */}
      <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-zinc-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.5)] border border-black/40 z-10" />
      <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-zinc-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.5)] border border-black/40 z-10" />
      <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-zinc-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2_rgba(0,0,0,0.5)] border border-black/40 z-10" />
      <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-zinc-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.5)] border border-black/40 z-10" />

      {/* TOP SECTION: Tuner-style Progress Bar */}
      <div className="h-20 border-b border-black/40 bg-black/20 flex flex-col justify-end pb-4 px-10 relative pt-4">
        <div className="flex justify-between items-end mb-1 px-1">
          <span className="text-[7px] font-mono text-white/20 uppercase tracking-[0.4em]">Linear Position Indicator</span>
          <div className="flex gap-4">
            <span className="text-[9px] font-mono text-orange-500/60 tabular-nums">{formatTime(currentTime)}</span>
            <span className="text-[9px] font-mono text-white/20 tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>
        <div className="relative h-4 flex items-center">
          <SkeuoSlider 
            value={[currentTime]} 
            max={duration || 100} 
            step={0.1}
            onValueChange={(v) => seek(v[0])}
            variant="neutral"
            className="flex-1"
          />
        </div>
        {/* Decorative Frequency Markers */}
        <div className="absolute bottom-0 left-10 right-10 flex justify-between h-1 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={cn("w-[1px] bg-white", i % 5 === 0 ? "h-full" : "h-1/2")} />
          ))}
        </div>
      </div>

      {/* BOTTOM SECTION: Modular Control Panels */}
      <div className="flex-1 flex items-stretch px-10 py-6 gap-0">
        
        {/* PANEL 1: Information Display */}
        <div className="w-80 flex items-center gap-4 pr-8 border-r border-black/40 relative">
          <div 
            className="relative group cursor-pointer shrink-0" 
            onClick={() => setIsExpanded(true)}
          >
            <div className="w-14 h-14 bg-black rounded-sm overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.8)] border border-white/5 flex items-center justify-center">
              {trackInfo.cover ? (
                <img src={trackInfo.cover} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
              ) : (
                <Activity className="w-6 h-6 text-white/10 animate-pulse" />
              )}
            </div>
            <div className="absolute -inset-1 border border-black/60 rounded-sm pointer-events-none" />
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <span className="text-[6px] font-mono text-white/20 uppercase tracking-[0.3em]">Module 01 / Info</span>
            <div className="bg-zinc-900/50 p-2 rounded-sm border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)] relative overflow-hidden group/info">
              <div className="absolute top-0 left-0 w-[2px] h-full bg-orange-500/40" />
              <div className="text-[7px] font-mono text-orange-500/30 uppercase tracking-widest truncate">
                {trackInfo.artist || 'NO_SIGNAL'}
              </div>
              <div className="text-[10px] font-bold text-orange-500/70 uppercase tracking-widest truncate font-mono">
                {trackInfo.title || 'IDLE_PROCESS'}
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 2: Transport Controls (Precision Machined) */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8 border-r border-black/40 relative">
          <span className="text-[6px] font-mono text-white/20 uppercase tracking-[0.5em]">Module 02 / Transport</span>
          <div className="bg-black/20 p-4 rounded-full border border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] flex items-center gap-6">
            <HifiButton size="sm" onClick={previousTrack}>
              <SkipBack className="fill-current" />
            </HifiButton>
            
            <HifiButton 
              variant="primary" 
              size="lg"
              onClick={isPlaying ? pause : play}
              active={isPlaying}
            >
              {isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current ml-1" />}
            </HifiButton>

            <HifiButton size="sm" onClick={nextTrack}>
              <SkipForward className="fill-current" />
            </HifiButton>
          </div>
          {/* Status LEDs */}
          <div className="flex gap-6 mt-1">
            <div className="flex items-center gap-1.5">
              <div className={cn("w-1 h-1 rounded-full", isPlaying ? "bg-green-500 shadow-[0_0_5px_#22c55e]" : "bg-green-950")} />
              <span className="text-[5px] font-mono text-white/20 uppercase tracking-tighter">Running</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={cn("w-1 h-1 rounded-full", !isPlaying ? "bg-red-500 shadow-[0_0_5px_#ef4444]" : "bg-red-950")} />
              <span className="text-[5px] font-mono text-white/20 uppercase tracking-tighter">Standby</span>
            </div>
          </div>
        </div>

        {/* PANEL 3: Vertical Equalizer */}
        <div className="w-80 flex flex-col items-center justify-center gap-2 px-4 border-r border-black/40 relative">
          <span className="text-[6px] font-mono text-white/20 uppercase tracking-[0.5em]">Module 03 / EQ</span>
          <div className="flex gap-2 h-28 items-end w-full justify-between">
            {[
              { freq: '60', color: 'blue' },
              { freq: '150', color: 'blue' },
              { freq: '400', color: 'neutral' },
              { freq: '1K', color: 'neutral' },
              { freq: '2.4K', color: 'neutral' },
              { freq: '6K', color: 'red' },
              { freq: '15K', color: 'red' }
            ].map((band, i) => (
              <div key={i} className="flex flex-col items-center gap-1 h-full flex-1">
                <span className="text-[5px] font-mono text-white/20 uppercase whitespace-nowrap">{band.freq}</span>
                <SkeuoSlider 
                  value={[eqValues[i]]} 
                  min={-12}
                  max={12}
                  onValueChange={(v) => handleEqChange(i, v[0])}
                  variant={band.color as any}
                  orientation="vertical"
                  className="flex-1"
                />
                <span className="text-[5px] font-mono text-white/40">{eqValues[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL 4: Master Volume (Fader Style) */}
        <div className="w-32 flex flex-col items-center justify-center gap-2 px-6 border-r border-black/40 relative">
          <span className="text-[6px] font-mono text-white/20 uppercase tracking-[0.4em]">Master</span>
          <div className="h-28 w-10 flex flex-col items-center gap-1">
            <SkeuoSlider 
              value={[volume * 100]} 
              max={100} 
              onValueChange={(v) => setVolume(v[0] / 100)}
              variant="green"
              orientation="vertical"
              className="flex-1 w-full"
            />
            <span className="text-[7px] font-mono text-white/40">{Math.round(volume * 100)}</span>
          </div>
        </div>

        {/* PANEL 5: Signal Analysis */}
        <div className="w-64 flex flex-col items-center justify-center gap-3 pl-8 relative">
          <span className="text-[6px] font-mono text-white/20 uppercase tracking-[0.4em]">Signal</span>
          <VUMeter engine={engine} isPlaying={isPlaying} />
          
          {/* Master Power Indication */}
          <div className="flex items-center gap-2 mt-1">
            <div className={cn(
              "w-2 h-2 rounded-full border border-black/60 transition-all duration-300",
              isPlaying ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" : "bg-zinc-800"
            )} />
            <span className="text-[5px] font-mono text-white/20 uppercase tracking-widest">Power Activity</span>
          </div>
        </div>

      </div>

      {/* Ventilation Details */}
      <div className="absolute top-2 right-12 flex gap-1 opacity-20">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-8 h-[2px] bg-black shadow-[0_1px_0_rgba(255,255,255,0.05)]" />
        ))}
      </div>

      {/* Expanded Overlay Logic */}
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
