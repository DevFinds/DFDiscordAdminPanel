import React from 'react';

function Dashboard({ user }){
  return (
    <main className="container section">
      <h2 className="section-title">Серверы для управления</h2>
      <div className="grid cards">
        {/* Placeholder: servers should come from props or API in parent; keeping markup only */}
        <article className="card">
          <div className="server-header">
            <div className="server-icon">🧩</div>
            <div>
              <div className="server-name">Web Project</div>
              <div className="server-meta status warn">Бот не активен на этом сервере</div>
            </div>
          </div>
          <p className="muted" style={{marginBottom:10}}>Чтобы управлять сервером, добавьте Discord‑бота</p>
          <div className="server-actions">
            <button className="btn primary">Пригласить бота</button>
            <button className="btn" disabled>Управлять</button>
          </div>
        </article>
      </div>
    </main>
  );
}

export default Dashboard;
