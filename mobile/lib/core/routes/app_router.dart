import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'route_names.dart';
import '../../shared/providers/auth_provider.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/student_dashboard/presentation/student_dashboard_screen.dart';
import '../../features/admin_dashboard/presentation/admin_dashboard_screen.dart';
import '../../features/meal_calendar/presentation/meal_calendar_screen.dart';
import '../../features/subscriptions/presentation/subscriptions_screen.dart';
import '../../features/payments/presentation/payments_screen.dart';
import '../../features/notifications/presentation/notifications_screen.dart';
import '../../features/adjustments/presentation/adjustments_screen.dart';
import '../../features/audit/presentation/audit_screen.dart';
import '../../features/qr/presentation/qr_validate_screen.dart';
import '../../features/qr/presentation/qr_issue_screen.dart';

class AppRouter {
  AppRouter._();

  static final GoRouter router = GoRouter(
    initialLocation: RouteNames.loginPath,
    redirect: _redirectLogic,
    routes: [
      GoRoute(
        name: RouteNames.login,
        path: RouteNames.loginPath,
        builder: (_, __) => const LoginScreen(),
      ),
      GoRoute(
        name: RouteNames.studentDashboard,
        path: RouteNames.studentDashboardPath,
        builder: (_, __) => const StudentDashboardScreen(),
      ),
      GoRoute(
        name: RouteNames.mealCalendar,
        path: RouteNames.mealCalendarPath,
        builder: (_, __) => const MealCalendarScreen(),
      ),
      GoRoute(
        name: RouteNames.subscriptions,
        path: RouteNames.subscriptionsPath,
        builder: (_, __) => const SubscriptionsScreen(),
      ),
      GoRoute(
        name: RouteNames.payments,
        path: RouteNames.paymentsPath,
        builder: (_, __) => const PaymentsScreen(),
      ),
      GoRoute(
        name: RouteNames.adjustments,
        path: RouteNames.adjustmentsPath,
        builder: (_, __) => const AdjustmentsScreen(),
      ),
      GoRoute(
        name: RouteNames.notifications,
        path: RouteNames.notificationsPath,
        builder: (_, __) => const NotificationsScreen(),
      ),
      GoRoute(
        name: RouteNames.adminDashboard,
        path: RouteNames.adminDashboardPath,
        builder: (_, __) => const AdminDashboardScreen(),
      ),
      GoRoute(
        name: RouteNames.audit,
        path: RouteNames.auditPath,
        builder: (_, __) => const AuditScreen(),
      ),
      GoRoute(
        name: RouteNames.qrValidate,
        path: RouteNames.qrValidatePath,
        builder: (_, __) => const QrValidateScreen(),
      ),
      GoRoute(
        name: RouteNames.qrIssue,
        path: RouteNames.qrIssuePath,
        builder: (_, __) => const QrIssueScreen(),
      ),
    ],
  );

  static String? _redirectLogic(BuildContext context, GoRouterState state) {
    final auth = context.read<AuthProvider>();
    final loggedIn = auth.isAuthenticated;
    final location = state.uri.toString();

    if (!loggedIn && location != RouteNames.loginPath) {
      return RouteNames.loginPath;
    }

    if (loggedIn && location == RouteNames.loginPath) {
      if (auth.isStudent) return RouteNames.studentDashboardPath;
      return RouteNames.adminDashboardPath;
    }

    if (loggedIn && auth.isStudent && location == RouteNames.adminDashboardPath) {
      return RouteNames.studentDashboardPath;
    }

    if (loggedIn && auth.isAdmin && location == RouteNames.studentDashboardPath) {
      return RouteNames.adminDashboardPath;
    }

    return null;
  }
}
