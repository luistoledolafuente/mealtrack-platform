import './network/api_client.dart';
import './datasources/remote_sources.dart';
import './repositories/repositories.dart';

class ServiceLocator {
  final ApiClient apiClient;

  late final SubscriptionRepository subscriptionRepository;
  late final DailyMealRepository dailyMealRepository;
  late final PaymentRepository paymentRepository;
  late final NotificationRepository notificationRepository;
  late final AdjustmentRepository adjustmentRepository;
  late final AuditRepository auditRepository;
  late final DashboardRepository dashboardRepository;
  late final QrRepository qrRepository;

  ServiceLocator({ApiClient? apiClient})
      : apiClient = apiClient ?? ApiClient() {
    _init();
  }

  void _init() {
    final subscriptionRemote = SubscriptionRemoteSource(apiClient);
    final dailyMealRemote = DailyMealRemoteSource(apiClient);
    final paymentRemote = PaymentRemoteSource(apiClient);
    final notificationRemote = NotificationRemoteSource(apiClient);
    final adjustmentRemote = AdjustmentRemoteSource(apiClient);
    final auditRemote = AuditRemoteSource(apiClient);
    final dashboardRemote = DashboardRemoteSource(apiClient);
    final qrRemote = QrRemoteSource(apiClient);

    subscriptionRepository = SubscriptionRepository(subscriptionRemote);
    dailyMealRepository = DailyMealRepository(dailyMealRemote);
    paymentRepository = PaymentRepository(paymentRemote);
    notificationRepository = NotificationRepository(notificationRemote);
    adjustmentRepository = AdjustmentRepository(adjustmentRemote);
    auditRepository = AuditRepository(auditRemote);
    dashboardRepository = DashboardRepository(dashboardRemote);
    qrRepository = QrRepository(qrRemote);
  }
}
