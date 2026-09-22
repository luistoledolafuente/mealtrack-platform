import 'package:flutter_test/flutter_test.dart';
import 'package:mealtrack/features/qr/domain/consumption_result_model.dart';

void main() {
  group('ConsumptionResultModel', () {
    test('creates successful result correctly', () {
      final result = ConsumptionResultModel(
        success: true,
        service: 'lunch',
        serviceName: 'Almuerzo',
        remainingBalance: 12,
        timestamp: DateTime(2026, 9, 20, 13, 30),
        restaurantName: 'Restaurante Central',
        branchName: 'Sede Principal',
        validationMethod: 'qr_scan',
      );

      expect(result.success, isTrue);
      expect(result.service, equals('lunch'));
      expect(result.serviceName, equals('Almuerzo'));
      expect(result.remainingBalance, equals(12));
      expect(result.restaurantName, equals('Restaurante Central'));
      expect(result.errorCode, isNull);
    });

    test('creates failure result correctly', () {
      final failure = ConsumptionResultModel.failure(
        errorCode: 'EXPIRED_QR',
        errorMessage: 'El código QR ha expirado',
      );

      expect(failure.success, isFalse);
      expect(failure.errorCode, equals('EXPIRED_QR'));
      expect(failure.errorMessage, equals('El código QR ha expirado'));
    });
  });
}
