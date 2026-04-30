'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useAudio } from '@/store/AudioContext';
import { motion } from 'framer-motion';
import { Zap, Package, Activity } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const LibraryView = () => {
  const { library, trackInfo, playTrack, removeFromLibrary } = useAudio();
  const [sortBy, setSortBy] = React.useState<keyof typeof library[0] | null>(null);
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  
  const sortedLibrary = [...library].sort((a, b) => {
    if (!sortBy) return 0;
    const aVal = (a[sortBy] ?? '') as string;
    const bVal = (b[sortBy] ?? '') as string;
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof typeof library[0]) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <>
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
          </motion.div>
        </div>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/10 text-[9px] uppercase tracking-widest text-muted-foreground/40">
              {['artist', 'title', 'album'].map((field) => (
                <th 
                  key={field} 
                  className="p-2 font-normal cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort(field as any)}
                >
                  {field}
                </th>
              ))}
              <th className="p-2 font-normal">Type</th>
              <th className="p-2 font-normal text-right">Bitrate</th>
              <th className="p-2 font-normal text-right">Data Size</th>
              <th className="p-2 font-normal w-12"></th>
            </tr>
            </thead>
            <tbody className="text-[11px] uppercase tracking-tight">
            {sortedLibrary.map((track) => {
              const isActive = trackInfo.title === track.title;
              return (
                <tr 
                  key={track.id} 
                  className={cn(
                    "border-b border-border/5 group cursor-pointer transition-colors",
                    isActive 
                      ? "bg-primary/10 border-l-2 border-l-primary shadow-[inset_0_0_10px_rgba(var(--primary-rgb),0.1)]" 
                      : "hover:bg-primary/5"
                  )}
                >
                  <td className="p-1.5 text-muted-foreground/60 font-mono flex items-center gap-3" onClick={() => playTrack(track.id)}>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-500 shrink-0",
                      isActive 
                        ? "bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)] scale-125" 
                        : "bg-zinc-800 opacity-20 group-hover:opacity-100"
                    )} />
                    <span className={cn("truncate transition-colors", isActive ? "text-primary font-bold" : "")}>
                      {track.artist}
                    </span>
                  </td>
                  <td className={cn("p-1.5 font-bold truncate max-w-[200px] transition-colors", isActive ? "text-primary" : "")} onClick={() => playTrack(track.id)}>
                    {track.title}
                  </td>
                  <td className="p-1.5 text-muted-foreground/40 italic truncate max-w-[150px]" onClick={() => playTrack(track.id)}>
                    {track.album || 'SINGLE'}
                  </td>
                  <td className="p-1.5 text-muted-foreground/50" onClick={() => playTrack(track.id)}>
                    {('name' in track.file) ? track.file.name.split('.').pop()?.toUpperCase() : 'RAW'}
                  </td>
                  <td className="p-1.5 text-right text-muted-foreground/30 font-mono" onClick={() => playTrack(track.id)}>
                    320 KBPS
                  </td>
                  <td className="p-1.5 text-right text-muted-foreground/30 font-mono" onClick={() => playTrack(track.id)}>
                    {(track.file.size / (1024 * 1024)).toFixed(2)} MB
                  </td>
                  <td className="p-1.5 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFromLibrary(track.id); }}
                      className="text-muted-foreground/20 hover:text-red-500 transition-colors p-0.5"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
            </tbody>        </table>
      )}
    </>
  );
};
