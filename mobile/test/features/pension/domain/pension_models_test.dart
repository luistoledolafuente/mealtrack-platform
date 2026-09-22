import 'package:flutter_test/flutter_test.dart';
import 'package:mealtrack/features/pension/domain/pension_models.dart';

void main() {
  group('PensionSummaryModel & ServiceBalance', () {
    test('deserializes ServiceBalance correctly', () {
      final json = {
        'service': 'breakfast',
        'serviceName': 'Desayuno',
        'contractedCount': 20,
        'remainingCount': 15,
        'included': true,
      };

      final balance = ServiceBalance.fromJson(json);

      expect(balance.service, equals('breakfast'));
      expect(balance.serviceName, equals('Desayuno'));
      expect(balance.contractedCount, equals(20));
      expect(balance.remainingCount, equals(15));
      expect(balance.included, isTrue);
    });

    test('deserializes PensionSummaryModel correctly', () {
      final json = {
        'subscriptionId': 'sub-99',
        'status': 'active',
        'mealPlanName': 'Plan Almuerzo L-V',
        'restaurantName': 'Restaurante Central',
        'validityStartDate': '2026-09-01T00:00:00Z',
        'validityEndDate': '2026-09-30T00:00:00Z',
        'serviceBalances': [
          {
            'service': 'lunch',
            'serviceName': 'Almuerzo',
            'contractedCount': 22,
            'remainingCount': 10,
            'included': true,
          }
        ],
        'closureAlerts': [
          {
            'id': 'c-1',
            'restaurantName': 'Restaurante Central',
            'reason': 'Mantenimiento',
            'affectedServices': ['lunch'],
            'startDate': '2026-09-24T00:00:00Z',
            'endDate': '2026-09-24T00:00:00Z',
            'validityExtendedDays': 1,
          }
        ],
        'absences': [
          {
            'id': 'abs-1',
            'date': '2026-09-15T00:00:00Z',
            'service': 'lunch',
            'status': 'approved',
            'reason': 'Cita médica',
          }
        ],
        'monthlyAbsenceLimit': 3,
        'usedAbsences': 1,
      };

      final summary = PensionSummaryModel.fromJson(json);

      expect(summary.subscriptionId, equals('sub-99'));
      expect(summary.isActive, isTrue);
      expect(summary.serviceBalances.length, equals(1));
      expect(summary.serviceBalances.first.service, equals('lunch'));
      expect(summary.closureAlerts.length, equals(1));
      expect(summary.closureAlerts.first.validityExtendedDays, equals(1));
      expect(summary.absences.length, equals(1));
      expect(summary.absences.first.status, equals('approved'));
      expect(summary.usedAbsences, equals(1));
    });
  });
}
