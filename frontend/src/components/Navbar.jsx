import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

// Icons
const LogoutIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
  </svg>
);

const SettingsIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);

function Navbar({ user, onLogout }) {
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
    : '/default-avatar.png';

  return (
    <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/dashboard" 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
              <span className="text-white text-sm font-bold">DF</span>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              DevFinds Admin Panel
            </span>
          </Link>
          
          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* User Menu */}
            <div className="flex items-center gap-3">
              {/* User Avatar & Info */}
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-default">
                <img 
                  src={avatarUrl} 
                  alt={user.username} 
                  className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-400 transition-colors"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iMTYiIGZpbGw9IiNFMkU4RjAiLz4KPHBhdGggZD0iTTE2IDEyQzE3LjEwNDYgMTIgMTggMTEuMTA0NiAxOCAxMEMxOCA4Ljg5NTQzIDE3LjEwNDYgOCAxNiA4QzE0Ljg5NTQgOCAxNCA4Ljg5NTQzIDE0IDEwQzE0IDExLjEwNDYgMTQuODk1NCAxMiAxNiAxMlpNMjAgMjBDMjAgMTYuNjg2MyAxOC4zMTM3IDE0IDE2IDE0QzEzLjY4NjMgMTQgMTIgMTYuNjg2MyAxMiAyMEgyMFoiIGZpbGw9IiM5Q0E0QjQiLz4KPC9zdmc+';
                  }}
                />
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {user.username}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Администратор
                  </div>
                </div>
              </div>
              
              {/* Divider */}
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />
              
              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                title="Выйти из аккаунта"
              >
                <LogoutIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Выход</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;