import { Router } from 'express';
import { authenticate } from '../../shared/index.js';
import { validate } from '../../shared/middleware/validate.js';
import { createDailyMealSchema } from './daily-meals.schema.js';
import * as controller from './daily-meals.controller.js';

const router = Router();

router.get('/', authenticate, controller.list);
router.get('/:id', authenticate, controller.getById);
router.post('/', authenticate, validate(createDailyMealSchema), controller.create);

export default router;
