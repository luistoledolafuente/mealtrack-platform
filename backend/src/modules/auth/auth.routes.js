const { Router } = require('express');
const controller = require('./auth.controller');
const validation = require('./auth.validation');
const { validate } = require('../../shared');

const router = Router();

// POST /auth/login — Iniciar sesión
router.post('/login', validate(validation.loginSchema), controller.login);

// POST /auth/logout — Cerrar sesión
router.post('/logout', controller.logout);

// GET /auth/me — Obtener usuario autenticado
router.get('/me', controller.me);

module.exports = router;
