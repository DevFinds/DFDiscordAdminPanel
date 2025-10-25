import { useState, useEffect } from 'react';

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || THEMES.SYSTEM;
    }
    return THEMES.SYSTEM;
  });

  const [resolvedTheme, setResolvedTheme] = useState('light');

  useEffect(() => {
    const root = window.document.documentElement;
    
    const updateTheme = (newTheme) => {
      root.classList.remove('light', 'dark');
      
      if (newTheme === THEMES.SYSTEM) {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
        setResolvedTheme(systemTheme);
      } else {
        root.classList.add(newTheme);
        setResolvedTheme(newTheme);
      }
    };

    // Apply theme on mount and when theme changes
    updateTheme(theme);

    // Listen for system theme changes when using system theme
    if (theme === THEMES.SYSTEM) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateTheme(THEMES.SYSTEM);
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return {
    theme,
    resolvedTheme,
    setTheme: changeTheme,
    toggleTheme: () => {
      if (theme === THEMES.LIGHT) {
        changeTheme(THEMES.DARK);
      } else if (theme === THEMES.DARK) {
        changeTheme(THEMES.SYSTEM);
      } else {
        changeTheme(THEMES.LIGHT);
      }
    }
  };
}