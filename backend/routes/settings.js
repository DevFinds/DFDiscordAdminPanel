const express = require('express');
const { verifyToken } = require('../middleware/auth');
const Guild = require('../models/Guild');
const User = require('../models/User');
const router = express.Router();

const verifyAccess = async (userId, guildId) => {
  const user = await User.findById(userId);
  return user.guilds.some(g => g.id === guildId);
};

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
