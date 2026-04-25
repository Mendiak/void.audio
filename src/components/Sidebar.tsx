'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { LayoutGrid, Library, Settings, Music, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
  { icon: Library, label: 'Library', id: 'library' },
  { icon: Music, label: 'Playlists', id: 'playlists' },
  { icon: BarChart2, label: 'Visuals', id: 'visuals' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

export function Sidebar() {
  return (
    <div className="w-64 h-full flex flex-col border-r border-border bg-black/40 backdrop-blur-md">
      <div className="p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2"
        >
          <div className="w-4 h-4 bg-primary animate-pulse" />
          <h1 className="text-lg font-mono font-bold tracking-tighter crt-glow">VOID.AUDIO</h1>
        </motion.div>
        <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-widest">
          Terminal UI v0.1
        </p>
      </div>

      <Separator className="bg-border/50" />

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-mono text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all group"
            >
              <item.icon size={16} className="group-hover:scale-110 transition-transform" />
              <span className="uppercase tracking-tight">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 px-3">
          <h3 className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-[0.2em] mb-4">
            Recent Signals
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group cursor-pointer">
                <div className="text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors">
                  SIGNAL_00{i}.WAV
                </div>
                <div className="text-[10px] font-mono text-muted-foreground/30">
                  DECIBEL_RANGE: -1{i}dB
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/50">
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/50 uppercase">
          <span>System Status</span>
          <span className="text-primary/70 animate-pulse">Stable</span>
        </div>
      </div>
    </div>
  );
}
