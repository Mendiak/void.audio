'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Player } from '@/components/Player';
import { AsciiVisualizer } from '@/visuals/AsciiVisualizer';
import { BootScreen } from '@/components/BootScreen';
import { useAudio } from '@/store/AudioContext';
import { motion } from 'framer-motion';
import { Terminal, Activity, Zap } from 'lucide-react';

export default function Home() {
  const { loadTrack, isPlaying, trackInfo, playTone } = useAudio();

  const [mounted, setMounted] = React.useState(false);
  const nodeId = React.useMemo(() => Math.random().toString(16).slice(2, 8).toUpperCase(), []);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartSample = () => {
    // Using a sample MP3 from a CDN for demonstration
    loadTrack(
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      'SIGNAL_ALPHA_01',
      'VOID_SYSTEMS'
    );
  };

  return (
    <main className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      <BootScreen />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col relative overflow-hidden bg-zinc-950">
          {/* Header Bar */}
          <div className="h-12 border-b border-border/50 px-6 flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-mono text-primary/70 uppercase tracking-widest">
                <Terminal size={12} />
                <span>Console active</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">
                <Activity size={12} />
                <span>Buffer: 100%</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground/30">
              <span>LATENCY: 0.04ms</span>
              <span>NODE_ID: {mounted ? nodeId : '------'}</span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6 relative">
            {!isPlaying && trackInfo.title === 'NO SIGNAL' ? (
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 text-center"
                >
                  <div className="w-16 h-16 border border-primary/20 flex items-center justify-center bg-primary/5">
                    <Zap size={32} className="text-primary animate-pulse" />
                  </div>
                  <h2 className="text-xl font-mono uppercase tracking-[0.2em] crt-glow">Initialize Signal</h2>
                  <p className="text-xs text-muted-foreground max-w-xs font-mono">
                    System awaiting audio input. Load local signal or connect to external stream.
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={handleStartSample}
                      className="px-6 py-2 border border-primary text-primary text-xs font-mono uppercase tracking-widest hover:bg-primary/10 transition-all active:scale-95"
                    >
                      Load External Signal
                    </button>
                    <button
                      onClick={playTone}
                      className="px-6 py-2 border border-white/20 text-white/50 text-xs font-mono uppercase tracking-widest hover:bg-white/5 transition-all active:scale-95"
                    >
                      Run System Diagnostic
                    </button>
                  </div>
                </motion.div>
              </div>
            ) : (
              <AsciiVisualizer />
            )}
          </div>

          {/* Background Text Layer */}
          <div className="absolute bottom-10 left-10 pointer-events-none select-none opacity-5">
            <h1 className="text-[120px] font-bold font-mono tracking-tighter leading-none">
              VOID<br />AUDIO
            </h1>
          </div>
        </div>
      </div>

      <Player />
      
      {/* Global Overlays */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,65,0.02)_0%,rgba(0,0,0,0)_100%)]" />
      </div>
    </main>
  );
}
