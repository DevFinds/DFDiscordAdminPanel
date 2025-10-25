import React, { useState, useEffect } from 'react';
import { buildin, guild } from '../../services/api';
import { FaRocket, FaPlus, FaTimes, FaPlay, FaSpinner, FaExternalLinkAlt, FaCheck } from 'react-icons/fa';

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
    title: ''
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
    // If it's already a UUID
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(url)) {
      return url;
    }
    // Extract from URL
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

    setSaving(true);
    try {
      await buildin.addFeed(guildId, {
        pageUrl: newFeed.pageUrl,
        channelId: newFeed.channelId,
        interval: parseInt(newFeed.interval),
        enabled: newFeed.enabled,
        title: newFeed.title || `Buildin страница`
      });
      
      alert('✅ Buildin интеграция добавлена!');
      setNewFeed({ pageUrl: '', channelId: '', interval: 5, enabled: true, title: '' });
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
    const diff = Math.floor((now - new Date(date)) / (1000 * 60)); // минут
    if (diff < 1) return 'Менее минуты назад';
    if (diff < 60) return `${diff} мин. назад`;
    const hours = Math.floor(diff / 60);
    return `${hours} ч. назад`;
  };

  if (loading) {
    return (
      <div className="settings-panel" style={{ textAlign: 'center', padding: '2rem' }}>
        <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '2rem', color: '#5865F2' }} />
        <p>Загрузка Buildin интеграций...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-panel">
        <div className="error-message">
          <h3>⚠️ Ошибка загрузки</h3>
          <p>{error}</p>
          <button onClick={loadData} style={{ marginTop: '0.5rem' }}>
            🔄 Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-panel">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaRocket style={{ color: '#00d4aa' }} /> Buildin.ai Интеграция
        </h2>
        <p style={{ color: '#b9bbbe', marginBottom: '1.5rem' }}>
          Автоматически публикуйте новые записи с ваших страниц Buildin.ai в Discord каналы
        </p>
        
        {/* Кнопка добавления */}
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            background: showAddForm ? '#666' : '#00d4aa',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}
        >
          {showAddForm ? <FaTimes /> : <FaPlus />}
          {showAddForm ? 'Отмена' : 'Добавить интеграцию'}
        </button>
      </div>

      {/* Форма добавления */}
      {showAddForm && (
        <div style={{
          background: 'rgba(0, 212, 170, 0.1)',
          border: '1px solid #00d4aa',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#00d4aa' }}>✨ Новая Buildin интеграция</h3>
          
          <div className="form-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div>
              <label>Ссылка на страницу Buildin.ai:</label>
              <input
                type="text"
                placeholder="https://buildin.ai/..."
                value={newFeed.pageUrl}
                onChange={(e) => setNewFeed({...newFeed, pageUrl: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#40444b',
                  border: '1px solid #72767d',
                  borderRadius: '4px',
                  color: '#ffffff'
                }}
              />
              {newFeed.pageUrl && extractPageId(newFeed.pageUrl) && (
                <small style={{ color: '#00d4aa', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FaCheck /> Page ID: {extractPageId(newFeed.pageUrl)}
                </small>
              )}
            </div>
            
            <div>
              <label>Название (опционально):</label>
              <input
                type="text"
                placeholder="Мои посты на Buildin"
                value={newFeed.title}
                onChange={(e) => setNewFeed({...newFeed, title: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#40444b',
                  border: '1px solid #72767d',
                  borderRadius: '4px',
                  color: '#ffffff'
                }}
              />
            </div>
            
            <div>
              <label>Discord канал:</label>
              <select
                value={newFeed.channelId}
                onChange={(e) => setNewFeed({...newFeed, channelId: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#40444b',
                  border: '1px solid #72767d',
                  borderRadius: '4px',
                  color: '#ffffff'
                }}
              >
                <option value="">Выберите канал</option>
                {channels.filter(c => [0, 5].includes(c.type)).map(channel => (
                  <option key={channel.id} value={channel.id}>
                    #{channel.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label>Интервал проверки (минуты):</label>
              <input
                type="number"
                min="1"
                max="60"
                value={newFeed.interval}
                onChange={(e) => setNewFeed({...newFeed, interval: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#40444b',
                  border: '1px solid #72767d',
                  borderRadius: '4px',
                  color: '#ffffff'
                }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              onClick={handleAddFeed} 
              disabled={saving}
              style={{
                background: '#00d4aa',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1
              }}
            >
              {saving ? '💾 Сохранение...' : '➕ Добавить'}
            </button>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
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

      {/* Список существующих интеграций */}
      <div>
        <h3>Настроенные интеграции ({feeds.length})</h3>
        
        {feeds.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: '#72767d',
            background: 'rgba(114, 118, 125, 0.1)',
            borderRadius: '8px',
            marginTop: '1rem'
          }}>
            <FaRocket style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }} />
            <p>Нет настроенных Buildin интеграций</p>
            <p style={{ fontSize: '0.9rem' }}>Добавьте первую для начала автоматической публикации</p>
          </div>
        ) : (
          <div style={{ marginTop: '1rem' }}>
            {feeds.map((feed) => {
              const channel = getChannelById(feed.channelId);
              return (
                <div
                  key={feed._id}
                  style={{
                    background: feed.enabled ? '#2c2f33' : 'rgba(44, 47, 51, 0.5)',
                    border: `1px solid ${feed.enabled ? '#40444b' : '#72767d'}`,
                    borderRadius: '8px',
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    opacity: feed.enabled ? 1 : 0.7
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: '#00d4aa', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaRocket />
                        {feed.title || 'Без названия'}
                        {!feed.enabled && <span style={{ color: '#faa61a', fontSize: '0.8rem' }}>(Неактивно)</span>}
                      </h4>
                      <div style={{ fontSize: '0.9rem', color: '#b9bbbe' }}>
                        <p><strong>Страница:</strong> 
                          <a 
                            href={feed.pageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#00d4aa', textDecoration: 'none', marginLeft: '0.25rem' }}
                          >
                            {feed.pageUrl} <FaExternalLinkAlt style={{ fontSize: '0.7rem' }} />
                          </a>
                        </p>
                        <p><strong>Канал:</strong> {channel ? `#${channel.name}` : `ID: ${feed.channelId} (канал не найден)`}</p>
                        <p><strong>Интервал:</strong> {feed.interval} мин. | <strong>Последняя проверка:</strong> {formatLastCheck(feed.lastCheck)}</p>
                        <p><strong>Опубликовано:</strong> {feed.lastPostedIds?.length || 0} записей</p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <button
                        onClick={() => handleTestFeed(feed)}
                        disabled={testing === feed._id}
                        style={{
                          background: '#5865F2',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: testing === feed._id ? 'not-allowed' : 'pointer',
                          opacity: testing === feed._id ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                        title="Проверить сейчас"
                      >
                        {testing === feed._id ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaPlay />}
                        {testing === feed._id ? 'Тест...' : 'Тест'}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteFeed(feed._id)}
                        style={{
                          background: '#f04747',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: 'pointer'
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

      {/* Инструкции */}
      <div style={{
        background: 'rgba(88, 101, 242, 0.1)',
        border: '1px solid #5865F2',
        borderRadius: '8px',
        padding: '1rem',
        marginTop: '2rem'
      }}>
        <h4 style={{ color: '#5865F2', marginBottom: '0.5rem' }}>📚 Как настроить:</h4>
        <ol style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#b9bbbe' }}>
          <li>Откройте страницу на Buildin.ai, которую хотите транслировать</li>
          <li>Скопируйте URL страницы в поле выше</li>
          <li>Выберите Discord канал для публикации</li>
          <li>Укажите интервал проверки (1-60 минут)</li>
          <li>Нажмите "Добавить" и затем "Тест" для проверки</li>
        </ol>
      </div>
    </div>
  );
}

export default BuildinSettings;