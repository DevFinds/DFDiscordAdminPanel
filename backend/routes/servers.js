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
    
    // Filter servers where user has admin permissions
    const adminServers = user.guilds.filter(guild => {
      const permissions = BigInt(guild.permissions);
      const ADMINISTRATOR = BigInt(0x8);
      const MANAGE_GUILD = BigInt(0x20);
      return (permissions & ADMINISTRATOR) === ADMINISTRATOR ||
             (permissions & MANAGE_GUILD) === MANAGE_GUILD;
    });
    
    // Check which servers have the bot and get their settings
    const serversWithSettings = await Promise.all(
      adminServers.map(async (guild) => {
        // Check if guild exists in database (means bot is present)
        const guildSettings = await Guild.findOne({ guildId: guild.id });
        const hasBot = !!guildSettings;
        
        return {
          id: guild.id,
          name: guild.name,
          icon: guild.icon,
          owner: guild.owner,
          permissions: guild.permissions,
          hasBot: hasBot,
          settings: guildSettings?.settings || {}
        };
      })
    );
    
    res.json(serversWithSettings);
  } catch (err) {
    console.error('Error in /servers:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific server
router.get('/:guildId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const { guildId } = req.params;
    
    // Check if user has access to this guild
    const userGuild = user.guilds.find(g => g.id === guildId);
    if (!userGuild) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check if user has admin permissions
    const permissions = BigInt(userGuild.permissions);
    const ADMINISTRATOR = BigInt(0x8);
    const MANAGE_GUILD = BigInt(0x20);
    const hasAdminPerms = (permissions & ADMINISTRATOR) === ADMINISTRATOR ||
                         (permissions & MANAGE_GUILD) === MANAGE_GUILD;
    
    if (!hasAdminPerms) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    let guild = await Guild.findOne({ guildId });
    if (!guild) {
      // If guild doesn't exist in database, bot is not present
      return res.status(404).json({ 
        error: 'Bot not found on this server',
        message: 'Бот не добавлен или неактивен на этом сервере'
      });
    }
    
    res.json(guild);
  } catch (err) {
    console.error('Error in /servers/:guildId:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;