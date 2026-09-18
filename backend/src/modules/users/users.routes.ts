import { Router } from 'express';
import { authenticate, authorize, ROLES } from '../../shared/index.js';
import { validate } from '../../shared/middleware/validate.js';
import { createUserSchema, updateProfileSchema, changePasswordSchema } from './users.schema.js';
import * as controller from './users.controller.js';

const router = Router();

router.get('/me', authenticate, controller.getProfile);
router.patch('/me', authenticate, validate(updateProfileSchema), controller.updateProfile);
router.patch('/me/password', authenticate, validate(changePasswordSchema), controller.changePassword);
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPERADMIN), validate(createUserSchema), controller.createUser);

export default router;