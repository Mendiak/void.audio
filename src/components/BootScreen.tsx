'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LOGS = [
  'INITIALIZING AUDIO_CORE...',
  'CALIBRATING INTERFACE...',
  'ESTABLISHING CONNECTION...',
  'VOID.AUDIO READY.',
];

export function BootScreen() {
  const [logs, setLogs] = useState<{ text: string, time: string }[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let current = 0;
    const interval = setInterval(() => {
      if (current < BOOT_LOGS.length) {
        setLogs(prev => [...prev, { 
          text: BOOT_LOGS[current], 
          time: new Date().toLocaleTimeString() 
        }]);
        current++;
      } else {
        clearInterval(interval);
        setTimeout(() => setIsComplete(true), 1000);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {!isComplete && mounted && (
        <motion.div
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-start justify-start p-12 font-mono text-primary overflow-hidden"
        >
          <div className="flex items-center gap-4 mb-12">
            <div className="w-8 h-8 bg-primary animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tighter crt-glow">VOID.AUDIO</h1>
          </div>

          <div className="space-y-1">
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs tracking-widest uppercase flex items-center gap-2"
              >
                <span className="text-primary/30">[{log.time}]</span>
                <span>{log.text}</span>
              </motion.div>
            ))}
            {!isComplete && logs.length < BOOT_LOGS.length && (
              <div className="w-2 h-4 bg-primary animate-pulse inline-block align-middle ml-2" />
            )}
          </div>


          <div className="scanline" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
