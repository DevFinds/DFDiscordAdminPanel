import React from 'react';
import { useThemeContext, THEMES } from '../contexts/ThemeContext';
import { cn } from '../utils/cn';

// Theme Icons
const SunIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

const MoonIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

const SystemIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <line x1="8" y1="21" x2="16" y2="21" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <line x1="12" y1="17" x2="12" y2="21" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

const ThemeToggle = ({ className }) => {
  const { theme, toggleTheme } = useThemeContext();

  const getIcon = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return <SunIcon className="w-4 h-4" />;
      case THEMES.DARK:
        return <MoonIcon className="w-4 h-4" />;
      case THEMES.SYSTEM:
        return <SystemIcon className="w-4 h-4" />;
      default:
        return <SystemIcon className="w-4 h-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return 'Светлая тема';
      case THEMES.DARK:
        return 'Тёмная тема';
      case THEMES.SYSTEM:
        return 'Системная тема';
      default:
        return 'Системная тема';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      title={`Переключить тему (текущая: ${getLabel()})`}
      className={cn(
        "inline-flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200",
        "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
        "dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
        className
      )}
    >
      <span className="sr-only">{getLabel()}</span>
      {getIcon()}
    </button>
  );
};

export default ThemeToggle;