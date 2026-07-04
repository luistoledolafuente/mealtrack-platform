import { Router } from 'express';
import { authenticate, authorize, ROLES } from '../../shared/index.js';
import * as controller from './dashboards.controller.js';

const router = Router();

router.get('/student', authenticate, authorize(ROLES.STUDENT), controller.getStudentDashboard);
router.get('/admin', authenticate, authorize(ROLES.ADMIN, ROLES.SUPERADMIN), controller.getAdminDashboard);
router.get('/superadmin', authenticate, authorize(ROLES.SUPERADMIN), controller.getSuperadminDashboard);

export default router;
