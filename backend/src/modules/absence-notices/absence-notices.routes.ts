import { Router } from 'express';
import { authenticate, authorize, ROLES } from '../../shared/index.js';
import { validate } from '../../shared/middleware/validate.js';
import { createAbsenceNoticeSchema, reviewAbsenceNoticeSchema } from './absence-notices.schema.js';
import * as controller from './absence-notices.controller.js';

const router = Router();
router.get('/', authenticate, controller.list);
router.post('/', authenticate, validate(createAbsenceNoticeSchema), controller.create);
router.patch('/:id/review', authenticate, authorize(ROLES.ADMIN, ROLES.SUPERADMIN), validate(reviewAbsenceNoticeSchema), controller.review);

export default router;
