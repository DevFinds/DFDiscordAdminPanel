const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: String,
  icon: String,
  ownerId: String,
  settings: {
    prefix: {
      type: String,
      default: '!'
    },
    welcomeEnabled: {
      type: Boolean,
      default: false
    },
    welcomeChannel: String,
    welcomeMessage: {
      type: String,
      default: 'Welcome to {{server}}, {{user}}! 👋 You are member #{{memberCount}}'
    },
    autoRoleEnabled: {
      type: Boolean,
      default: false
    },
    autoRoleIds: {
      type: [String],
      default: []
    },
    reactionRoles: [{
      messageId: String,
      channelId: String,
      roles: [{
        emoji: String,
        roleId: String
      }]
    }],
    rssFeeds: [{
      url: String,
      channelId: String,
      interval: {
        type: Number,
        default: 30
      },
      lastCheck: Date,
      enabled: {
        type: Boolean,
        default: true
      }
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

GuildSchema.index({ guildId: 1, updatedAt: -1 });

GuildSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Guild', GuildSchema);
