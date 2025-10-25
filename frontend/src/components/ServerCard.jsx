import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCog, FaServer } from 'react-icons/fa';

// Универсальный Invite Bot URL-генератор
const getInviteLink = (clientId, guildId) =>
  `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}`;

function ServerCard({ server }) {
  const navigate = useNavigate();
  
  // Получаем URL иконки сервера или используем fallback
  const iconUrl = server.icon
    ? `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png?size=128`
    : null;

  // Получаем ID клиента (бота) из env
  const clientId = process.env.REACT_APP_DISCORD_CLIENT_ID;
  const inviteUrl = getInviteLink(clientId, server.id);

  return (
    <div className="server-card">
      <div className="server-icon-container">
        {iconUrl ? (
          <img 
            src={iconUrl} 
            alt={server.name || 'Server'} 
            className="server-icon"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="server-icon-fallback" 
          style={{
            display: iconUrl ? 'none' : 'flex',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#5865F2',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}
        >
          {server.name ? server.name.charAt(0).toUpperCase() : <FaServer />}
        </div>
      </div>
      
      <h3 title={server.name || server.id}>
        {server.name || `Сервер ${server.id.slice(-4)}`}
      </h3>
      
      {server.hasBot ? (
        <button
          className="btn-manage"
          onClick={() => navigate(`/server/${server.id}`)}
          title="Управлять настройками сервера"
        >
          <FaCog /> Управлять
        </button>
      ) : (
        <>
          <p className="bot-missing-msg" style={{ 
            color: '#ff9800', 
            margin: '8px 0',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            Бот не добавлен или неактивен на этом сервере
          </p>
          <div style={{ textAlign: 'center' }}>
            <a
              className="btn-add-bot"
              href={inviteUrl}
              rel="noopener noreferrer"
              target="_blank"
              title="Добавить бота на сервер"
              style={{
                display: 'inline-block',
                background: '#5865F2',
                color: '#fff',
                padding: '10px 24px',
                borderRadius: '4px',
                fontWeight: 'bold',
                textDecoration: 'none',
                marginTop: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#4752C4'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#5865F2'}
            >
              Пригласить бота
            </a>
          </div>
          <p style={{
            fontSize: '12px',
            color: '#666',
            margin: '8px 0 0 0',
            textAlign: 'center'
          }}>
            Чтобы управлять сервером, добавьте Discord-бота
          </p>
        </>
      )}
    </div>
  );
}

export default ServerCard;