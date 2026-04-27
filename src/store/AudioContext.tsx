'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AudioEngine } from '@/audio/Engine';
import * as mm from 'music-metadata-browser';
import { getAllTracks, saveTrack, deleteTrack as dbDeleteTrack } from '@/lib/db';

const extractMetadata = async (file: File | Blob): Promise<{ title: string; artist: string; album?: string; cover?: string }> => {
  try {
    const metadata = await mm.parseBlob(file);
    const { title, artist, album, picture } = metadata.common;
    
    let cover;
    const activePicture = mm.selectCover(picture);
    if (activePicture) {
      const blob = new Blob([new Uint8Array(activePicture.data)], { type: activePicture.format });
      cover = URL.createObjectURL(blob);
    }
    
    return {
      title: title || (file instanceof File ? file.name.toUpperCase() : 'UNKNOWN_TRACK'),
      artist: artist || 'UNKNOWN_SOURCE',
      album: album || 'SINGLE_PROCESS',
      cover
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {
      title: file instanceof File ? file.name.toUpperCase() : 'UNKNOWN_TRACK',
      artist: 'LOCAL_SIGNAL',
      album: 'OFFLINE_STORAGE'
    };
  }
};

interface Track {
  id: string;
  file: File | Blob;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  cover?: string;
}

interface AudioContextType {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  trackInfo: { title: string; artist: string; cover?: string };
  play: () => void;
  pause: () => void;
  setVolume: (v: number) => void;
  seek: (time: number) => void;
  loadLocalFile: (file: File) => Promise<void>;
  library: Array<Track>;
  addToLibrary: (files: FileList | File[]) => void;
  removeFromLibrary: (id: string) => void;
  playTrack: (id: string) => Promise<void>;
  nextTrack: () => void;
  previousTrack: () => void;
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
  const [library, setLibrary] = useState<Array<Track>>([]);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({ latency: 0, sampleRate: 0 });
  
  const engineRef = useRef<AudioEngine | null>(null);

  // Initialize DB and load library
  useEffect(() => {
    const loadLibrary = async () => {
      const storedTracks = await getAllTracks();
      setLibrary(storedTracks);
    };
    loadLibrary();
  }, []);

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

        // Auto-next when track finishes
        if (state.duration > 0 && state.currentTime >= state.duration - 0.1 && state.isPlaying) {
          nextTrack();
        }
      }
    }, 100);
    return () => clearInterval(timer);
  }, [library, currentTrackId]);

  const play = () => engineRef.current?.play();
  const pause = () => engineRef.current?.pause();
  const setVolume = (v: number) => {
    setVolumeState(v);
    engineRef.current?.setVolume(v);
  };
  const seek = (time: number) => engineRef.current?.seek(time);

  useEffect(() => {
    if (trackInfo.title !== 'NO SIGNAL') {
      document.title = `${trackInfo.title} // VOID.AUDIO`;
    } else {
      document.title = 'VOID.AUDIO';
    }
  }, [trackInfo]);


  const playTrack = async (id: string) => {
    const track = library.find(t => t.id === id);
    if (track) {
      // Re-extract cover URL if it was lost (Blob URLs are temporary)
      if (!track.cover && track.file) {
        const meta = await extractMetadata(track.file);
        track.cover = meta.cover;
      }
      
      await engineRef.current?.loadLocalFile(track.file as File);
      setTrackInfo({ title: track.title, artist: track.artist, cover: track.cover });
      setCurrentTrackId(id);
      engineRef.current?.play();
    }
  };

  const nextTrack = () => {
    if (library.length === 0) return;
    const currentIndex = library.findIndex(t => t.id === currentTrackId);
    const nextIndex = (currentIndex + 1) % library.length;
    playTrack(library[nextIndex].id);
  };

  const previousTrack = () => {
    if (library.length === 0) return;
    const currentIndex = library.findIndex(t => t.id === currentTrackId);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = library.length - 1;
    playTrack(library[prevIndex].id);
  };

  const loadLocalFile = async (file: File) => {
    // Check if file already exists in library to avoid duplicates
    const existingTrack = library.find(t => 
      t.file instanceof File && 
      t.file.name === file.name && 
      t.file.size === file.size
    );

    if (existingTrack) {
      playTrack(existingTrack.id);
      return;
    }

    const meta = await extractMetadata(file);
    const id = Math.random().toString(36).substring(7);
    const newTrack = { id, file, ...meta };
    setLibrary(prev => [...prev, newTrack]);
    setCurrentTrackId(id);
    await saveTrack(newTrack);
    await engineRef.current?.loadLocalFile(file);
    setTrackInfo(meta);
    engineRef.current?.play();
  };

  const addToLibrary = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newTracks: Track[] = [];
    
    for (const file of fileArray) {
      // Avoid duplicates
      const exists = library.some(t => 
        t.file instanceof File && 
        t.file.name === file.name && 
        t.file.size === file.size
      ) || newTracks.some(t => 
        (t.file as File).name === file.name && 
        (t.file as File).size === file.size
      );

      if (!exists) {
        const meta = await extractMetadata(file);
        const track = {
          id: Math.random().toString(36).substring(7),
          file,
          ...meta
        };
        await saveTrack(track);
        newTracks.push(track);
      }
    }
    
    if (newTracks.length > 0) {
      setLibrary(prev => [...prev, ...newTracks]);
    }
  };

  const removeFromLibrary = async (id: string) => {
    await dbDeleteTrack(id);
    setLibrary(prev => prev.filter(t => t.id !== id));
    if (currentTrackId === id) {
      engineRef.current?.pause();
      setTrackInfo({ title: 'NO SIGNAL', artist: 'UNKNOWN' });
      setCurrentTrackId(null);
    }
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
      setVolume,
      seek,
      loadLocalFile,
      addToLibrary,
      removeFromLibrary,
      playTrack,
      nextTrack,
      previousTrack,
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
