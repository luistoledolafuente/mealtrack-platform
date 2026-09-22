import { Router } from 'express';
import { authenticate, authorize, ROLES } from '../../shared/index.js';
import { validate } from '../../shared/middleware/validate.js';
import { createOperationalClosureSchema } from './operational-closures.schema.js';
import * as controller from './operational-closures.controller.js';

const router = Router();
router.get('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPERADMIN), controller.list);
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPERADMIN), validate(createOperationalClosureSchema), controller.create);

export default router;
