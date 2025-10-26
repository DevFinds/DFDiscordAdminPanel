import React, { useState } from 'react';
import WelcomeSettings from '../components/Settings/WelcomeSettings';
import RoleSettings from '../components/Settings/RoleSettings';
import RSSSettings from '../components/Settings/RSSSettings';
import BuildinSettings from '../components/Settings/BuildinSettings';

function ServerSettings(){
  const [active, setActive] = useState('welcome');
  const guildId = window.location.pathname.split('/').pop();

  return (
    <div className="container" style={{padding:'24px 0'}}>
      <div className="tabs" role="tablist">
        {[
          {id:'welcome',label:'👋 Приветствия'},
          {id:'roles',label:'🛡️ Роли'},
          {id:'rss',label:'📰 RSS'},
          {id:'buildin',label:'🔗 Buildin'}
        ].map(t=> (
          <button key={t.id} className={`tab ${active===t.id?'active':''}`} onClick={()=>setActive(t.id)} role="tab">{t.label}</button>
        ))}
      </div>

      <div className={`pane ${active==='welcome'?'active':''}`}> 
        <WelcomeSettings guildId={guildId} settings={{}} onUpdate={()=>{}} />
      </div>
      <div className={`pane ${active==='roles'?'active':''}`}>
        <RoleSettings />
      </div>
      <div className={`pane ${active==='rss'?'active':''}`}>
        <RSSSettings />
      </div>
      <div className={`pane ${active==='buildin'?'active':''}`}>
        <BuildinSettings />
      </div>
    </div>
  );
}

export default ServerSettings;
