const User = require('../models/user');
const Vehicle = require('../models/vehicle');
const Diagnostic = require('../models/diagnostic');
const ActivityLog = require('../models/activityLog');

const getAdminDashboardData = async () => {
  const [totalUsers, activeUsers, totalVehicles, totalDiagnostics] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: 'active' }),
    Vehicle.countDocuments(),
    Diagnostic.countDocuments()
  ]);
  return { totalUsers, activeUsers, totalVehicles, totalDiagnostics, systemUptime: process.uptime() };
};

const listUsers = async (page = 1, limit = 20, search = '', role = '', status = '') => {
  const query = {};
  if (search) query.$or = [{ email: new RegExp(search, 'i') }, { firstName: new RegExp(search, 'i') }, { lastName: new RegExp(search, 'i') }];
  if (role) query.role = role;
  if (status) query.status = status;
  const total = await User.countDocuments(query);
  const users = await User.find(query).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
  return { users, total, page, totalPages: Math.ceil(total / limit) };
};

const updateUser = async (userId, updates) => {
  const forbidden = ['password', '_id'];
  forbidden.forEach(f => delete updates[f]);
  return User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
};

const deleteUser = async (userId) => {
  return User.findByIdAndUpdate(userId, { status: 'inactive' }, { new: true }).select('-password');
};

const changeUserRole = async (userId, role) => {
  if (!['user', 'admin', 'superadmin'].includes(role)) throw new Error('Invalid role');
  return User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
};

const getActivityLogs = async (page = 1, limit = 50, filters = {}) => {
  const query = {};
  if (filters.userId) query.userId = filters.userId;
  if (filters.action) query.action = new RegExp(filters.action, 'i');
  if (filters.startDate || filters.endDate) {
    query.timestamp = {};
    if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
    if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
  }
  const total = await ActivityLog.countDocuments(query);
  const logs = await ActivityLog.find(query).populate('userId', 'email firstName lastName').sort({ timestamp: -1 }).skip((page - 1) * limit).limit(limit).lean();
  return { logs, total, page, totalPages: Math.ceil(total / limit) };
};

module.exports = { getAdminDashboardData, listUsers, updateUser, deleteUser, changeUserRole, getActivityLogs };
