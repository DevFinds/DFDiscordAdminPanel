import React from 'react';
import { auth } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';

// Modern Discord Icon
const DiscordIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.010c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.197.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

// Feature Icons
const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
  </svg>
);

const ShieldIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
  </svg>
);

const CogIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);

function Login() {
  const handleLogin = () => {
    window.location.href = auth.loginUrl();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-500">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg hover:scale-105 transition-transform duration-200">
              <DiscordIcon className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-3">
              DevFinds Admin Panel
            </h1>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Профессиональная панель управления Discord серверами
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: UsersIcon, title: 'Участники', desc: 'Управление' },
              { icon: ShieldIcon, title: 'Роли', desc: 'Права доступа' },
              { icon: CogIcon, title: 'Настройки', desc: 'Кастомизация' }
            ].map((feature, index) => (
              <div 
                key={index}
                className="text-center p-4 rounded-xl bg-white/50 dark:bg-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-600/50 transition-all duration-200 hover:scale-105 cursor-default group border border-slate-200/50 dark:border-slate-600/50"
              >
                <div className="text-indigo-600 dark:text-indigo-400 mb-2 flex justify-center">
                  <feature.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">{feature.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{feature.desc}</div>
              </div>
            ))}
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-[#5865F2] to-[#7289DA] hover:from-[#4752C4] hover:to-[#5B6EAE] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-3 mb-6 group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          >
            <DiscordIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
            Войти через Discord
          </button>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-slate-200 dark:border-slate-600">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Безопасная авторизация через Discord OAuth2<br/>
              Мы не храним ваши личные данные
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Powered by <span className="text-indigo-600 dark:text-indigo-400 font-semibold">DevFinds</span>
            </p>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        </div>
      </div>
    </div>
  );
}

export default Login;