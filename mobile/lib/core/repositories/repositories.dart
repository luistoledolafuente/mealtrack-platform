import '../models/models.dart';
import '../datasources/remote_sources.dart';

class UserRepository {
  final UserRemoteSource _remote;
  UserRepository(this._remote);

  Future<Map<String, dynamic>> createUser({
    required String fullName,
    required String email,
    String? phone,
    String? password,
    String? role,
    String? planId,
  }) =>
      _remote.createUser(
        fullName: fullName,
        email: email,
        phone: phone,
        password: password,
        role: role,
        planId: planId,
      );
}

class MealPlanRepository {
  final MealPlanRemoteSource _remote;
  MealPlanRepository(this._remote);

  Future<List<MealPlanModel>> getMealPlans() => _remote.getMealPlans();
}

class SubscriptionRepository {
  final SubscriptionRemoteSource _remote;
  SubscriptionRepository(this._remote);

  Future<List<SubscriptionModel>> getMySubscriptions() => _remote.getMySubscriptions();
}

class DailyMealRepository {
  final DailyMealRemoteSource _remote;
  DailyMealRepository(this._remote);

  Future<List<DailyMealModel>> getMeals({String? month, String? year}) =>
      _remote.getMeals(month: month, year: year);

  Future<void> registerMeal({
    required String subscriptionId,
    required String date,
    required String status,
    String? validationMethod,
  }) =>
      _remote.registerMeal(
        subscriptionId: subscriptionId,
        date: date,
        status: status,
        validationMethod: validationMethod,
      );
}

class PaymentRepository {
  final PaymentRemoteSource _remote;
  PaymentRepository(this._remote);

  Future<List<PaymentModel>> getMyPayments() => _remote.getMyPayments();
}

class NotificationRepository {
  final NotificationRemoteSource _remote;
  NotificationRepository(this._remote);

  Future<List<NotificationModel>> getNotifications() => _remote.getNotifications();

  Future<void> markAsRead(String id) => _remote.markAsRead(id);

  Future<void> markAllAsRead() => _remote.markAllAsRead();
}

class AdjustmentRepository {
  final AdjustmentRemoteSource _remote;
  AdjustmentRepository(this._remote);

  Future<List<AdjustmentRequestModel>> getMyAdjustments() => _remote.getMyAdjustments();

  Future<void> createAdjustment({
    required String dailyMealId,
    required String reason,
  }) =>
      _remote.createAdjustment(dailyMealId: dailyMealId, reason: reason);

  Future<void> reviewAdjustment({
    required String id,
    required String decision,
    String? resolutionNotes,
  }) =>
      _remote.reviewAdjustment(
        id: id,
        decision: decision,
        resolutionNotes: resolutionNotes,
      );
}

class AuditRepository {
  final AuditRemoteSource _remote;
  AuditRepository(this._remote);

  Future<List<AuditLogModel>> getAuditLogs() => _remote.getAuditLogs();
}

class DashboardRepository {
  final DashboardRemoteSource _remote;
  DashboardRepository(this._remote);

  Future<StudentDashboardModel> getStudentDashboard() => _remote.getStudentDashboard();

  Future<DashboardSummaryModel> getAdminDashboard() => _remote.getAdminDashboard();
}

class QrRepository {
  final QrRemoteSource _remote;
  QrRepository(this._remote);

  Future<Map<String, dynamic>> issueQr(String subscriptionId) => _remote.issueQr(subscriptionId);

  Future<Map<String, dynamic>> validateQr(String token) => _remote.validateQr(token);
}
