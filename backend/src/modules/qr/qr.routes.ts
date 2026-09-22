import { Router } from 'express';
import { authenticate, authorize, ROLES } from '../../shared/index.js';
import { validate } from '../../shared/middleware/validate.js';
import { createQrSessionSchema, issueQrSchema, scanQrSessionSchema, validateQrSchema } from './qr.schema.js';
import * as controller from './qr.controller.js';

const router = Router();

router.post('/issue', authenticate, authorize(ROLES.STUDENT), validate(issueQrSchema), controller.issue);
router.post('/validate', authenticate, authorize(ROLES.ADMIN, ROLES.SUPERADMIN), validate(validateQrSchema), controller.validate);
router.post('/sessions', authenticate, authorize(ROLES.ADMIN), validate(createQrSessionSchema), controller.createSession);
router.post('/scan', authenticate, authorize(ROLES.STUDENT), validate(scanQrSessionSchema), controller.scanSession);

export default router;
