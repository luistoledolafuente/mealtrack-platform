const service = require('./auth.service');
const { sendSuccess } = require('../../shared');

async function login(req, res, next) {
  try {
    // TODO: Implement login controller
    // 1. Call service.login(req.body.email, req.body.password)
    // 2. Return token + user data
    // Example:
    // const result = await service.login(req.body.email, req.body.password);
    // return sendSuccess(res, result, 'Inicio de sesión exitoso');

    return sendSuccess(res, { message: 'Not implemented yet' });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    // TODO: Implement logout controller
    // 1. Extract token from Authorization header
    // 2. Call service.logout(token)
    // 3. Return success

    return sendSuccess(res, null, 'Sesión cerrada correctamente');
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    // TODO: Implement me controller
    // 1. Get user id from req.user (set by auth middleware)
    // 2. Call service.getProfile(userId)
    // 3. Return user data

    return sendSuccess(res, { message: 'Not implemented yet' });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, logout, me };
