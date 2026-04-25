'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'cyan' | 'pink' | 'amber' | 'green' | 'purple';
type View = 'visuals' | 'library' | 'playlists' | 'settings';

interface UIContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  activeView: View;
  setActiveView: (v: View) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('cyan');
  const [activeView, setActiveView] = useState<View>('visuals');

  useEffect(() => {
    // Apply theme class to body
    const body = document.body;
    body.classList.forEach(cls => {
      if (cls.startsWith('theme-')) body.classList.remove(cls);
    });
    body.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <UIContext.Provider value={{ theme, setTheme, activeView, setActiveView }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
}
