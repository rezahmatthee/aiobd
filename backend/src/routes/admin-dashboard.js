const express = require('express');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const adminService = require('../services/admin');
const ActivityLog = require('../models/activityLog');

const router = express.Router();
router.use(auth);
router.use(authorize('admin', 'superadmin'));

router.get('/dashboard', async (req, res) => {
  try {
    const data = await adminService.getAdminDashboardData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '', status = '' } = req.query;
    const result = await adminService.listUsers(parseInt(page), parseInt(limit), search, role, status);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const User = require('../models/user');
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);
    await ActivityLog.create({ userId: req.user._id, action: 'update_user', resourceType: 'user', resourceId: req.params.id, changes: req.body, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await adminService.deleteUser(req.params.id);
    await ActivityLog.create({ userId: req.user._id, action: 'delete_user', resourceType: 'user', resourceId: req.params.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ message: 'User deactivated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/users/:id/role-change', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await adminService.changeUserRole(req.params.id, role);
    await ActivityLog.create({ userId: req.user._id, action: 'change_role', resourceType: 'user', resourceId: req.params.id, changes: { role }, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/activity-log', async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, action, startDate, endDate } = req.query;
    const result = await adminService.getActivityLogs(parseInt(page), parseInt(limit), { userId, action, startDate, endDate });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    const User = require('../models/user');
    const Diagnostic = require('../models/diagnostic');
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [newUsers, newDiagnostics] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: last30Days } }),
      Diagnostic.countDocuments({ createdAt: { $gte: last30Days } })
    ]);
    res.json({ newUsers, newDiagnostics, period: '30d' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
