'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AudioEngine } from '@/audio/Engine';
import * as mm from 'music-metadata-browser';

const extractMetadata = async (file: File): Promise<{ title: string; artist: string; cover?: string }> => {
  try {
    const metadata = await mm.parseBlob(file);
    const { title, artist, picture } = metadata.common;
    
    let cover;
    const activePicture = mm.selectCover(picture);
    if (activePicture) {
      const blob = new Blob([new Uint8Array(activePicture.data)], { type: activePicture.format });
      cover = URL.createObjectURL(blob);
    }
    
    return {
      title: title || file.name.toUpperCase(),
      artist: artist || 'UNKNOWN_SOURCE',
      cover
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {
      title: file.name.toUpperCase(),
      artist: 'LOCAL_SIGNAL'
    };
  }
};

interface AudioContextType {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  trackInfo: { title: string; artist: string; cover?: string };
  play: () => void;
  pause: () => void;
  playTone: () => void;
  setVolume: (v: number) => void;
  loadTrack: (url: string, title: string, artist: string, cover?: string) => Promise<void>;
  loadLocalFile: (file: File) => Promise<void>;
  library: Array<{ id: string; file: File; title: string; artist: string; duration?: number; cover?: string }>;
  addToLibrary: (files: FileList | File[]) => void;
  metrics: { latency: number; sampleRate: number };
  engine: AudioEngine | null;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.5);
  const [trackInfo, setTrackInfo] = useState<{ title: string; artist: string; cover?: string }>({ title: 'NO SIGNAL', artist: 'UNKNOWN' });
  const [library, setLibrary] = useState<Array<{ id: string; file: File; title: string; artist: string; duration?: number; cover?: string }>>([]);
  const [metrics, setMetrics] = useState({ latency: 0, sampleRate: 0 });
  
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
        const sysMetrics = engineRef.current.getSystemMetrics();
        setIsPlaying(state.isPlaying);
        setCurrentTime(state.currentTime);
        setDuration(state.duration);
        setMetrics(sysMetrics);
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

  useEffect(() => {
    if (trackInfo.title !== 'NO SIGNAL') {
      document.title = `${trackInfo.title} // VOID.AUDIO`;
    } else {
      document.title = 'VOID.AUDIO';
    }
  }, [trackInfo]);

  const loadTrack = async (url: string, title: string, artist: string, cover?: string) => {
    await engineRef.current?.loadTrack(url);
    setTrackInfo({ title, artist, cover });
    engineRef.current?.play();
  };

  const loadLocalFile = async (file: File) => {
    const meta = await extractMetadata(file);
    await engineRef.current?.loadLocalFile(file);
    setTrackInfo(meta);
    engineRef.current?.play();
  };

  const addToLibrary = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newTracks = await Promise.all(fileArray.map(async file => {
      const meta = await extractMetadata(file);
      return {
        id: Math.random().toString(36).substring(7),
        file,
        ...meta
      };
    }));
    setLibrary(prev => [...prev, ...newTracks]);
  };

  return (
    <AudioContext.Provider value={{
      isPlaying,
      currentTime,
      duration,
      volume,
      trackInfo,
      library,
      play,
      pause,
      playTone,
      setVolume,
      loadTrack,
      loadLocalFile,
      addToLibrary,
      metrics,
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
