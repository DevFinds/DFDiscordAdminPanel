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

// Get server statistics
router.get('/:guildId/stats', verifyToken, async (req, res) => {
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
    
    // Get bot instance and guild data
    const bot = req.app.locals.bot;
    if (!bot) {
      return res.status(500).json({ error: 'Bot not available' });
    }
    
    const discordGuild = bot.guilds.cache.get(guildId);
    if (!discordGuild) {
      return res.status(404).json({ error: 'Guild not found or bot not present' });
    }
    
    // Calculate statistics
    const totalMembers = discordGuild.memberCount;
    const onlineMembers = discordGuild.members.cache.filter(member => 
      member.presence?.status && member.presence.status !== 'offline'
    ).size;
    
    const textChannels = discordGuild.channels.cache.filter(channel => 
      channel.type === 0 // GUILD_TEXT
    ).size;
    
    const voiceChannels = discordGuild.channels.cache.filter(channel => 
      channel.type === 2 // GUILD_VOICE
    ).size;
    
    const roles = discordGuild.roles.cache.size - 1; // Exclude @everyone
    const botCount = discordGuild.members.cache.filter(member => member.user.bot).size;
    
    // Bot uptime
    const uptime = process.uptime();
    const uptimePercentage = 99.9; // This could be calculated from actual uptime logs
    
    const stats = {
      members: {
        total: totalMembers,
        online: onlineMembers,
        offline: totalMembers - onlineMembers,
        bots: botCount,
        humans: totalMembers - botCount
      },
      channels: {
        total: textChannels + voiceChannels,
        text: textChannels,
        voice: voiceChannels
      },
      roles: roles,
      bot: {
        uptime: uptime,
        uptimePercentage: uptimePercentage,
        lastRestart: new Date(Date.now() - (uptime * 1000))
      },
      server: {
        name: discordGuild.name,
        icon: discordGuild.iconURL({ dynamic: true, size: 256 }),
        createdAt: discordGuild.createdAt,
        ownerId: discordGuild.ownerId,
        verified: discordGuild.verified,
        partnered: discordGuild.partnered,
        boostLevel: discordGuild.premiumTier,
        boostCount: discordGuild.premiumSubscriptionCount
      }
    };
    
    res.json(stats);
  } catch (err) {
    console.error('Error in /servers/:guildId/stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get server analytics (activity data)
router.get('/:guildId/analytics', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const { guildId } = req.params;
    const { period = '7d' } = req.query; // 7d, 30d, 90d
    
    // Check permissions (same as above)
    const userGuild = user.guilds.find(g => g.id === guildId);
    if (!userGuild) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const permissions = BigInt(userGuild.permissions);
    const ADMINISTRATOR = BigInt(0x8);
    const MANAGE_GUILD = BigInt(0x20);
    const hasAdminPerms = (permissions & ADMINISTRATOR) === ADMINISTRATOR ||
                         (permissions & MANAGE_GUILD) === MANAGE_GUILD;
    
    if (!hasAdminPerms) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const bot = req.app.locals.bot;
    if (!bot) {
      return res.status(500).json({ error: 'Bot not available' });
    }
    
    const discordGuild = bot.guilds.cache.get(guildId);
    if (!discordGuild) {
      return res.status(404).json({ error: 'Guild not found or bot not present' });
    }
    
    // Generate mock analytics data (in real implementation, this would come from database)
    const days = period === '30d' ? 30 : period === '90d' ? 90 : 7;
    const activityData = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      activityData.push({
        date: date.toISOString().split('T')[0],
        messages: Math.floor(Math.random() * 500) + 100,
        joins: Math.floor(Math.random() * 10) + 1,
        leaves: Math.floor(Math.random() * 5) + 1,
        activeUsers: Math.floor(Math.random() * 50) + 20
      });
    }
    
    // Get top active members (mock data)
    const topMembers = Array.from(discordGuild.members.cache.values())
      .filter(member => !member.user.bot)
      .slice(0, 10)
      .map(member => ({
        id: member.id,
        username: member.user.username,
        displayName: member.displayName,
        avatar: member.user.displayAvatarURL({ dynamic: true, size: 64 }),
        messageCount: Math.floor(Math.random() * 1000) + 100,
        joinedAt: member.joinedAt
      }))
      .sort((a, b) => b.messageCount - a.messageCount);
    
    // Recent events (mock data)
    const recentEvents = [
      {
        type: 'member_join',
        user: 'User123',
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        details: 'Новый участник присоединился'
      },
      {
        type: 'role_assigned',
        user: 'User456',
        role: 'Moderator',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        details: 'Роль назначена'
      },
      {
        type: 'channel_created',
        channel: '#announcements',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        details: 'Новый канал создан'
      }
    ];
    
    const analytics = {
      period,
      activity: activityData,
      topMembers,
      recentEvents,
      summary: {
        totalMessages: activityData.reduce((sum, day) => sum + day.messages, 0),
        totalJoins: activityData.reduce((sum, day) => sum + day.joins, 0),
        totalLeaves: activityData.reduce((sum, day) => sum + day.leaves, 0),
        avgActiveUsers: Math.round(activityData.reduce((sum, day) => sum + day.activeUsers, 0) / activityData.length)
      }
    };
    
    res.json(analytics);
  } catch (err) {
    console.error('Error in /servers/:guildId/analytics:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;