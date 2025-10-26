import React, { useState, useEffect } from 'react';

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

// Navigation Hook
const useNavigation = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const showSection = (sectionId) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return {
    activeSection,
    showSection,
    isMobileMenuOpen,
    toggleMobileMenu
  };
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

const ModernDashboard = () => {
  const { theme, setTheme } = useTheme();
  const { activeSection, showSection, isMobileMenuOpen, toggleMobileMenu } = useNavigation();
  const { isVisible: notificationVisible, showNotification } = useNotification();

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

  const navItems = [
    { id: 'overview', label: 'Обзор', icon: 'home', badge: 'New' },
    { id: 'members', label: 'Участники', icon: 'users' },
    { id: 'roles', label: 'Роли и права', icon: 'shield' },
    { id: 'welcome', label: 'Приветствия', icon: 'smile' },
    { id: 'rss', label: 'RSS Feeds', icon: 'rss' },
    { id: 'buildin', label: 'BuildIn.ai', icon: 'cpu' },
    { id: 'settings', label: 'Настройки', icon: 'settings' }
  ];

  const pageTitles = {
    'overview': 'Обзор',
    'members': 'Участники',
    'roles': 'Роли и права',
    'welcome': 'Приветствия',
    'settings': 'Настройки',
    'rss': 'RSS интеграция',
    'buildin': 'BuildIn.ai интеграция'
  };

  const renderOverviewSection = () => (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-discord-100 dark:bg-discord-900 rounded-lg">
              <FeatherIcon name="users" className="w-5 h-5 text-discord-600 dark:text-discord-400" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">+12%</span>
          </div>
          <h3 className="text-2xl font-bold">1,234</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Всего участников</p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <FeatherIcon name="activity" className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">+5%</span>
          </div>
          <h3 className="text-2xl font-bold">847</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Онлайн сейчас</p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <FeatherIcon name="message-circle" className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs font-medium text-red-600 bg-red-100 dark:bg-red-900 px-2 py-1 rounded-full">-3%</span>
          </div>
          <h3 className="text-2xl font-bold">15.4K</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Сообщений сегодня</p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FeatherIcon name="server" className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">99.9%</span>
          </div>
          <h3 className="text-2xl font-bold">99.9%</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Время работы</p>
        </div>
      </div>
      
      {/* Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Активность сервера</h3>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg">День</button>
            <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Неделя</button>
            <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Месяц</button>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg">
          <div className="text-center">
            <div className="animate-pulse-slow">
              <FeatherIcon name="bar-chart-2" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            </div>
            <p className="text-gray-500">График активности будет здесь</p>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Последние события</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <FeatherIcon name="user-plus" className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Новый участник присоединился</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">User123 • 2 минуты назад</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FeatherIcon name="shield" className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Роль назначена</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Moderator → User456 • 15 минут назад</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FeatherIcon name="hash" className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Новый канал создан</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">#announcements • 1 час назад</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Топ активных участников</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center space-x-3">
                <img src="https://ui-avatars.com/api/?name=Alex&background=5865F2&color=fff" alt="User" className="w-10 h-10 rounded-full" />
                <div>
                  <p className="text-sm font-medium">Alex</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2,345 сообщений</p>
                </div>
              </div>
              <span className="text-lg font-bold text-yellow-500">#1</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center space-x-3">
                <img src="https://ui-avatars.com/api/?name=Maria&background=EB459E&color=fff" alt="User" className="w-10 h-10 rounded-full" />
                <div>
                  <p className="text-sm font-medium">Maria</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">1,892 сообщения</p>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-400">#2</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center space-x-3">
                <img src="https://ui-avatars.com/api/?name=John&background=57F287&color=fff" alt="User" className="w-10 h-10 rounded-full" />
                <div>
                  <p className="text-sm font-medium">John</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">1,456 сообщений</p>
                </div>
              </div>
              <span className="text-lg font-bold text-orange-600">#3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMembersSection = () => (
    <div className="p-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold">Управление участниками</h3>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input type="text" placeholder="Поиск участников..." className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-discord-500 w-64" />
                <FeatherIcon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              <button className="px-4 py-2 bg-discord-500 text-white rounded-lg text-sm font-medium hover:bg-discord-600">
                Добавить
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Участник</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Роли</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Присоединился</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img src="https://ui-avatars.com/api/?name=User123&background=5865F2&color=fff" alt="User" className="w-10 h-10 rounded-full" />
                    <div className="ml-4">
                      <div className="text-sm font-medium">User123</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">#1234</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md mr-1">@everyone</span>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-md">Member</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">12.03.2024</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full">Онлайн</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-gray-600 hover:text-discord-500 dark:text-gray-400 dark:hover:text-discord-400 mr-3">
                    <FeatherIcon name="edit-2" className="w-4 h-4" />
                  </button>
                  <button className="text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                    <FeatherIcon name="trash-2" className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverviewSection();
      case 'members':
        return renderMembersSection();
      default:
        return (
          <div className="p-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold mb-4">{pageTitles[activeSection]}</h3>
              <p className="text-gray-500 dark:text-gray-400">Раздел в разработке...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="font-inter bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 h-screen overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800"
      >
        <FeatherIcon name="menu" className="w-5 h-5" />
      </button>
      
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="h-full flex flex-col">
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-discord-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    D
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                </div>
                <div>
                  <h1 className="text-lg font-semibold">Discord Admin</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Server Management</p>
                </div>
              </div>
            </div>
            
            {/* Server Stats Mini */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Members</p>
                  <p className="text-lg font-semibold">1,234</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
                  <p className="text-lg font-semibold text-green-500">847</p>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item, index) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => showSection(item.id)}
                    className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gray-100 dark:bg-gray-800 text-discord-600 dark:text-discord-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <FeatherIcon name={item.icon} className="w-5 h-5 mr-3" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-discord-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
              
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Интеграции</p>
              </div>
            </nav>
            
            {/* User Section */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                <img src="https://ui-avatars.com/api/?name=Admin&background=5865F2&color=fff" alt="User" className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">admin@discord.bot</p>
                </div>
                <FeatherIcon name="more-vertical" className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold">{pageTitles[activeSection]}</h2>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-md">Online</span>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Search */}
                <div className="relative hidden md:block">
                  <input type="text" placeholder="Поиск..." className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-discord-500 w-64" />
                  <FeatherIcon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
                
                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <FeatherIcon name="bell" className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
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
                
                {/* Save Button */}
                <button
                  onClick={showNotification}
                  className="px-4 py-2 bg-gradient-to-r from-discord-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </header>
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
            {renderSection()}
          </main>
        </div>
      </div>
      
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
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}
    </div>
  );
};

export default ModernDashboard;
