import { Router } from 'express';
import { authenticate, authorize, ROLES } from '../../shared/index.js';
import { validate } from '../../shared/middleware/validate.js';
import { createSubscriptionSchema, updateSubscriptionSchema } from './subscriptions.schema.js';
import * as controller from './subscriptions.controller.js';

const router = Router();

router.get('/', authenticate, controller.list);
router.get('/:id', authenticate, controller.getById);
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPERADMIN), validate(createSubscriptionSchema), controller.create);
router.patch('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPERADMIN), validate(updateSubscriptionSchema), controller.update);

export default router;
