import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { servers } from '../services/api';

// Feather Icons Component
const FeatherIcon = ({ name, className = "w-5 h-5" }) => {
  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  return <i data-feather={name} className={className}></i>;
};

// Chart Component (placeholder for now)
const ActivityChart = ({ data, period }) => {
  return (
    <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg">
      <div className="text-center">
        <div className="animate-pulse-slow">
          <FeatherIcon name="bar-chart-2" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        </div>
        <p className="text-gray-500 mb-2">График активности ({period})</p>
        <p className="text-sm text-gray-400">{data?.length || 0} точек данных</p>
      </div>
    </div>
  );
};

// Format time ago helper
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} секунд назад`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} минут назад`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} часов назад`;
  return `${Math.floor(diffInSeconds / 86400)} дней назад`;
};

// Format uptime helper
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}д ${hours}ч ${minutes}м`;
  if (hours > 0) return `${hours}ч ${minutes}м`;
  return `${minutes}м`;
};

const ServerDashboard = ({ user, onLogout }) => {
  const { guildId } = useParams();
  const navigate = useNavigate();
  const [serverData, setServerData] = useState(null);
  const [serverStats, setServerStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsPeriod, setAnalyticsPeriod] = useState('7d');

  useEffect(() => {
    if (guildId) {
      loadServerData();
    }
  }, [guildId]);

  useEffect(() => {
    if (guildId && analyticsPeriod) {
      loadAnalytics();
    }
  }, [guildId, analyticsPeriod]);

  const loadServerData = async () => {
    try {
      setLoading(true);
      const [serverResponse, statsResponse] = await Promise.all([
        servers.getOne(guildId),
        servers.getStats(guildId)
      ]);
      
      setServerData(serverResponse.data);
      setServerStats(statsResponse.data);
      setError(null);
    } catch (err) {
      console.error('Error loading server data:', err);
      setError(err.response?.data?.message || 'Ошибка загрузки данных сервера');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await servers.getAnalytics(guildId, analyticsPeriod);
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-discord-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Загрузка сервера...</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Получаем статистику</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg max-w-md w-full text-center border border-gray-200 dark:border-gray-800">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <FeatherIcon name="alert-circle" className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Ошибка</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Назад
            </button>
            <button
              onClick={loadServerData}
              className="flex-1 px-4 py-2 bg-discord-500 text-white rounded-lg hover:bg-discord-600"
            >
              Повторить
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-inter bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FeatherIcon name="arrow-left" className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                {serverStats?.server?.icon && (
                  <img
                    src={serverStats.server.icon}
                    alt="Server icon"
                    className="w-12 h-12 rounded-xl"
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold">{serverStats?.server?.name || 'Сервер'}</h1>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-md">
                      Бот активен
                    </span>
                    <span>•</span>
                    <span>{serverStats?.members?.total || 0} участников</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FeatherIcon name="refresh-cw" className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200 dark:border-gray-800">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Обзор', icon: 'home' },
                { id: 'members', label: 'Участники', icon: 'users' },
                { id: 'roles', label: 'Роли', icon: 'shield' },
                { id: 'settings', label: 'Настройки', icon: 'settings' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-discord-500 text-discord-600 dark:text-discord-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <FeatherIcon name={tab.icon} className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FeatherIcon name="users" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Всего</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{serverStats?.members?.total || 0}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Участников</p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    +{analytics?.summary?.totalJoins || 0} за период
                  </p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <FeatherIcon name="activity" className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Онлайн</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{serverStats?.members?.online || 0}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Сейчас активны</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(((serverStats?.members?.online || 0) / (serverStats?.members?.total || 1)) * 100)}% от всех
                  </p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <FeatherIcon name="message-circle" className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Сообщения</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{analytics?.summary?.totalMessages || 0}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">За {analyticsPeriod === '7d' ? '7 дней' : analyticsPeriod === '30d' ? '30 дней' : '90 дней'}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    ср. {Math.round((analytics?.summary?.totalMessages || 0) / (analyticsPeriod === '7d' ? 7 : analyticsPeriod === '30d' ? 30 : 90))} в день
                  </p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <FeatherIcon name="server" className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Аптайм</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{serverStats?.bot?.uptimePercentage || 0}%</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Время работы</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    вкл. {formatUptime(serverStats?.bot?.uptime || 0)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Activity Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Активность сервера</h3>
                <div className="flex items-center space-x-2">
                  {['7d', '30d', '90d'].map(period => (
                    <button
                      key={period}
                      onClick={() => setAnalyticsPeriod(period)}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        analyticsPeriod === period
                          ? 'bg-discord-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {period === '7d' ? '7 дней' : period === '30d' ? '30 дней' : '90 дней'}
                    </button>
                  ))}
                </div>
              </div>
              <ActivityChart data={analytics?.activity} period={analyticsPeriod} />
            </div>
            
            {/* Recent Activity & Top Members */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Последние события</h3>
                <div className="space-y-3">
                  {analytics?.recentEvents?.map((event, index) => {
                    const getEventIcon = (type) => {
                      switch (type) {
                        case 'member_join': return 'user-plus';
                        case 'role_assigned': return 'shield';
                        case 'channel_created': return 'hash';
                        default: return 'activity';
                      }
                    };
                    
                    const getEventColor = (type) => {
                      switch (type) {
                        case 'member_join': return 'green';
                        case 'role_assigned': return 'purple';
                        case 'channel_created': return 'blue';
                        default: return 'gray';
                      }
                    };
                    
                    const color = getEventColor(event.type);
                    
                    return (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className={`p-2 bg-${color}-100 dark:bg-${color}-900 rounded-lg flex-shrink-0`}>
                          <FeatherIcon name={getEventIcon(event.type)} className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{event.details}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {event.user || event.channel || event.role} • {formatTimeAgo(event.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  }) || (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">Нет последних событий</p>
                  )}
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Топ активные участники</h3>
                <div className="space-y-3">
                  {analytics?.topMembers?.slice(0, 5).map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.username)}&background=5865F2&color=fff`}
                            alt={member.displayName}
                            className="w-10 h-10 rounded-full"
                          />
                          {index < 3 && (
                            <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-yellow-500 text-white' :
                              index === 1 ? 'bg-gray-400 text-white' :
                              'bg-orange-600 text-white'
                            }`}>
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.displayName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{member.messageCount} сообщений</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">#{index + 1}</span>
                    </div>
                  )) || (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">Нет данных об активности</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'members' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Управление участниками</h3>
              <p className="text-gray-500 dark:text-gray-400">Раздел в разработке...</p>
            </div>
          </div>
        )}
        
        {(activeTab === 'roles' || activeTab === 'settings') && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {activeTab === 'roles' ? 'Управление ролями' : 'Настройки сервера'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">Раздел в разработке...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServerDashboard;