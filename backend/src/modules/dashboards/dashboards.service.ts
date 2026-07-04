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
      mealPlanName: activeSubscription.mealPlan.name,
      contractedDays: activeSubscription.contractedDays,
      remainingDays: activeSubscription.remainingDays,
      startDate: activeSubscription.startDate,
    } : null,
    todayMeal: todayMeal ? {
      id: todayMeal.id,
      date: todayMeal.date,
      status: todayMeal.status,
    } : null,
    pendingNotifications,
    recentMeals: recentMeals.map((m) => ({
      id: m.id,
      date: m.date,
      status: m.status,
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
