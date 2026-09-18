import { Router } from 'express';
import { authenticate, authorize, ROLES } from '../../shared/index.js';
import * as controller from './audit.controller.js';

const router = Router();

router.get('/', authenticate, authorize(ROLES.SUPERADMIN), controller.list);

export default router;
