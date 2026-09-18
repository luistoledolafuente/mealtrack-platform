import { Router } from 'express';
import { authenticate, authorize, ROLES } from '../../shared/index.js';
import { validate } from '../../shared/middleware/validate.js';
import { issueQrSchema, validateQrSchema } from './qr.schema.js';
import * as controller from './qr.controller.js';

const router = Router();

router.post('/issue', authenticate, authorize(ROLES.STUDENT), validate(issueQrSchema), controller.issue);
router.post('/validate', authenticate, authorize(ROLES.ADMIN, ROLES.SUPERADMIN), validate(validateQrSchema), controller.validate);

export default router;
