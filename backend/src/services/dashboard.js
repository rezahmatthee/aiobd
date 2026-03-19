const User = require('../models/user');
const Vehicle = require('../models/vehicle');
const Diagnostic = require('../models/diagnostic');
const ActivityLog = require('../models/activityLog');

const getUserDashboardData = async (userId) => {
  const [vehicles, diagnostics, activities] = await Promise.all([
    Vehicle.find({ userId }).lean(),
    Diagnostic.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
    ActivityLog.find({ userId }).sort({ timestamp: -1 }).limit(10).lean()
  ]);
  const stats = {
    totalVehicles: vehicles.length,
    activeDiagnostics: diagnostics.filter(d => d.status === 'completed').length,
    reportsGenerated: diagnostics.length
  };
  return { stats, vehicles, recentDiagnostics: diagnostics, recentActivity: activities };
};

const getUserStatistics = async (userId) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const diagnostics = await Diagnostic.find({ userId, createdAt: { $gte: thirtyDaysAgo } }).lean();
  return {
    diagnosticsThisMonth: diagnostics.length,
    averagePerWeek: Math.round(diagnostics.length / 4),
    successRate: diagnostics.filter(d => d.status === 'completed').length / (diagnostics.length || 1) * 100
  };
};

module.exports = { getUserDashboardData, getUserStatistics };
