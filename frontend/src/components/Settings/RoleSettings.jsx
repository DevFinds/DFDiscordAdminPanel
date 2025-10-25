import React, { useState } from 'react';
import { settings } from '../../services/api';

function RoleSettings({ guildId, settings: guildSettings, onUpdate }) {
  const [autoRoleEnabled, setAutoRoleEnabled] = useState(guildSettings.autoRoleEnabled || false);
  const [autoRoles, setAutoRoles] = useState((guildSettings.autoRoleIds || []).join(', '));
  const [reactionRoles, setReactionRoles] = useState(guildSettings.reactionRoles || []);
  const [newRR, setNewRR] = useState({ messageId: '', channelId: '', emoji: '', roleId: '' });
  const [saving, setSaving] = useState(false);

  const handleSaveAutoRoles = async () => {
    setSaving(true);
    try {
      const roleIds = autoRoles.split(',').map(r => r.trim()).filter(r => r);
      await settings.updateAutoRole(guildId, {
        autoRoleEnabled,
        autoRoleIds: roleIds
      });
      alert('Auto-roles settings saved!');
      onUpdate();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddReactionRole = async () => {
    if (!newRR.messageId || !newRR.channelId || !newRR.emoji || !newRR.roleId) {
      alert('Please fill all fields');
      return;
    }
    try {
      await settings.addReactionRole(guildId, newRR);
      alert('Reaction role added!');
      setNewRR({ messageId: '', channelId: '', emoji: '', roleId: '' });
      onUpdate();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteReactionRole = async (messageId, emoji) => {
    if (!window.confirm('Delete this reaction role?')) return;
    try {
      await settings.deleteReactionRole(guildId, messageId, emoji);
      alert('Role deleted');
      onUpdate();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="settings-panel">
      <h2>Auto-roles on Join</h2>
      <div className="form-group">
        <label>
          <input 
            type="checkbox" 
            checked={autoRoleEnabled}
            onChange={(e) => setAutoRoleEnabled(e.target.checked)}
          />
          Enable auto-roles
        </label>
      </div>
      {autoRoleEnabled && (
        <div className="form-group">
          <label>Role IDs (comma separated):</label>
          <input 
            type="text" 
            value={autoRoles}
            onChange={(e) => setAutoRoles(e.target.value)}
            placeholder="1234567890123456,9876543210987654"
          />
        </div>
      )}
      <button className="btn-save" onClick={handleSaveAutoRoles} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
      <hr />
      <h2>Reaction Roles</h2>
      <div className="reaction-roles-list">
        {reactionRoles.length === 0 ? (
          <p>No reaction roles set up</p>
        ) : (
          reactionRoles.map((rr, idx) => (
            <div key={idx} className="reaction-role-item">
              <strong>Message: {rr.messageId}</strong>
              <ul>
                {rr.roles.map((role, i) => (
                  <li key={i}>
                    {role.emoji} → Role {role.roleId}
                    <button onClick={() => handleDeleteReactionRole(rr.messageId, role.emoji)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
      <h3>Add Reaction Role</h3>
      <div className="form-grid">
        <input 
          type="text" 
          placeholder="Message ID"
          value={newRR.messageId}
          onChange={(e) => setNewRR({...newRR, messageId: e.target.value})}
        />
        <input 
          type="text" 
          placeholder="Channel ID"
          value={newRR.channelId}
          onChange={(e) => setNewRR({...newRR, channelId: e.target.value})}
        />
        <input 
          type="text" 
          placeholder="Emoji (e.g., 👍)"
          value={newRR.emoji}
          onChange={(e) => setNewRR({...newRR, emoji: e.target.value})}
        />
        <input 
          type="text" 
          placeholder="Role ID"
          value={newRR.roleId}
          onChange={(e) => setNewRR({...newRR, roleId: e.target.value})}
        />
      </div>
      <button className="btn-add" onClick={handleAddReactionRole}>
        Add
      </button>
    </div>
  );
}

export default RoleSettings;
