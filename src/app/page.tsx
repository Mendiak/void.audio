'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Player } from '@/components/Player';
import { AsciiVisualizer } from '@/visuals/AsciiVisualizer';
import { BootScreen } from '@/components/BootScreen';
import { useAudio } from '@/store/AudioContext';
import { useUI } from '@/store/UIContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Activity, Zap, Package, Music, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const { loadTrack, loadLocalFile, isPlaying, trackInfo, playTone } = useAudio();
  const { activeView } = useUI();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [mounted, setMounted] = React.useState(false);
  const nodeId = React.useMemo(() => Math.random().toString(16).slice(2, 8).toUpperCase(), []);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartSample = () => {
    loadTrack(
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      'SIGNAL_ALPHA_01',
      'VOID_SYSTEMS'
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadLocalFile(file);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'visuals':
        return (
          <div className="flex-1 p-6 relative h-full">
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
                  <div className="flex flex-wrap justify-center gap-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2 border border-primary bg-primary/10 text-primary text-xs font-mono uppercase tracking-widest hover:bg-primary/20 transition-all active:scale-95"
                    >
                      Load Local Signal
                    </button>
                    <button
                      onClick={handleStartSample}
                      className="px-6 py-2 border border-white/20 text-white/50 text-xs font-mono uppercase tracking-widest hover:bg-white/5 transition-all active:scale-95"
                    >
                      Stream External
                    </button>
                    <button
                      onClick={playTone}
                      className="px-6 py-2 border border-white/10 text-white/30 text-xs font-mono uppercase tracking-widest hover:bg-white/5 transition-all active:scale-95"
                    >
                      Diagnostic Tone
                    </button>
                  </div>
                </motion.div>
              </div>
            ) : (
              <AsciiVisualizer />
            )}
          </div>
        );
      case 'library':
        return (
          <div className="flex-1 p-12 font-mono space-y-8 h-full overflow-auto">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tighter uppercase flex items-center gap-4">
                <Package className="text-primary" />
                Audio Repository
              </h2>
              <div className="h-0.5 w-32 bg-primary/30" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="border border-border/50 p-6 space-y-4 hover:border-primary/50 transition-colors bg-white/5 group cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 border border-primary/20 flex items-center justify-center text-primary/40 group-hover:text-primary transition-colors">
                      {i}
                    </div>
                    <div className="text-[10px] text-muted-foreground/30">TYPE: .FLAC</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold uppercase tracking-tight">DATA_STREAM_{i}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">ARCHIVE_NODE_{i}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'playlists':
        return (
          <div className="flex-1 p-12 font-mono space-y-8 h-full overflow-auto">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tighter uppercase flex items-center gap-4">
                <Music className="text-primary" />
                Signal Chains
              </h2>
              <div className="h-0.5 w-32 bg-primary/30" />
            </div>
            <div className="space-y-4">
              {['Ambient Decay', 'Neural Beats', 'Static Void'].map((name, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-border/20 hover:bg-white/5 cursor-pointer group">
                  <div className="flex items-center gap-6">
                    <span className="text-primary/20 group-hover:text-primary">0{i+1}</span>
                    <span className="uppercase tracking-widest">{name}</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1 h-1 bg-primary/40" />
                    <div className="w-1 h-1 bg-primary/40" />
                    <div className="w-1 h-1 bg-primary/40" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="flex-1 p-12 font-mono space-y-8 h-full overflow-auto">
             <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tighter uppercase flex items-center gap-4">
                <SettingsIcon className="text-primary" />
                System Config
              </h2>
              <div className="h-0.5 w-32 bg-primary/30" />
            </div>
            <div className="max-w-md space-y-6">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-widest">FFT Resolution</label>
                <div className="flex gap-2">
                  {[256, 512, 1024, 2048].map(size => (
                    <button key={size} className={cn(
                      "px-4 py-2 border text-[10px]",
                      size === 1024 ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"
                    )}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      <BootScreen />
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="audio/*" 
        className="hidden" 
      />

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

          {/* Dynamic Content Area */}
          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 overflow-auto"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <Player />
    </main>
  );
}
