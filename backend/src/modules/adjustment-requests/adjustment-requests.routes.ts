import { Router } from 'express';
import { authenticate, authorize, ROLES } from '../../shared/index.js';
import { validate } from '../../shared/middleware/validate.js';
import { createAdjustmentSchema, reviewAdjustmentSchema } from './adjustment-requests.schema.js';
import * as controller from './adjustment-requests.controller.js';

const router = Router();

router.get('/', authenticate, controller.list);
router.post('/', authenticate, validate(createAdjustmentSchema), controller.create);
router.patch('/:id/review', authenticate, authorize(ROLES.ADMIN, ROLES.SUPERADMIN), validate(reviewAdjustmentSchema), controller.review);

export default router;
