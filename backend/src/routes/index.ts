import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import usersRoutes from '../modules/users/users.routes.js';
import restaurantsRoutes from '../modules/restaurants/restaurants.routes.js';
import mealPlansRoutes from '../modules/meal-plans/meal-plans.routes.js';
import subscriptionsRoutes from '../modules/subscriptions/subscriptions.routes.js';
import dailyMealsRoutes from '../modules/daily-meals/daily-meals.routes.js';
import adjustmentRequestsRoutes from '../modules/adjustment-requests/adjustment-requests.routes.js';
import paymentsRoutes from '../modules/payments/payments.routes.js';
import notificationsRoutes from '../modules/notifications/notifications.routes.js';
import dashboardsRoutes from '../modules/dashboards/dashboards.routes.js';
import auditRoutes from '../modules/audit/audit.routes.js';
import qrRoutes from '../modules/qr/qr.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/restaurants', restaurantsRoutes);
router.use('/meal-plans', mealPlansRoutes);
router.use('/subscriptions', subscriptionsRoutes);
router.use('/daily-meals', dailyMealsRoutes);
router.use('/adjustment-requests', adjustmentRequestsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/dashboards', dashboardsRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/qr', qrRoutes);

export default router;
