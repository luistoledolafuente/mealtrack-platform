import { Router } from 'express';
import { authenticate, authorize, ROLES } from '../../shared/index.js';
import { validate } from '../../shared/middleware/validate.js';
import { createMealPlanSchema, updateMealPlanSchema } from './meal-plans.schema.js';
import * as controller from './meal-plans.controller.js';

const router = Router();

router.get('/', authenticate, controller.list);
router.get('/:id', authenticate, controller.getById);
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPERADMIN), validate(createMealPlanSchema), controller.create);
router.patch('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPERADMIN), validate(updateMealPlanSchema), controller.update);

export default router;
