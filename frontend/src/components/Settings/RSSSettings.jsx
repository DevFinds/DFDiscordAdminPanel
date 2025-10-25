import React, { useState } from 'react';
import { settings } from '../../services/api';

function RSSSettings({ guildId, settings: guildSettings, onUpdate }) {
  const [feeds, setFeeds] = useState(guildSettings.rssFeeds || []);
  const [newFeed, setNewFeed] = useState({ url: '', channelId: '', interval: 30 });

  const handleAddFeed = async () => {
    if (!newFeed.url || !newFeed.channelId) {
      alert('Fill out RSS URL and Channel ID');
      return;
    }
    try {
      await settings.addRSSFeed(guildId, newFeed);
      alert('RSS feed added!');
      setNewFeed({ url: '', channelId: '', interval: 30 });
      onUpdate();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteFeed = async (feedId) => {
    if (!window.confirm('Delete this RSS feed?')) return;
    try {
      await settings.deleteRSSFeed(guildId, feedId);
      alert('Deleted');
      onUpdate();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="settings-panel">
      <h2>RSS Feeds</h2>
      <div className="rss-list">
        {feeds.length === 0 ? (
          <p>No RSS feeds added</p>
        ) : (
          feeds.map((feed, idx) => (
            <div key={feed._id || idx} className="rss-item">
              <div>
                <strong>{feed.url}</strong>
                <p>Channel: {feed.channelId} | Interval: {feed.interval} min</p>
              </div>
              <button onClick={() => handleDeleteFeed(feed._id)}>Delete</button>
            </div>
          ))
        )}
      </div>
      <h3>Add RSS Feed</h3>
      <div className="form-group">
        <input 
          type="text" 
          placeholder="RSS feed URL"
          value={newFeed.url}
          onChange={(e) => setNewFeed({...newFeed, url: e.target.value})}
        />
      </div>
      <div className="form-group">
        <input 
          type="text" 
          placeholder="Channel ID"
          value={newFeed.channelId}
          onChange={(e) => setNewFeed({...newFeed, channelId: e.target.value})}
        />
      </div>
      <div className="form-group">
        <label>Check interval (minutes):</label>
        <input 
          type="number" 
          min="5"
          value={newFeed.interval}
          onChange={(e) => setNewFeed({...newFeed, interval: parseInt(e.target.value)})}
        />
      </div>
      <button className="btn-add" onClick={handleAddFeed}>
        Add feed
      </button>
    </div>
  );
}

export default RSSSettings;
