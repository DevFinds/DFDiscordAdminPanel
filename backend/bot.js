require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mongoose = require('mongoose');
const Guild = require('./models/Guild');
const Parser = require('rss-parser');
const cron = require('node-cron');
const axios = require('axios');

let cheerio;
try {
  cheerio = require('cheerio');
} catch (err) {
  console.warn('⚠️ Cheerio not available, using fallback parsing');
  cheerio = null;
}

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

client.once('ready', async () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);

  // Ensure guild docs exist and update basic info
  for (const [guildId, guild] of client.guilds.cache) {
    try {
      let guildDoc = await Guild.findOne({ guildId });
      if (!guildDoc) {
        guildDoc = await Guild.create({
          guildId,
          name: guild.name,
          icon: guild.icon,
          ownerId: guild.ownerId,
          settings: {}
        });
        console.log(`🗃 Guild "${guild.name}" [${guildId}] добавлен в MongoDB`);
      } else {
        guildDoc.name = guild.name;
        guildDoc.icon = guild.icon;
        guildDoc.ownerId = guild.ownerId;
        guildDoc.updatedAt = new Date();
        await guildDoc.save();
        console.log(`🔄 Guild "${guild.name}" [${guildId}] обновлен в MongoDB`);
      }
    } catch (error) {
      console.error(`Error updating guild ${guild.name}:`, error);
    }
  }

  // Schedule RSS checks every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    checkRSSFeeds();
  });

  // Schedule Buildin checks every minute dispatcher
  cron.schedule('* * * * *', () => {
    checkBuildinFeeds().catch(err => console.error('Buildin cron error:', err));
  });
});

client.on('guildCreate', async (guild) => {
  try {
    let guildDoc = await Guild.findOne({ guildId: guild.id });
    if (!guildDoc) {
      guildDoc = await Guild.create({
        guildId: guild.id,
        name: guild.name,
        icon: guild.icon,
        ownerId: guild.ownerId,
        settings: {}
      });
      console.log(`🗃 Guild "${guild.name}" [${guild.id}] добавлен в MongoDB (guildCreate)`);
    } else {
      guildDoc.name = guild.name;
      guildDoc.icon = guild.icon;
      guildDoc.ownerId = guild.ownerId;
      guildDoc.updatedAt = new Date();
      await guildDoc.save();
      console.log(`🔄 Guild "${guild.name}" [${guild.id}] обновлен в MongoDB (guildCreate)`);
    }
  } catch (error) {
    console.error(`Error in guildCreate for ${guild.name}:`, error);
  }
});

client.on('guildDelete', async (guild) => {
  try {
    await Guild.findOneAndDelete({ guildId: guild.id });
    console.log(`🗑 Guild "${guild.name}" [${guild.id}] удален из MongoDB (guildDelete)`);
  } catch (error) {
    console.error(`Error in guildDelete for ${guild.name}:`, error);
  }
});

client.on('guildMemberAdd', async (member) => {
  try {
    const guildSettings = await Guild.findOne({ guildId: member.guild.id });
    if (!guildSettings) return;

    if (guildSettings.settings.welcomeEnabled && guildSettings.settings.welcomeChannel) {
      const channel = member.guild.channels.cache.get(guildSettings.settings.welcomeChannel);
      if (channel) {
        const welcomeMessage = (guildSettings.settings.welcomeMessage || '')
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

// Reaction roles — Add/remove
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) { try { await reaction.fetch(); } catch { return; } }
  try {
    const guildSettings = await Guild.findOne({ guildId: reaction.message.guildId });
    if (!guildSettings) return;
    const reactionRole = guildSettings.settings.reactionRoles.find(rr => rr.messageId === reaction.message.id);
    if (!reactionRole) return;
    const roleConfig = reactionRole.roles.find(r => r.emoji === reaction.emoji.name || r.emoji === reaction.emoji.id);
    if (roleConfig) {
      const member = await reaction.message.guild.members.fetch(user.id);
      const role = reaction.message.guild.roles.cache.get(roleConfig.roleId);
      if (role && member && member.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
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
  if (reaction.partial) { try { await reaction.fetch(); } catch { return; } }
  try {
    const guildSettings = await Guild.findOne({ guildId: reaction.message.guildId });
    if (!guildSettings) return;
    const reactionRole = guildSettings.settings.reactionRoles.find(rr => rr.messageId === reaction.message.id);
    if (!reactionRole) return;
    const roleConfig = reactionRole.roles.find(r => r.emoji === reaction.emoji.name || r.emoji === reaction.emoji.id);
    if (roleConfig) {
      const member = await reaction.message.guild.members.fetch(user.id);
      const role = reaction.message.guild.roles.cache.get(roleConfig.roleId);
      if (role && member && member.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
        await member.roles.remove(role);
        console.log(`➖ Removed role ${role.name} from ${user.username} via reaction`);
      }
    }
  } catch (err) {
    console.error('Error in messageReactionRemove:', err);
  }
});

// RSS feed checker (existing)
async function checkRSSFeeds() {
  try {
    const guilds = await Guild.find({ 'settings.rssFeeds.0': { $exists: true } });
    for (const guildDoc of guilds) {
      for (const feed of guildDoc.settings.rssFeeds) {
        if (!feed.enabled) continue;
        const now = new Date();
        const lastCheck = feed.lastCheck || new Date(0);
        const intervalMs = (feed.interval || 30) * 60 * 1000;
        if (now - lastCheck < intervalMs) continue;
        try {
          const parsed = await rssParser.parseURL(feed.url);
          const guild = client.guilds.cache.get(guildDoc.guildId);
          if (!guild) continue;
          const channel = guild.channels.cache.get(feed.channelId);
          if (!channel) continue;
          const newItems = parsed.items.filter(item => new Date(item.pubDate) > lastCheck).slice(0, 3);
          for (const item of newItems) {
            const embed = new EmbedBuilder()
              .setTitle(item.title || 'New Post')
              .setURL(item.link)
              .setDescription((item.contentSnippet || '').substring(0, 200) + '...')
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

// Buildin helpers
function extractPageId(urlOrId) {
  if (!urlOrId) return null;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(urlOrId)) return urlOrId;
  const match = String(urlOrId).match(/buildin\.ai\/(?:[^/]+\/)?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  return match ? match[1] : null;
}

function extractGalleryFragment(pageUrl) {
  if (!pageUrl) return null;
  const match = pageUrl.match(/#([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  return match ? match[1] : null;
}

// Enhanced Buildin gallery parser
async function fetchBuildinGalleryPosts(pageUrl, galleryFragment) {
  try {
    const pageId = extractPageId(pageUrl);
    if (!pageId) {
      console.log('⚠️ No valid page ID found in URL:', pageUrl);
      return [];
    }
    
    const shareUrl = `https://buildin.ai/share/${pageId}`;
    console.log(`🚀 Fetching Buildin gallery: ${shareUrl}${galleryFragment ? `#${galleryFragment}` : ''}`);
    
    const response = await axios.get(shareUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000,
      maxRedirects: 5
    });
    
    console.log(`📊 Received response: ${response.status} ${response.statusText}, size: ${response.data.length} chars`);
    
    const posts = [];
    
    if (cheerio) {
      const $ = cheerio.load(response.data);
      
      // Strategy 1: Look for gallery-specific fragment content
      if (galleryFragment) {
        console.log(`🔍 Looking for gallery fragment: ${galleryFragment}`);
        
        // Try to find elements with the fragment ID or data attributes
        const fragmentSelectors = [
          `[id*="${galleryFragment}"]`,
          `[data-id*="${galleryFragment}"]`,
          `[data-fragment*="${galleryFragment}"]`,
          `[href*="${galleryFragment}"]`
        ];
        
        for (const selector of fragmentSelectors) {
          const fragmentElements = $(selector);
          if (fragmentElements.length > 0) {
            console.log(`✅ Found ${fragmentElements.length} fragment elements with selector: ${selector}`);
            
            fragmentElements.each((i, el) => {
              const $el = $(el);
              const text = $el.text().trim();
              if (text && text.length > 10 && text.length < 200) {
                posts.push({
                  id: `fragment-${galleryFragment}-${i}`,
                  title: text.substring(0, 80),
                  url: shareUrl,
                  shareUrl: shareUrl,
                  source: `fragment-${selector}`
                });
              }
            });
            
            if (posts.length > 0) break;
          }
        }
      }
      
      // Strategy 2: Look for post cards/items in various patterns
      if (posts.length === 0) {
        console.log('🔍 Searching for post cards/items...');
        
        const cardSelectors = [
          '[class*="post"] h1, [class*="post"] h2, [class*="post"] h3',
          '[class*="card"] h1, [class*="card"] h2, [class*="card"] h3',
          '[class*="item"] h1, [class*="item"] h2, [class*="item"] h3',
          '[class*="entry"] h1, [class*="entry"] h2, [class*="entry"] h3',
          'article h1, article h2, article h3',
          '.title, [class*="title"]',
          'h1, h2, h3, h4'
        ];
        
        for (const selector of cardSelectors) {
          $(selector).each((i, el) => {
            const $el = $(el);
            const title = $el.text().trim();
            const $link = $el.closest('a').length > 0 ? $el.closest('a') : $el.find('a').first();
            const link = $link.attr('href');
            
            if (title && title.length > 10 && title.length < 200) {
              const postId = link ? extractPageId(link) : null;
              const postUrl = link && link.includes('buildin.ai') ? link : shareUrl;
              const sharePostUrl = postUrl.includes('/share/') ? postUrl : 
                (postId ? `https://buildin.ai/share/${postId}` : shareUrl);
              
              posts.push({
                id: postId || `title-${Date.now()}-${i}`,
                title: title.substring(0, 100),
                url: postUrl,
                shareUrl: sharePostUrl,
                source: `card-${selector}`
              });
            }
          });
          
          if (posts.length > 0) {
            console.log(`✅ Found ${posts.length} posts with selector: ${selector}`);
            break;
          }
        }
      }
      
      // Strategy 3: Look for any meaningful text content
      if (posts.length === 0) {
        console.log('🔍 Fallback: extracting meaningful text content...');
        
        const textElements = $('p, div, span').filter((i, el) => {
          const text = $(el).text().trim();
          return text.length > 20 && text.length < 200 && 
                 !text.includes('©') && !text.includes('Terms') && 
                 !text.includes('Privacy') && !text.includes('buildin.ai');
        });
        
        textElements.slice(0, 5).each((i, el) => {
          const title = $(el).text().trim();
          posts.push({
            id: `text-${Date.now()}-${i}`,
            title: title.substring(0, 80),
            url: shareUrl,
            shareUrl: shareUrl,
            source: 'text-content'
          });
        });
      }
    }
    
    // Final fallback: create at least one post from the page itself
    if (posts.length === 0) {
      console.log('🚀 Using ultimate fallback: creating post from page URL');
      posts.push({
        id: pageId,
        title: `Buildin Post ${pageId.substring(0, 8)}`,
        url: shareUrl,
        shareUrl: shareUrl,
        source: 'fallback'
      });
    }
    
    // Remove duplicates and limit results
    const uniquePosts = posts.filter((post, index, self) => 
      index === self.findIndex(p => p.id === post.id || p.title === post.title)
    ).slice(0, 15);
    
    console.log(`📝 Final result: ${uniquePosts.length} unique posts extracted`);
    uniquePosts.forEach((post, i) => {
      console.log(`  ${i + 1}. "${post.title}" (${post.source})`);
    });
    
    return uniquePosts;
    
  } catch (error) {
    console.error(`❌ Error fetching Buildin gallery ${pageUrl}:`, error.message);
    
    // Always return fallback post so something gets published
    const pageId = extractPageId(pageUrl);
    if (pageId) {
      console.log('🚀 Error fallback: creating single post from page ID');
      return [{
        id: pageId,
        title: `Buildin Post ${pageId.substring(0, 8)}`,
        url: pageUrl,
        shareUrl: pageUrl.includes('/share/') ? pageUrl : `https://buildin.ai/share/${pageId}`,
        source: 'error-fallback'
      }];
    }
    return [];
  }
}

// Enhanced post metadata fetcher
async function fetchBuildinPostMeta(postUrl) {
  try {
    console.log(`🔍 Fetching post metadata: ${postUrl}`);
    
    const response = await axios.get(postUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });
    
    let title = 'Buildin Post';
    let imageUrl = null;
    let description = null;
    
    if (cheerio) {
      const $ = cheerio.load(response.data);
      
      // Extract title with priority order
      const titleSources = [
        $('meta[property="og:title"]').attr('content'),
        $('meta[name="twitter:title"]').attr('content'),
        $('title').text().trim(),
        $('h1').first().text().trim(),
        $('h2').first().text().trim(),
        $('[class*="title"]').first().text().trim()
      ].filter(Boolean);
      
      if (titleSources.length > 0) {
        title = titleSources[0];
        // Clean up common patterns
        title = title.replace(/^Buildin\.AI.*?\|\s*/, '')
                    .replace(/\s*\|\s*Buildin\.AI.*$/, '')
                    .trim();
      }
      
      if (!title || title.length < 3 || title === 'Buildin.AI | Create, connect, publish instantly') {
        title = `Buildin Post ${extractPageId(postUrl)?.substring(0, 8) || 'New'}`;
      }
      
      // Extract description
      const descriptionSources = [
        $('meta[property="og:description"]').attr('content'),
        $('meta[name="twitter:description"]').attr('content'),
        $('meta[name="description"]').attr('content'),
        $('p').first().text().trim()
      ].filter(Boolean);
      
      if (descriptionSources.length > 0) {
        description = descriptionSources[0].substring(0, 300);
      }
      
      // Extract image with priority order
      const imageSources = [
        $('meta[property="og:image"]').attr('content'),
        $('meta[name="twitter:image"]').attr('content'),
        $('meta[name="twitter:image:src"]').attr('content')
      ].filter(Boolean);
      
      if (imageSources.length > 0) {
        imageUrl = imageSources[0];
      } else {
        // Look for first meaningful image
        $('img').each((i, el) => {
          const src = $(el).attr('src');
          if (src && !imageUrl && 
              !src.includes('logo') && 
              !src.includes('icon') && 
              !src.includes('avatar') &&
              (src.startsWith('http') || src.startsWith('data:') || src.startsWith('/'))) {
            imageUrl = src.startsWith('/') ? `https://buildin.ai${src}` : src;
            return false; // Break
          }
        });
      }
      
      console.log(`✅ Extracted metadata: title="${title}", image=${imageUrl ? 'yes' : 'no'}, desc=${description ? 'yes' : 'no'}`);
    }
    
    return {
      title: title.substring(0, 100),
      description: description ? description.substring(0, 300) : null,
      imageUrl: imageUrl || null,
      url: postUrl
    };
    
  } catch (error) {
    console.error(`❌ Error fetching post meta ${postUrl}:`, error.message);
    const pageId = extractPageId(postUrl);
    return {
      title: `Buildin Post ${pageId?.substring(0, 8) || 'New'}`,
      description: null,
      imageUrl: null,
      url: postUrl
    };
  }
}

// Create enhanced Discord embed
function buildEmbedFromBuildinPost(meta) {
  const embed = new EmbedBuilder()
    .setTitle(meta.title || 'Buildin Post')
    .setURL(meta.url)
    .setColor('#00D4AA')
    .setTimestamp(new Date())
    .setFooter({ text: 'Buildin.ai', iconURL: 'https://buildin.ai/favicon.ico' });
  
  if (meta.description) {
    embed.setDescription(meta.description);
  }
  
  if (meta.imageUrl) {
    embed.setImage(meta.imageUrl);
  }
  
  return embed;
}

// Main Buildin checker function
async function checkBuildinFeeds() {
  const now = new Date();
  const guilds = await Guild.find({ 'settings.buildinFeeds.0': { $exists: true } });
  
  for (const guildDoc of guilds) {
    const guild = client.guilds.cache.get(guildDoc.guildId);
    if (!guild) continue;

    let guildChanged = false;

    for (const feed of guildDoc.settings.buildinFeeds) {
      try {
        if (!feed.enabled) continue;
        
        const intervalMs = (feed.interval || 5) * 60 * 1000;
        const lastCheck = feed.lastCheck ? new Date(feed.lastCheck) : new Date(0);
        const shouldCheck = now - lastCheck >= intervalMs;
        
        const channel = guild.channels.cache.get(feed.channelId);
        if (!channel) {
          console.log(`⚠️ Channel ${feed.channelId} not found for guild ${guild.name}`);
          continue;
        }
        
        console.log(`🔄 Processing feed: ${feed.title || feed.pageId} (guild: ${guild.name})`);
        
        // Handle initial backfill
        if (!feed.backfilled && feed.initialBackfill > 0) {
          console.log(`🚀 Starting backfill for "${feed.title || feed.pageId}" (${feed.initialBackfill} posts)`);
          
          const posts = await fetchBuildinGalleryPosts(feed.pageUrl, feed.galleryFragment);
          const postsToPublish = posts.slice(0, feed.initialBackfill).reverse(); // Oldest first
          
          console.log(`📝 Publishing ${postsToPublish.length} backfill posts...`);
          
          for (const [index, post] of postsToPublish.entries()) {
            if (feed.lastPostedIds && feed.lastPostedIds.includes(post.id)) {
              console.log(`⏭️ Skipping already posted: "${post.title}"`);
              continue;
            }
            
            const postMeta = await fetchBuildinPostMeta(post.shareUrl || post.url);
            const embed = buildEmbedFromBuildinPost(postMeta);
            
            await channel.send({ embeds: [embed] });
            console.log(`📤 Backfill ${index + 1}/${postsToPublish.length}: "${postMeta.title}" → ${guild.name}#${channel.name}`);
            
            // Add to posted IDs
            feed.lastPostedIds = feed.lastPostedIds || [];
            feed.lastPostedIds.push(post.id);
            
            // Small delay between posts
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
          feed.backfilled = true;
          feed.lastCheck = now;
          guildChanged = true;
          console.log(`✅ Backfill completed for "${feed.title || feed.pageId}"`);
          
        } else if (shouldCheck) {
          // Regular check for new posts
          console.log(`🔍 Regular check for new posts: "${feed.title || feed.pageId}"`);
          
          const posts = await fetchBuildinGalleryPosts(feed.pageUrl, feed.galleryFragment);
          const newPosts = posts.filter(post => !(feed.lastPostedIds || []).includes(post.id));
          
          console.log(`📊 Found ${newPosts.length} new posts (total: ${posts.length})`);
          
          for (const [index, post] of newPosts.slice(0, 3).entries()) { // Limit to 3 new posts per check
            const postMeta = await fetchBuildinPostMeta(post.shareUrl || post.url);
            const embed = buildEmbedFromBuildinPost(postMeta);
            
            await channel.send({ embeds: [embed] });
            console.log(`📤 New post ${index + 1}: "${postMeta.title}" → ${guild.name}#${channel.name}`);
            
            // Add to posted IDs (keep last 200)
            feed.lastPostedIds = feed.lastPostedIds || [];
            feed.lastPostedIds.push(post.id);
            if (feed.lastPostedIds.length > 200) {
              feed.lastPostedIds = feed.lastPostedIds.slice(-200);
            }
            
            // Small delay between posts
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
          feed.lastCheck = now;
          guildChanged = true;
        }
        
      } catch (error) {
        console.error(`❌ Buildin feed error (guild ${guildDoc.guildId}, feed "${feed.title || feed.pageId}"):`, error.message);
      }
    }

    if (guildChanged) {
      try {
        await guildDoc.save();
        console.log(`💾 Saved changes for guild ${guild.name}`);
      } catch (error) {
        console.error('Failed to save guild after Buildin updates:', error.message);
      }
    }
  }
}

// Error handling & graceful shutdown
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