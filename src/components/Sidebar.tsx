'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Library, Settings, Music, BarChart2, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUI } from '@/store/UIContext';
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
        <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">
          <Cpu size={10} />
          <span>Kernel: v2.4.0</span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="px-3 mb-4 text-[10px] font-mono text-muted-foreground/30 uppercase tracking-[0.3em]">
          Data Nodes
        </div>
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

        <div className="mt-8 px-3">
          <h3 className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-[0.2em] mb-4">
            Color Spectrum
          </h3>
          <div className="flex items-center justify-between gap-2 px-1">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "w-4 h-4 rounded-full border border-white/10 transition-all hover:scale-125 active:scale-90 shadow-sm",
                  theme === t.id ? "ring-2 ring-primary ring-offset-2 ring-offset-black" : ""
                )}
                style={{ backgroundColor: t.color }}
              />
            ))}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/20 bg-black/40">
        <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground/30 uppercase">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/20 shadow-[0_0_4px_rgba(34,197,94,0.4)]" />
            <span>Link established</span>
          </div>
          <span>Uptime: 04:21:00</span>
        </div>
      </div>
    </div>
  );
}
