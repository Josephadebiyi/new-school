const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const JWT_SECRET = process.env.JWT_SECRET || 'lumina-lms-secret-key';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ detail: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Try to find user by id field first
    let user = await req.db.collection('users').findOne(
      { id: decoded.sub },
      { projection: { password: 0 } }
    );
    
    // Fallback: try by _id
    if (!user) {
      try {
        user = await req.db.collection('users').findOne(
          { _id: new ObjectId(decoded.sub) },
          { projection: { password: 0 } }
        );
        if (user) {
          user.id = user._id.toString();
          delete user._id;
        }
      } catch (e) {
        // Invalid ObjectId format
      }
    }
    
    if (!user) {
      return res.status(401).json({ detail: 'User not found' });
    }

    // Remove _id from response
    if (user._id) {
      user.id = user.id || user._id.toString();
      delete user._id;
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ detail: 'Token expired' });
    }
    return res.status(401).json({ detail: 'Invalid token' });
  }
};

const requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ detail: 'Not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ detail: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticate, requireRoles };
