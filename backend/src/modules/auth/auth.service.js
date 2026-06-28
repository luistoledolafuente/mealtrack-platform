const repository = require('./auth.repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const { ApiError } = require('../../shared');

async function login(email, password) {
  // TODO: Implement login business logic
  // 1. Find user by email via repository
  // 2. Compare password with bcrypt
  // 3. Generate JWT token
  // 4. Return { accessToken, user: { id, fullName, email, role } }

  const user = await repository.findByEmail(email);
  if (!user) {
    throw new ApiError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    throw new ApiError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
  }

  const accessToken = jwt.sign(
    { id: user.id, role: user.rol, restaurantId: user.restaurant_id },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  );

  return {
    accessToken,
    user: {
      id: user.id,
      fullName: user.nombre,
      email: user.email,
      role: user.rol,
    },
  };
}

async function logout(token) {
  // TODO: Implement logout logic
  // 1. Add token to blacklist or mark session as invalid
  // 2. Return success
}

async function getProfile(userId) {
  // TODO: Implement profile retrieval
  // 1. Fetch user by id from repository
  // 2. Return sanitized user data (no password hash)
}

module.exports = { login, logout, getProfile };
