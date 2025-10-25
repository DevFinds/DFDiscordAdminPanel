import React, { useState, useEffect } from 'react';
import { settings, guild } from '../../services/api';
import { FaHeart, FaSpinner } from 'react-icons/fa';

function WelcomeSettings({ guildId, settings: guildSettings, onUpdate }) {
  const [welcomeEnabled, setWelcomeEnabled] = useState(guildSettings.welcomeEnabled || false);
  const [welcomeChannel, setWelcomeChannel] = useState(guildSettings.welcomeChannel || '');
  const [welcomeMessage, setWelcomeMessage] = useState(
    guildSettings.welcomeMessage || 'Welcome to {{server}}, {{user}}! 👋 You are member #{{memberCount}}'
  );
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (welcomeEnabled && channels.length === 0) {
      loadChannels();
    }
  }, [welcomeEnabled, guildId]);

  const loadChannels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await guild.getChannels(guildId);
      setChannels(response.data.channels || []);
    } catch (err) {
      console.error('Error loading channels:', err);
      setError(err.response?.data?.error || 'Ошибка загрузки каналов');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settings.updateWelcome(guildId, {
        welcomeEnabled,
        welcomeChannel,
        welcomeMessage
      });
      alert('✅ Настройки приветствий сохранены!');
      onUpdate();
    } catch (err) {
      alert('❌ Ошибка: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const getChannelById = (channelId) => channels.find(c => c.id === channelId);
  const selectedChannel = getChannelById(welcomeChannel);

  return (
    <div className="settings-panel">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FaHeart style={{ color: '#f04747' }} /> Приветственные сообщения
      </h2>
      <p style={{ color: '#b9bbbe', marginBottom: '1.5rem' }}>
        Автоматически приветствуйте новых участников сервера персонализированными сообщениями
      </p>

      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={welcomeEnabled}
            onChange={(e) => setWelcomeEnabled(e.target.checked)}
          />
          Включить приветственные сообщения
        </label>
      </div>

      {welcomeEnabled && (
        <div style={{ marginTop: '1.5rem' }}>
          {/* Channel Selection */}
          <div className="form-group">
            <label>Канал для приветствий:</label>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem' }}>
                <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                <span>Загрузка каналов...</span>
              </div>
            ) : error ? (
              <div style={{ color: '#f04747', padding: '0.75rem' }}>
                {error}
                <button 
                  onClick={loadChannels}
                  style={{
                    marginLeft: '0.5rem',
                    background: '#5865F2',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  🔄 Повторить
                </button>
              </div>
            ) : (
              <select 
                value={welcomeChannel} 
                onChange={(e) => setWelcomeChannel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#40444b',
                  border: '1px solid #72767d',
                  borderRadius: '4px',
                  color: '#ffffff'
                }}
              >
                <option value="">Выберите канал для приветствий</option>
                {channels.filter(c => [0, 5].includes(c.type)).map(channel => (
                  <option key={channel.id} value={channel.id}>
                    #{channel.name}
                  </option>
                ))}
              </select>
            )}
            {selectedChannel && (
              <small style={{ color: '#43b581', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                ✅ Выбран канал: <strong>#{selectedChannel.name}</strong>
              </small>
            )}
          </div>

          {/* Welcome Message */}
          <div className="form-group">
            <label>Текст приветствия:</label>
            <textarea 
              value={welcomeMessage} 
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows="4"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#40444b',
                border: '1px solid #72767d',
                borderRadius: '4px',
                color: '#ffffff',
                resize: 'vertical'
              }}
            />
            <div style={{ marginTop: '0.5rem' }}>
              <small style={{ color: '#b9bbbe' }}>Доступные переменные:</small>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.5rem', 
                marginTop: '0.5rem'
              }}>
                {[
                  { var: '{{user}}', desc: 'упоминание пользователя' },
                  { var: '{{username}}', desc: 'имя пользователя' },
                  { var: '{{server}}', desc: 'название сервера' },
                  { var: '{{memberCount}}', desc: 'количество участников' }
                ].map(({ var: variable, desc }) => (
                  <span 
                    key={variable}
                    style={{
                      background: '#2c2f33',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      border: '1px solid #40444b',
                      cursor: 'pointer'
                    }}
                    title={desc}
                    onClick={() => {
                      setWelcomeMessage(prev => prev + ' ' + variable);
                    }}
                  >
                    {variable}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          {welcomeMessage && (
            <div className="form-group">
              <label>Предварительный просмотр:</label>
              <div style={{
                background: '#2c2f33',
                border: '1px solid #40444b',
                borderRadius: '6px',
                padding: '1rem',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                lineHeight: '1.4'
              }}>
                {welcomeMessage
                  .replace(/\{\{user\}\}/g, '@НовыйПользователь')
                  .replace(/\{\{username\}\}/g, 'НовыйПользователь')
                  .replace(/\{\{server\}\}/g, 'Мой Сервер')
                  .replace(/\{\{memberCount\}\}/g, '42')
                }
              </div>
            </div>
          )}
        </div>
      )}

      <button 
        className="btn-save" 
        onClick={handleSave} 
        disabled={saving || (welcomeEnabled && !welcomeChannel)}
        style={{ marginTop: '1.5rem' }}
      >
        {saving ? '💾 Сохранение...' : '💾 Сохранить настройки'}
      </button>
      
      {welcomeEnabled && !welcomeChannel && (
        <p style={{ color: '#faa61a', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          ⚠️ Выберите канал для отправки приветствий
        </p>
      )}
    </div>
  );
}

export default WelcomeSettings;