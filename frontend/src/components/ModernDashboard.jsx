import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { servers } from '../services/api';

// Feather Icons Component
const FeatherIcon = ({ name, className = "w-5 h-5" }) => {
  useEffect(() => {
    // Initialize feather icons if available
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  return <i data-feather={name} className={className}></i>;
};

// Theme Hook
const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const applyTheme = (newTheme) => {
    let actualTheme = newTheme;
    
    if (newTheme === 'system') {
      actualTheme = getSystemTheme();
    }
    
    if (actualTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    applyTheme(theme);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return { theme, setTheme: (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  }};
};

// Notification Hook
const useNotification = () => {
  const [isVisible, setIsVisible] = useState(false);

  const showNotification = () => {
    setIsVisible(true);
    setTimeout(() => setIsVisible(false), 3000);
  };

  return { isVisible, showNotification };
};

const ModernDashboard = ({ user, onLogout }) => {
  const { theme, setTheme } = useTheme();
  const { isVisible: notificationVisible, showNotification } = useNotification();
  const navigate = useNavigate();
  const [userServers, setUserServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load Feather Icons
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/feather-icons';
    script.onload = () => {
      if (window.feather) {
        window.feather.replace();
      }
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      setLoading(true);
      const response = await servers.getAll();
      setUserServers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading servers:', err);
      setError('Ошибка загрузки серверов');
    } finally {
      setLoading(false);
    }
  };

  const handleServerClick = (server) => {
    if (server.hasBot) {
      navigate(`/server/${server.id}`);
    } else {
      // Show bot invite link
      const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.REACT_APP_BOT_CLIENT_ID}&permissions=8&guild_id=${server.id}&scope=bot%20applications.commands`;
      window.open(inviteUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors duration-200">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-800">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-discord-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Загрузка...</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Получаем список серверов</p>
          </div>
        </div>
      </div>
    );
  }

  const allWithoutBot = userServers.length > 0 && userServers.every(s => !s.hasBot);

  return (
    <div className="font-inter bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-discord-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  D
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Discord Admin Panel</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Управление серверами</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Theme Switcher */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-md hover:bg-white dark:hover:bg-gray-700 transition-colors ${
                  theme === 'light' ? 'bg-white dark:bg-gray-700' : ''
                }`}
              >
                <FeatherIcon name="sun" className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`p-2 rounded-md hover:bg-white dark:hover:bg-gray-700 transition-colors ${
                  theme === 'system' ? 'bg-white dark:bg-gray-700' : ''
                }`}
              >
                <FeatherIcon name="monitor" className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-md hover:bg-white dark:hover:bg-gray-700 transition-colors ${
                  theme === 'dark' ? 'bg-white dark:bg-gray-700' : ''
                }`}
              >
                <FeatherIcon name="moon" className="w-4 h-4" />
              </button>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-700">
              <img 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=5865F2&color=fff`} 
                alt="User" 
                className="w-8 h-8 rounded-full" 
              />
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user?.username || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'user@example.com'}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Выйти"
              >
                <FeatherIcon name="log-out" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Ваши серверы</h2>
            <p className="text-gray-500 dark:text-gray-400">Выберите сервер для управления или добавьте бота</p>
          </div>
          
          {/* Warning for servers without bot */}
          {allWithoutBot && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <FeatherIcon name="alert-triangle" className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Чтобы использовать админ-панель:</h3>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                    На ваши серверы нужно добавить Discord-бота. Нажмите «Пригласить бота» под нужным сервером.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <FeatherIcon name="alert-circle" className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-200">Ошибка</h3>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
                  <button
                    onClick={loadServers}
                    className="mt-2 px-3 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 text-sm rounded-md hover:bg-red-200 dark:hover:bg-red-700"
                  >
                    Повторить
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Server Grid */}
          {userServers.length === 0 && !error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FeatherIcon name="server" className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Нет доступных серверов</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                У вас нет серверов, где вы администратор
              </p>
              <button
                onClick={loadServers}
                className="px-4 py-2 bg-discord-500 text-white rounded-lg hover:bg-discord-600"
              >
                Обновить
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userServers.map(server => {
                const iconUrl = server.icon 
                  ? `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png?size=256`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(server.name)}&background=5865F2&color=fff&size=256`;
                
                return (
                  <div
                    key={server.id}
                    onClick={() => handleServerClick(server)}
                    className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-discord-300 dark:hover:border-discord-600 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative">
                        <img
                          src={iconUrl}
                          alt={server.name}
                          className="w-12 h-12 rounded-xl"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(server.name)}&background=5865F2&color=fff&size=256`;
                          }}
                        />
                        {server.hasBot && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-discord-600 dark:group-hover:text-discord-400 transition-colors">
                          {server.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {server.hasBot ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-md">
                              Бот активен
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 rounded-md">
                              Бот не добавлен
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {server.owner && (
                          <div className="flex items-center space-x-1">
                            <FeatherIcon name="crown" className="w-3 h-3" />
                            <span>Владелец</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1 text-discord-600 dark:text-discord-400">
                        <span className="text-sm font-medium">
                          {server.hasBot ? 'Открыть' : 'Добавить'}
                        </span>
                        <FeatherIcon 
                          name={server.hasBot ? 'arrow-right' : 'plus'} 
                          className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      
      {/* Notification Toast */}
      <div className={`fixed bottom-4 right-4 transform transition-transform duration-300 ${
        notificationVisible ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <FeatherIcon name="check" className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div>
            <p className="font-medium">Изменения сохранены</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Все настройки успешно обновлены</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;