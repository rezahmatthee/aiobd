const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');
const ActivityLog = require('../models/activityLog');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });
    const user = new User({ email, password, firstName, lastName });
    await user.save();
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', { expiresIn: '7d' });
    res.status(201).json({ token, refreshToken, user: { id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.status !== 'active') return res.status(403).json({ message: 'Account is not active' });
    const valid = await user.comparePassword(password);
    if (!valid) {
      await ActivityLog.create({ userId: user._id, action: 'login_failed', resourceType: 'auth', ipAddress: req.ip, userAgent: req.headers['user-agent'], status: 'failed' });
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    user.lastLogin = new Date();
    user.loginHistory.push({ ipAddress: req.ip, userAgent: req.headers['user-agent'], success: true });
    if (user.loginHistory.length > 10) user.loginHistory = user.loginHistory.slice(-10);
    await user.save();
    await ActivityLog.create({ userId: user._id, action: 'login', resourceType: 'auth', ipAddress: req.ip, userAgent: req.headers['user-agent'] });
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', { expiresIn: '7d' });
    res.json({ token, refreshToken, user: { id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '15m' });
    res.json({ token });
  } catch (err) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

router.post('/logout', auth, async (req, res) => {
  await ActivityLog.create({ userId: req.user._id, action: 'logout', resourceType: 'auth', ipAddress: req.ip, userAgent: req.headers['user-agent'] });
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
