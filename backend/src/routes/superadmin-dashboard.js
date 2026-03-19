const express = require('express');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const superadminService = require('../services/superadmin');
const ActivityLog = require('../models/activityLog');

const router = express.Router();
router.use(auth);
router.use(authorize('superadmin'));

router.get('/dashboard', async (req, res) => {
  try {
    const data = await superadminService.getPlatformMetrics();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/admins', async (req, res) => {
  try {
    const admins = await superadminService.listAdmins();
    res.json({ admins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/admins', async (req, res) => {
  try {
    const admin = await superadminService.createAdmin(req.body);
    await ActivityLog.create({ userId: req.user._id, action: 'create_admin', resourceType: 'user', ipAddress: req.ip, userAgent: req.headers['user-agent'] });
    res.status(201).json({ admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/admins/:id', async (req, res) => {
  try {
    const admin = await superadminService.removeAdmin(req.params.id);
    await ActivityLog.create({ userId: req.user._id, action: 'remove_admin', resourceType: 'user', resourceId: req.params.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ message: 'Admin role removed', admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/system-health', async (req, res) => {
  try {
    const health = await superadminService.getSystemHealth();
    res.json({ health });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/security-audit', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const total = await ActivityLog.countDocuments();
    const logs = await ActivityLog.find().populate('userId', 'email role').sort({ timestamp: -1 }).skip((page - 1) * limit).limit(parseInt(limit)).lean();
    res.json({ logs, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/system/backup', async (req, res) => {
  try {
    await ActivityLog.create({ userId: req.user._id, action: 'system_backup', resourceType: 'system', ipAddress: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ message: 'Backup initiated', timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/system/maintenance', async (req, res) => {
  try {
    const { enabled } = req.body;
    await ActivityLog.create({ userId: req.user._id, action: 'maintenance_mode', resourceType: 'system', changes: { enabled }, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`, enabled });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
