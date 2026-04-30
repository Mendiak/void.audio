'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Player } from '@/components/Player';
import { VisualizerContainer } from '@/visuals/VisualizerContainer';
import { BootScreen } from '@/components/BootScreen';
import { useAudio } from '@/store/AudioContext';
import { useUI, THEMES } from '@/store/UIContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Activity, Zap, Package, Music, Settings as SettingsIcon, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Home() {
  const { loadLocalFile, isPlaying, trackInfo, library, addToLibrary, metrics, playTrack } = useAudio();
  const { activeView, theme, setTheme } = useUI();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [mounted, setMounted] = React.useState(false);
  const [hwInfo, setHwInfo] = React.useState({ cores: 0, platform: '' });

  React.useEffect(() => {
    setMounted(true);
    setHwInfo({
      cores: navigator.hardwareConcurrency || 0,
      platform: navigator.platform || 'UNKNOWN'
    });
  }, []);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (files.length === 1 && activeView !== 'library') {
        loadLocalFile(files[0]);
      } else {
        addToLibrary(files);
      }
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
                  <h2 className="text-xl font-mono uppercase tracking-[0.2em] crt-glow">Awaiting Music</h2>
                  <p className="text-xs text-muted-foreground max-w-xs font-mono">
                    Load a track to begin the visual experience.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2 border border-primary bg-primary/10 text-primary text-xs font-mono uppercase tracking-widest hover:bg-primary/20 transition-all active:scale-95"
                    >
                      Open Library
                    </button>
                  </div>
                </motion.div>
              </div>
            ) : (
              <VisualizerContainer />
            )}
          </div>
        );
      case 'library':
        return (
          <div className="flex-1 p-8 font-mono space-y-8 h-full overflow-hidden flex flex-col">
            <div className="flex items-end justify-between border-b border-border/20 pb-6 shrink-0">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tighter uppercase flex items-center gap-4">
                  <Package className="text-primary" />
                  Library
                </h2>
              </div>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group relative px-8 py-3 border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Zap size={14} className="text-primary" />
                  <span className="text-xs uppercase tracking-widest text-primary">Add Music</span>
                </div>
              </button>
            </div>

            <div className="flex-1 overflow-hidden border border-border/10 bg-black/20">
              <ScrollArea className="h-full">
                {library.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-6 min-h-[400px]">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center gap-6 text-center"
                    >
                      <div className="w-16 h-16 border border-primary/20 flex items-center justify-center bg-primary/5">
                        <Zap size={32} className="text-primary animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-mono uppercase tracking-[0.2em] crt-glow">No Music Found</h3>
                        <p className="text-xs text-muted-foreground max-w-xs font-mono">
                          Your library is empty. Load your local tracks to start listening.
                        </p>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-8 py-3 border border-primary bg-primary/10 text-primary text-xs font-mono uppercase tracking-widest hover:bg-primary/20 transition-all active:scale-95 flex items-center gap-3"
                      >
                        <Package size={14} />
                        Load Local Signals
                      </button>
                    </motion.div>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/10 text-[9px] uppercase tracking-widest text-muted-foreground/40">
                        <th className="p-3 font-normal">Artist</th>
                        <th className="p-3 font-normal">Track</th>
                        <th className="p-3 font-normal">Album</th>
                        <th className="p-3 font-normal">Type</th>
                        <th className="p-3 font-normal text-right">Bitrate</th>
                        <th className="p-3 font-normal text-right">Data Size</th>
                        <th className="p-3 font-normal w-20"></th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px] uppercase tracking-tight">
                      {library.map((track) => {
                        const isActive = trackInfo.title === track.title;
                        return (
                          <tr 
                            key={track.id} 
                            className={cn(
                              "border-b border-border/5 group cursor-pointer transition-colors",
                              isActive ? "bg-primary/10" : "hover:bg-primary/5"
                            )}
                            onClick={() => playTrack(track.id)}
                          >
                            <td className="p-3 text-muted-foreground/60 font-mono flex items-center gap-3">
                              <div className={cn(
                                "w-1.5 h-1.5 rounded-full transition-all duration-500 shrink-0",
                                isActive 
                                  ? "bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]" 
                                  : "bg-zinc-800 opacity-20 group-hover:opacity-100"
                              )} />
                              <span className="truncate">{track.artist}</span>
                            </td>
                            <td className="p-3 font-bold truncate max-w-[200px]">
                              {track.title}
                            </td>
                            <td className="p-3 text-muted-foreground/40 italic truncate max-w-[150px]">
                              {track.album || 'SINGLE'}
                            </td>
                            <td className="p-3 text-muted-foreground/50">
                              {('name' in track.file) ? track.file.name.split('.').pop()?.toUpperCase() : 'RAW'}
                            </td>
                            <td className="p-3 text-right text-muted-foreground/30 font-mono">
                              320 KBPS
                            </td>
                            <td className="p-3 text-right text-muted-foreground/30 font-mono">
                              {(track.file.size / (1024 * 1024)).toFixed(2)} MB
                            </td>
                            <td className="p-3 text-right">
                              <Activity size={12} className={cn(
                                "inline-block transition-all",
                                isActive ? "text-primary animate-pulse" : "text-muted-foreground/10 opacity-0 group-hover:opacity-100"
                              )} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </ScrollArea>
            </div>
          </div>
        );
      case 'playlists':
        return (
          <div className="flex-1 p-12 font-mono space-y-8 h-full overflow-auto">
            <div className="space-y-2 border-b border-border/20 pb-6">
              <h2 className="text-2xl font-bold tracking-tighter uppercase flex items-center gap-4">
                <Music className="text-primary" />
                Playlists
              </h2>
            </div>
            <div className="space-y-4">
              {['Ambient Decay', 'Neural Beats', 'Static Void'].map((name, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-border/10 bg-black/40 hover:border-primary/30 cursor-pointer group transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-primary/40 group-hover:shadow-[0_0_8px_var(--primary)] transition-all" />
                    <span className="text-primary/20 group-hover:text-primary font-mono">0{i+1}</span>
                    <span className="uppercase tracking-widest text-sm font-bold group-hover:text-primary transition-colors">{name}</span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="flex gap-1">
                      {[1, 2, 3].map(j => (
                        <div key={j} className="w-0.5 h-3 bg-primary/10 group-hover:bg-primary/30 transition-colors" />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground/20 uppercase tracking-widest">Listen</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="flex-1 p-8 font-mono space-y-12 h-full overflow-auto">
            <div className="space-y-2 border-b border-border/20 pb-6">
              <h2 className="text-2xl font-bold tracking-tighter uppercase flex items-center gap-4">
                <SettingsIcon className="text-primary" />
                Settings
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-[10px] text-primary uppercase tracking-[0.3em]">
                  <Zap size={12} />
                  Theme Selection
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {THEMES.map((t: { id: any; color: string; name: string }) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        "flex items-center justify-between p-4 border transition-all group",
                        theme === t.id 
                          ? "bg-primary/10 border-primary text-primary" 
                          : "bg-black/20 border-white/5 text-muted-foreground hover:border-white/20"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" 
                          style={{ backgroundColor: t.color }}
                        />
                        <span className="text-xs uppercase tracking-widest">{t.name}</span>
                      </div>
                      {theme === t.id && <Activity size={12} className="animate-pulse" />}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-2 text-[10px] text-primary uppercase tracking-[0.3em]">
                  <Info size={12} />
                  About
                </div>
                  <div className="bg-black/40 border border-white/5 p-6 space-y-4">
                    {[
                      { label: 'Version', value: '1.0.0' },
                      { label: 'Renderer', value: 'High Fidelity' },
                      { label: 'Engine', value: 'Void Core' },
                      { label: 'Status', value: 'Optimal' }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0">
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground/40">{item.label}</span>
                        <span className="text-[10px] text-white/60">{item.value}</span>
                      </div>
                    ))}
                  </div>
              </section>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="h-screen w-screen flex flex-col bg-[#050505] text-foreground overflow-hidden relative">
      {/* GLOBAL CRT OVERLAY EFFECTS */}
      <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
        <div className="scanline" />
      </div>

      <BootScreen />
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="audio/*" 
        multiple
        className="hidden" 
      />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        
        <div className="flex-1 flex flex-col relative overflow-hidden bg-black">
          {/* Top 'Lip' of the chassis wrapping the screen */}
          <div className="h-2 bg-[#1a1b1c] border-b border-white/5 shrink-0" />
          <div className="absolute top-2 left-0 right-0 h-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

          {/* Dynamic Content Area (The 'Screen') */}
          <div className="flex-1 overflow-hidden relative shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]">
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
      
      {/* Discreet Footer Credits */}
      <footer className="mt-2 py-2 px-8 text-[10px] font-mono text-white/30 flex justify-end shrink-0 pointer-events-auto tracking-widest uppercase">
        <span className="pointer-events-auto">
          Engineered by <a href="https://mendiak.github.io/portfolio/" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-orange-500/80 transition-colors border-b border-white/10 hover:border-orange-500/40 ml-1">Mikel Aramendia</a>
        </span>
      </footer>
    </main>
  );
}
