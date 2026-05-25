const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ttf-super-secret-key-2026');
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token', message: 'Your session has expired or the token is invalid.' });
    }
  }

  return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required. No security token provided.' });
};

const authorizeRoles = (allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions.' });
  }

  next();
};

module.exports = { authMiddleware, authorizeRoles };