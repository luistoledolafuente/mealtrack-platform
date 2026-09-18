import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'core/locator.dart';
import 'core/routes/app_router.dart';
import 'core/theme/app_theme.dart';
import 'shared/providers/auth_provider.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MealTrackApp());
}

class MealTrackApp extends StatefulWidget {
  const MealTrackApp({super.key});

  @override
  State<MealTrackApp> createState() => _MealTrackAppState();
}

class _MealTrackAppState extends State<MealTrackApp> {
  late final ServiceLocator _locator;
  late final AuthProvider _authProvider;
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    _locator = ServiceLocator();
    _authProvider = AuthProvider(_locator.apiClient)..tryAutoLogin();
    _router = AppRouter.createRouter(_authProvider);
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: _authProvider),
        Provider.value(value: _locator.userRepository),
        Provider.value(value: _locator.mealPlanRepository),
        Provider.value(value: _locator.subscriptionRepository),
        Provider.value(value: _locator.dailyMealRepository),
        Provider.value(value: _locator.paymentRepository),
        Provider.value(value: _locator.notificationRepository),
        Provider.value(value: _locator.adjustmentRepository),
        Provider.value(value: _locator.auditRepository),
        Provider.value(value: _locator.dashboardRepository),
        Provider.value(value: _locator.qrRepository),
      ],
      child: MaterialApp.router(
        title: 'MealTrack',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        darkTheme: AppTheme.dark,
        routerConfig: _router,
      ),
    );
  }
}
