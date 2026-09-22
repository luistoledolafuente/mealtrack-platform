import { Router } from 'express';
import { authenticate, authorize, ROLES } from '../../shared/index.js';
import { validate } from '../../shared/middleware/validate.js';
import { scanConsumptionSchema } from './consumptions.schema.js';
import * as controller from './consumptions.controller.js';

const router = Router();

router.post('/scan', authenticate, authorize(ROLES.STUDENT), validate(scanConsumptionSchema), controller.scan);

export default router;
