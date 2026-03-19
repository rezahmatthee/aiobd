const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const loginRecordSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String,
  success: Boolean
});

const dashboardPrefsSchema = new mongoose.Schema({
  theme: { type: String, default: 'dark' },
  notifications: { type: Boolean, default: true },
  defaultView: { type: String, default: 'overview' }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  avatar: String,
  phone: String,
  company: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  permissions: [{ type: String }],
  status: { type: String, enum: ['active', 'suspended', 'inactive'], default: 'active' },
  lastLogin: Date,
  loginHistory: [loginRecordSchema],
  dashboardPreferences: { type: dashboardPrefsSchema, default: () => ({}) },
  subscriptionTier: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
