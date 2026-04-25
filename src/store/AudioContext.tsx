'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AudioEngine } from '@/audio/Engine';

interface AudioContextType {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  trackInfo: { title: string; artist: string };
  play: () => void;
  pause: () => void;
  playTone: () => void;
  setVolume: (v: number) => void;
  loadTrack: (url: string, title: string, artist: string) => Promise<void>;
  engine: AudioEngine | null;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.5);
  const [trackInfo, setTrackInfo] = useState({ title: 'NO SIGNAL', artist: 'UNKNOWN' });
  
  const engineRef = useRef<AudioEngine | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { AudioEngine } = require('@/audio/Engine');
      engineRef.current = new AudioEngine();
      engineRef.current?.setVolume(volume);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (engineRef.current) {
        const state = engineRef.current.getPlaybackState();
        setIsPlaying(state.isPlaying);
        setCurrentTime(state.currentTime);
        setDuration(state.duration);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const play = () => engineRef.current?.play();
  const pause = () => engineRef.current?.pause();
  const playTone = () => {
    engineRef.current?.playTone();
    setTrackInfo({ title: 'SYSTEM_DIAGNOSTIC_TONE', artist: 'VOID_OS' });
  };
  const setVolume = (v: number) => {
    setVolumeState(v);
    engineRef.current?.setVolume(v);
  };

  const loadTrack = async (url: string, title: string, artist: string) => {
    await engineRef.current?.loadTrack(url);
    setTrackInfo({ title, artist });
    engineRef.current?.play();
  };

  return (
    <AudioContext.Provider value={{
      isPlaying,
      currentTime,
      duration,
      volume,
      trackInfo,
      play,
      pause,
      playTone,
      setVolume,
      loadTrack,
      engine: engineRef.current
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
