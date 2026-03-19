const express = require('express');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const dashboardService = require('../services/dashboard');
const User = require('../models/user');
const Vehicle = require('../models/vehicle');
const Diagnostic = require('../models/diagnostic');
const ActivityLog = require('../models/activityLog');

const router = express.Router();
router.use(auth);
router.use(authorize('user', 'admin', 'superadmin'));

router.get('/dashboard', async (req, res) => {
  try {
    const data = await dashboardService.getUserDashboardData(req.user._id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.user._id }).lean();
    res.json({ vehicles });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/diagnostics', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Diagnostic.countDocuments({ userId: req.user._id });
    const diagnostics = await Diagnostic.find({ userId: req.user._id }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)).populate('vehicleId', 'make model year').lean();
    res.json({ diagnostics, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/diagnostics/:id', async (req, res) => {
  try {
    const diagnostic = await Diagnostic.findOne({ _id: req.params.id, userId: req.user._id }).populate('vehicleId').lean();
    if (!diagnostic) return res.status(404).json({ message: 'Diagnostic not found' });
    res.json({ diagnostic });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/profile', async (req, res) => {
  res.json({ user: req.user });
});

router.put('/profile', async (req, res) => {
  try {
    const allowed = ['firstName', 'lastName', 'phone', 'company', 'address', 'city', 'state', 'zipCode', 'country', 'avatar'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/settings', async (req, res) => {
  res.json({ settings: req.user.dashboardPreferences });
});

router.put('/settings', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { dashboardPreferences: req.body }, { new: true }).select('-password');
    res.json({ settings: user.dashboardPreferences });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/recent-activity', async (req, res) => {
  try {
    const activities = await ActivityLog.find({ userId: req.user._id }).sort({ timestamp: -1 }).limit(10).lean();
    res.json({ activities });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/statistics', async (req, res) => {
  try {
    const stats = await dashboardService.getUserStatistics(req.user._id);
    res.json({ statistics: stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
