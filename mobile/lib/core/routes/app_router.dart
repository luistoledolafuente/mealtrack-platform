import 'package:go_router/go_router.dart';
import 'route_names.dart';
import '../../shared/providers/auth_provider.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/change_password_screen.dart';
import '../../features/students/presentation/add_student_screen.dart';
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
import '../../features/pension/presentation/pension_summary_screen.dart';
import '../../features/qr/presentation/student_qr_scan_screen.dart';

class AppRouter {
  AppRouter._();

  static GoRouter createRouter(AuthProvider auth) {
    return GoRouter(
      initialLocation: RouteNames.loginPath,
      refreshListenable: auth,
      redirect: (context, state) {
        final loggedIn = auth.isAuthenticated;
        final location = state.uri.toString();

        if (!loggedIn && location != RouteNames.loginPath) {
          return RouteNames.loginPath;
        }

        if (loggedIn && !auth.user!.mustChangePassword && location == RouteNames.changePasswordPath) {
          if (auth.isStudent) return RouteNames.studentDashboardPath;
          return RouteNames.adminDashboardPath;
        }

        if (loggedIn && auth.user!.mustChangePassword && location != RouteNames.changePasswordPath) {
          return RouteNames.changePasswordPath;
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
      },
      routes: [
        GoRoute(
          name: RouteNames.login,
          path: RouteNames.loginPath,
          builder: (_, __) => const LoginScreen(),
        ),
        GoRoute(
          name: RouteNames.changePassword,
          path: RouteNames.changePasswordPath,
          builder: (_, __) => const ChangePasswordScreen(),
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
          name: RouteNames.addStudent,
          path: RouteNames.addStudentPath,
          builder: (_, __) => const AddStudentScreen(),
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
          builder: (context, state) {
            final subId = state.uri.queryParameters['subId'];
            return QrIssueScreen(subscriptionId: subId);
          },
        ),
        GoRoute(
          name: RouteNames.pensionSummary,
          path: RouteNames.pensionSummaryPath,
          builder: (_, __) => const PensionSummaryScreen(),
        ),
        GoRoute(
          name: RouteNames.studentQrScan,
          path: RouteNames.studentQrScanPath,
          builder: (_, __) => const StudentQrScanScreen(),
        ),
      ],
    );
  }
}
