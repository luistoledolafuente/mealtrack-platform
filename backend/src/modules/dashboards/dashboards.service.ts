import * as repository from './dashboards.repository.js';
import * as notificationRepository from '../notifications/notifications.repository.js';
import * as subscriptionRepository from '../subscriptions/subscriptions.repository.js';

export async function getStudentDashboard(studentId: string) {
  const [activeSubscription, todayMeal, pendingNotifications, recentMeals] = await Promise.all([
    repository.getActiveSubscription(studentId),
    repository.getTodayMeal(studentId),
    notificationRepository.countUnread(studentId),
    repository.getRecentMeals(studentId),
  ]);

  return {
    activeSubscription: activeSubscription ? {
      id: activeSubscription.id,
      studentId: activeSubscription.studentId,
      mealPlanId: activeSubscription.mealPlanId,
      restaurantId: activeSubscription.restaurantId,
      startDate: activeSubscription.startDate,
      contractedDays: activeSubscription.contractedDays,
      remainingDays: activeSubscription.remainingDays,
      status: activeSubscription.status,
      mealPlan: {
        name: activeSubscription.mealPlan.name,
      },
      restaurant: {
        name: activeSubscription.restaurant.name,
      },
    } : null,
    todayMeal: todayMeal ? {
      id: todayMeal.id,
      subscriptionId: todayMeal.subscriptionId,
      studentId: todayMeal.studentId,
      date: todayMeal.date,
      status: todayMeal.status,
      registeredBy: todayMeal.registeredBy,
      validationMethod: todayMeal.validationMethod,
    } : null,
    pendingNotifications,
    recentMeals: recentMeals.map((m) => ({
      id: m.id,
      subscriptionId: m.subscriptionId,
      studentId: m.studentId,
      date: m.date,
      status: m.status,
      registeredBy: m.registeredBy,
      validationMethod: m.validationMethod,
    })),
  };
}

export async function getAdminDashboard(restaurantId: string) {
  const [totalStudents, todayConsumed, pendingAdjustments, activeSubscriptions] = await Promise.all([
    repository.countStudentsByRestaurant(restaurantId),
    repository.countTodayConsumed(restaurantId),
    repository.countPendingAdjustments(restaurantId),
    subscriptionRepository.countActiveByRestaurant(restaurantId),
  ]);

  return {
    totalStudents,
    todayConsumed,
    pendingAdjustments,
    activeSubscriptions,
  };
}
