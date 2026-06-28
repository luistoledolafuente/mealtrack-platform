import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'route_names.dart';

// TODO: Import feature screens once implemented
// import '../../features/auth/presentation/login_screen.dart';
// import '../../features/student_dashboard/presentation/dashboard_screen.dart';

class AppRouter {
  AppRouter._();

  static final GoRouter router = GoRouter(
    initialLocation: RouteNames.loginPath,
    routes: [
      GoRoute(
        name: RouteNames.login,
        path: RouteNames.loginPath,
        builder: (context, state) => const _PlaceholderScreen(title: 'Login'),
      ),
      GoRoute(
        name: RouteNames.studentDashboard,
        path: RouteNames.studentDashboardPath,
        builder: (context, state) =>
            const _PlaceholderScreen(title: 'Dashboard'),
      ),
      GoRoute(
        name: RouteNames.mealCalendar,
        path: RouteNames.mealCalendarPath,
        builder: (context, state) =>
            const _PlaceholderScreen(title: 'Calendario'),
      ),
      GoRoute(
        name: RouteNames.subscriptions,
        path: RouteNames.subscriptionsPath,
        builder: (context, state) =>
            const _PlaceholderScreen(title: 'Suscripciones'),
      ),
      GoRoute(
        name: RouteNames.payments,
        path: RouteNames.paymentsPath,
        builder: (context, state) => const _PlaceholderScreen(title: 'Pagos'),
      ),
      GoRoute(
        name: RouteNames.adjustments,
        path: RouteNames.adjustmentsPath,
        builder: (context, state) =>
            const _PlaceholderScreen(title: 'Ajustes'),
      ),
      GoRoute(
        name: RouteNames.notifications,
        path: RouteNames.notificationsPath,
        builder: (context, state) =>
            const _PlaceholderScreen(title: 'Notificaciones'),
      ),
      GoRoute(
        name: RouteNames.adminDashboard,
        path: RouteNames.adminDashboardPath,
        builder: (context, state) => const _PlaceholderScreen(title: 'Admin'),
      ),
      GoRoute(
        name: RouteNames.audit,
        path: RouteNames.auditPath,
        builder: (context, state) => const _PlaceholderScreen(title: 'Auditoría'),
      ),
    ],
  );
}

class _PlaceholderScreen extends StatelessWidget {
  final String title;
  const _PlaceholderScreen({required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(child: Text(title)),
    );
  }
}
