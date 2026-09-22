import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:mealtrack/features/qr/application/qr_scan_provider.dart';
import 'package:mealtrack/features/qr/data/consumption_repository.dart';
import 'package:mealtrack/features/qr/domain/consumption_result_model.dart';
import 'package:mealtrack/features/qr/presentation/student_qr_scan_screen.dart';

import 'package:mealtrack/core/network/api_client.dart';

class MockConsumptionRemoteSource extends ConsumptionRemoteSource {
  MockConsumptionRemoteSource() : super(FakeApiClient());

  @override
  Future<ConsumptionResultModel> scanQrOrCode({
    String? qrToken,
    String? manualCode,
    required String idempotencyKey,
  }) async {
    final code = manualCode ?? qrToken ?? '';

    if (code == '999999') {
      return ConsumptionResultModel.failure(
        errorCode: 'EXPIRED_QR',
        errorMessage: 'El código QR ha expirado',
      );
    }

    if (code == '888888') {
      return ConsumptionResultModel.failure(
        errorCode: 'INSUFFICIENT_BALANCE',
        errorMessage: 'Saldo insuficiente',
      );
    }

    if (code == '777777') {
      return ConsumptionResultModel.failure(
        errorCode: 'DUPLICATE_CONSUMPTION',
        errorMessage: 'Ya registraste tu consumo para este servicio',
      );
    }

    return ConsumptionResultModel(
      success: true,
      service: 'lunch',
      serviceName: 'Almuerzo',
      remainingBalance: 11,
      timestamp: DateTime(2026, 9, 20, 13, 30),
      restaurantName: 'Restaurante Central',
      validationMethod: manualCode != null ? 'manual_code' : 'qr_scan',
    );
  }
}

class FakeApiClient extends ApiClient {}

void main() {
  testWidgets('StudentQrScanScreen renders scanner tab and manual code tab', (tester) async {
    final repository = ConsumptionRepository(MockConsumptionRemoteSource());
    final provider = QrScanProvider(repository);

    await tester.pumpWidget(
      MaterialApp(
        home: ChangeNotifierProvider<QrScanProvider>.value(
          value: provider,
          child: const StudentQrScanScreen(),
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('Registrar Consumo'), findsOneWidget);
    expect(find.text('Escanear QR'), findsOneWidget);
    expect(find.text('Código de 6 dígitos'), findsOneWidget);
    expect(find.byKey(const Key('scan_qr_action_btn')), findsOneWidget);

    await tester.tap(find.text('Código de 6 dígitos'));
    await tester.pumpAndSettle();

    expect(find.byKey(const Key('manual_code_input')), findsOneWidget);
    expect(find.byKey(const Key('submit_manual_code_btn')), findsOneWidget);
  });

  testWidgets('Submitting 6-digit manual code navigates to result screen', (tester) async {
    final repository = ConsumptionRepository(MockConsumptionRemoteSource());
    final provider = QrScanProvider(repository);

    await tester.pumpWidget(
      MaterialApp(
        home: ChangeNotifierProvider<QrScanProvider>.value(
          value: provider,
          child: const StudentQrScanScreen(),
        ),
      ),
    );

    await tester.pumpAndSettle();

    await tester.tap(find.text('Código de 6 dígitos'));
    await tester.pumpAndSettle();

    await tester.enterText(find.byKey(const Key('manual_code_input')), '123456');
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('submit_manual_code_btn')));
    await tester.pumpAndSettle();

    expect(find.text('¡Consumo Registrado!'), findsOneWidget);
    expect(find.text('Almuerzo'), findsOneWidget);
    expect(find.text('11 consumos'), findsOneWidget);
  });

  testWidgets('Displays EXPIRED_QR error result correctly', (tester) async {
    final repository = ConsumptionRepository(MockConsumptionRemoteSource());
    final provider = QrScanProvider(repository);

    await tester.pumpWidget(
      MaterialApp(
        home: ChangeNotifierProvider<QrScanProvider>.value(
          value: provider,
          child: const StudentQrScanScreen(),
        ),
      ),
    );

    await tester.pumpAndSettle();

    await tester.tap(find.text('Código de 6 dígitos'));
    await tester.pumpAndSettle();

    await tester.enterText(find.byKey(const Key('manual_code_input')), '999999');
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('submit_manual_code_btn')));
    await tester.pumpAndSettle();

    expect(find.text('No se pudo registrar'), findsOneWidget);
    expect(find.text('El código QR ha expirado'), findsOneWidget);
  });
}
