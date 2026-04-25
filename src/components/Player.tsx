'use client';

import React from 'react';
import { useAudio } from '@/store/AudioContext';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const BarVisualizer = ({ engine, isPlaying }: { engine: any, isPlaying: boolean }) => {
  const [data, setData] = React.useState<Uint8Array>(new Uint8Array(12).fill(0));

  React.useEffect(() => {
    if (!isPlaying || !engine) {
      if (!isPlaying) setData(new Uint8Array(12).fill(0));
      return;
    }

    let animationFrameId: number;
    const update = () => {
      const freqData = engine.getFrequencyData();
      if (freqData && freqData.length > 0) {
        // Skip the first 2 bins (often DC offset/extreme bass noise)
        const offset = 2;
        const simplified = new Uint8Array(12);
        // Map 12 bars over the remaining frequency range, slightly weighted towards lower-mids
        const totalBins = freqData.length - offset;
        for (let i = 0; i < 12; i++) {
          // Logarithmic-ish sampling to better reflect human hearing
          const index = offset + Math.floor(Math.pow(i / 11, 1.5) * (totalBins - 1));
          simplified[i] = freqData[index] || 0;
        }
        setData(simplified);
      }
      animationFrameId = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, engine]);

  return (
    <>
      {Array.from(data).map((val, i) => (
        <div 
          key={i} 
          className="w-[2px] bg-primary transition-all duration-75"
          style={{ 
            height: val > 5 ? `${(val / 255) * 100}%` : '2px',
            opacity: val > 5 ? 0.3 + (val / 255) * 0.7 : 0.1
          }}
        />
      ))}
    </>
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
    engine,
    metrics
  } = useAudio();

  const [isExpanded, setIsExpanded] = React.useState(false);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="h-24 border-t border-border/50 bg-black/60 backdrop-blur-xl flex items-center px-8 gap-8 relative overflow-hidden shrink-0">
      {/* Expanded Signal View Overlay */}
      {isExpanded && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-12"
          onClick={() => setIsExpanded(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-2xl w-full aspect-square border border-primary/30 bg-black/40 relative group overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {trackInfo.cover ? (
              <img src={trackInfo.cover} className="w-full h-full object-contain" alt="Signal Identity" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/5">
                <Activity size={128} className="text-primary/10 animate-pulse" />
              </div>
            )}
            
            {/* HUD Overlays */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8">
              {/* Top Row: Meta & Diagnostics */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary animate-ping rounded-full" />
                    <span className="text-[10px] text-primary uppercase tracking-[0.4em] font-mono">Signal_Diagnostic_Active</span>
                  </div>
                  <h2 className="text-3xl font-bold uppercase tracking-tighter crt-glow text-white/90">{trackInfo.title}</h2>
                  <div className="text-xs text-primary/60 uppercase tracking-widest font-mono">{trackInfo.artist}</div>
                </div>
                
                <div className="bg-black/60 border border-primary/20 backdrop-blur-md p-4 space-y-2 min-w-[140px]">
                  <div className="text-[8px] text-primary/40 uppercase tracking-widest border-b border-primary/10 pb-1 mb-2">Sync_Metrics</div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-primary/40">POS:</span>
                    <span className="text-primary">{formatTime(currentTime)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-primary/40">LEN:</span>
                    <span className="text-primary">{formatTime(duration)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-primary/40">FRQ:</span>
                    <span className="text-primary">{(metrics.sampleRate / 1000).toFixed(1)}kHz</span>
                  </div>
                </div>
              </div>

              {/* Grid lines effect */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#var(--primary)_1px,transparent_1px),linear-gradient(to_bottom,#var(--primary)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.03]" />

              {/* Bottom Row: Hardware Status */}
              <div className="flex justify-between items-end">
                <div className="text-[8px] font-mono text-primary/30 max-w-[200px] leading-relaxed">
                  CORE_ANALYSIS_COMPLETE // SIGNAL_STABILITY: NOMINAL // 
                  DECRYPTING_METADATA_STREAM... DONE
                </div>
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-1 h-4 bg-primary/10 relative overflow-hidden">
                      <motion.div 
                        animate={{ y: [16, -16] }}
                        transition={{ duration: 1 + Math.random(), repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-primary/40"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Corners */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-primary/40" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-primary/40" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-primary/40" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-primary/40" />
            </div>

            <button 
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 p-2 text-primary/40 hover:text-primary transition-colors z-50"
            >
              <div className="text-[10px] font-mono uppercase tracking-widest">Close_View [X]</div>
            </button>
          </motion.div>
        </motion.div>
      )}
      {/* Hardware Accents */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      {/* Track Info Container */}
      <div className="w-80 shrink-0">
        <div className="flex items-center gap-6">
          {/* Signal Identity (Cover Art Slot) */}
          <div 
            className="relative group cursor-pointer" 
            onClick={() => setIsExpanded(true)}
            title="Expand Signal Identity"
          >
            <div className="w-12 h-12 border border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden relative">
              {trackInfo.cover ? (
                <img 
                  src={trackInfo.cover} 
                  alt="Signal Source" 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
                />
              ) : (
                /* Placeholder Graphic */
                <div className="w-6 h-6 border-2 border-primary/10 rotate-45 flex items-center justify-center group-hover:rotate-90 transition-transform duration-700">
                  <div className="w-2 h-2 bg-primary/20 animate-pulse" />
                </div>
              )}
              
              {/* Decorative Scanline */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-10" />

              {/* Technical Corners */}
              <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-primary/40 z-20" />
              <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-primary/40 z-20" />
            </div>
            
            {/* Status LED */}
            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)] z-30" />
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.3em] flex items-center gap-2">
              <div className="w-1 h-1 bg-primary/40 rounded-full" />
              Signal Locked
            </div>
            <div className="text-sm font-bold tracking-tighter uppercase crt-glow truncate">
              {trackInfo.title}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">
                {trackInfo.artist}
              </div>
              {/* Minimalist Bar Visualizer */}
              <div className="flex items-end gap-[2px] h-3 shrink-0">
                <BarVisualizer engine={engine} isPlaying={isPlaying} />
              </div>
            </div>
          </div>
        </div>
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
              onValueChange={(v) => {
                const val = Array.isArray(v) ? v[0] : v;
                setVolume(val / 100);
              }}
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
