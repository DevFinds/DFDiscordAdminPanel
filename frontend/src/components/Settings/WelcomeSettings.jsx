import React, { useState } from 'react';
import { settings } from '../../services/api';

function WelcomeSettings({ guildId, settings: guildSettings, onUpdate }) {
  const [enabled, setEnabled] = useState(guildSettings.welcomeEnabled || false);
  const [channel, setChannel] = useState(guildSettings.welcomeChannel || '');
  const [message, setMessage] = useState(guildSettings.welcomeMessage || 'Welcome, {{user}}!');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settings.updateWelcome(guildId, {
        welcomeEnabled: enabled,
        welcomeChannel: channel,
        welcomeMessage: message
      });
      alert('Welcome settings saved!');
      onUpdate();
    } catch (err) {
      alert('Saving error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-panel">
      <h2>Welcome Message Settings</h2>
      <div className="form-group">
        <label>
          <input 
            type="checkbox" 
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Enable welcome messages
        </label>
      </div>
      {enabled && (
        <>
          <div className="form-group">
            <label>Channel ID for welcome:</label>
            <input 
              type="text" 
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="123456789012345678"
            />
            <small>Right click channel in Discord → Copy ID</small>
          </div>
          <div className="form-group">
            <label>Welcome message text:</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Use {{user}}, {{username}}, {{server}}"
            />
            <small>
              Available variables: {'{{user}}'}, {'{{username}}'}, {'{{server}}'}, {'{{memberCount}}'}
            </small>
          </div>
        </>
      )}
      <button 
        className="btn-save"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}

export default WelcomeSettings;
