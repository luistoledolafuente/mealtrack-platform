import { Router } from 'express';
import { authenticate, authorize, ROLES } from '../../shared/index.js';
import { validate } from '../../shared/middleware/validate.js';
import { createPaymentSchema } from './payments.schema.js';
import * as controller from './payments.controller.js';

const router = Router();

router.get('/', authenticate, controller.list);
router.get('/:id', authenticate, controller.getById);
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPERADMIN), validate(createPaymentSchema), controller.create);

export default router;
