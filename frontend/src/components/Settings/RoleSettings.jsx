import React, { useState, useEffect } from 'react';
import { settings, guild } from '../../services/api';
import { FaCrown, FaRobot, FaEye, FaTimes, FaPlus, FaSpinner } from 'react-icons/fa';

function RoleSettings({ guildId, settings: guildSettings, onUpdate }) {
  const [autoRoleEnabled, setAutoRoleEnabled] = useState(guildSettings.autoRoleEnabled || false);
  const [selectedRoles, setSelectedRoles] = useState(guildSettings.autoRoleIds || []);
  const [reactionRoles, setReactionRoles] = useState(guildSettings.reactionRoles || []);
  const [newRR, setNewRR] = useState({ messageId: '', channelId: '', emoji: '', roleId: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGuildData();
  }, [guildId]);

  const loadGuildData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [rolesResponse, channelsResponse] = await Promise.all([
        guild.getRoles(guildId),
        guild.getChannels(guildId)
      ]);
      
      setRoles(rolesResponse.data.roles || []);
      setChannels(channelsResponse.data.channels || []);
    } catch (err) {
      console.error('Error loading guild data:', err);
      setError(err.response?.data?.error || 'Ошибка загрузки данных сервера');
    } finally {
      setLoading(false);
    }
  };

  const getRoleById = (roleId) => roles.find(r => r.id === roleId);
  const getChannelById = (channelId) => channels.find(c => c.id === channelId);

  const handleRoleToggle = (roleId) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSaveAutoRoles = async () => {
    setSaving(true);
    try {
      await settings.updateAutoRole(guildId, {
        autoRoleEnabled,
        autoRoleIds: selectedRoles
      });
      alert('✅ Настройки автоматических ролей сохранены!');
      onUpdate();
    } catch (err) {
      alert('❌ Ошибка: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleAddReactionRole = async () => {
    if (!newRR.messageId || !newRR.channelId || !newRR.emoji || !newRR.roleId) {
      alert('Пожалуйста, заполните все поля');
      return;
    }
    try {
      await settings.addReactionRole(guildId, newRR);
      alert('✅ Реакция-роль добавлена!');
      setNewRR({ messageId: '', channelId: '', emoji: '', roleId: '' });
      onUpdate();
    } catch (err) {
      alert('❌ Ошибка: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteReactionRole = async (messageId, emoji) => {
    if (!window.confirm('Удалить эту реакцию-роль?')) return;
    try {
      await settings.deleteReactionRole(guildId, messageId, emoji);
      alert('✅ Реакция-роль удалена!');
      onUpdate();
    } catch (err) {
      alert('❌ Ошибка: ' + (err.response?.data?.error || err.message));
    }
  };

  const getRoleColor = (color) => {
    if (!color || color === 0) return '#99AAB5';
    return `#${color.toString(16).padStart(6, '0')}`;
  };

  if (loading) {
    return (
      <div className="settings-panel" style={{ textAlign: 'center', padding: '2rem' }}>
        <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '2rem', color: '#5865F2' }} />
        <p>Загрузка ролей и каналов сервера...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-panel">
        <div style={{ 
          background: 'rgba(240, 71, 71, 0.1)', 
          border: '1px solid #f04747', 
          padding: '1rem', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#f04747', margin: '0 0 0.5rem 0' }}>⚠️ Ошибка загрузки</h3>
          <p>{error}</p>
          <button 
            onClick={loadGuildData}
            style={{
              background: '#5865F2',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-panel">
      {/* Auto-roles Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaCrown style={{ color: '#faa61a' }} /> Автоматические роли
        </h2>
        <p style={{ color: '#b9bbbe', marginBottom: '1rem' }}>
          Роли, которые будут автоматически присваиваться новым участникам сервера
        </p>
        
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={autoRoleEnabled}
              onChange={(e) => setAutoRoleEnabled(e.target.checked)}
            />
            Включить автоматические роли
          </label>
        </div>

        {autoRoleEnabled && (
          <div style={{ marginTop: '1rem' }}>
            <h4>Выберите роли для автоматического назначения:</h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
              gap: '0.5rem',
              maxHeight: '300px',
              overflowY: 'auto',
              padding: '0.5rem',
              border: '1px solid #40444b',
              borderRadius: '6px',
              background: '#2c2f33'
            }}>
              {roles.map(role => (
                <label 
                  key={role.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    cursor: role.managed ? 'not-allowed' : 'pointer',
                    background: selectedRoles.includes(role.id) ? 'rgba(88, 101, 242, 0.2)' : 'transparent',
                    border: selectedRoles.includes(role.id) ? '1px solid #5865f2' : '1px solid transparent',
                    opacity: role.managed ? 0.5 : 1
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => handleRoleToggle(role.id)}
                    disabled={role.managed}
                  />
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: getRoleColor(role.color),
                      flexShrink: 0
                    }}
                  />
                  <span style={{ fontSize: '0.9rem' }}>
                    {role.name}
                    {role.managed && <FaRobot style={{ marginLeft: '0.25rem', color: '#7289da' }} title="Управляется ботом" />}
                  </span>
                </label>
              ))}
            </div>
            
            {selectedRoles.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h5>Выбранные роли ({selectedRoles.length}):</h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedRoles.map(roleId => {
                    const role = getRoleById(roleId);
                    if (!role) return null;
                    return (
                      <span
                        key={roleId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          background: getRoleColor(role.color),
                          color: role.color === 0 ? '#2c2f33' : 'white',
                          fontSize: '0.8rem'
                        }}
                      >
                        {role.name}
                        <FaTimes 
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleRoleToggle(roleId)}
                          title="Убрать роль"
                        />
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <button 
          className="btn-save" 
          onClick={handleSaveAutoRoles} 
          disabled={saving}
          style={{ marginTop: '1rem' }}
        >
          {saving ? '💾 Сохранение...' : '💾 Сохранить настройки'}
        </button>
      </div>

      <hr />

      {/* Reaction Roles Section */}
      <div>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ⚡ Реакции-роли
        </h2>
        <p style={{ color: '#b9bbbe', marginBottom: '1rem' }}>
          Пользователи получат роль при добавлении реакции и потеряют при её удалении
        </p>

        <div className="reaction-roles-list">
          {reactionRoles.length === 0 ? (
            <p style={{ color: '#72767d', textAlign: 'center', padding: '2rem' }}>Реакции-роли не настроены</p>
          ) : (
            reactionRoles.map((rr, idx) => {
              const channel = getChannelById(rr.channelId);
              return (
                <div key={idx} className="reaction-role-item" style={{
                  background: '#2c2f33',
                  padding: '1rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  border: '1px solid #40444b'
                }}>  
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>📄 Сообщение:</strong> {rr.messageId}
                    {channel && <span style={{ color: '#7289da', marginLeft: '0.5rem' }}>в #{channel.name}</span>}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {rr.roles.map((roleData, i) => {
                      const role = getRoleById(roleData.roleId);
                      return (
                        <div key={i} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          background: '#40444b',
                          borderRadius: '4px'
                        }}>
                          <span style={{ fontSize: '1.2rem' }}>{roleData.emoji}</span>
                          <span>→</span>
                          {role ? (
                            <span style={{ color: getRoleColor(role.color) }}>{role.name}</span>
                          ) : (
                            <span style={{ color: '#f04747' }}>Роль не найдена</span>
                          )}
                          <FaTimes
                            style={{ cursor: 'pointer', color: '#f04747' }}
                            onClick={() => handleDeleteReactionRole(rr.messageId, roleData.emoji)}
                            title="Удалить"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaPlus /> Добавить реакцию-роль
        </h3>
        
        <div className="form-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div>
            <label>ID сообщения:</label>
            <input
              type="text"
              placeholder="123456789012345678"
              value={newRR.messageId}
              onChange={(e) => setNewRR({...newRR, messageId: e.target.value})}
            />
          </div>
          
          <div>
            <label>Канал:</label>
            <select
              value={newRR.channelId}
              onChange={(e) => setNewRR({...newRR, channelId: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#40444b',
                border: '1px solid #72767d',
                borderRadius: '4px',
                color: '#ffffff'
              }}
            >
              <option value="">Выберите канал</option>
              {channels.filter(c => [0, 5].includes(c.type)).map(channel => (
                <option key={channel.id} value={channel.id}>
                  #{channel.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label>Эмодзи:</label>
            <input
              type="text"
              placeholder="👍 или :thumbsup:"
              value={newRR.emoji}
              onChange={(e) => setNewRR({...newRR, emoji: e.target.value})}
            />
          </div>
          
          <div>
            <label>Роль:</label>
            <select
              value={newRR.roleId}
              onChange={(e) => setNewRR({...newRR, roleId: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#40444b',
                border: '1px solid #72767d',
                borderRadius: '4px',
                color: '#ffffff'
              }}
            >
              <option value="">Выберите роль</option>
              {roles.filter(r => !r.managed).map(role => (
                <option key={role.id} value={role.id} style={{ color: getRoleColor(role.color) }}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <button className="btn-add" onClick={handleAddReactionRole}>
          ➕ Добавить реакцию-роль
        </button>
      </div>
    </div>
  );
}

export default RoleSettings;