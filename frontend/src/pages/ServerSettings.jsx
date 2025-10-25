import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { servers } from '../services/api';
import WelcomeSettings from '../components/Settings/WelcomeSettings';
import RoleSettings from '../components/Settings/RoleSettings';
import RSSSettings from '../components/Settings/RSSSettings';

const getInviteLink = (clientId, guildId) =>
  `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}`;

function ServerSettings() {
  const { guildId } = useParams();
  const [guild, setGuild] = useState(null);
  const [activeTab, setActiveTab] = useState('welcome');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuild();
    // eslint-disable-next-line
  }, [guildId]);

  const loadGuild = async () => {
    try {
      const response = await servers.getOne(guildId);
      setGuild(response.data);
    } catch (err) {
      setGuild(null);
      console.error('Error loading guild:', err);
    } finally {
      setLoading(false);
    }
  };

  // invite-url для ручного добавления бота
  const clientId = process.env.REACT_APP_DISCORD_CLIENT_ID;
  const inviteUrl = getInviteLink(clientId, guildId);

  if (loading) {
    return <div className="loading">Загрузка настроек...</div>;
  }

  if (!guild || !guild.settings) {
    return (
      <div className="server-settings">
        <div className="container">
          <div style={{
            background: '#fff3cd',
            color: '#856404',
            padding: '24px',
            borderRadius: '6px',
            textAlign: 'center',
            border: '1px solid #ffeeba'
          }}>
            <h2>Бот не добавлен или неактивен на этом сервере</h2>
            <p>
              Чтобы управлять сервером, <b>добавьте Discord-бота:</b>
              <br />
              <a
                className="btn-add-bot"
                href={inviteUrl}
                rel="noopener noreferrer"
                target="_blank"
                style={{
                  display: 'inline-block',
                  background: '#5865F2',
                  color: '#fff',
                  padding: '10px 24px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  marginTop: '14px'
                }}
              >
                Пригласить бота
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="server-settings">
      <div className="container">
        <h1>Настройки: {guild.name}</h1>
        <div className="tabs">
          <button
            className={activeTab === 'welcome' ? 'active' : ''}
            onClick={() => setActiveTab('welcome')}
          >
            Приветствие
          </button>
          <button
            className={activeTab === 'roles' ? 'active' : ''}
            onClick={() => setActiveTab('roles')}
          >
            Роли
          </button>
          <button
            className={activeTab === 'rss' ? 'active' : ''}
            onClick={() => setActiveTab('rss')}
          >
            RSS
          </button>
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
        </div>
      </div>
    </div>
  );
}

export default ServerSettings;
