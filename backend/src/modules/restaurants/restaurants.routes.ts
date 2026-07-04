import { Router } from 'express';
import { authenticate, authorize, ROLES } from '../../shared/index.js';
import { validate } from '../../shared/middleware/validate.js';
import { createRestaurantSchema, updateRestaurantSchema } from './restaurants.schema.js';
import * as controller from './restaurants.controller.js';

const router = Router();

router.get('/', authenticate, controller.list);
router.get('/:id', authenticate, controller.getById);
router.post('/', authenticate, authorize(ROLES.SUPERADMIN), validate(createRestaurantSchema), controller.create);
router.patch('/:id', authenticate, authorize(ROLES.SUPERADMIN), validate(updateRestaurantSchema), controller.update);

export default router;
