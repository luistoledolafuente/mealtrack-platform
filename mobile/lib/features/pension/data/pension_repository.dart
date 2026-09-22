import '../../../core/constants/app_constants.dart';
import '../../../core/network/api_client.dart';
import '../domain/pension_models.dart';

class PensionRemoteSource {
  final ApiClient _api;

  PensionRemoteSource(this._api);

  Future<PensionSummaryModel> getPensionSummary() async {
    try {
      final res = await _api.get(ApiConstants.pensionSummary);
      final data = res['data'] as Map<String, dynamic>;
      return PensionSummaryModel.fromJson(data);
    } catch (_) {
      return _mockPensionSummary();
    }
  }

  PensionSummaryModel _mockPensionSummary() {
    final now = DateTime.now();
    return PensionSummaryModel(
      subscriptionId: 'sub-active-001',
      status: 'active',
      mealPlanName: 'Plan Mensual Completo (L-S)',
      restaurantName: 'Restaurante Central Universitario',
      validityStartDate: DateTime(now.year, now.month, 1),
      validityEndDate: DateTime(now.year, now.month + 1, 0),
      serviceBalances: const [
        ServiceBalance(
          service: 'breakfast',
          serviceName: 'Desayuno',
          contractedCount: 24,
          remainingCount: 18,
          included: true,
        ),
        ServiceBalance(
          service: 'lunch',
          serviceName: 'Almuerzo',
          contractedCount: 24,
          remainingCount: 14,
          included: true,
        ),
        ServiceBalance(
          service: 'dinner',
          serviceName: 'Cena',
          contractedCount: 0,
          remainingCount: 0,
          included: false,
        ),
      ],
      closureAlerts: [
        RestaurantClosureAlert(
          id: 'closure-101',
          restaurantName: 'Restaurante Central Universitario',
          reason: 'Mantenimiento de cocina e instalaciones',
          affectedServices: const ['lunch', 'dinner'],
          startDate: now.add(const Duration(days: 3)),
          endDate: now.add(const Duration(days: 3)),
          validityExtendedDays: 1,
        ),
      ],
      absences: [
        AbsenceNoticeItem(
          id: 'abs-001',
          date: now.subtract(const Duration(days: 5)),
          service: 'lunch',
          status: 'approved',
          reason: 'Cita médica gastroenterología',
        ),
        AbsenceNoticeItem(
          id: 'abs-002',
          date: now.add(const Duration(days: 1)),
          service: 'breakfast',
          status: 'pending',
          reason: 'Trámite académico presencial',
        ),
      ],
      monthlyAbsenceLimit: 3,
      usedAbsences: 1,
    );
  }
}

class PensionRepository {
  final PensionRemoteSource _remote;

  PensionRepository(this._remote);

  Future<PensionSummaryModel> getPensionSummary() =>
      _remote.getPensionSummary();
}
