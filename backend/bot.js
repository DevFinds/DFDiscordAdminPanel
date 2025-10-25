require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mongoose = require('mongoose');
const Guild = require('./models/Guild');
const Parser = require('rss-parser');
const cron = require('node-cron');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent
  ]
});

const rssParser = new Parser();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🤖 Bot connected to MongoDB'))
  .catch(err => console.error('Bot MongoDB error:', err));

client.once('ready', () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);
  cron.schedule('*/10 * * * *', () => {
    checkRSSFeeds();
  });
  console.log('🔄 RSS feed checker scheduled (every 10 minutes)');
});

client.on('guildMemberAdd', async (member) => {
  try {
    const guildSettings = await Guild.findOne({ guildId: member.guild.id });
    if (!guildSettings) return;
    if (guildSettings.settings.welcomeEnabled && guildSettings.settings.welcomeChannel) {
      const channel = member.guild.channels.cache.get(guildSettings.settings.welcomeChannel);
      if (channel) {
        const welcomeMessage = guildSettings.settings.welcomeMessage
          .replace('{{user}}', `<@${member.id}>`)
          .replace('{{username}}', member.user.username)
          .replace('{{server}}', member.guild.name)
          .replace('{{memberCount}}', member.guild.memberCount);
        await channel.send(welcomeMessage);
        console.log(`👋 Sent welcome message for ${member.user.tag} in ${member.guild.name}`);
      }
    }
    if (guildSettings.settings.autoRoleEnabled && guildSettings.settings.autoRoleIds.length > 0) {
      for (const roleId of guildSettings.settings.autoRoleIds) {
        const role = member.guild.roles.cache.get(roleId);
        if (role && member.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
          await member.roles.add(role).catch(err => {
            console.error(`Failed to add role ${role.name}:`, err.message);
          });
          console.log(`✅ Auto-assigned role ${role.name} to ${member.user.tag}`);
        }
      }
    }
  } catch (err) {
    console.error('Error in guildMemberAdd:', err);
  }
});

// Reaction roles — Add/remove:
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) {
    try { await reaction.fetch(); } catch { return; }
  }
  try {
    const guildSettings = await Guild.findOne({ guildId: reaction.message.guildId });
    if (!guildSettings) return;
    const reactionRole = guildSettings.settings.reactionRoles.find(
      rr => rr.messageId === reaction.message.id
    );
    if (!reactionRole) return;
    const roleConfig = reactionRole.roles.find(r => r.emoji === reaction.emoji.name || r.emoji === reaction.emoji.id);
    if (roleConfig) {
      const member = await reaction.message.guild.members.fetch(user.id);
      const role = reaction.message.guild.roles.cache.get(roleConfig.roleId);
      if (role && member &&
          member.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
        await member.roles.add(role);
        console.log(`✅ Added role ${role.name} to ${user.username} via reaction`);
      }
    }
  } catch (err) {
    console.error('Error in messageReactionAdd:', err);
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) {
    try { await reaction.fetch(); } catch { return; }
  }
  try {
    const guildSettings = await Guild.findOne({ guildId: reaction.message.guildId });
    if (!guildSettings) return;
    const reactionRole = guildSettings.settings.reactionRoles.find(
      rr => rr.messageId === reaction.message.id
    );
    if (!reactionRole) return;
    const roleConfig = reactionRole.roles.find(r => r.emoji === reaction.emoji.name || r.emoji === reaction.emoji.id);
    if (roleConfig) {
      const member = await reaction.message.guild.members.fetch(user.id);
      const role = reaction.message.guild.roles.cache.get(roleConfig.roleId);
      if (role && member &&
          member.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
        await member.roles.remove(role);
        console.log(`➖ Removed role ${role.name} from ${user.username} via reaction`);
      }
    }
  } catch (err) {
    console.error('Error in messageReactionRemove:', err);
  }
});

// RSS feed checker:
async function checkRSSFeeds() {
  try {
    const guilds = await Guild.find({ 'settings.rssFeeds.0': { $exists: true } });
    for (const guildDoc of guilds) {
      for (const feed of guildDoc.settings.rssFeeds) {
        if (!feed.enabled) continue;
        const now = new Date();
        const lastCheck = feed.lastCheck || new Date(0);
        const intervalMs = feed.interval * 60 * 1000;
        if (now - lastCheck < intervalMs) continue;
        try {
          const parsed = await rssParser.parseURL(feed.url);
          const guild = client.guilds.cache.get(guildDoc.guildId);
          if (!guild) continue;
          const channel = guild.channels.cache.get(feed.channelId);
          if (!channel) continue;
          const newItems = parsed.items
            .filter(item => new Date(item.pubDate) > lastCheck)
            .slice(0, 3);
          for (const item of newItems) {
            const embed = new EmbedBuilder()
              .setTitle(item.title || 'New Post')
              .setURL(item.link)
              .setDescription(item.contentSnippet?.substring(0, 200) + '...' || 'No description')
              .setColor('#5865F2')
              .setTimestamp(new Date(item.pubDate))
              .setFooter({ text: parsed.title || 'RSS Feed' });
            if (item.enclosure?.url) embed.setImage(item.enclosure.url);
            await channel.send({ embeds: [embed] });
            console.log(`📰 Posted RSS update to ${guild.name}`);
          }
          feed.lastCheck = now;
          await guildDoc.save();
        } catch (feedError) {
          console.error(`RSS feed error for ${feed.url}:`, feedError.message);
        }
      }
    }
  } catch (err) {
    console.error('Error in checkRSSFeeds:', err);
  }
}

// Error handling & graceful shutdown:
client.on('error', error => { console.error('Discord client error:', error); });
process.on('unhandledRejection', error => { console.error('Unhandled promise rejection:', error); });
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down bot...');
  await client.destroy();
  await mongoose.connection.close();
  process.exit(0);
});
client.login(process.env.DISCORD_BOT_TOKEN)
  .catch(err => {
    console.error('❌ Failed to login bot:', err);
    process.exit(1);
  });
