const express = require('express');
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
const Guild = require('../models/Guild');
const router = express.Router();

// Get user's servers
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const adminServers = user.guilds.filter(guild => {
      const permissions = BigInt(guild.permissions);
      const ADMINISTRATOR = BigInt(0x8);
      const MANAGE_GUILD = BigInt(0x20);
      return (permissions & ADMINISTRATOR) === ADMINISTRATOR ||
             (permissions & MANAGE_GUILD) === MANAGE_GUILD;
    });
    const serversWithSettings = await Promise.all(
      adminServers.map(async (guild) => {
        const settings = await Guild.findOne({ guildId: guild.id });
        return {
          ...guild,
          hasBot: true,
          settings: settings?.settings || {}
        };
      })
    );
    res.json(serversWithSettings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific server
router.get('/:guildId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const { guildId } = req.params;
    const hasAccess = user.guilds.some(g => g.id === guildId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    let guild = await Guild.findOne({ guildId });
    if (!guild) {
      guild = await Guild.create({
        guildId,
        name: user.guilds.find(g => g.id === guildId)?.name,
        ownerId: user.discordId
      });
    }
    res.json(guild);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
