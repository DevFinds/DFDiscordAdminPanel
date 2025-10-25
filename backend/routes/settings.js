const express = require('express');
const { verifyToken } = require('../middleware/auth');
const Guild = require('../models/Guild');
const User = require('../models/User');
const axios = require('axios');
const router = express.Router();

const verifyAccess = async (userId, guildId) => {
  const user = await User.findById(userId);
  return user.guilds.some(g => g.id === guildId);
};

// Extract pageId from Buildin URL
const extractPageId = (urlOrId) => {
  if (!urlOrId) return null;
  // If it's already a UUID, return as is
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(urlOrId)) {
    return urlOrId;
  }
  // Extract from URL pattern: buildin.ai/pageId or buildin.ai/workspace/pageId
  const match = urlOrId.match(/buildin\.ai\/(?:[^/]+\/)?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  return match ? match[1] : null;
};

// Extract gallery fragment from URL (after #)
const extractGalleryFragment = (pageUrl) => {
  if (!pageUrl) return null;
  const match = pageUrl.match(/#([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  return match ? match[1] : null;
};

// Get guild roles from Discord API
router.get('/:guildId/roles', verifyToken, async (req, res) => {
  try {
    const { guildId } = req.params;
    
    if (!await verifyAccess(req.userId, guildId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get roles from Discord API using bot token
    const response = await axios.get(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
      }
    });

    // Filter out @everyone role and sort by position
    const roles = response.data
      .filter(role => role.name !== '@everyone')
      .sort((a, b) => b.position - a.position)
      .map(role => ({
        id: role.id,
        name: role.name,
        color: role.color,
        position: role.position,
        permissions: role.permissions,
        mentionable: role.mentionable,
        managed: role.managed
      }));

    res.json({ roles });
  } catch (err) {
    console.error('Error fetching guild roles:', err.response?.data || err.message);
    if (err.response?.status === 403) {
      return res.status(403).json({ error: 'Bot lacks permissions to view roles' });
    }
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Get guild channels from Discord API
router.get('/:guildId/channels', verifyToken, async (req, res) => {
  try {
    const { guildId } = req.params;
    
    if (!await verifyAccess(req.userId, guildId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get channels from Discord API using bot token
    const response = await axios.get(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
      }
    });

    // Filter and organize channels by type
    const channels = response.data
      .filter(channel => [0, 2, 5, 13].includes(channel.type)) // Text, Voice, News, Stage
      .sort((a, b) => a.position - b.position)
      .map(channel => ({
        id: channel.id,
        name: channel.name,
        type: channel.type,
        position: channel.position,
        parentId: channel.parent_id
      }));

    res.json({ channels });
  } catch (err) {
    console.error('Error fetching guild channels:', err.response?.data || err.message);
    if (err.response?.status === 403) {
      return res.status(403).json({ error: 'Bot lacks permissions to view channels' });
    }
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

// Get Buildin feeds
router.get('/:guildId/buildin', verifyToken, async (req, res) => {
  try {
    const { guildId } = req.params;
    
    if (!await verifyAccess(req.userId, guildId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const guild = await Guild.findOne({ guildId });
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    res.json({ feeds: guild.settings.buildinFeeds || [] });
  } catch (err) {
    console.error('Error fetching buildin feeds:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add/Update Buildin feed
router.post('/:guildId/buildin', verifyToken, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { pageUrl, channelId, interval = 5, enabled = true, title, initialBackfill = 3 } = req.body;
    
    if (!await verifyAccess(req.userId, guildId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const pageId = extractPageId(pageUrl);
    if (!pageId) {
      return res.status(400).json({ error: 'Invalid Buildin page URL or ID' });
    }

    if (!channelId || interval < 1 || interval > 60) {
      return res.status(400).json({ error: 'Invalid channel or interval (1-60 minutes)' });
    }

    if (initialBackfill < 0 || initialBackfill > 20) {
      return res.status(400).json({ error: 'Initial backfill must be between 0-20 posts' });
    }

    const galleryFragment = extractGalleryFragment(pageUrl);

    const guild = await Guild.findOne({ guildId });
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    // Check if feed already exists
    const existingFeed = guild.settings.buildinFeeds.find(f => f.pageId === pageId);
    if (existingFeed) {
      // Update existing
      existingFeed.pageUrl = pageUrl;
      existingFeed.channelId = channelId;
      existingFeed.interval = interval;
      existingFeed.enabled = enabled;
      existingFeed.title = title || pageId;
      existingFeed.initialBackfill = initialBackfill;
      existingFeed.galleryFragment = galleryFragment;
      // Reset backfill if settings changed
      if (existingFeed.initialBackfill !== initialBackfill) {
        existingFeed.backfilled = false;
      }
    } else {
      // Add new
      guild.settings.buildinFeeds.push({
        pageId,
        pageUrl,
        channelId,
        interval,
        enabled,
        lastCheck: new Date(),
        lastPostedIds: [],
        title: title || pageId,
        initialBackfill,
        backfilled: false,
        galleryFragment,
        createdAt: new Date()
      });
    }

    await guild.save();
    res.json({ success: true, feeds: guild.settings.buildinFeeds });
  } catch (err) {
    console.error('Error adding buildin feed:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete Buildin feed
router.delete('/:guildId/buildin/:feedId', verifyToken, async (req, res) => {
  try {
    const { guildId, feedId } = req.params;
    
    if (!await verifyAccess(req.userId, guildId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const guild = await Guild.findOne({ guildId });
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    guild.settings.buildinFeeds = guild.settings.buildinFeeds.filter(
      feed => feed._id.toString() !== feedId
    );
    
    await guild.save();
    res.json({ success: true, feeds: guild.settings.buildinFeeds });
  } catch (err) {
    console.error('Error deleting buildin feed:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Test Buildin feed (manual check)
router.post('/:guildId/buildin/test', verifyToken, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { pageId, channelId } = req.body;
    
    if (!await verifyAccess(req.userId, guildId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // This will be handled by the bot - just return success for now
    // The actual implementation will be in bot.js
    res.json({ 
      success: true, 
      message: 'Тестовая проверка запущена. Проверьте канал Discord.',
      pageId,
      channelId
    });
  } catch (err) {
    console.error('Error testing buildin feed:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Welcome settings
router.put('/:guildId/welcome', verifyToken, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { welcomeEnabled, welcomeChannel, welcomeMessage } = req.body;

    if (!await verifyAccess(req.userId, guildId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const guild = await Guild.findOneAndUpdate(
      { guildId },
      {
        $set: {
          'settings.welcomeEnabled': welcomeEnabled,
          'settings.welcomeChannel': welcomeChannel,
          'settings.welcomeMessage': welcomeMessage,
          updatedAt: Date.now()
        }
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, settings: guild.settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Auto-role settings
router.put('/:guildId/autorole', verifyToken, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { autoRoleEnabled, autoRoleIds } = req.body;

    if (!await verifyAccess(req.userId, guildId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const guild = await Guild.findOneAndUpdate(
      { guildId },
      {
        $set: {
          'settings.autoRoleEnabled': autoRoleEnabled,
          'settings.autoRoleIds': autoRoleIds,
          updatedAt: Date.now()
        }
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, settings: guild.settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add reaction role
router.post('/:guildId/reactionrole', verifyToken, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { messageId, channelId, emoji, roleId } = req.body;

    if (!await verifyAccess(req.userId, guildId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const guild = await Guild.findOne({ guildId });

    let reactionRole = guild.settings.reactionRoles.find(rr => rr.messageId === messageId);
    if (reactionRole) {
      reactionRole.roles.push({ emoji, roleId });
    } else {
      guild.settings.reactionRoles.push({
        messageId,
        channelId,
        roles: [{ emoji, roleId }]
      });
    }
    await guild.save();
    res.json({ success: true, settings: guild.settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete reaction role
router.delete('/:guildId/reactionrole/:messageId/:emoji', verifyToken, async (req, res) => {
  try {
    const { guildId, messageId, emoji } = req.params;

    if (!await verifyAccess(req.userId, guildId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const guild = await Guild.findOne({ guildId });
    const reactionRole = guild.settings.reactionRoles.find(rr => rr.messageId === messageId);

    if (reactionRole) {
      reactionRole.roles = reactionRole.roles.filter(r => r.emoji !== decodeURIComponent(emoji));
      if (reactionRole.roles.length === 0) {
        guild.settings.reactionRoles = guild.settings.reactionRoles.filter(rr => rr.messageId !== messageId);
      }
      await guild.save();
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add RSS feed
router.post('/:guildId/rss', verifyToken, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { url, channelId, interval } = req.body;

    if (!await verifyAccess(req.userId, guildId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const guild = await Guild.findOne({ guildId });
    guild.settings.rssFeeds.push({
      url,
      channelId,
      interval: interval || 30,
      lastCheck: new Date(),
      enabled: true
    });
    await guild.save();
    res.json({ success: true, settings: guild.settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete RSS feed
router.delete('/:guildId/rss/:feedId', verifyToken, async (req, res) => {
  try {
    const { guildId, feedId } = req.params;
    if (!await verifyAccess(req.userId, guildId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const guild = await Guild.findOne({ guildId });
    guild.settings.rssFeeds = guild.settings.rssFeeds.filter(feed => feed._id.toString() !== feedId);
    await guild.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;