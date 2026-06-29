import { Router } from 'express';
import { authenticate } from '../../shared/index.js';
import * as controller from './auth.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { loginSchema } from './auth.schema.js';

const router = Router();

router.post('/login', validate(loginSchema), controller.login);
router.post('/logout', authenticate, controller.logout);
router.get('/me', authenticate, controller.me);

export default router;
