import React, { useState, useEffect } from 'react';
import { settings, guild } from '../../services/api';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Checkbox from '../../ui/Checkbox';

function WelcomeSettings({ guildId, settings: guildSettings, onUpdate }) {
  // keep business state/logic
  const [welcomeEnabled, setWelcomeEnabled] = useState(guildSettings.welcomeEnabled || false);
  const [welcomeChannel, setWelcomeChannel] = useState(guildSettings.welcomeChannel || '');
  const [welcomeMessage, setWelcomeMessage] = useState(
    guildSettings.welcomeMessage || 'Добро пожаловать, {{user}}! 👋 Ты #{{memberCount}} на {{server}}'
  );
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (welcomeEnabled && channels.length === 0) loadChannels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [welcomeEnabled, guildId]);

  const loadChannels = async () => {
    try {
      setLoading(true); setError(null);
      const response = await guild.getChannels(guildId);
      setChannels(response.data.channels || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки каналов');
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settings.updateWelcome(guildId, { welcomeEnabled, welcomeChannel, welcomeMessage });
      onUpdate?.();
    } catch (err) {
      alert('❌ ' + (err.response?.data?.error || err.message));
    } finally { setSaving(false); }
  };

  const channelOptions = channels
    .filter(c => [0,5].includes(c.type))
    .map(c => ({ value: c.id, label: `#${c.name}` }));

  const sample = { user:'@НовыйПользователь', username:'НовыйПользователь', server:'DevFinds', memberCount:42 };
  const preview = welcomeMessage
    .replace(/\{\{user\}\}/g, sample.user)
    .replace(/\{\{username\}\}/g, sample.username)
    .replace(/\{\{server\}\}/g, sample.server)
    .replace(/\{\{memberCount\}\}/g, sample.memberCount);

  return (
    <section>
      {/* Header */}
      <div style={{marginBottom:16}}>
        <h2 style={{fontWeight:700, fontSize:18, marginBottom:8}}>👋 Приветствия</h2>
        <p style={{color:'#a1a1aa'}}>Автоматические приветственные сообщения для новых участников</p>
      </div>

      {/* Toggle */}
      <div className="card" style={{marginBottom:16}}>
        <div className="field">
          <Checkbox
            label="Включить приветственные сообщения"
            checked={welcomeEnabled}
            onChange={(e)=>setWelcomeEnabled(e.target.checked)}
          />
          <p className="hint">При включении бот будет отправлять приветствия в выбранный канал</p>
        </div>
      </div>

      {welcomeEnabled && (
        <div className="animate-fade-in">
          {/* Channel */}
          <div className="card" style={{marginBottom:16}}>
            <div className="field">
              <label className="label">Канал для приветствий</label>
              {loading ? (
                <div className="hint">Загрузка каналов…</div>
              ) : error ? (
                <div className="hint" style={{color:'#f59e0b'}}>
                  {error} <Button variant="secondary" size="sm" onClick={loadChannels} style={{marginLeft:8}}>Повторить</Button>
                </div>
              ) : (
                <Select value={welcomeChannel} onChange={(e)=>setWelcomeChannel(e.target.value)}>
                  <option value="">— Выберите канал —</option>
                  {channelOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
              )}
              <p className="hint">Будут использоваться только текстовые каналы</p>
            </div>
          </div>

          {/* Message */}
          <div className="card" style={{marginBottom:16}}>
            <div className="field">
              <label className="label">Текст приветствия</label>
              <textarea className="textarea" rows={4} value={welcomeMessage} onChange={(e)=>setWelcomeMessage(e.target.value)} />
              <p className="hint">Переменные: {{'{{user}}'}}, {{'{{username}}'}}, {{'{{server}}'}}, {{'{{memberCount}}'}}</p>
            </div>
          </div>

          {/* Preview */}
          <div className="card" style={{marginBottom:16}}>
            <div className="field">
              <label className="label">Предпросмотр</label>
              <div className="preview">
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                  <div style={{width:20,height:20,background:'#0070f3',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:10}}>🤖</div>
                  <strong>Discord Бот</strong>
                  <span className="muted">сегодня</span>
                </div>
                {preview}
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="toolbar">
            <Button onClick={handleSave} variant="primary" disabled={!welcomeChannel || saving}>{saving?'Сохранение…':'Сохранить настройки'}</Button>
          </div>
        </div>
      )}
    </section>
  );
}

export default WelcomeSettings;
