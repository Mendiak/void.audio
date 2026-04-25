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
