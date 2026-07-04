import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/locator.dart';
import 'core/routes/app_router.dart';
import 'core/theme/app_theme.dart';
import 'shared/providers/auth_provider.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MealTrackApp());
}

class MealTrackApp extends StatelessWidget {
  const MealTrackApp({super.key});

  @override
  Widget build(BuildContext context) {
    final locator = ServiceLocator();

    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthProvider(locator.apiClient)..tryAutoLogin(),
        ),
        Provider.value(value: locator.subscriptionRepository),
        Provider.value(value: locator.dailyMealRepository),
        Provider.value(value: locator.paymentRepository),
        Provider.value(value: locator.notificationRepository),
        Provider.value(value: locator.adjustmentRepository),
        Provider.value(value: locator.auditRepository),
        Provider.value(value: locator.dashboardRepository),
        Provider.value(value: locator.qrRepository),
      ],
      child: MaterialApp.router(
        title: 'MealTrack',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        darkTheme: AppTheme.dark,
        routerConfig: AppRouter.router,
      ),
    );
  }
}
