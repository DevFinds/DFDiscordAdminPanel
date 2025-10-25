const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  discordId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: String,
  discriminator: String,
  avatar: String,
  accessToken: String, // Опционально: храните зашифрованным!
  refreshToken: String,
  guilds: [{
    id: String,
    name: String,
    icon: String,
    owner: Boolean,
    permissions: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

UserSchema.index({ createdAt: 1 });

module.exports = mongoose.model('User', UserSchema);
