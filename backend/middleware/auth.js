const DiscordStrategy = require('passport-discord').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = (passport) => {
  passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL || 'http://localhost:5000/auth/discord/callback',
    scope: ['identify', 'guilds']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Discord OAuth Profile:', {
        id: profile.id,
        username: profile.username,
        guildsCount: profile.guilds ? profile.guilds.length : 0
      });
      
      let user = await User.findOne({ discordId: profile.id });
      if (user) {
        user.username = profile.username;
        user.discriminator = profile.discriminator;
        user.avatar = profile.avatar;
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        user.guilds = profile.guilds || [];
        user.lastLogin = new Date();
        await user.save();
        console.log('User updated successfully:', user.discordId);
      } else {
        user = await User.create({
          discordId: profile.id,
          username: profile.username,
          discriminator: profile.discriminator,
          avatar: profile.avatar,
          accessToken,
          refreshToken,
          guilds: profile.guilds || []
        });
        console.log('New user created:', user.discordId);
      }
      return done(null, user);
    } catch (err) {
      console.error('Discord auth error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      return done(err, null);
    }
  }));

  passport.serializeUser((user, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      console.log('Deserializing user:', id, user ? 'found' : 'not found');
      done(null, user);
    } catch (err) {
      console.error('Deserialize error:', err);
      done(err, null);
    }
  });
};

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports.verifyToken = verifyToken;