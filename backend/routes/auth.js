const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Redirect to Discord OAuth
router.get('/discord', passport.authenticate('discord'));

// OAuth callback
router.get('/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/login' }),
  (req, res) => {
    try {
      console.log('OAuth callback - user:', req.user ? req.user.discordId : 'no user');
      
      if (!req.user) {
        console.error('No user found in OAuth callback');
        return res.status(500).json({ 
          error: 'Authentication failed - no user data',
          details: 'User object is null after Discord OAuth'
        });
      }
      
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET not configured');
        return res.status(500).json({ 
          error: 'Server configuration error',
          details: 'JWT_SECRET environment variable is not set'
        });
      }
      
      const token = jwt.sign(
        { userId: req.user._id, discordId: req.user.discordId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/callback?token=${token}`;
      console.log('Redirecting to:', redirectUrl);
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('OAuth callback error:', {
        message: error.message,
        stack: error.stack,
        user: req.user ? req.user.discordId : 'no user'
      });
      res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Authentication failed'
      });
    }
  }
);

// Get current user
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const User = require('../models/User');
    const user = await User.findById(decoded.userId).select('-accessToken -refreshToken');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;