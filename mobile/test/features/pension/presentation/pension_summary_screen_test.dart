import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:mealtrack/features/pension/application/pension_provider.dart';
import 'package:mealtrack/features/pension/data/pension_repository.dart';
import 'package:mealtrack/features/pension/domain/pension_models.dart';
import 'package:mealtrack/features/pension/presentation/pension_summary_screen.dart';

import 'package:mealtrack/core/network/api_client.dart';

class MockPensionRemoteSource extends PensionRemoteSource {
  MockPensionRemoteSource() : super(FakeApiClient());

  @override
  Future<PensionSummaryModel> getPensionSummary() async {
    final now = DateTime(2026, 9, 20);
    return PensionSummaryModel(
      subscriptionId: 'sub-test-1',
      status: 'active',
      mealPlanName: 'Plan Test Mensual',
      restaurantName: 'Restaurante Prueba',
      validityStartDate: now,
      validityEndDate: now.add(const Duration(days: 30)),
      serviceBalances: const [
        ServiceBalance(
          service: 'breakfast',
          serviceName: 'Desayuno',
          contractedCount: 20,
          remainingCount: 15,
          included: true,
        ),
        ServiceBalance(
          service: 'lunch',
          serviceName: 'Almuerzo',
          contractedCount: 20,
          remainingCount: 10,
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
          id: 'closure-1',
          restaurantName: 'Restaurante Prueba',
          reason: 'Mantenimiento preventivo',
          affectedServices: const ['lunch'],
          startDate: now.add(const Duration(days: 2)),
          endDate: now.add(const Duration(days: 2)),
          validityExtendedDays: 1,
        ),
      ],
      absences: [
        AbsenceNoticeItem(
          id: 'abs-1',
          date: now.subtract(const Duration(days: 2)),
          service: 'lunch',
          status: 'approved',
          reason: 'Cita médica',
        ),
      ],
      monthlyAbsenceLimit: 3,
      usedAbsences: 1,
    );
  }
}

class FakeApiClient extends ApiClient {}

void main() {
  testWidgets('PensionSummaryScreen displays balances, closures and absences', (tester) async {
    final repository = PensionRepository(MockPensionRemoteSource());
    final provider = PensionProvider(repository);

    await tester.pumpWidget(
      MaterialApp(
        home: ChangeNotifierProvider<PensionProvider>.value(
          value: provider,
          child: const PensionSummaryScreen(),
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('Resumen de Pensión'), findsOneWidget);
    expect(find.text('Plan Test Mensual'), findsOneWidget);
    expect(find.text('Restaurante Prueba'), findsOneWidget);
    expect(find.text('Vigente'), findsOneWidget);
    expect(find.text('Desayuno'), findsOneWidget);
    expect(find.text('Almuerzo'), findsOneWidget);
    expect(find.text('15/20'), findsOneWidget);
    expect(find.text('10/20'), findsOneWidget);
    expect(find.textContaining('Mantenimiento preventivo'), findsOneWidget);
    expect(find.textContaining('Cita médica'), findsOneWidget);
    expect(find.byKey(const Key('register_consumption_btn')), findsOneWidget);
  });
}
