import React, { useState, useEffect } from 'react';
import { servers } from '../services/api';
import ServerCard from './ServerCard';

function Dashboard({ user }) {
  const [userServers, setUserServers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServers();
    // eslint-disable-next-line
  }, []);

  const loadServers = async () => {
    try {
      const response = await servers.getAll();
      setUserServers(response.data);
    } catch (err) {
      console.error('Error loading servers:', err);
    } finally {
      setLoading(false);
    }
  };

  const allWithoutBot = userServers.length > 0 && userServers.every(s => !s.hasBot);

  return (
    <div className="dashboard">
      <div className="container">
        <h1>Серверы, доступные для управления</h1>
        {allWithoutBot && (
          <div className="alert alert-warning" style={{
            background: '#fff3cd',
            color: '#856404',
            padding: '16px',
            borderRadius: '6px',
            marginBottom: '24px',
            border: '1px solid #ffeeba'
          }}>
            <b>Чтобы использовать админ-панель:</b><br />
            <span>
              На ваши серверы нужно <b>добавить Discord-бота</b>. <br />
              Нажмите «Пригласить бота» под нужным сервером.
            </span>
          </div>
        )}
        <div className="server-grid">
          {userServers.length === 0 ? (
            <p>У вас нет серверов, где вы администратор, или отсутствуют серверы с добавленным ботом.</p>
          ) : (
            userServers.map(server => (
              <ServerCard key={server.id} server={server} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
