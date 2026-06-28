const jwt = require('jsonwebtoken');
const config = require('../../config');
const ApiError = require('../errors/ApiError');

function auth(...allowedRoles) {
  return (req, res, next) => {
    try {
      // TODO: Implement full JWT verification
      // 1. Extract token from Authorization: Bearer <token>
      // 2. jwt.verify(token, config.jwt.secret)
      // 3. Attach decoded user to req.user
      // 4. If allowedRoles.length > 0, check req.user.role is included
      // 5. On failure, throw ApiError('No autorizado', 401, 'UNAUTHORIZED')

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError('Token no proporcionado', 401, 'UNAUTHORIZED');
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = decoded;

      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        throw new ApiError('No tienes permisos para esta acción', 403, 'FORBIDDEN');
      }

      next();
    } catch (err) {
      if (err instanceof ApiError) {
        return next(err);
      }
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return next(new ApiError('Token inválido o expirado', 401, 'INVALID_TOKEN'));
      }
      next(err);
    }
  };
}

module.exports = { auth };
