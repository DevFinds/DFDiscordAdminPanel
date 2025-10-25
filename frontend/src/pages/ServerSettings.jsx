import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { servers } from '../services/api';
import WelcomeSettings from '../components/Settings/WelcomeSettings';
import RoleSettings from '../components/Settings/RoleSettings';
import RSSSettings from '../components/Settings/RSSSettings';
import BuildinSettings from '../components/Settings/BuildinSettings';
import { FaArrowLeft } from 'react-icons/fa';

const getInviteLink = (clientId, guildId) =>
  `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}`;

function ServerSettings() {
  const { guildId } = useParams();
  const navigate = useNavigate();
  const [guild, setGuild] = useState(null);
  const [activeTab, setActiveTab] = useState('welcome');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGuild();
    // eslint-disable-next-line
  }, [guildId]);

  const loadGuild = async () => {
    try {
      setError(null);
      const response = await servers.getOne(guildId);
      setGuild(response.data);
    } catch (err) {
      setGuild(null);
      setError(err.response?.data?.message || 'Ошибка загрузки настроек сервера');
      console.error('Error loading guild:', err);
    } finally {
      setLoading(false);
    }
  };

  // invite-url для ручного добавления бота
  const clientId = process.env.REACT_APP_DISCORD_CLIENT_ID;
  const inviteUrl = getInviteLink(clientId, guildId);

  if (loading) {
    return (
      <div className="loading">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 2s linear infinite' }}>⚙️</div>
          <p>Загрузка настроек сервера...</p>
        </div>
      </div>
    );
  }

  if (error || !guild || !guild.settings) {
    return (
      <div className="server-settings">
        <div className="container">
          <button 
            onClick={() => navigate('/')}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FaArrowLeft /> Вернуться к серверам
          </button>
          
          <div className="alert alert-warning" style={{
            background: 'rgba(255, 152, 0, 0.1)',
            border: '2px solid var(--warning)',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '2rem auto'
          }}>
            <h2 style={{ color: 'var(--warning)', marginBottom: '1rem' }}>
              Бот не добавлен или неактивен на этом сервере
            </h2>
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Чтобы управлять настройками сервера, необходимо добавить Discord-бота на ваш сервер.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                className="btn-add-bot"
                href={inviteUrl}
                rel="noopener noreferrer"
                target="_blank"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--primary)',
                  color: 'var(--text)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Пригласить бота
              </a>
              
              <button
                onClick={loadGuild}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Проверить снова
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="server-settings">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FaArrowLeft /> Назад
          </button>
          <h1>Настройки: {guild.name}</h1>
        </div>
        
        <div className="tabs">
          <button className={activeTab === 'welcome' ? 'active' : ''} onClick={() => setActiveTab('welcome')}>👋 Приветствие</button>
          <button className={activeTab === 'roles' ? 'active' : ''} onClick={() => setActiveTab('roles')}>🎭 Роли</button>
          <button className={activeTab === 'rss' ? 'active' : ''} onClick={() => setActiveTab('rss')}>📰 RSS</button>
          <button className={activeTab === 'buildin' ? 'active' : ''} onClick={() => setActiveTab('buildin')}>🚀 Buildin</button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'welcome' && (
            <WelcomeSettings guildId={guildId} settings={guild.settings} onUpdate={loadGuild} />
          )}
          {activeTab === 'roles' && (
            <RoleSettings guildId={guildId} settings={guild.settings} onUpdate={loadGuild} />
          )}
          {activeTab === 'rss' && (
            <RSSSettings guildId={guildId} settings={guild.settings} onUpdate={loadGuild} />
          )}
          {activeTab === 'buildin' && (
            <BuildinSettings guildId={guildId} settings={guild.settings} onUpdate={loadGuild} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ServerSettings;
