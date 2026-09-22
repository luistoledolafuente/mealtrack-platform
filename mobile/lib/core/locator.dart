import './network/api_client.dart';
import './datasources/remote_sources.dart';
import './repositories/repositories.dart';
import '../features/pension/data/pension_repository.dart';
import '../features/qr/data/consumption_repository.dart';

class ServiceLocator {
  final ApiClient apiClient;

  late final UserRepository userRepository;
  late final MealPlanRepository mealPlanRepository;
  late final SubscriptionRepository subscriptionRepository;
  late final DailyMealRepository dailyMealRepository;
  late final PaymentRepository paymentRepository;
  late final NotificationRepository notificationRepository;
  late final AdjustmentRepository adjustmentRepository;
  late final AuditRepository auditRepository;
  late final DashboardRepository dashboardRepository;
  late final QrRepository qrRepository;
  late final PensionRepository pensionRepository;
  late final ConsumptionRepository consumptionRepository;

  ServiceLocator({ApiClient? apiClient})
      : apiClient = apiClient ?? ApiClient() {
    _init();
  }

  void _init() {
    final userRemote = UserRemoteSource(apiClient);
    final mealPlanRemote = MealPlanRemoteSource(apiClient);
    final subscriptionRemote = SubscriptionRemoteSource(apiClient);
    final dailyMealRemote = DailyMealRemoteSource(apiClient);
    final paymentRemote = PaymentRemoteSource(apiClient);
    final notificationRemote = NotificationRemoteSource(apiClient);
    final adjustmentRemote = AdjustmentRemoteSource(apiClient);
    final auditRemote = AuditRemoteSource(apiClient);
    final dashboardRemote = DashboardRemoteSource(apiClient);
    final qrRemote = QrRemoteSource(apiClient);
    final pensionRemote = PensionRemoteSource(apiClient);
    final consumptionRemote = ConsumptionRemoteSource(apiClient);

    userRepository = UserRepository(userRemote);
    mealPlanRepository = MealPlanRepository(mealPlanRemote);
    subscriptionRepository = SubscriptionRepository(subscriptionRemote);
    dailyMealRepository = DailyMealRepository(dailyMealRemote);
    paymentRepository = PaymentRepository(paymentRemote);
    notificationRepository = NotificationRepository(notificationRemote);
    adjustmentRepository = AdjustmentRepository(adjustmentRemote);
    auditRepository = AuditRepository(auditRemote);
    dashboardRepository = DashboardRepository(dashboardRemote);
    qrRepository = QrRepository(qrRemote);
    pensionRepository = PensionRepository(pensionRemote);
    consumptionRepository = ConsumptionRepository(consumptionRemote);
  }
}
