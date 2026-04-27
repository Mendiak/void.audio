'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'cyan' | 'pink' | 'amber' | 'green' | 'purple';
export type View = 'visuals' | 'library' | 'playlists' | 'settings';
export type VisualMode = 'ascii' | 'oscilloscope' | 'spectrum' | 'matrix';

export const THEMES = [
  { id: 'cyan' as Theme, color: '#a2e4f1', name: 'CYAN_MOD' },
  { id: 'pink' as Theme, color: '#ffb7c5', name: 'PINK_FLOWER' },
  { id: 'amber' as Theme, color: '#ffd8a8', name: 'AMBER_GLOW' },
  { id: 'green' as Theme, color: '#c1e1c1', name: 'SAGE_LEAF' },
  { id: 'purple' as Theme, color: '#dcd3ff', name: 'VIOLET_DREAM' },
];

interface UIContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  activeView: View;
  setActiveView: (v: View) => void;
  visualMode: VisualMode;
  setVisualMode: (m: VisualMode) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('cyan');
  const [activeView, setActiveView] = useState<View>('library');
  const [visualMode, setVisualMode] = useState<VisualMode>('ascii');

  useEffect(() => {
    // Apply theme to document element
    document.documentElement.setAttribute('data-theme', theme);
    
    // Also keep the class for legacy support if needed
    const html = document.documentElement;
    html.classList.forEach(cls => {
      if (cls.startsWith('theme-')) html.classList.remove(cls);
    });
    html.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <UIContext.Provider value={{ 
      theme, 
      setTheme, 
      activeView, 
      setActiveView,
      visualMode,
      setVisualMode
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
}
