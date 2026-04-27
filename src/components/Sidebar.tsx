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
  const { library } = useAudio();

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
    <div className="w-64 h-full flex flex-col border-r border-border bg-black/40 backdrop-blur-md relative overflow-hidden">
      <div className="p-6 border-b border-border/20">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 mb-1"
        >
          <div className="w-2 h-2 bg-primary shadow-[0_0_8px_var(--primary)]" />
          <h1 className="text-lg font-mono font-bold tracking-[0.1em] uppercase crt-glow">VOID.AUDIO</h1>
        </motion.div>
        <div className="h-4" />
      </div>

      <ScrollArea className="flex-1 px-3 py-4">

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


    </div>
  );
}
