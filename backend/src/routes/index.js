const { Router } = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const usersRoutes = require('../modules/users/users.routes');
const restaurantsRoutes = require('../modules/restaurants/restaurants.routes');
const mealPlansRoutes = require('../modules/meal-plans/meal-plans.routes');
const subscriptionsRoutes = require('../modules/subscriptions/subscriptions.routes');
const dailyMealsRoutes = require('../modules/daily-meals/daily-meals.routes');
const adjustmentRequestsRoutes = require('../modules/adjustment-requests/adjustment-requests.routes');
const paymentsRoutes = require('../modules/payments/payments.routes');
const notificationsRoutes = require('../modules/notifications/notifications.routes');
const dashboardsRoutes = require('../modules/dashboards/dashboards.routes');
const auditRoutes = require('../modules/audit/audit.routes');

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

module.exports = router;
