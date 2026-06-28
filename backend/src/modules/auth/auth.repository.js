const db = require('../../config/db');

async function findByEmail(email) {
  // TODO: Implement database query
  // SELECT id, nombre, email, password_hash, rol, restaurante_id
  // FROM usuarios
  // WHERE email = $1 AND activo = true

  const result = await db.query(
    'SELECT id, nombre, email, password_hash, rol, restaurante_id FROM usuarios WHERE email = $1 AND activo = true',
    [email],
  );

  return result.rows[0] || null;
}

async function findById(id) {
  // TODO: Implement find by id query
  // SELECT id, nombre, email, rol, restaurante_id
  // FROM usuarios WHERE id = $1

  const result = await db.query(
    'SELECT id, nombre, email, rol, restaurante_id FROM usuarios WHERE id = $1',
    [id],
  );

  return result.rows[0] || null;
}

module.exports = { findByEmail, findById };
