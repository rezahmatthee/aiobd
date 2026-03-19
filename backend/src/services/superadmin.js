const User = require('../models/user');
const Vehicle = require('../models/vehicle');
const Diagnostic = require('../models/diagnostic');
const SystemHealth = require('../models/systemHealth');
const os = require('os');

const getPlatformMetrics = async () => {
  const [totalUsers, admins, totalVehicles, totalDiagnostics] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: { $in: ['admin', 'superadmin'] } }),
    Vehicle.countDocuments(),
    Diagnostic.countDocuments()
  ]);
  const mau = await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
  const dau = await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
  return { totalUsers, admins, totalVehicles, totalDiagnostics, mau, dau, uptime: process.uptime() };
};

const getSystemHealth = async () => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memUsage = ((totalMem - freeMem) / totalMem * 100).toFixed(2);
  const cpuUsage = os.loadavg()[0];
  const health = await SystemHealth.create({
    cpuUsage: Math.min(cpuUsage * 10, 100),
    memoryUsage: parseFloat(memUsage),
    diskUsage: 0,
    databaseConnections: 1,
    activeUsers: await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 60 * 60 * 1000) } }),
    requestsPerMinute: 0,
    errorRate: 0
  });
  return health;
};

const listAdmins = async () => {
  return User.find({ role: { $in: ['admin', 'superadmin'] } }).select('-password').sort({ createdAt: -1 }).lean();
};

const createAdmin = async (data) => {
  const admin = new User({ ...data, role: 'admin' });
  await admin.save();
  return admin.toObject();
};

const removeAdmin = async (adminId) => {
  return User.findByIdAndUpdate(adminId, { role: 'user' }, { new: true }).select('-password');
};

module.exports = { getPlatformMetrics, getSystemHealth, listAdmins, createAdmin, removeAdmin };
