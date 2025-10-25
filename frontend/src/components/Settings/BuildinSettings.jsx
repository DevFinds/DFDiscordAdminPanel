import React, { useState, useEffect } from 'react';
import { buildin, guild } from '../../services/api';
import { FaRocket, FaPlus, FaTimes, FaPlay, FaSpinner, FaExternalLinkAlt, FaCheck, FaClock, FaCheckCircle } from 'react-icons/fa';

function BuildinSettings({ guildId, settings: guildSettings, onUpdate }) {
  const [feeds, setFeeds] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(null);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFeed, setNewFeed] = useState({
    pageUrl: '',
    channelId: '',
    interval: 5,
    enabled: true,
    title: '',
    initialBackfill: 3
  });

  useEffect(() => {
    loadData();
  }, [guildId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [feedsResponse, channelsResponse] = await Promise.all([
        buildin.getFeeds(guildId),
        guild.getChannels(guildId)
      ]);
      
      setFeeds(feedsResponse.data.feeds || []);
      setChannels(channelsResponse.data.channels || []);
    } catch (err) {
      console.error('Error loading buildin data:', err);
      setError(err.response?.data?.error || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const extractPageId = (url) => {
    if (!url) return null;
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(url)) {
      return url;
    }
    const match = url.match(/buildin\.ai\/(?:[^/]+\/)?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    return match ? match[1] : null;
  };

  const getChannelById = (channelId) => channels.find(c => c.id === channelId);

  const handleAddFeed = async () => {
    const pageId = extractPageId(newFeed.pageUrl);
    if (!pageId) {
      alert('⚠️ Неправильная ссылка Buildin.ai');
      return;
    }
    
    if (!newFeed.channelId || newFeed.interval < 1 || newFeed.interval > 60) {
      alert('⚠️ Выберите канал и укажите интервал (1-60 минут)');
      return;
    }

    if (newFeed.initialBackfill < 0 || newFeed.initialBackfill > 20) {
      alert('⚠️ Количество предыдущих постов должно быть от 0 до 20');
      return;
    }

    setSaving(true);
    try {
      await buildin.addFeed(guildId, {
        pageUrl: newFeed.pageUrl,
        channelId: newFeed.channelId,
        interval: parseInt(newFeed.interval),
        enabled: newFeed.enabled,
        title: newFeed.title || `Buildin страница`,
        initialBackfill: parseInt(newFeed.initialBackfill)
      });
      
      alert('✅ Buildin интеграция добавлена!');
      setNewFeed({ pageUrl: '', channelId: '', interval: 5, enabled: true, title: '', initialBackfill: 3 });
      setShowAddForm(false);
      await loadData();
      onUpdate();
    } catch (err) {
      alert('❌ Ошибка: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFeed = async (feedId) => {
    if (!window.confirm('Удалить эту Buildin интеграцию?')) return;
    
    try {
      await buildin.deleteFeed(guildId, feedId);
      alert('✅ Интеграция удалена!');
      await loadData();
      onUpdate();
    } catch (err) {
      alert('❌ Ошибка: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleTestFeed = async (feed) => {
    setTesting(feed._id);
    try {
      await buildin.testFeed(guildId, {
        pageId: feed.pageId,
        channelId: feed.channelId
      });
      alert('✅ Тестовая публикация запущена! Проверьте канал Discord.');
    } catch (err) {
      alert('❌ Ошибка теста: ' + (err.response?.data?.error || err.message));
    } finally {
      setTesting(null);
    }
  };

  const formatLastCheck = (date) => {
    if (!date) return 'Никогда';
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / (1000 * 60));
    if (diff < 1) return 'Менее минуты назад';
    if (diff < 60) return `${diff} мин. назад`;
    const hours = Math.floor(diff / 60);
    return `${hours} ч. назад`;
  };

  if (loading) {
    return (
      <div className="loading">
        <FaSpinner className="loading-spinner" />
        <p>Загрузка Buildin интеграций...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <h3>⚠️ Ошибка загрузки</h3>
        <p>{error}</p>
        <button onClick={loadData} className="btn-primary" style={{ marginTop: 'var(--space-md)' }}>
          🔄 Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="settings-panel fade-in">
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
          <FaRocket style={{ color: 'var(--success)', fontSize: '1.5rem' }} />
          <h2 className="text-gradient">Buildin.ai Интеграция</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', lineHeight: '1.6' }}>
          Автоматически публикуйте новые записи с ваших страниц Buildin.ai в Discord каналы с красивыми embed-сообщениями
        </p>
        
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={showAddForm ? 'btn-secondary' : 'btn-success'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            marginBottom: 'var(--space-lg)'
          }}
        >
          {showAddForm ? <FaTimes /> : <FaPlus />}
          {showAddForm ? 'Отмена' : 'Добавить интеграцию'}
        </button>
      </div>

      {showAddForm && (
        <div className="buildin-form fade-in">
          <h3 style={{ marginBottom: 'var(--space-xl)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            ✨ Новая Buildin интеграция
          </h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Ссылка на страницу/галерею Buildin.ai</label>
              <input
                type="text"
                placeholder="https://buildin.ai/..."
                value={newFeed.pageUrl}
                onChange={(e) => setNewFeed({...newFeed, pageUrl: e.target.value})}
              />
              {newFeed.pageUrl && extractPageId(newFeed.pageUrl) && (
                <small style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                  <FaCheck /> Page ID: {extractPageId(newFeed.pageUrl)}
                </small>
              )}
            </div>
            
            <div className="form-group">
              <label>Название (опционально)</label>
              <input
                type="text"
                placeholder="Мои посты на Buildin"
                value={newFeed.title}
                onChange={(e) => setNewFeed({...newFeed, title: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Discord канал</label>
              <select
                value={newFeed.channelId}
                onChange={(e) => setNewFeed({...newFeed, channelId: e.target.value})}
              >
                <option value="">Выберите канал</option>
                {channels.filter(c => [0, 5].includes(c.type)).map(channel => (
                  <option key={channel.id} value={channel.id}>
                    #{channel.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Интервал проверки (минуты)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={newFeed.interval}
                onChange={(e) => setNewFeed({...newFeed, interval: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Опубликовать сразу (количество предыдущих постов)</label>
              <select
                value={newFeed.initialBackfill}
                onChange={(e) => setNewFeed({...newFeed, initialBackfill: parseInt(e.target.value)})}
              >
                <option value={0}>Не публиковать предыдущие посты</option>
                <option value={1}>1 пост</option>
                <option value={3}>3 поста</option>
                <option value={5}>5 постов</option>
                <option value={10}>10 постов</option>
                <option value={20}>20 постов</option>
              </select>
              <small>После создания бот опубликует эти посты с галереи</small>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'center', marginTop: 'var(--space-xl)' }}>
            <button 
              onClick={handleAddFeed} 
              disabled={saving}
              className="btn-success"
              style={{ opacity: saving ? 0.6 : 1 }}
            >
              {saving ? '💾 Сохранение...' : '➕ Добавить'}
            </button>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={newFeed.enabled}
                onChange={(e) => setNewFeed({...newFeed, enabled: e.target.checked})}
              />
              Активна
            </label>
          </div>
        </div>
      )}

      <div>
        <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          Настроенные интеграции 
          <span style={{ 
            background: 'var(--bg-tertiary)', 
            padding: 'var(--space-xs) var(--space-sm)', 
            borderRadius: 'var(--radius-sm)', 
            fontSize: '0.8rem',
            color: 'var(--text-secondary)'
          }}>
            {feeds.length}
          </span>
        </h3>
        
        {feeds.length === 0 ? (
          <div className="buildin-card" style={{
            textAlign: 'center',
            padding: 'var(--space-2xl)',
            opacity: 0.7
          }}>
            <FaRocket style={{ fontSize: '3rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-lg)' }} />
            <h4 style={{ marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>Нет настроенных Buildin интеграций</h4>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Добавьте первую для начала автоматической публикации</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
            {feeds.map((feed) => {
              const channel = getChannelById(feed.channelId);
              return (
                <div key={feed._id} className="buildin-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                        <FaRocket style={{ color: 'var(--success)' }} />
                        <h4 style={{ color: 'var(--text-primary)' }}>{feed.title || 'Без названия'}</h4>
                        {!feed.enabled && (
                          <span style={{ 
                            color: 'var(--warning)', 
                            fontSize: '0.8rem',
                            background: 'rgba(245, 166, 35, 0.1)',
                            padding: 'var(--space-xs) var(--space-sm)',
                            borderRadius: 'var(--radius-sm)'
                          }}>Неактивно</span>
                        )}
                        <span className={`buildin-status ${feed.backfilled ? 'completed' : 'pending'}`}>
                          {feed.backfilled ? <FaCheckCircle /> : <FaClock />}
                          {feed.backfilled ? 'Готово' : 'Ожидание'}
                        </span>
                      </div>
                      
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: 'var(--space-md)',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                      }}>
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>Страница:</strong>
                          <br />
                          <a 
                            href={feed.pageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                              color: 'var(--success)', 
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 'var(--space-xs)',
                              fontSize: '0.8rem'
                            }}
                          >
                            {feed.pageUrl.length > 50 ? feed.pageUrl.substring(0, 50) + '...' : feed.pageUrl}
                            <FaExternalLinkAlt />
                          </a>
                        </div>
                        
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>Канал:</strong>
                          <br />
                          {channel ? `#${channel.name}` : `ID: ${feed.channelId} (канал не найден)`}
                        </div>
                        
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>Настройки:</strong>
                          <br />
                          Каждые {feed.interval} мин. • {feed.lastPostedIds?.length || 0} записей
                        </div>
                        
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>Статус:</strong>
                          <br />
                          Последняя проверка: {formatLastCheck(feed.lastCheck)}
                          <br />
                          Первичная публикация: {feed.initialBackfill || 0} постов
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', flexShrink: 0, marginLeft: 'var(--space-lg)' }}>
                      <button
                        onClick={() => handleTestFeed(feed)}
                        disabled={testing === feed._id}
                        className="btn-primary"
                        style={{
                          opacity: testing === feed._id ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-xs)',
                          fontSize: '0.8rem',
                          padding: 'var(--space-sm) var(--space-md)'
                        }}
                        title="Проверить сейчас"
                      >
                        {testing === feed._id ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaPlay />}
                        {testing === feed._id ? 'Тест...' : 'Тест'}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteFeed(feed._id)}
                        className="btn-error"
                        style={{
                          fontSize: '0.8rem',
                          padding: 'var(--space-sm) var(--space-md)'
                        }}
                        title="Удалить интеграцию"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="alert" style={{
        background: 'rgba(0, 112, 243, 0.1)',
        border: '1px solid var(--primary)',
        marginTop: 'var(--space-2xl)'
      }}>
        <h4 style={{ color: 'var(--primary)', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          📚 Как настроить
        </h4>
        <ol style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)', paddingLeft: 'var(--space-lg)' }}>
          <li style={{ marginBottom: 'var(--space-xs)' }}>Откройте страницу/галерею на Buildin.ai, которую хотите транслировать</li>
          <li style={{ marginBottom: 'var(--space-xs)' }}>Скопируйте URL страницы (с #fragment для галерей) в поле выше</li>
          <li style={{ marginBottom: 'var(--space-xs)' }}>Выберите Discord канал для публикации</li>
          <li style={{ marginBottom: 'var(--space-xs)' }}>Укажите интервал проверки (1-60 минут) и количество предыдущих постов</li>
          <li>Нажмите "Добавить" — бот опубликует посты с названиями и обложками</li>
        </ol>
      </div>
    </div>
  );
}

export default BuildinSettings;