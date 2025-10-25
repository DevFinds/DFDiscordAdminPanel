import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCog } from 'react-icons/fa';

// Универсальный Invite Bot URL-генератор
const getInviteLink = (clientId, guildId) =>
  `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}`;

function ServerCard({ server }) {
  const navigate = useNavigate();
  const iconUrl = server.icon
    ? `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`
    : '/default-server.png';

  // возьмём из env ID клиента (бота)
  const clientId = process.env.REACT_APP_DISCORD_CLIENT_ID;
  const inviteUrl = getInviteLink(clientId, server.id);

  return (
    <div className="server-card">
      <img src={iconUrl} alt={server.name} className="server-icon" />
      <h3>{server.name}</h3>
      {server.hasBot ? (
        <button
          className="btn-manage"
          onClick={() => navigate(`/server/${server.id}`)}
        >
          <FaCog /> Управлять
        </button>
      ) : (
        <>
          <p className="bot-missing-msg" style={{ color: '#ff9800', margin: '8px 0' }}>
            Бот не добавлен на сервер
          </p>
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
              marginTop: '8px'
            }}
          >
            Пригласить бота
          </a>
        </>
      )}
    </div>
  );
}

export default ServerCard;
