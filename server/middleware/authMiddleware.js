const jwt = require('jsonwebtoken');
const dbResolver = require('../utils/dbResolver');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lifeflowsecretkey');

      // Attempt to fetch user by ObjectId; if invalid, fall back to userId field
      let user = null;
      try {
        // This will work if decoded.id is a valid ObjectId
        user = await dbResolver.findById('User', decoded.id);
      } catch (e) {
        // If casting fails (e.g., decoded.id is a string like 'USR001'), ignore
        user = null;
      }
      // Fallback: try to find by custom userId field when ObjectId lookup fails
      if (!user) {
        user = await dbResolver.findOne('User', { userId: decoded.id });
      }

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      if (user.status === 'Inactive') {
        return res.status(403).json({ message: 'Access denied, account is inactive' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('JWT Auth Error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Role authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({
        message: `Role (${req.user ? req.user.role : 'None'}) is not authorized to access this resource`
      });
    }
  };
};

module.exports = { protect, authorize };
