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