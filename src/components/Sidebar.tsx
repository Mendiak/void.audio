'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Library, Settings, Music, BarChart2, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUI } from '@/store/UIContext';
import { useAudio } from '@/store/AudioContext';
import { cn } from '@/lib/utils';

const LedIndicator = ({ active }: { active: boolean }) => (
  <div className={cn(
    "w-1 h-1 rounded-full transition-all duration-300",
    active 
      ? `bg-primary shadow-[0_0_4px_var(--primary)]` 
      : "bg-zinc-800"
  )} />
);

export function Sidebar() {
  const { activeView, setActiveView, theme, setTheme } = useUI();
  const { library, metrics } = useAudio();

  const capacity = Math.min(Math.round((library.length / 50) * 100), 100);

  const menuItems = [
    { icon: Library, label: 'Library', id: 'library' },
    { icon: Music, label: 'Playlists', id: 'playlists' },
    { icon: BarChart2, label: 'Visuals', id: 'visuals' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ] as const;

  const themes = [
    { id: 'cyan', color: '#a2e4f1' },
    { id: 'pink', color: '#ffb7c5' },
    { id: 'amber', color: '#ffd8a8' },
    { id: 'green', color: '#c1e1c1' },
    { id: 'purple', color: '#dcd3ff' },
  ] as const;

  const [uptime, setUptime] = React.useState(0);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const start = Date.now();
    const timer = setInterval(() => {
      setUptime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-64 h-full flex flex-col border-r-2 border-white/10 bg-[#1a1b1c] relative overflow-hidden shadow-[15px_0_50px_rgba(0,0,0,0.4)] z-40">
      {/* Retro Metal Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')]" />
      
      {/* Hardware Screw Details (Unified with Player) */}
      <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-zinc-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.5)] border border-black/40 z-10" />
      <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-zinc-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.5)] border border-black/40 z-10" />

      {/* Inner Shadow to simulate depth for the screen */}
      <div className="absolute top-0 right-0 bottom-0 w-4 bg-gradient-to-l from-black/40 to-transparent pointer-events-none z-10" />

      <div className="p-6 border-b border-black/40 relative z-20 pt-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 mb-1"
        >
          <div className="w-2 h-2 bg-primary shadow-[0_0_8px_var(--primary)]" />
          <h1 className="text-lg font-mono font-bold tracking-[0.1em] uppercase crt-glow">VOID.AUDIO</h1>
        </motion.div>
        <div className="text-[7px] font-mono text-white/30 uppercase tracking-[0.2em] ml-5">
          HIGH-FIDELITY SIGNAL PROCESSOR
        </div>
        <div className="h-4" />
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="h-10" /> {/* Vertical margin above the scroll area items */}
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 text-xs font-mono uppercase tracking-widest transition-all group relative",
                activeView === item.id 
                  ? "text-primary bg-primary/5 border-l-2 border-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5 border-l-2 border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={14} className={cn(
                  activeView === item.id ? "text-primary" : "text-muted-foreground/50 group-hover:text-muted-foreground"
                )} />
                <span>{item.label}</span>
              </div>
              <LedIndicator active={activeView === item.id} />
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* SYSTEM STATUS PANEL (Bottom) */}
      <div className="p-4 border-t border-black/40 bg-black/10 relative z-20">
        <div className="bg-zinc-950/80 p-3 border border-white/5 rounded-sm shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[6px] font-mono text-white/20 uppercase tracking-widest">System Status</span>
            <div className="flex gap-1">
              <div className={cn(
                "w-1 h-1 rounded-full animate-pulse",
                metrics.sampleRate > 0 ? "bg-green-500/40" : "bg-red-500/20"
              )} />
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-[8px] font-mono">
              <span className="text-white/20 uppercase">Uptime</span>
              <span className="text-primary/60">{formatUptime(uptime)}</span>
            </div>
            <div className="flex justify-between text-[8px] font-mono">
              <span className="text-white/20 uppercase">Rate</span>
              <span className="text-primary/60">{metrics.sampleRate ? `${(metrics.sampleRate / 1000).toFixed(1)} KHZ` : '0.0 KHZ'}</span>
            </div>
            <div className="flex justify-between text-[8px] font-mono">
              <span className="text-white/20 uppercase">Latency</span>
              <span className="text-primary/60">{metrics.latency ? `${(metrics.latency * 1000).toFixed(1)} MS` : '0.0 MS'}</span>
            </div>
          </div>

          <div className="pt-1 border-t border-white/5 flex items-center gap-2">
            <div className="flex-1 h-[2px] bg-zinc-900 overflow-hidden">
              <div 
                className="h-full bg-primary/30 transition-all duration-500"
                style={{ width: `${capacity}%` }}
              />
            </div>
            <span className="text-[6px] font-mono text-white/10 uppercase">Library</span>
          </div>
        </div>
      </div>
    </div>
  );
}
