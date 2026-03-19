const mongoose = require('mongoose');

const systemHealthSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  cpuUsage: { type: Number, min: 0, max: 100 },
  memoryUsage: { type: Number, min: 0, max: 100 },
  diskUsage: { type: Number, min: 0, max: 100 },
  databaseConnections: Number,
  activeUsers: Number,
  requestsPerMinute: Number,
  errorRate: { type: Number, min: 0, max: 100 }
});

systemHealthSchema.index({ timestamp: -1 });

module.exports = mongoose.model('SystemHealth', systemHealthSchema);
