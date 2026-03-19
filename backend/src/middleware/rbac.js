const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (req.user.role === 'superadmin') return next();
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({ message: `Permission '${permission}' required` });
    }
    next();
  };
};

module.exports = { authorize, requirePermission };
