import { Router } from 'express';
import { authenticate } from '../../shared/index.js';
import * as controller from './notifications.controller.js';

const router = Router();

router.get('/', authenticate, controller.list);
router.patch('/:id/read', authenticate, controller.markAsRead);
router.patch('/read-all', authenticate, controller.markAllAsRead);

export default router;
