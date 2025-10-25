import React, { useState, useEffect } from 'react';
import { settings, guild } from '../../services/api';
import { FaHeart, FaSpinner, FaEye, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Checkbox from '../../ui/Checkbox';

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
  
  const channelOptions = channels
    .filter(c => [0, 5].includes(c.type))
    .map(channel => ({
      value: channel.id,
      label: `#${channel.name}`
    }));
  
  const variables = [
    { var: '{{user}}', desc: 'упоминание пользователя', example: '@НовыйПользователь' },
    { var: '{{username}}', desc: 'имя пользователя', example: 'НовыйПользователь' },
    { var: '{{server}}', desc: 'название сервера', example: 'Мой Сервер' },
    { var: '{{memberCount}}', desc: 'количество участников', example: '42' }
  ];
  
  const getPreviewMessage = () => {
    return welcomeMessage
      .replace(/\{\{user\}\}/g, '@НовыйПользователь')
      .replace(/\{\{username\}\}/g, 'НовыйПользователь')
      .replace(/\{\{server\}\}/g, 'Мой Сервер')
      .replace(/\{\{memberCount\}\}/g, '42');
  };

  return (
    <div className="settings-panel animate-fadeIn">
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-3)' }}>
          <FaHeart style={{ color: 'var(--error)', fontSize: '1.5rem' }} />
          <h2 className="text-gradient">Приветственные сообщения</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
          Автоматически приветствуйте новых участников сервера персонализированными сообщениями
        </p>
      </div>

      {/* Main Toggle */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <Checkbox
            id="welcome-enabled"
            label="Включить приветственные сообщения"
            checked={welcomeEnabled}
            onChange={(e) => setWelcomeEnabled(e.target.checked)}
            size="lg"
          />
          <small style={{ color: 'var(--text-tertiary)', display: 'block', marginTop: 'var(--space-2)', marginLeft: 'var(--space-8)' }}>
            При включении бот будет автоматически приветствовать новых участников
          </small>
        </div>
      </div>

      {/* Configuration */}
      {welcomeEnabled && (
        <div className="animate-slideIn">
          {/* Channel Selection */}
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="card-header">
              <h3>🎣 Канал для приветствий</h3>
              <p>Выберите канал, в который будут отправляться приветственные сообщения</p>
            </div>
            
            {loading ? (
              <div className="flex items-center gap-3" style={{ padding: 'var(--space-4)' }}>
                <FaSpinner className="animate-spin" style={{ color: 'var(--brand)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Загрузка каналов...</span>
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <FaExclamationTriangle />
                <div>
                  <p>{error}</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<span>🔄</span>}
                    onClick={loadChannels}
                    style={{ marginTop: 'var(--space-2)' }}
                  >
                    Повторить
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <Select
                  label="Discord канал"
                  value={welcomeChannel}
                  onChange={(e) => setWelcomeChannel(e.target.value)}
                  options={channelOptions}
                  placeholder="Выберите канал для приветствий"
                  fullWidth
                  success={!!selectedChannel}
                  helperText={selectedChannel ? `Выбран: #${selectedChannel.name}` : 'Выберите текстовый канал'}
                />
              </div>
            )}
          </div>

          {/* Message Configuration */}
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="card-header">
              <h3>✉️ Текст приветствия</h3>
              <p>Настройте сообщение, которое будет отправляться новым участникам</p>
            </div>
            
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <label 
                htmlFor="welcome-message" 
                style={{ 
                  display: 'block',
                  marginBottom: 'var(--space-3)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text-primary)'
                }}
              >
                Сообщение
              </label>
              <textarea
                id="welcome-message"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows="4"
                placeholder="Напишите приветственное сообщение..."
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-family-sans)',
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: 'var(--line-height-normal)',
                  resize: 'vertical',
                  minHeight: '100px',
                  transition: 'all var(--duration-fast) var(--ease-out)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--border-interactive)';
                  e.target.style.boxShadow = 'var(--shadow-focus)';
                  e.target.style.backgroundColor = 'var(--surface-overlay)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-default)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = 'var(--surface-elevated)';
                }}
              />
            </div>
            
            {/* Variables */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h4 style={{ 
                fontSize: 'var(--font-size-sm)', 
                marginBottom: 'var(--space-3)',
                color: 'var(--text-primary)'
              }}>
                🏷️ Доступные переменные
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-3)'
              }}>
                {variables.map(({ var: variable, desc, example }) => (
                  <div
                    key={variable}
                    onClick={() => setWelcomeMessage(prev => prev + ' ' + variable)}
                    style={{
                      background: 'var(--surface-overlay)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-3)',
                      cursor: 'pointer',
                      transition: 'all var(--duration-fast) var(--ease-out)'
                    }}
                    className="variable-card"
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = 'var(--border-interactive)';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = 'var(--border-default)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ 
                      fontFamily: 'var(--font-family-mono)', 
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--brand)',
                      fontWeight: 'var(--font-weight-semibold)',
                      marginBottom: 'var(--space-1)'
                    }}>
                      {variable}
                    </div>
                    <div style={{ 
                      fontSize: 'var(--font-size-xs)', 
                      color: 'var(--text-tertiary)',
                      marginBottom: 'var(--space-1)'
                    }}>
                      {desc}
                    </div>
                    <div style={{ 
                      fontSize: 'var(--font-size-xs)', 
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic'
                    }}>
                      Пример: {example}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          {welcomeMessage.trim() && (
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="card-header">
                <h3 className="flex items-center gap-2">
                  <FaEye style={{ color: 'var(--brand)' }} />
                  Предварительный просмотр
                </h3>
                <p>Как будет выглядеть ваше сообщение</p>
              </div>
              
              <div style={{
                background: 'var(--surface-base)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                fontFamily: 'var(--font-family-sans)',
                fontSize: 'var(--font-size-sm)',
                lineHeight: 'var(--line-height-relaxed)',
                color: 'var(--text-primary)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, var(--success), var(--brand))',
                  opacity: 0.6
                }} />
                <div style={{ 
                  color: 'var(--success)', 
                  fontSize: 'var(--font-size-xs)',
                  marginBottom: 'var(--space-2)',
                  fontWeight: 'var(--font-weight-medium)'
                }}>
                  🤖 Discord Бот • Сегодня
                </div>
                {getPreviewMessage()}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="card-footer">
            <div className="flex items-center justify-between gap-4">
              {welcomeEnabled && !welcomeChannel ? (
                <div className="flex items-center gap-2" style={{ color: 'var(--warning)' }}>
                  <FaExclamationTriangle />
                  <span style={{ fontSize: 'var(--font-size-sm)' }}>
                    Выберите канал для отправки приветствий
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2" style={{ color: 'var(--success)' }}>
                  <FaCheck />
                  <span style={{ fontSize: 'var(--font-size-sm)' }}>
                    Настройки готовы к сохранению
                  </span>
                </div>
              )}
              
              <Button
                variant="success"
                size="lg"
                loading={saving}
                disabled={welcomeEnabled && !welcomeChannel}
                leftIcon={saving ? null : <span>💾</span>}
                onClick={handleSave}
              >
                {saving ? 'Сохранение...' : 'Сохранить настройки'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WelcomeSettings;