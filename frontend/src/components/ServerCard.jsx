import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCog, FaServer } from 'react-icons/fa';

// Универсальный Invite Bot URL-генератор
const getInviteLink = (clientId, guildId) =>
  `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}`;

function ServerCard({ server }) {
  const navigate = useNavigate();

  // Безопасные значения
  const guildId = typeof server?.id === 'string' ? server.id : '';
  const guildIcon = typeof server?.icon === 'string' ? server.icon : '';
  const nameRaw = typeof server?.name === 'string' ? server.name : '';

  const iconUrl = guildId && guildIcon
    ? `https://cdn.discordapp.com/icons/${guildId}/${guildIcon}.png?size=128`
    : null;

  const clientId = process.env.REACT_APP_DISCORD_CLIENT_ID || '';
  const inviteUrl = clientId && guildId ? getInviteLink(clientId, guildId) : '#';

  const safeIdTail = guildId ? (guildId.length >= 4 ? guildId.slice(-4) : guildId) : '—';
  const safeTitle = nameRaw || guildId || 'Server';
  const safeHeading = nameRaw || `Сервер ${safeIdTail}`;

  return (
    <div className="server-card">
      <div className="server-icon-container">
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={safeTitle}
            className="server-icon"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextSibling;
              if (fallback) fallback.style.display = 'flex';
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
          {nameRaw ? nameRaw.charAt(0).toUpperCase() : <FaServer />}
        </div>
      </div>

      <h3 title={safeTitle}>{safeHeading}</h3>

      {server?.hasBot ? (
        <button
          className="btn-manage"
          onClick={() => guildId && navigate(`/server/${guildId}`)}
          title="Управлять настройками сервера"
          disabled={!guildId}
        >
          <FaCog /> Управлять
        </button>
      ) : (
        <>
          <p className="bot-missing-msg" style={{ color: '#ff9800', margin: '8px 0', fontSize: '14px', textAlign: 'center' }}>
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
                background: clientId && guildId ? '#5865F2' : '#888',
                color: '#fff',
                padding: '10px 24px',
                borderRadius: '4px',
                fontWeight: 'bold',
                textDecoration: 'none',
                marginTop: '8px',
                pointerEvents: clientId && guildId ? 'auto' : 'none'
              }}
            >
              Пригласить бота
            </a>
          </div>
          <p style={{ fontSize: '12px', color: '#666', margin: '8px 0 0 0', textAlign: 'center' }}>
            Чтобы управлять сервером, добавьте Discord-бота
          </p>
        </>
      )}
    </div>
  );
}

export default ServerCard;
