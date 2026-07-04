import { Router } from 'express';
import { authenticate } from '../../shared/index.js';
import { validate } from '../../shared/middleware/validate.js';
import { updateProfileSchema } from './users.schema.js';
import * as controller from './users.controller.js';

const router = Router();

router.get('/me', authenticate, controller.getProfile);
router.patch('/me', authenticate, validate(updateProfileSchema), controller.updateProfile);

export default router;
