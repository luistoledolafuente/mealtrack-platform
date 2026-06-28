const jwt = require('jsonwebtoken');
const config = require('../../config');

function auth(...allowedRoles) {
  return (req, res, next) => {
    // TODO: Implement JWT verification and role checking
    // 1. Extract token from Authorization header
    // 2. Verify token with config.jwt.secret
    // 3. Attach user to req.user
    // 4. Check if user.role is in allowedRoles
    next();
  };
}

module.exports = { auth };
